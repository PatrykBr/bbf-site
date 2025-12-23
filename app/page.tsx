import { Header, Footer, Hero, AboutSection, ContactSection, WorkGrid } from "@/components";
import { getAllPastWork } from "@/lib/data/past-work";

export default function Home() {
    const pastWork = getAllPastWork(true);

    return (
        <>
            <Header />
            <main>
                <Hero />
                <WorkGrid items={pastWork} />
                <AboutSection />
                <ContactSection />
            </main>
            <Footer />
        </>
    );
}
