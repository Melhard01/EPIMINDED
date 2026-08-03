import { useState, type FormHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./RequestCommunityForm.module.css";

type Role = "founders" | "community_builders" | "organisations";

const fieldClassName =
  "bg-background border-[#303030] focus-visible:border-gold/50 focus-visible:ring-gold/25";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

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
      return;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);

    const payload = {
      name: `${first} ${last}`.trim(),
      community_type: role,
      phone: phoneClean,
      email: emailClean,
    };

    try {
      const response = await fetch("/api/communities/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
        detail?: string;
      } | null;

      if (!response.ok) {
        const message =
          (typeof data?.message === "string" && data.message.trim()) ||
          (typeof data?.error === "string" && data.error.trim()) ||
          (typeof data?.detail === "string" && data.detail.trim()) ||
          t("communityRequest.errors.submitFailed");
        setFormError(message);
        return;
      }

      setSubmitted(true);
      onSuccess?.();
    } catch {
      setFormError(t("communityRequest.errors.submitFailed"));
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
        label={t("communityRequest.fields.firstName")}
        error={errors.firstName}
        required
      >
        <Input
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          className={fieldClassName}
        />
      </Field>

      <Field
        label={t("communityRequest.fields.lastName")}
        error={errors.lastName}
        required
      >
        <Input
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          className={fieldClassName}
        />
      </Field>

      <Field
        label={t("communityRequest.fields.role")}
        error={errors.role}
        required
        className={spanFull}
      >
        <RadioGroup
          value={role}
          onValueChange={(value) => {
            setRole(value as Role);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.role;
              return next;
            });
          }}
          className="grid gap-2"
          aria-required
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
        label={t("communityRequest.fields.email")}
        error={errors.email}
        required
        className={spanFull}
      >
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={fieldClassName}
        />
      </Field>

      <Field
        label={t("communityRequest.fields.phone")}
        error={errors.phone}
        required
        className={spanFull}
      >
        <Input
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm text-foreground">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
