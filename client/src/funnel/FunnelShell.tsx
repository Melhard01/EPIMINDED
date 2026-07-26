import type { ReactNode } from "react";
import "./funnel.css";
import { FunnelProvider } from "@/funnel/lib/funnel/store";
import { SiteFooter } from "@/funnel/components/ui/SiteFooter";

export default function FunnelShell({ children }: { children: ReactNode }) {
  return (
    <FunnelProvider>
      <div className="funnel-root min-h-screen font-funnel-sans text-body antialiased">
        {children}
        <SiteFooter />
      </div>
    </FunnelProvider>
  );
}
