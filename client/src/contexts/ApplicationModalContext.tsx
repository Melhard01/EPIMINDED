import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import ApplicationModal from "@/components/ApplicationModal";
import PartnerInquiryModal from "@/components/PartnerInquiryModal";
import { scrollToApply } from "@/lib/scrollToApply";
import { scrollToPartner } from "@/lib/scrollToPartner";
import { getLenis } from "@/lib/smoothScroll";

interface ModalContextType {
  openApplication: () => void;
  openPartner: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ApplicationModalProvider({ children }: { children: ReactNode }) {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;

    if (applicationOpen || partnerOpen) {
      lenis.stop();
      return () => lenis.start();
    }
  }, [applicationOpen, partnerOpen]);

  return (
    <ModalContext.Provider
      value={{
        openApplication: () => {
          if (scrollToApply()) return;
          setApplicationOpen(true);
        },
        openPartner: () => {
          const onCommunityBuildersPage = window.location.pathname === "/community-builders";
          if (onCommunityBuildersPage && scrollToPartner()) return;
          setPartnerOpen(true);
        },
      }}
    >
      {children}
      <ApplicationModal open={applicationOpen} onOpenChange={setApplicationOpen} />
      <PartnerInquiryModal open={partnerOpen} onOpenChange={setPartnerOpen} />
    </ModalContext.Provider>
  );
}

export function useApplicationModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useApplicationModal must be used within ApplicationModalProvider");
  return ctx;
}
