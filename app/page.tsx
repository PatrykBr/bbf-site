import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import Work from "@/components/Work";
import About from "@/components/About";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Work />
      <About />
      <Contact />
    </div>
  );
}
