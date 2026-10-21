import { ParallaxImage } from "./ParallaxImage";
import { ContactForm } from "./ContactForm";
import { ContactAction } from "./ContactAction";
import { contactInfo, businessHours, phoneHref, whatsappHref, companyInfo } from "@/lib/data/contact";
import { getAllPastWork } from "@/lib/data/past-work";

function ContactIcon({ method }: { method: "phone" | "whatsapp" | "email" | "facebook" }) {
    const background = method === "email" ? "bg-red-600" : method === "facebook" ? "bg-[#1877F2]" : "bg-brand-dark/30";
    const paths = {
        phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
        whatsapp:
            "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
        email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
        facebook: "M14 21v-8h3l.5-4H14V7c0-1 .5-1.5 1.5-1.5H18V2h-3c-3 0-5 2-5 5v2H7v4h3v8"
    };
    return (
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${background}`}>
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={paths[method]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    );
}

export function ContactSection() {
    const projects = getAllPastWork().map(({ slug, name }) => ({ slug, name }));
    const methods = [
        {
            method: "phone",
            label: "Call us",
            value: contactInfo.phone,
            href: phoneHref,
            note: `Available ${businessHours.days}, ${businessHours.hours}`
        },
        {
            method: "whatsapp",
            label: "WhatsApp",
            value: "Message us on WhatsApp",
            href: whatsappHref,
            note: "Send photos of your room or a project you like."
        },
        {
            method: "email",
            label: "Email",
            value: contactInfo.email,
            href: `mailto:${contactInfo.email}`,
            note: "We reply within 24 hours"
        },
        {
            method: "facebook",
            label: "Facebook",
            value: companyInfo.name,
            href: contactInfo.facebook,
            note: "See our latest projects"
        }
    ] as const;

    return (
        <section id="contact" className="bg-brand-light pt-4 pb-16 sm:pt-8 sm:pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-6 text-center text-3xl font-bold text-white sm:mb-10 sm:text-4xl">Get in touch</h2>
                <div className="mb-5 flex gap-3 lg:hidden">
                    <ContactAction
                        method="phone"
                        href={phoneHref}
                        className="bg-brand-dark flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white focus-visible:outline-white"
                    >
                        Call us
                    </ContactAction>
                    <ContactAction
                        method="whatsapp"
                        href={whatsappHref}
                        className="text-brand-dark flex min-h-11 flex-1 items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold focus-visible:outline-white"
                    >
                        WhatsApp
                    </ContactAction>
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
                    <div className="rounded-2xl bg-white p-5 sm:p-8 lg:order-2">
                        <h3 className="text-brand-dark text-xl font-semibold">Send us a message</h3>
                        <p className="mt-2 mb-6 text-sm leading-relaxed text-gray-600">
                            Tell us what you would like made. We will reply within 24 hours to discuss your project.
                        </p>
                        <ContactForm projects={projects} />
                    </div>
                    <div className="bg-brand-dark/20 shadow-brand-dark/5 rounded-2xl border border-white/15 p-5 text-white shadow-lg backdrop-blur-sm sm:p-8 lg:order-1">
                        <h3 className="mb-6 text-xl font-semibold">Contact details</h3>
                        <div className="space-y-5">
                            {methods.map(({ method, label, value, href, note }) => (
                                <ContactAction
                                    key={method}
                                    method={method}
                                    href={href}
                                    className="-m-2 flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-white/5 focus-visible:outline-white"
                                >
                                    <ContactIcon method={method} />
                                    <span className="min-w-0">
                                        <span className="mb-1 block text-sm text-white/95">{label}</span>
                                        <span
                                            className={`block font-semibold ${method === "email" ? "break-all" : ""}`}
                                        >
                                            {value}
                                        </span>
                                        <span className="mt-1 block text-sm leading-relaxed text-white/95">{note}</span>
                                    </span>
                                </ContactAction>
                            ))}
                        </div>
                        <div className="parallax-frame relative mt-7 flex h-32 items-center justify-center overflow-clip rounded-xl sm:h-40">
                            <ParallaxImage
                                src="/contact-bg.webp"
                                alt="Furniture workshop"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-black/60" />
                            <div className="relative px-4 text-center">
                                <p className="text-lg font-semibold">{companyInfo.name}</p>
                                <p className="mt-1 text-sm">{companyInfo.location}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
