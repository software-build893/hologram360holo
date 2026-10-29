import Hero from "@/components/Hero";
import { Footer, Kit, Reel, Wild } from "@/components/Sections";
import Prices from "@/components/Prices";
import Beacon from "@/components/Beacon";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <Wild />
      <Reel />
      <Kit />
      <Prices />
      <Footer />
      <Beacon />
    </main>
  );
}
