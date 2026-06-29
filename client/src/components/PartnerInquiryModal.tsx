import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PartnerForm from "@/components/PartnerForm";
import { useLanguage } from "@/contexts/LanguageContext";

interface PartnerInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PartnerInquiryModal({ open, onOpenChange }: PartnerInquiryModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        overlayClassName="bg-black/70 z-[100]"
        className="z-[101] w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-card border border-[#303030] rounded-2xl p-6 sm:p-8"
      >
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="font-serif text-2xl leading-tight">
            {t("partner.title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t("partner.subhead")}
          </DialogDescription>
        </DialogHeader>
        <PartnerForm className="mt-4" onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
