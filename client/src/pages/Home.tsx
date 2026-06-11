import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import TrustBand from "@/components/TrustBand";
import PainSection from "@/components/PainSection";
import WhatWeBring from "@/components/WhatWeBring";
import HowItWorks from "@/components/HowItWorks";
import WhyNowStats from "@/components/WhyNowStats";
import FoundersCohort from "@/components/FoundersCohort";
import AudienceBridge from "@/components/AudienceBridge";
import FinalCTA from "@/components/FinalCTA";
import ApplicationSection from "@/components/ApplicationSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans selection:bg-gold/20">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TrustBand />
        <PainSection />
        <WhatWeBring />
        <HowItWorks />
        <WhyNowStats />
        <FoundersCohort />
        <AudienceBridge />
        <FinalCTA />
        <ApplicationSection />
      </main>
      <Footer />
    </div>
  );
}
