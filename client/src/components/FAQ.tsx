import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
  ];

  return (
    <section id="faq" className="section-padding bg-background relative">
      <div className="section-divider absolute top-0" />
      <div className="container max-w-2xl">
        <Reveal className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            {t("faq.title")}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="premium-card-static border-border/80 px-6 data-[state=open]:border-gold/20 transition-all duration-300"
              >
                <AccordionTrigger className="text-base md:text-lg font-medium text-foreground hover:text-gold hover:no-underline py-5 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5 border-t border-border/50 pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
