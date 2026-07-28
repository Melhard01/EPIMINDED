import { useMemo, useState, type FormHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  extractAccessToken,
  getAuthAccessToken,
  setAuthAccessToken,
} from "@/lib/authToken";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./RequestCommunityForm.module.css";

type RequesterType = "organization" | "influencer" | "other";
type AuthMode = "signIn" | "signUp" | "otp";

const fieldClassName =
  "bg-background border-[#303030] focus-visible:border-gold/50 focus-visible:ring-gold/25";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RequestCommunityFormProps {
  onSuccess?: () => void;
  className?: string;
  wide?: boolean;
  showHeader?: boolean;
}

type AuthApiPayload = {
  message?: string;
  error?: string;
  detail?: string;
  code?: string;
  challengeId?: string;
};

function backendMessage(payload: AuthApiPayload | null): string {
  return (
    (typeof payload?.message === "string" && payload.message.trim()) ||
    (typeof payload?.error === "string" && payload.error.trim()) ||
    (typeof payload?.detail === "string" && payload.detail.trim()) ||
    ""
  );
}

export default function RequestCommunityForm({
  onSuccess,
  className,
  wide = false,
  showHeader = false,
}: RequestCommunityFormProps) {
  const { t } = useLanguage();
  const [token, setToken] = useState<string | null>(() => getAuthAccessToken());
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const [requesterType, setRequesterType] = useState<RequesterType | "">("");
  const [name, setName] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const nameLabel = useMemo(() => {
    if (requesterType === "organization") return t("communityRequest.fields.orgName");
    if (requesterType === "influencer") return t("communityRequest.fields.brandName");
    return t("communityRequest.fields.name");
  }, [requesterType, t]);

  const spanFull = wide ? "md:col-span-2" : undefined;
  const signedIn = Boolean(token);

  const markSignedIn = (nextToken: string) => {
    setAuthAccessToken(nextToken);
    setToken(nextToken);
    setAuthError(null);
    setAuthInfo(null);
    setPassword("");
    setOtp("");
  };

  const handleSignOut = () => {
    setAuthAccessToken(null);
    setToken(null);
    setAuthMode("signIn");
    setAuthError(null);
    setAuthInfo(null);
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthInfo(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authBusy) return;

    const emailClean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(emailClean) || !password) {
      setAuthError(t("communityRequest.auth.errors.credentialsRequired"));
      return;
    }

    setAuthBusy(true);
    setAuthError(null);
    setAuthInfo(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailClean, password }),
      });
      const payload = (await response.json().catch(() => null)) as AuthApiPayload | null;
      const message = backendMessage(payload);

      if (!response.ok) {
        const normalized = message.toLowerCase();
        if (
          normalized.includes("not verified") ||
          normalized.includes("unverified") ||
          normalized.includes("verify your email") ||
          payload?.code === "EMAIL_NOT_VERIFIED"
        ) {
          setAuthMode("otp");
          setAuthInfo(t("communityRequest.auth.otpHint"));
          setAuthError(message || t("communityRequest.auth.errors.verifyRequired"));
          return;
        }
        setAuthError(message || t("communityRequest.auth.errors.signInFailed"));
        return;
      }

      const nextToken = extractAccessToken(payload);
      if (!nextToken) {
        setAuthError(t("communityRequest.auth.errors.noToken"));
        return;
      }
      markSignedIn(nextToken);
    } catch {
      setAuthError(t("communityRequest.auth.errors.signInFailed"));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authBusy) return;

    const emailClean = email.trim().toLowerCase();
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last || !EMAIL_RE.test(emailClean) || password.length < 8) {
      setAuthError(t("communityRequest.auth.errors.signUpIncomplete"));
      return;
    }

    setAuthBusy(true);
    setAuthError(null);
    setAuthInfo(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: first,
          lastName: last,
          email: emailClean,
          password,
        }),
      });
      const payload = (await response.json().catch(() => null)) as AuthApiPayload | null;
      const message = backendMessage(payload);

      if (!response.ok) {
        setAuthError(message || t("communityRequest.auth.errors.signUpFailed"));
        return;
      }

      if (typeof payload?.challengeId === "string" && payload.challengeId) {
        setChallengeId(payload.challengeId);
      }
      setAuthMode("otp");
      setAuthInfo(t("communityRequest.auth.otpSent").replace("{email}", emailClean));
    } catch {
      setAuthError(t("communityRequest.auth.errors.signUpFailed"));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authBusy) return;

    const emailClean = email.trim().toLowerCase();
    const otpClean = otp.trim();
    if (!EMAIL_RE.test(emailClean) || !otpClean) {
      setAuthError(t("communityRequest.auth.errors.otpRequired"));
      return;
    }

    setAuthBusy(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailClean,
          otp: otpClean,
          ...(challengeId ? { challengeId } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as AuthApiPayload | null;
      const message = backendMessage(payload);

      if (!response.ok) {
        setAuthError(message || t("communityRequest.auth.errors.otpFailed"));
        return;
      }

      const nextToken = extractAccessToken(payload);
      if (!nextToken) {
        // Email verified but login still needed for JWT
        setAuthMode("signIn");
        setAuthInfo(t("communityRequest.auth.verifiedSignIn"));
        setOtp("");
        return;
      }
      markSignedIn(nextToken);
    } catch {
      setAuthError(t("communityRequest.auth.errors.otpFailed"));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleResendOtp = async () => {
    if (authBusy) return;
    const emailClean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(emailClean)) {
      setAuthError(t("communityRequest.auth.errors.otpRequired"));
      return;
    }

    setAuthBusy(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailClean }),
      });
      const payload = (await response.json().catch(() => null)) as AuthApiPayload | null;
      if (!response.ok) {
        setAuthError(backendMessage(payload) || t("communityRequest.auth.errors.resendFailed"));
        return;
      }
      setAuthInfo(t("communityRequest.auth.otpResent"));
    } catch {
      setAuthError(t("communityRequest.auth.errors.resendFailed"));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const accessToken = token || getAuthAccessToken();
    if (!accessToken) {
      setFormError(t("communityRequest.errors.authRequired"));
      return;
    }

    const nextErrors: Record<string, string> = {};
    if (!requesterType) nextErrors.requesterType = t("form.required");
    if (!name.trim()) nextErrors.name = t("form.required");
    else if (name.trim().length > 200) nextErrors.name = t("communityRequest.errors.nameLength");
    if (!description.trim()) nextErrors.description = t("form.required");

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);

    const payload = {
      requester_type: requesterType,
      name: name.trim(),
      community_name: communityName.trim() || "",
      description: description.trim(),
      social_handle:
        requesterType === "influencer" ? socialHandle.trim() || "" : "",
    };

    try {
      const response = await fetch("/api/communities/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
        detail?: string;
        status?: string;
      } | null;

      if (!response.ok) {
        const message =
          (typeof data?.message === "string" && data.message.trim()) ||
          (typeof data?.error === "string" && data.error.trim()) ||
          (typeof data?.detail === "string" && data.detail.trim()) ||
          t("communityRequest.errors.submitFailed");
        setFormError(message);
        if (/not authorized|no token|unauthorized|invalid token/i.test(message)) {
          handleSignOut();
        }
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
        {showHeader && <FormHeader t={t} />}
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

  if (!signedIn) {
    return (
      <LayeredFormCard className={className} wide={wide} compact={!showHeader}>
        {showHeader && <FormHeader t={t} />}

        <div className={styles.authBlock}>
          <div className={styles.authIntro}>
            <p className={styles.authTitle}>{t("communityRequest.auth.title")}</p>
            <p className={styles.authSubhead}>{t("communityRequest.auth.subhead")}</p>
          </div>

          {authMode !== "otp" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchAuthMode("signIn")}
                className={cn(
                  "flex-1 rounded-full px-3 py-2 text-sm transition-colors",
                  authMode === "signIn"
                    ? "bg-gold text-[#0E0E0E]"
                    : "border border-[#303030] text-muted-foreground hover:border-gold/40",
                )}
              >
                {t("communityRequest.auth.tabs.signIn")}
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode("signUp")}
                className={cn(
                  "flex-1 rounded-full px-3 py-2 text-sm transition-colors",
                  authMode === "signUp"
                    ? "bg-gold text-[#0E0E0E]"
                    : "border border-[#303030] text-muted-foreground hover:border-gold/40",
                )}
              >
                {t("communityRequest.auth.tabs.signUp")}
              </button>
            </div>
          )}

          {authMode === "signIn" && (
            <form onSubmit={handleSignIn} className="space-y-3" noValidate>
              <Field label={t("communityRequest.auth.fields.email")} required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={fieldClassName}
                />
              </Field>
              <Field label={t("communityRequest.auth.fields.password")} required>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  autoComplete="current-password"
                  showLabel={t("communityRequest.auth.showPassword")}
                  hideLabel={t("communityRequest.auth.hidePassword")}
                />
              </Field>
              <AuthFeedback error={authError} info={authInfo} />
              <Button
                type="submit"
                disabled={authBusy}
                className="w-full rounded-full bg-gold text-[#0E0E0E] hover:bg-gold/90 border-0 h-11 disabled:opacity-60"
              >
                {authBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t("communityRequest.auth.signingIn")}
                  </span>
                ) : (
                  t("communityRequest.auth.signIn")
                )}
              </Button>
            </form>
          )}

          {authMode === "signUp" && (
            <form onSubmit={handleSignUp} className="space-y-3" noValidate>
              <div className={cn(wide && "md:grid md:grid-cols-2 md:gap-3")}>
                <Field label={t("communityRequest.auth.fields.firstName")} required>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className={fieldClassName}
                  />
                </Field>
                <Field label={t("communityRequest.auth.fields.lastName")} required>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className={fieldClassName}
                  />
                </Field>
              </div>
              <Field label={t("communityRequest.auth.fields.email")} required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={fieldClassName}
                />
              </Field>
              <Field label={t("communityRequest.auth.fields.password")} required>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  autoComplete="new-password"
                  showLabel={t("communityRequest.auth.showPassword")}
                  hideLabel={t("communityRequest.auth.hidePassword")}
                />
              </Field>
              <AuthFeedback error={authError} info={authInfo} />
              <Button
                type="submit"
                disabled={authBusy}
                className="w-full rounded-full bg-gold text-[#0E0E0E] hover:bg-gold/90 border-0 h-11 disabled:opacity-60"
              >
                {authBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t("communityRequest.auth.creating")}
                  </span>
                ) : (
                  t("communityRequest.auth.createAccount")
                )}
              </Button>
            </form>
          )}

          {authMode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-3" noValidate>
              <Field label={t("communityRequest.auth.fields.email")} required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={fieldClassName}
                />
              </Field>
              <Field label={t("communityRequest.auth.fields.otp")} required>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className={fieldClassName}
                />
              </Field>
              <AuthFeedback error={authError} info={authInfo} />
              <Button
                type="submit"
                disabled={authBusy}
                className="w-full rounded-full bg-gold text-[#0E0E0E] hover:bg-gold/90 border-0 h-11 disabled:opacity-60"
              >
                {authBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t("communityRequest.auth.verifying")}
                  </span>
                ) : (
                  t("communityRequest.auth.verify")
                )}
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={authBusy}
                  className="text-gold hover:underline disabled:opacity-60"
                >
                  {t("communityRequest.auth.resend")}
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode("signIn")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("communityRequest.auth.backToSignIn")}
                </button>
              </div>
            </form>
          )}
        </div>
      </LayeredFormCard>
    );
  }

  return (
    <LayeredFormCard
      as="form"
      className={cn(
        wide && "md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-4 md:space-y-0 space-y-4",
        className,
      )}
      wide={wide}
      compact={!showHeader}
      onSubmit={handleSubmit}
      noValidate
    >
      {showHeader && <FormHeader t={t} wide={wide} />}

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/25 bg-gold/5 px-3 py-2 text-sm",
          spanFull,
        )}
      >
        <span className="text-muted-foreground">{t("communityRequest.auth.signedIn")}</span>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-gold hover:underline"
        >
          {t("communityRequest.auth.signOut")}
        </button>
      </div>

      <Field
        label={t("communityRequest.fields.who")}
        error={errors.requesterType}
        required
        className={spanFull}
      >
        <RadioGroup
          value={requesterType}
          onValueChange={(value) => {
            setRequesterType(value as RequesterType);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.requesterType;
              return next;
            });
          }}
          className="grid gap-2 sm:grid-cols-3"
          aria-required
        >
          {(
            [
              ["organization", "communityRequest.type.organization"],
              ["influencer", "communityRequest.type.influencer"],
              ["other", "communityRequest.type.other"],
            ] as const
          ).map(([value, labelKey]) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-3 text-sm transition-colors",
                requesterType === value
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

      <Field label={nameLabel} error={errors.name} required className={spanFull}>
        <Input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          autoComplete="organization"
          className={fieldClassName}
        />
      </Field>

      <Field label={t("communityRequest.fields.communityName")} className={spanFull}>
        <Input
          name="communityName"
          value={communityName}
          onChange={(e) => setCommunityName(e.target.value)}
          maxLength={200}
          className={fieldClassName}
        />
      </Field>

      <Field
        label={t("communityRequest.fields.description")}
        error={errors.description}
        required
        className={spanFull}
      >
        <Textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={cn(fieldClassName, "resize-none")}
          placeholder={t("communityRequest.fields.descriptionPlaceholder")}
        />
      </Field>

      {requesterType === "influencer" && (
        <Field label={t("communityRequest.fields.socialHandle")} className={spanFull}>
          <Input
            name="socialHandle"
            value={socialHandle}
            onChange={(e) => setSocialHandle(e.target.value)}
            placeholder={t("communityRequest.fields.socialHandlePlaceholder")}
            className={fieldClassName}
          />
        </Field>
      )}

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

function FormHeader({ t, wide }: { t: TranslateFn; wide?: boolean }) {
  return (
    <div className={cn(styles.header, wide && "md:col-span-2")}>
      <h3 className={styles.headerTitle}>{t("communityRequest.title")}</h3>
      <p className={styles.headerSubhead}>{t("communityRequest.subhead")}</p>
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

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  showLabel,
  hideLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={cn(fieldClassName, "pr-12")}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0 opacity-70 hover:opacity-100"
        aria-label={show ? hideLabel : showLabel}
      >
        <img
          src={show ? "/eye-open.png" : "/eye-closed.png"}
          alt=""
          width={22}
          height={22}
          className="h-[22px] w-[22px] object-contain"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function AuthFeedback({ error, info }: { error: string | null; info: string | null }) {
  if (!error && !info) return null;
  return (
    <div className="space-y-2">
      {info && (
        <p className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-sm text-foreground/90">
          {info}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#6b3d3d] bg-[#241515] px-3 py-2 text-sm text-[#f0bbbb]"
        >
          {error}
        </p>
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
