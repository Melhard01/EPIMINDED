import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Enterprise from "@/pages/Enterprise";
import CommunityBuilders from "@/pages/CommunityBuilders";
import Founders from "@/pages/Founders";
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
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <SmoothScrollProvider>
          <LanguageProvider>
            <ApplicationModalProvider>
              <TooltipProvider>
                <div className="dark min-h-screen relative overflow-x-hidden">
                  <PageBackground />
                  <div className="relative z-[1]">
                    <Toaster />
                    <ScrollToHash />
                    <Router />
                    <CookieBanner />
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
