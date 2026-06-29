import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeHero from "@/components/home/HomeHero";
import ThreeDoors from "@/components/home/ThreeDoors";
import FourPillars from "@/components/home/FourPillars";
import WhyNow from "@/components/home/WhyNow";
import RetentionSection from "@/components/home/RetentionSection";
import AboutEpineon from "@/components/home/AboutEpineon";
import HomeCTA from "@/components/home/HomeCTA";

export default function Home() {
  return (
    <div className="dark min-h-screen flex flex-col bg-background font-sans selection:bg-gold/20 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <HomeHero />
        <ThreeDoors />
        <FourPillars />
        <WhyNow />
        <RetentionSection />
        <AboutEpineon />
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
}
