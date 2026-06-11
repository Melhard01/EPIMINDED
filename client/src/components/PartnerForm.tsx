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

const SIZE_KEYS = ["500-1000", "1000-5000", "5000+"] as const;

const fieldClassName =
  "bg-background border-[#303030] focus-visible:border-[#4A74B8] focus-visible:ring-[#4A74B8]/30";

interface PartnerFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  wide?: boolean;
}

export default function PartnerForm({ onSuccess, onClose, className, wide = false }: PartnerFormProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [size, setSize] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextErrors: Record<string, string> = {};

    for (const field of ["fullName", "email", "brand"]) {
      if (!String(fd.get(field) || "").trim()) {
        nextErrors[field] = t("form.required");
      }
    }
    if (!size) nextErrors.size = t("form.required");

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
      brand: fd.get("brand"),
      size,
      audience: fd.get("audience"),
      workUrl: fd.get("workUrl"),
    };

    if (import.meta.env.VITE_PARTNER_FORM_URL) {
      try {
        await fetch(import.meta.env.VITE_PARTNER_FORM_URL, {
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
        <h2 className="font-serif text-2xl md:text-3xl">{t("partner.confirm.title")}</h2>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          {t("partner.confirm.body")}
        </p>
        {onClose && (
          <Button onClick={onClose} className="rounded-full mt-2">
            {t("partner.confirm.close")}
          </Button>
        )}
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
      <Field label={t("partner.fields.fullName")} error={errors.fullName} required>
        <Input name="fullName" className={fieldClassName} />
      </Field>
      <Field label={t("partner.fields.email")} error={errors.email} required>
        <Input name="email" type="email" className={fieldClassName} />
      </Field>
      <Field label={t("partner.fields.brand")} error={errors.brand} required>
        <Input name="brand" className={fieldClassName} />
      </Field>
      <Field label={t("partner.fields.size")} error={errors.size} required>
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger className={cn(fieldClassName, "w-full")}>
            <SelectValue placeholder={t("partner.fields.sizePlaceholder")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-[#303030]">
            {SIZE_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`partner.size.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("partner.fields.audience")} className={spanFull}>
        <Textarea name="audience" rows={3} className={cn(fieldClassName, "resize-none")} />
      </Field>
      <Field label={t("partner.fields.workUrl")} className={spanFull}>
        <Input name="workUrl" type="url" className={fieldClassName} />
      </Field>
      <Button
        type="submit"
        className={cn(
          "w-full rounded-full bg-gold text-[#0E0E0E] hover:bg-gold/90 border-0 h-12 mt-2",
          spanFull
        )}
      >
        {t("partner.submit")}
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
