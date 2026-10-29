import Hero from "@/components/Hero";
import { Footer, HowItWorks, Kit, Reel, Wild } from "@/components/Sections";
import Prices from "@/components/Prices";
import Beacon from "@/components/Beacon";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <HowItWorks />
      <Wild />
      <Reel />
      <Kit />
      <Prices />
      <Footer />
      <Beacon />
    </main>
  );
}
