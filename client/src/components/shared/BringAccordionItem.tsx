import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type BringAccordionItemProps = {
  title: string;
  body: string;
  subtitle?: string;
};

export default function BringAccordionItem({ title, body, subtitle }: BringAccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("builders-bring__item", open && "builders-bring__item--open")}>
      <button
        type="button"
        className="builders-bring__trigger"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="font-serif text-2xl md:text-3xl text-left leading-snug">{title}</span>
        <ChevronUp
          className="builders-bring__arrow"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>
      <div className="builders-bring__body">
        {subtitle ? (
          <p className="text-foreground font-medium mb-3 leading-snug">{subtitle}</p>
        ) : null}
        <p className="text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
