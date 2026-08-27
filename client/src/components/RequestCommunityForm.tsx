import {
  useCallback,
  useId,
  useRef,
  useState,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import styles from "./RequestCommunityForm.module.css";

type Role = "founders" | "community_builders" | "organisations";

const fieldClassName =
  "bg-background border-[#303030] focus-visible:border-gold/50 focus-visible:ring-gold/25";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

/**
 * Posts straight to the community service, bypassing the /api BFF route, so the
 * form works without the Express server running.
 *
 * The upstream is HTTP-only, so this works from an http:// origin such as
 * localhost but a browser BLOCKS it as mixed content on an https:// site —
 * which soulchain.net is. Set VITE_COMMUNITY_REQUEST_URL to
 * "/api/communities/request" to route through the BFF instead, which reaches
 * the upstream server-side where mixed content does not apply.
 */
const REQUEST_ENDPOINT =
  import.meta.env.VITE_COMMUNITY_REQUEST_URL?.trim() ||
  "http://40.89.185.79:5044/communities/request/lead";

const ROLE_OPTIONS: { value: Role; labelKey: string }[] = [
  { value: "founders", labelKey: "communityRequest.role.founders" },
  { value: "community_builders", labelKey: "communityRequest.role.communityBuilders" },
  { value: "organisations", labelKey: "communityRequest.role.organisations" },
];

interface RequestCommunityFormProps {
  onSuccess?: () => void;
  className?: string;
  wide?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubhead?: string;
}

export default function RequestCommunityForm({
  onSuccess,
  className,
  wide = false,
  showHeader = false,
  headerTitle,
  headerSubhead,
}: RequestCommunityFormProps) {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const spanFull = wide ? "md:col-span-2" : undefined;

  // Several instances of this form can share a page (inline section + modal),
  // so field ids have to be unique per instance.
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;

  // form_started fires once, on the first field the visitor touches.
  const startedRef = useRef(false);
  const markStarted = useCallback(
    (field: string) => {
      if (startedRef.current) return;
      startedRef.current = true;
      track("form_started", { form: "request_community", route: window.location.pathname, first_field: field });
    },
    [],
  );

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const first = firstName.trim();
    const last = lastName.trim();
    const emailClean = email.trim().toLowerCase();
    const phoneClean = phone.trim();
    const nextErrors: Record<string, string> = {};

    if (!first) nextErrors.firstName = t("form.required");
    if (!last) nextErrors.lastName = t("form.required");
    if (!role) nextErrors.role = t("form.required");
    if (!emailClean) nextErrors.email = t("form.required");
    else if (!EMAIL_RE.test(emailClean)) nextErrors.email = t("form.emailInvalid");
    if (!phoneClean) nextErrors.phone = t("form.required");
    else if (!PHONE_RE.test(phoneClean)) nextErrors.phone = t("communityRequest.errors.phoneInvalid");

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError(null);
      // Field names only — never the values the visitor typed.
      track("form_error", {
        form: "request_community",
        route: window.location.pathname,
        source: "validation",
        fields: Object.keys(nextErrors),
      });
      return;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);
    track("form_submitted", {
      form: "request_community",
      route: window.location.pathname,
      community_type: role,
    });

    const payload = {
      name: `${first} ${last}`.trim(),
      community_type: role,
      phone: phoneClean,
      email: emailClean,
    };

    try {
      const response = await fetch(REQUEST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // A 2xx that isn't JSON means the request never reached the API (e.g. a
      // static host answering the SPA rewrite). Treat it as a failure rather
      // than confirming a lead nobody received.
      const isJson = (response.headers.get("content-type") || "").includes(
        "application/json",
      );
      const data = isJson
        ? ((await response.json().catch(() => null)) as {
            message?: string;
            error?: string;
            // A string via the BFF, but FastAPI returns an array of field
            // errors when the community service is called directly.
            detail?: string | { msg?: string }[];
          } | null)
        : null;

      if (!response.ok || !isJson) {
        const detail = Array.isArray(data?.detail)
          ? data.detail
              .map(d => d?.msg)
              .filter(Boolean)
              .join(" ")
          : data?.detail;
        const message =
          (typeof data?.message === "string" && data.message.trim()) ||
          (typeof data?.error === "string" && data.error.trim()) ||
          (typeof detail === "string" && detail.trim()) ||
          t("communityRequest.errors.submitFailed");
        setFormError(message);
        track("form_error", {
          form: "request_community",
          route: window.location.pathname,
          source: "server",
          status: response.status,
        });
        return;
      }

      setSubmitted(true);
      track("form_completed", {
        form: "request_community",
        route: window.location.pathname,
        community_type: role,
      });
      track("community_requested", {
        route: window.location.pathname,
        community_type: role,
      });
      onSuccess?.();
    } catch {
      setFormError(t("communityRequest.errors.submitFailed"));
      track("error_occurred", {
        scope: "request_community_submit",
        route: window.location.pathname,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <LayeredFormCard className={className} wide={wide} compact={!showHeader}>
        {showHeader && (
          <FormHeader t={t} title={headerTitle} subhead={headerSubhead} />
        )}
        <div className="py-8 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <Check className="h-7 w-7 text-gold" strokeWidth={2.5} />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl">{t("communityRequest.confirm.title")}</h2>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-md mx-auto">
            {t("communityRequest.confirm.body")}
          </p>
        </div>
      </LayeredFormCard>
    );
  }

  return (
    <LayeredFormCard
      as="form"
      className={cn(
        "space-y-4",
        wide && "md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-4 md:space-y-0",
        className,
      )}
      wide={wide}
      compact={!showHeader}
      onSubmit={handleSubmit}
      noValidate
    >
      {showHeader && (
        <FormHeader
          t={t}
          wide={wide}
          title={headerTitle}
          subhead={headerSubhead}
        />
      )}

      <Field
        htmlFor={fieldId("firstName")}
        label={t("communityRequest.fields.firstName")}
        error={errors.firstName}
        errorId={errorId("firstName")}
        required
      >
        <Input
          id={fieldId("firstName")}
          name="firstName"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            markStarted("firstName");
            clearError("firstName");
          }}
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? errorId("firstName") : undefined}
          autoComplete="given-name"
          className={fieldClassName}
        />
      </Field>

      <Field
        htmlFor={fieldId("lastName")}
        label={t("communityRequest.fields.lastName")}
        error={errors.lastName}
        errorId={errorId("lastName")}
        required
      >
        <Input
          id={fieldId("lastName")}
          name="lastName"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            markStarted("lastName");
            clearError("lastName");
          }}
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? errorId("lastName") : undefined}
          autoComplete="family-name"
          className={fieldClassName}
        />
      </Field>

      <Field
        labelId={fieldId("role-label")}
        label={t("communityRequest.fields.role")}
        error={errors.role}
        errorId={errorId("role")}
        required
        className={spanFull}
      >
        <RadioGroup
          value={role}
          onValueChange={(value) => {
            setRole(value as Role);
            markStarted("role");
            track("field_interacted", { form: "request_community", field: "role", value });
            clearError("role");
          }}
          className="grid gap-2"
          aria-required
          aria-labelledby={fieldId("role-label")}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? errorId("role") : undefined}
        >
          {ROLE_OPTIONS.map(({ value, labelKey }) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-3 text-sm transition-colors",
                role === value
                  ? "border-gold/60 bg-gold/10 text-foreground"
                  : "border-[#303030] bg-background text-muted-foreground hover:border-gold/30",
              )}
            >
              <RadioGroupItem value={value} className="border-gold/50 text-gold" />
              <span className="font-medium">{t(labelKey)}</span>
            </label>
          ))}
        </RadioGroup>
      </Field>

      <Field
        htmlFor={fieldId("email")}
        label={t("communityRequest.fields.email")}
        error={errors.email}
        errorId={errorId("email")}
        required
        className={spanFull}
      >
        <Input
          id={fieldId("email")}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            markStarted("email");
            clearError("email");
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? errorId("email") : undefined}
          autoComplete="email"
          className={fieldClassName}
        />
      </Field>

      <Field
        htmlFor={fieldId("phone")}
        label={t("communityRequest.fields.phone")}
        error={errors.phone}
        errorId={errorId("phone")}
        required
        className={spanFull}
      >
        <Input
          id={fieldId("phone")}
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            markStarted("phone");
            clearError("phone");
          }}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? errorId("phone") : undefined}
          autoComplete="tel"
          placeholder={t("communityRequest.fields.phonePlaceholder")}
          className={fieldClassName}
        />
      </Field>

      {formError && (
        <p
          role="alert"
          className={cn(
            "rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-sm text-[#f0bbbb]",
            spanFull,
          )}
        >
          {formError}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full rounded-full bg-gold text-[#0E0E0E] hover:bg-gold/90 border-0 h-12 mt-2 disabled:opacity-60",
          spanFull,
        )}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("communityRequest.submitting")}
          </span>
        ) : (
          t("communityRequest.submit")
        )}
      </Button>
    </LayeredFormCard>
  );
}

