import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const REVENUE_KEYS = ["under-1m", "1-5m", "5-25m", "25-50m", "over-50m"] as const;
const COUNTRY_KEYS = ["ma", "fr", "us", "gb", "ae", "ca", "de", "es", "be", "ch", "sn", "ci", "other"] as const;

const PHONE_CODES = [
  { value: "+212", label: "+212" },
  { value: "+33", label: "+33" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+971", label: "+971" },
  { value: "+32", label: "+32" },
  { value: "+41", label: "+41" },
  { value: "+221", label: "+221" },
  { value: "+225", label: "+225" },
] as const;

const fieldClassName =
  "bg-background border-[#303030] focus-visible:border-[#4A74B8] focus-visible:ring-[#4A74B8]/30";

interface ApplicationFormProps {
  onSuccess?: () => void;
  className?: string;
  wide?: boolean;
  showHeader?: boolean;
}

export default function ApplicationForm({
  onSuccess,
  className,
  wide = false,
  showHeader = false,
}: ApplicationFormProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [revenue, setRevenue] = useState("");
  const [country, setCountry] = useState("");
  const [phoneCode, setPhoneCode] = useState("+212");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextErrors: Record<string, string> = {};

    for (const field of ["fullName", "email", "company", "role"]) {
      if (!String(fd.get(field) || "").trim()) {
        nextErrors[field] = t("form.required");
      }
    }
    if (!revenue) nextErrors.revenue = t("form.required");
    if (!country) nextErrors.country = t("form.required");

    const email = String(fd.get("email") || "");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t("form.emailInvalid");
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      fullName: fd.get("fullName"),
      email: fd.get("email"),
      company: fd.get("company"),
      role: fd.get("role"),
      revenue,
      country,
      hoping: fd.get("hoping"),
      whatsapp: fd.get("whatsapp")
        ? `${phoneCode}${String(fd.get("whatsapp")).replace(/\s/g, "")}`
        : undefined,
    };

    if (import.meta.env.VITE_APPLICATION_FORM_URL) {
      try {
        await fetch(import.meta.env.VITE_APPLICATION_FORM_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Endpoint can be wired in production
      }
    }

    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) {
    return (
      <div className={cn("py-8 text-center space-y-5", className)}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
          <Check className="h-7 w-7 text-gold" strokeWidth={2.5} />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl">{t("apply.confirm.title")}</h2>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          {t("apply.confirm.body")}
        </p>
      </div>
    );
  }

  const spanFull = wide ? "md:col-span-2" : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4",
        wide && "md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-4 md:space-y-0",
        className
      )}
    >
      {showHeader && (
        <div className={cn("text-left space-y-2 mb-2", wide && "md:col-span-2")}>
          <h3 className="font-serif text-2xl leading-tight">{t("apply.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("apply.subhead")}</p>
        </div>
      )}
      <Field label={t("apply.fields.fullName")} error={errors.fullName} required>
        <Input name="fullName" className={fieldClassName} />
      </Field>
      <Field label={t("apply.fields.email")} error={errors.email} required>
        <Input name="email" type="email" className={fieldClassName} />
      </Field>
      <Field label={t("apply.fields.company")} error={errors.company} required>
        <Input name="company" className={fieldClassName} />
      </Field>
      <Field label={t("apply.fields.role")} error={errors.role} required>
        <Input name="role" className={fieldClassName} />
      </Field>
      <Field label={t("apply.fields.revenue")} error={errors.revenue} required>
        <Select value={revenue} onValueChange={setRevenue}>
          <SelectTrigger className={cn(fieldClassName, "w-full")}>
            <SelectValue placeholder={t("apply.fields.revenuePlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-[#303030]">
            {REVENUE_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`apply.revenue.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("apply.fields.country")} error={errors.country} required>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className={cn(fieldClassName, "w-full")}>
            <SelectValue placeholder={t("apply.fields.countryPlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-[#303030]">
            {COUNTRY_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`apply.country.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("apply.fields.hoping")} className={spanFull}>
        <Textarea name="hoping" rows={3} className={cn(fieldClassName, "resize-none")} />
      </Field>
      <Field label={t("apply.fields.whatsapp")} className={spanFull}>
        <div className="flex gap-2">
          <Select value={phoneCode} onValueChange={setPhoneCode}>
            <SelectTrigger className={cn(fieldClassName, "w-[6.5rem] shrink-0")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-[#303030]">
              {PHONE_CODES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="whatsapp"
            type="tel"
            placeholder="6 12 34 56 78"
            className={cn(fieldClassName, "flex-1")}
          />
        </div>
      </Field>
      <Button
        type="submit"
        className={cn(
          "w-full rounded-full bg-gold text-[#0E0E0E] hover:bg-gold/90 border-0 h-12 mt-2",
          spanFull
        )}
      >
        {t("apply.submit")}
      </Button>
    </form>
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
