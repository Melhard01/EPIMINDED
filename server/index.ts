import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "node:fs";
import { fileURLToPath } from "url";
import funnelRoutes from "./funnel/routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  /**
   * First-party reverse proxy for PostHog, mirroring the Vercel rewrites and
   * the Cloudflare worker so /ingest resolves wherever the site is served.
   *
   * Registered before express.json on purpose: PostHog posts gzipped and
   * form-encoded bodies, and letting the JSON parser touch them first would
   * corrupt every batch. The raw bytes are collected and forwarded as-is.
   */
  app.use("/ingest", (req, res) => {
    const isStatic = req.path.startsWith("/static/");
    const host = isStatic ? "us-assets.i.posthog.com" : "us.i.posthog.com";
    const target = `https://${host}${req.originalUrl.replace(/^\/ingest/, "")}`;

    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", async () => {
      try {
        const headers = new Headers();
        for (const [k, v] of Object.entries(req.headers)) {
          if (["host", "connection", "content-length", "cookie"].includes(k)) continue;
          if (typeof v === "string") headers.set(k, v);
        }
        headers.set("Host", host);

        const hasBody = req.method !== "GET" && req.method !== "HEAD";
        const upstream = await fetch(target, {
          method: req.method,
          headers,
          body: hasBody && chunks.length ? Buffer.concat(chunks) : undefined,
        });

        res.status(upstream.status);
        upstream.headers.forEach((value, key) => {
          const lower = key.toLowerCase();
          // fetch already decoded the payload, so the upstream encoding and
          // length headers no longer describe what we are about to send.
          if (["set-cookie", "content-encoding", "content-length"].includes(lower)) return;
          res.setHeader(key, value);
        });
        res.send(Buffer.from(await upstream.arrayBuffer()));
      } catch {
        // Analytics must never take the site down.
        res.status(502).end();
      }
    });
  });

  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(funnelRoutes);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  if (process.env.NODE_ENV === "production") {
    /**
     * Mirrors client/public/_headers (Cloudflare) and vercel.json.
     *
     * Vite marks the entry chunk and its stylesheet `crossorigin`, and a
     * module script is fetched in CORS mode whatever the attribute says. With
     * no Access-Control-Allow-Origin, a client that treats the request as
     * cross-origin drops the response — the stylesheet stops applying and the
     * page renders with no CSS, while text and images still arrive. Public
     * build artefacts, so * is the right scope.
     */
    app.use("/assets", (_req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    });

    /**
     * WebP has a PNG/JPEG twin beside it (scripts/make-image-fallbacks.py).
     * Clients that cannot decode WebP — Safari below 14 — request the .webp
     * URL written in the markup and the CSS and get the twin instead, so no
     * application code changes. Mirrors worker/index.ts.
     *
     * A request with no Accept header, or one that never mentions images,
     * keeps the WebP: that is what it receives today.
     */
    app.get(/\.webp$/i, (req, res, next) => {
      const accept = req.headers.accept ?? "";
      if (!accept.includes("image/") || accept.includes("image/webp")) return next();

      for (const extension of [".png", ".jpg"]) {
        const candidate = path.join(staticPath, req.path.replace(/\.webp$/i, extension));
        if (candidate.startsWith(staticPath) && fs.existsSync(candidate)) {
          res.setHeader("Vary", "Accept");
          return res.sendFile(candidate);
        }
      }
      return next();
    });

    // Serve <slug>.html for extensionless URLs before express.static gets a
    // look. prerender-seo emits both founders.html and founders/index.html for
    // the static hosts, and express.static answers a request for /founders by
    // 301-ing to /founders/ because the directory exists — a redirect to a URL
    // whose canonical then says /founders. Resolving the .html here keeps the
    // served URL and its canonical identical.
    app.get(/^\/[^.]+$/, (req, res, next) => {
      const candidate = path.join(staticPath, `${req.path}.html`);
      if (candidate.startsWith(staticPath) && fs.existsSync(candidate)) {
        return res.sendFile(candidate);
      }
      return next();
    });

    app.use(express.static(staticPath, { extensions: ["html"] }));
    // Mirrors worker/index.ts: a missing file must 404 rather than be
    // answered with the SPA shell, which would hand an HTML document to a
    // module script or a stylesheet. See that file for what it costs.
    app.get(/\/[^/]+\.[a-z0-9]+$/i, (req, res, next) => {
      if (req.path.endsWith(".html")) return next();
      res.status(404).type("text/plain").send("Not Found");
    });

    // Funnel steps and unknown paths get the bare shell, not index.html —
    // index.html now carries the prerendered home page, which would otherwise
    // be served under every funnel URL.
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "app-shell.html"));
    });
  }

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Funnel API server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
