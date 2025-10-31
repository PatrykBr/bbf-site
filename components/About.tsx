export default function About() {
    const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        mainEntity: {
            "@type": "Organization",
            name: "Bespoke Broncel Furniture",
            description:
                "25 years of experience in carpentry. Operating in England since 2007, specializing in custom-made furniture including kitchens and built-in wardrobes.",
            foundingDate: "2007",
            yearsInOperation: 25
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
            <section
                id="about"
                className="bg-primary relative h-screen overflow-hidden"
                aria-labelledby="about-heading"
            >
                <div className="absolute inset-0 py-32 sm:p-8 md:p-12">
                    <div className="about-background h-full w-full bg-cover bg-center bg-no-repeat brightness-50">
                        <div className="absolute inset-0 backdrop-blur-xs backdrop-filter" />
                    </div>
                </div>
                <div className="relative z-10 flex h-full items-center justify-center py-4 sm:p-8 md:p-12">
                    <article className="mx-auto max-w-4xl px-4 text-center sm:px-8 md:px-12">
                        <h2
                            id="about-heading"
                            className="mb-4 text-xl font-bold text-white drop-shadow-md sm:text-2xl md:text-3xl"
                        >
                            Designed for your Home
                        </h2>
                        <p className="text-sm text-white drop-shadow-md sm:text-base md:text-lg">
                            Our company has 25 years of experience in carpentry, we have been on the English market
                            since 2007 and we are successfully developing every year. Our main field is the production
                            of custom-made furniture, in particular kitchens and built-in wardrobes. We have a very
                            large range of colours and materials at your disposal. We operate throughout a large part of
                            England
                        </p>
                    </article>
                </div>
            </section>
        </>
    );
}