type TranslateFn = (key: string) => string;

function FormHeader({
  t,
  wide,
  title,
  subhead,
}: {
  t: TranslateFn;
  wide?: boolean;
  title?: string;
  subhead?: string;
}) {
  return (
    <div className={cn(styles.header, wide && "md:col-span-2")}>
      <h3 className={styles.headerTitle}>{title ?? t("communityRequest.title")}</h3>
      <p className={styles.headerSubhead}>{subhead ?? t("communityRequest.subhead")}</p>
    </div>
  );
}

type LayeredFormCardProps = {
  children: ReactNode;
  className?: string;
  wide?: boolean;
  compact?: boolean;
  as?: "div" | "form";
} & Omit<FormHTMLAttributes<HTMLFormElement>, "className">;

function LayeredFormCard({
  children,
  className,
  wide = false,
  compact = false,
  as = "div",
  ...formProps
}: LayeredFormCardProps) {
  const frontClassName = cn(
    styles.frontCard,
    wide && styles.frontCardWide,
    compact && styles.frontCardCompact,
    as === "form" && className,
  );

  return (
    <div className={cn(styles.stack, compact && styles.stackCompact, as !== "form" && className)}>
      <div className={styles.backCard} aria-hidden="true" />
      {as === "form" ? (
        <form className={frontClassName} {...formProps}>
          {children}
        </form>
      ) : (
        <div className={frontClassName}>{children}</div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  error,
  required,
  className,
  htmlFor,
  labelId,
  errorId,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  /** Id of the input this labels. Omitted for grouped controls (radios). */
  htmlFor?: string;
  /** Set instead of `htmlFor` so a group can point at the label. */
  labelId?: string;
  errorId?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label id={labelId} htmlFor={htmlFor} className="text-sm text-foreground">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
