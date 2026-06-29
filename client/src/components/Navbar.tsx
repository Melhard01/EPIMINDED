import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Globe, Menu } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { CALENDLY_ENTERPRISE } from "@/lib/urls";
import { computeNavScrolled } from "@/lib/navScroll";
import { cn } from "@/lib/utils";

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const DURATION = "0.55s";
const NAV_NUDGE_RIGHT = 20;

const USE_CASE_ROUTES = ["/founders", "/community-builders", "/enterprise"] as const;

const navLinkClass =
  "shrink-0 border-0 bg-transparent shadow-none p-0 h-auto rounded-none text-xs lg:text-[0.8125rem] xl:text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:ring-0 focus-visible:outline-none";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { openApplication, openPartner } = useApplicationModal();
  const [scrolled, setScrolled] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const trackRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);
  const [navX, setNavX] = useState({ right: 0, center: 0 });

  const useCaseLinks = [
    { href: "/founders", label: t("nav.founders") },
    { href: "/community-builders", label: t("nav.communityBuilders") },
    { href: "/enterprise", label: t("nav.organisations") },
  ];

  const [useCasesOpen, setUseCasesOpen] = useState(false);
  const useCasesCloseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openUseCasesMenu = useCallback(() => {
    if (useCasesCloseTimer.current) clearTimeout(useCasesCloseTimer.current);
    setUseCasesOpen(true);
  }, []);

  const scheduleCloseUseCasesMenu = useCallback(() => {
    if (useCasesCloseTimer.current) clearTimeout(useCasesCloseTimer.current);
    useCasesCloseTimer.current = setTimeout(() => setUseCasesOpen(false), 120);
  }, []);

  useEffect(() => {
    return () => {
      if (useCasesCloseTimer.current) clearTimeout(useCasesCloseTimer.current);
    };
  }, []);
  const isEnterpriseRoute = location === "/enterprise" || location.startsWith("/enterprise/");
  const isUseCaseRoute = USE_CASE_ROUTES.some(
    (route) => location === route || location.startsWith(`${route}/`)
  );

  const ctaLabel =
    location === "/community-builders"
      ? t("nav.cta.partner")
      : isEnterpriseRoute
        ? t("nav.cta.bookCall")
        : location === "/" || location === "/founders"
          ? t("nav.cta.beta")
          : t("nav.cta.apply");

  const measureNav = useCallback(() => {
    const track = trackRef.current;
    const nav = navRef.current;
    const actions = actionsRef.current;
    if (!track || !nav) return false;

    const trackW = track.getBoundingClientRect().width;
    const navW = nav.getBoundingClientRect().width;
    const actionsW = actions?.getBoundingClientRect().width ?? 0;
    const gap = 16;

    const right = Math.max(0, trackW - navW + NAV_NUDGE_RIGHT);
    const center = Math.max(0, (trackW - actionsW - gap - navW) / 2 + NAV_NUDGE_RIGHT);

    setNavX((prev) => {
      if (prev.right === right && prev.center === center) return prev;
      return { right, center };
    });
    setNavReady(true);
    return true;
  }, []);

  const syncScrolled = useCallback(() => {
    const next = computeNavScrolled(location, scrolledRef.current);
    if (next !== scrolledRef.current) {
      scrolledRef.current = next;
      setScrolled(next);
    }
  }, [location]);

  useLayoutEffect(() => {
    measureNav();

    const track = trackRef.current;
    const nav = navRef.current;
    const actions = actionsRef.current;
    if (!track || !nav) return;

    const observer = new ResizeObserver(() => measureNav());
    observer.observe(track);
    observer.observe(nav);
    if (actions) observer.observe(actions);

    window.addEventListener("resize", measureNav);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureNav);
    };
  }, [measureNav, language, location, ctaLabel]);

  useEffect(() => {
    const handleScroll = () => syncScrolled();
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [syncScrolled]);

  useLayoutEffect(() => {
    setMobileOpen(false);
    scrolledRef.current = false;
    setScrolled(false);
    measureNav();
    syncScrolled();
  }, [location, measureNav, syncScrolled]);

  const toggleLanguage = () => setLanguage(language === "fr" ? "en" : "fr");

  const handleCta = () => {
    if (location === "/community-builders") {
      openPartner();
    } else if (isEnterpriseRoute) {
      window.open(CALENDLY_ENTERPRISE, "_blank");
    } else {
      openApplication();
    }
  };

  const navTranslateX = scrolled ? navX.center : navX.right;
  const motionStyle = {
    transition: `transform ${DURATION} ${EASE}, opacity ${DURATION} ${EASE}`,
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 overflow-x-hidden transition-[background-color,padding,box-shadow] duration-300",
        scrolled
          ? "bg-surface/90 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent backdrop-blur-none shadow-none py-4"
      )}
    >
      <div className="container relative flex items-center gap-3 min-h-9">
        <Link href="/" className="flex h-9 shrink-0 items-center lg:-ml-2 xl:-ml-4">
          <img
            src="/assets/epiminded-logo.png"
            alt="EpiMinded"
            className="h-6 w-auto cursor-pointer lg:h-9 lg:max-h-9 lg:object-contain"
          />
        </Link>

        <div ref={trackRef} className="hidden lg:block relative flex-1 h-9 min-w-0">
          <div
            ref={navRef}
            className={cn(
              "absolute top-1/2 left-0 flex items-center gap-2 xl:gap-5 will-change-transform motion-reduce:transition-none",
              !navReady && "opacity-0"
            )}
            style={{
              ...motionStyle,
              transform: `translate3d(${navTranslateX}px, -50%, 0)`,
            }}
          >
            <Link
              href="/"
              className={cn(
                navLinkClass,
                location === "/" ? "text-foreground" : "text-muted-foreground hover:text-primary"
              )}
            >
              {t("nav.home")}
            </Link>

            <DropdownMenu open={useCasesOpen} onOpenChange={setUseCasesOpen} modal={false}>
              <div
                className="relative"
                onMouseEnter={openUseCasesMenu}
                onMouseLeave={scheduleCloseUseCasesMenu}
              >
                <DropdownMenuTrigger
                  className={cn(
                    navLinkClass,
                    "inline-flex items-center gap-1 cursor-pointer",
                    "data-[state=open]:bg-transparent data-[state=open]:shadow-none",
                    isUseCaseRoute ? "text-foreground" : "text-muted-foreground hover:text-primary"
                  )}
                  onPointerDown={(e) => e.preventDefault()}
                >
                  {t("nav.useCases")}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
                      useCasesOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={10}
                  className="min-w-[13rem] bg-card border-[#303030] rounded-xl p-1.5"
                  onMouseEnter={openUseCasesMenu}
                  onMouseLeave={scheduleCloseUseCasesMenu}
                >
                  {useCaseLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild className="rounded-lg cursor-pointer">
                      <Link
                        href={link.href}
                        className={cn(
                          "w-full text-sm font-medium",
                          location === link.href ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </div>
            </DropdownMenu>
          </div>
        </div>

        <div
          ref={actionsRef}
          className={cn(
            "hidden lg:flex h-9 items-center gap-2.5 absolute top-1/2 right-0 lg:mr-[calc(2cm-0.5rem)] xl:mr-[calc(2cm-1rem)]",
            "will-change-[transform,opacity] motion-reduce:transition-none"
          )}
          style={{
            ...motionStyle,
            opacity: !navReady ? 0 : scrolled ? 1 : 0,
            transform: `translate3d(${scrolled ? 0 : 16}px, -50%, 0)`,
            pointerEvents: scrolled && navReady ? "auto" : "none",
          }}
          aria-hidden={!scrolled}
        >
          <button
            type="button"
            onClick={toggleLanguage}
            tabIndex={scrolled ? 0 : -1}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-full hover:bg-secondary/10"
          >
            <Globe className="w-4 h-4 shrink-0" />
            {language.toUpperCase()}
          </button>
          <Button
            onClick={handleCta}
            tabIndex={scrolled ? 0 : -1}
            className={cn(
              "inline-flex shrink-0 bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full border-0 shadow-lg shadow-gold/10 whitespace-nowrap",
              isEnterpriseRoute
                ? "h-8 px-3 xl:px-4 text-[0.6875rem] xl:text-[0.75rem]"
                : "h-9 max-w-[9.5rem] xl:max-w-none px-3 xl:px-6 text-xs xl:text-sm truncate"
            )}
            title={ctaLabel}
          >
            {ctaLabel}
          </Button>
        </div>

        <div className="flex h-9 shrink-0 items-center justify-end ml-auto lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              data-lenis-prevent
              className="bg-surface border-0 inset-0 h-full w-full max-w-full sm:max-w-full left-0"
            >
              <div className="container flex flex-col items-center gap-8 pt-16 pb-10 h-full">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-center text-foreground transition-colors hover:text-primary"
                >
                  {t("nav.home")}
                </Link>

                <div className="flex flex-col items-center gap-4 w-full">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {t("nav.useCases")}
                  </p>
                  {useCaseLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "text-lg font-medium text-center transition-colors hover:text-primary",
                        location === link.href ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-secondary/10 w-fit"
                >
                  <Globe className="w-4 h-4" />
                  {language === "fr" ? "English" : "Français"}
                </button>
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    handleCta();
                  }}
                  className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full border-0 w-full sm:w-auto max-w-sm"
                >
                  {ctaLabel}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
