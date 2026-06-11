import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    // Here you would typically initialize Google Analytics or other tracking
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground flex-1">
          {language === 'fr' ? (
            <p>
              Nous utilisons des cookies pour améliorer votre expérience sur notre site, analyser le trafic et personnaliser le contenu. 
              En cliquant sur "Accepter", vous consentez à notre utilisation des cookies. 
              Pour en savoir plus, consultez notre <a href="/legal/cookies" className="underline hover:text-foreground">Politique des Cookies</a>.
            </p>
          ) : (
            <p>
              We use cookies to enhance your experience on our website, analyze traffic, and personalize content. 
              By clicking "Accept", you consent to our use of cookies. 
              To learn more, read our <a href="/legal/cookies" className="underline hover:text-foreground">Cookie Policy</a>.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={handleDecline} className="whitespace-nowrap">
            {language === 'fr' ? 'Refuser' : 'Decline'}
          </Button>
          <Button onClick={handleAccept} className="bg-gold text-white hover:bg-gold/90 whitespace-nowrap">
            {language === 'fr' ? 'Accepter' : 'Accept'}
          </Button>
        </div>
      </div>
    </div>
  );
}
