import Hero from "@/components/Hero";
import CommunitySection from "@/components/CommunitySection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import OrbitCardSection from "@/components/OrbitCardSection";
import SocialProofSection from "@/components/SocialProofSection";
import FinalCTA from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <CommunitySection />
      <ProblemSection />
      <SolutionSection />
      <OrbitCardSection />
      <SocialProofSection />
      <FinalCTA />
    </main>
  );
}
