import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import PainSection from "@/components/PainSection";
import WhatWeBring from "@/components/WhatWeBring";
import HowItWorks from "@/components/HowItWorks";
import FoundersFirst from "@/components/FoundersFirst";
import ApplicationSection from "@/components/ApplicationSection";

export default function Founders() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans selection:bg-gold/20">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <PainSection />
        <WhatWeBring />
        <HowItWorks />
        <FoundersFirst />
        <ApplicationSection />
      </main>
      <Footer />
    </div>
  );
}
