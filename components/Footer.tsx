const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="text-white-800 flex items-center justify-center body-text w-full border-t border-black-400 bg-bff_green px-4 py-4">
      <p className="text-center text-sm sm:text-base whitespace-normal">
        Copyright © {currentYear} Bespoke Broncel Furniture | All Rights
        Reserved
      </p>
    </footer>
  );
};

export default Footer;
