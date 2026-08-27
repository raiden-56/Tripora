import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MarketingNav } from "./MarketingNav";
import { Hero } from "./Hero";
import { ProblemSection } from "./ProblemSection";
import { MapStorySection } from "./MapStorySection";
import { InteractiveMapShowcase } from "./InteractiveMapShowcase";
import { TimelineSection } from "./TimelineSection";
import { FeaturesSection } from "./FeaturesSection";
import { MemoriesSection } from "./MemoriesSection";
import { DriveSection } from "./DriveSection";
import { ExplorerSection } from "./ExplorerSection";
import { AISection } from "./AISection";
import { StatisticsSection } from "./StatisticsSection";
import { RecapSection } from "./RecapSection";
import { StoriesSection } from "./StoriesSection";
import { WhySection } from "./WhySection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { UseCasesSection } from "./UseCasesSection";
import { RoadTripSection } from "./RoadTripSection";
import { UpcomingBucketSection } from "./UpcomingBucketSection";
import { PricingTeaserSection } from "./PricingTeaserSection";
import { PrivacySection } from "./PrivacySection";
import { FAQSection } from "./FAQSection";
import { ContactSection } from "./ContactSection";
import { NewsletterSection } from "./NewsletterSection";
import { FinalCTASection } from "./FinalCTASection";
import { MarketingFooter } from "./MarketingFooter";

/**
 * Public marketing website for TravelCanvas.
 * Entirely separate from the existing application — every CTA here routes into
 * the existing app's auth entry points (/login, /signup) or demo mode (/app via startDemo()).
 * Nothing under src/pages/(app routes) or src/components/(app UI) is modified by this module.
 */
export function MarketingSite() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const startDemo = useAuthStore((s) => s.startDemo);

  const startJourney = () => navigate(isAuthenticated ? "/app" : "/login");
  const goToLogin = () => navigate("/login");
  const exploreDemo = () => {
    startDemo();
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14171a] overflow-x-hidden">
      <MarketingNav onLogin={goToLogin} onStartJourney={startJourney} />
      <Hero onStartJourney={startJourney} />
      <ProblemSection />
      <MapStorySection />
      <InteractiveMapShowcase onStartJourney={startJourney} />
      <TimelineSection />
      <FeaturesSection />
      <MemoriesSection />
      <DriveSection onConnect={startJourney} />
      <ExplorerSection onStartJourney={startJourney} />
      <AISection onStartJourney={startJourney} />
      <StatisticsSection />
      <RecapSection onStartJourney={startJourney} />
      <StoriesSection onStartJourney={startJourney} />
      <WhySection />
      <HowItWorksSection />
      <UseCasesSection />
      <RoadTripSection />
      <UpcomingBucketSection onStartJourney={startJourney} />
      <PricingTeaserSection onStartJourney={startJourney} />
      <PrivacySection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <NewsletterSection />
      <FinalCTASection
        onStartJourney={startJourney}
        onExploreDemo={exploreDemo}
      />
      <MarketingFooter />
    </div>
  );
}
