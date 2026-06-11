import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Reveal from "@/components/ui/reveal";
import { useLanguage } from "@/contexts/LanguageContext";

interface LegalLayoutProps {
  children: ReactNode;
  title: string;
}

export default function LegalLayout({ children, title }: LegalLayoutProps) {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-secondary/30">
      <Navbar />
      <main className="flex-grow pt-32 pb-20">
        <div className="container max-w-4xl mx-auto px-4">
          <Reveal variant="fade">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
            </Link>
          </Reveal>
          <Reveal variant="up" delay={80}>
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-12 text-foreground">{title}</h1>
          </Reveal>
          <Reveal variant="fade" delay={160}>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              {children}
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}
