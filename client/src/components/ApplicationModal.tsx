import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RequestCommunityForm from "@/components/RequestCommunityForm";
import { useLanguage } from "@/contexts/LanguageContext";

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApplicationModal({ open, onOpenChange }: ApplicationModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-lenis-prevent
        overlayClassName="bg-black/70 z-[100]"
        className="z-[101] w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-card border border-[#303030] rounded-2xl p-6 sm:p-8"
      >
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="font-serif text-2xl leading-tight">
            {t("communityRequest.title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {t("communityRequest.subhead")}
          </DialogDescription>
        </DialogHeader>
        <RequestCommunityForm
          className="mt-4"
          onSuccess={() => {
            /* keep modal open to show confirmation */
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
