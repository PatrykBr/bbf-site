import { ContactInfo } from "../types";

export const contactInfo: ContactInfo = {
    phone: "+44 7523 706742",
    email: "broncelfurniture@gmail.com",
    facebook: "https://www.facebook.com/BespokeBroncelFurniture"
};

export const phoneHref = `tel:${contactInfo.phone.replace(/\s/g, "")}`;
export const whatsappHref = `https://wa.me/${contactInfo.phone.replace(/\D/g, "")}`;

export const businessHours = {
    days: "Monday to Friday",
    hours: "9am to 5pm",
    schema: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00"
    }
};

export const companyInfo = {
    name: "Bespoke Broncel Furniture",
    tagline: "Fitted kitchens and wardrobes in South Yorkshire",
    description:
        "We make custom kitchens and fitted wardrobes, with 25 years of carpentry experience. We have worked in England since 2007 and are based in South Yorkshire. Choose the colours and materials for your furniture. We take on projects across much of England.",
    location: "South Yorkshire, UK"
};
