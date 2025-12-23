import { ContactInfo } from "../types";

/**
 * Contact information for Bespoke Broncel Furniture
 * Ordered by priority: phone/WhatsApp > email > Facebook
 */
export const contactInfo: ContactInfo = {
    phone: "+44 7523 706742",
    whatsapp: "+447523706742", // WhatsApp format (no spaces)
    email: "broncelfurniture@gmail.com",
    facebook: "https://www.facebook.com/BespokeBroncelFurniture"
};

/**
 * Business hours display
 */
export const businessHours = {
    days: "Monday - Friday",
    hours: "9am - 5pm"
};

/**
 * Company information
 */
export const companyInfo = {
    name: "Bespoke Broncel Furniture",
    slogan: "Building your dream",
    tagline: "Building your dream furniture in South Yorkshire",
    description:
        "Our company has 25 years of experience in carpentry, we have been on the English market since 2007 and we are successfully developing every year. Our main field is the production of custom-made furniture, in particular kitchens and built-in wardrobes. We have a very large range of colours and materials at your disposal. We operate throughout a large part of England.",
    location: "South Yorkshire, UK",
    yearsExperience: 25,
    establishedYear: 2007
};
