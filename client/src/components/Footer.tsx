import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Instagram, Linkedin, Mail } from "lucide-react";
import {
  APP_STORE_URL,
  INSTAGRAM_URL,
  EPINEON_URL,
  LINKEDIN_URL,
  PLAY_STORE_URL,
  SUPPORT_EMAIL,
} from "@/lib/urls";

const PRODUCT_SECTIONS = [
  { href: "/#for-founders", path: "/", sectionId: "for-founders", labelKey: "footer.product.founders" },
  {
    href: "/community-builders#for-community-builders",
    path: "/community-builders",
    sectionId: "for-community-builders",
    labelKey: "footer.product.communityBuilders",
  },
  {
    href: "/enterprise#for-organisations",
    path: "/enterprise",
    sectionId: "for-organisations",
    labelKey: "footer.product.organisations",
  },
] as const;

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-background border-t border-[#303030]">
      <div className="container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
          <div className="space-y-4">
            <div className="mb-4 min-h-12 flex items-center">
              <img src="/assets/epiminded-logo.png" alt="EpiMinded" className="h-12 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 min-h-12 flex items-center">Product</h4>
            <ul className="space-y-3">
              {PRODUCT_SECTIONS.map(({ href, path, sectionId, labelKey }) => (
                <li key={sectionId}>
                  <Link
                    href={href}
                    onClick={(e) => {
                      if (window.location.pathname === path) {
                        e.preventDefault();
                        scrollToSection(sectionId);
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.product.downloadApp")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 min-h-12 flex items-center">Company</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={EPINEON_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.company.about")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 min-h-12 flex items-center">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.terms")}
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.cookies")}
                </Link>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.legal.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#303030]">
          <p className="text-sm text-muted-foreground text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
