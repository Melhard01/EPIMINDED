import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Enterprise from "@/pages/Enterprise";
import CommunityBuilders from "@/pages/CommunityBuilders";
import Founders from "@/pages/Founders";
import type { ReactNode } from "react";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ApplicationModalProvider } from "./contexts/ApplicationModalContext";
import { SmoothScrollProvider } from "./contexts/SmoothScrollProvider";
import CookieBanner from "./components/CookieBanner";
import ScrollToHash from "./components/ScrollToHash";
import PageBackground from "./components/PageBackground";
import FunnelShell from "@/funnel/FunnelShell";
import QuizPage from "@/funnel/pages/QuizPage";
import ReportPage from "@/funnel/pages/ReportPage";
import PaywallPage from "@/funnel/pages/PaywallPage";
import { CommunityPageClient } from "@/funnel/pages/CommunityPageClient";
import { OTPPageClient } from "@/funnel/pages/OTPPageClient";
import { PreCheckoutPageClient } from "@/funnel/pages/PreCheckoutPageClient";
import SuccessPage from "@/funnel/pages/SuccessPage";
import { useLocation } from "wouter";

function FunnelRoute({ children }: { children: ReactNode }) {
  return <FunnelShell>{children}</FunnelShell>;
}

function isFunnelPath(path: string) {
  return (
    path === "/quiz" ||
    path === "/report" ||
    path === "/paywall" ||
    path === "/success" ||
    path.startsWith("/pre-checkout")
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/founders" component={Founders} />
      <Route path="/community-builders" component={CommunityBuilders} />
      <Route path="/enterprise" component={Enterprise} />
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/privacy" component={Privacy} />
      <Route path="/legal/cookies" component={Cookies} />
      <Route path="/terms">{() => <Redirect to="/legal/terms" />}</Route>
      <Route path="/privacy">{() => <Redirect to="/legal/privacy" />}</Route>
      <Route path="/cookies">{() => <Redirect to="/legal/cookies" />}</Route>

      <Route path="/quiz">
        {() => (
          <FunnelRoute>
            <QuizPage />
          </FunnelRoute>
        )}
      </Route>
      <Route path="/report">
        {() => (
          <FunnelRoute>
            <ReportPage />
          </FunnelRoute>
        )}
      </Route>
      <Route path="/paywall">
        {() => (
          <FunnelRoute>
            <PaywallPage />
          </FunnelRoute>
        )}
      </Route>
      <Route path="/pre-checkout/community">
        {() => (
          <FunnelRoute>
            <CommunityPageClient />
          </FunnelRoute>
        )}
      </Route>
      <Route path="/pre-checkout/otp">
        {() => (
          <FunnelRoute>
            <OTPPageClient />
          </FunnelRoute>
        )}
      </Route>
      <Route path="/pre-checkout">
        {() => (
          <FunnelRoute>
            <PreCheckoutPageClient />
          </FunnelRoute>
        )}
      </Route>
      <Route path="/success">
        {() => (
          <FunnelRoute>
            <SuccessPage />
          </FunnelRoute>
        )}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const funnel = isFunnelPath(location.split("?")[0] || location);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <SmoothScrollProvider>
          <LanguageProvider>
            <ApplicationModalProvider>
              <TooltipProvider>
                <div className="dark min-h-screen relative overflow-x-hidden">
                  {!funnel && <PageBackground />}
                  <div className="relative z-[1]">
                    <Toaster />
                    <ScrollToHash />
                    <Router />
                    {!funnel && <CookieBanner />}
                  </div>
                </div>
              </TooltipProvider>
            </ApplicationModalProvider>
          </LanguageProvider>
        </SmoothScrollProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
