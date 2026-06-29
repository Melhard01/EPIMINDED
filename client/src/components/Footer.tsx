import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/reveal";
import { Link } from "wouter";
import {
  APP_STORE_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  PLAY_STORE_URL,
} from "@/lib/urls";
import { smoothScrollToId } from "@/lib/smoothScroll";

const PRODUCT_SECTIONS = [
  { href: "/founders", path: "/founders", sectionId: "for-founders", labelKey: "footer.product.founders" },
  {
    href: "/community-builders#for-community-builders",
    path: "/community-builders",
    sectionId: "for-community-builders",
    labelKey: "footer.product.communityBuilders",
  },
  {
    href: "/enterprise#for-organisations",
    path: "/enterprise",
    sectionId: "for-organisations",
    labelKey: "footer.product.organisations",
  },
] as const;

function scrollToSection(sectionId: string) {
  smoothScrollToId(sectionId);
}

const FOOTER_COL =
  "flex flex-col items-center sm:items-start text-center sm:text-left w-full";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-background border-t border-[#303030]">
      <div className="container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
          <Reveal variant="up" className={`space-y-4 ${FOOTER_COL}`}>
            <div className="mb-4 min-h-12 flex items-center justify-center sm:justify-start w-full">
              <img src="/assets/epiminded-logo.png" alt="EpiMinded" className="h-12 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto sm:mx-0">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-0 pt-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <img
                  src="/assets/footer-instagram.png"
                  alt="Instagram"
                  className="w-11 h-11"
                  width={1024}
                  height={1024}
                />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <img
                  src="/assets/footer-linkedin.png"
                  alt="LinkedIn"
                  className="w-11 h-11"
                  width={1024}
                  height={1024}
                />
              </a>
            </div>
          </Reveal>

          <Reveal variant="up" delay={80} className={FOOTER_COL}>
            <h4 className="text-sm font-medium text-foreground mb-4 min-h-12 flex items-center justify-center sm:justify-start w-full">
              Product
            </h4>
            <ul className="space-y-3">
              {PRODUCT_SECTIONS.map(({ href, path, sectionId, labelKey }) => (
                <li key={sectionId}>
                  <Link
                    href={href}
                    onClick={(e) => {
                      if (window.location.pathname === path) {
                        e.preventDefault();
                        scrollToSection(sectionId);
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="up" delay={160} className={FOOTER_COL}>
            <h4 className="text-sm font-medium text-foreground mb-4 min-h-12 flex items-center justify-center sm:justify-start w-full">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.terms")}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.cookies")}
                </Link>
              </li>
            </ul>
          </Reveal>

          <Reveal variant="up" delay={240} className={FOOTER_COL}>
            <p className="text-sm font-medium text-foreground mb-4 min-h-12 flex items-center justify-center sm:justify-start w-full">
              {t("footer.downloadApp.title")}
            </p>
            <div className="footer-store-badges">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <span className="footer-app-store-badge">
                  <img
                    src="/assets/app-store-badge.png"
                    alt="Download on the App Store"
                    width={800}
                    height={800}
                  />
                </span>
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <span className="footer-google-play-badge">
                  <img
                    src="/assets/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={1563}
                    height={1563}
                  />
                </span>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal variant="fade" delay={120}>
          <div className="mt-12 pt-8 border-t border-[#303030]">
            <p className="text-sm text-muted-foreground text-center">
              {t("footer.copyright")}
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
