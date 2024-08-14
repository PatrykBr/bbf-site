import Hero from "@/components/Hero";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Work from "@/components/Work";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

interface Props {
  searchParams: { [key: string]: string | undefined };
}

const Home = ({ searchParams }: Props) => {
  return (
    <main>
      <Navbar />
      <Hero />
      <Work searchParams={searchParams} />
      <About />
      <Contact />
      <Footer />
      <SpeedInsights />
      <Analytics />
    </main>
  );
};

export default Home;
