"use client";
import { formUrlQuery } from "@/sanity/utils";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const links = ["all", "wardrobes", "kitchens", "other"];

const Filters = () => {
  const [active, setActive] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilter = (link: string) => {
    let newUrl = "";
    if (active === link) {
      setActive("");
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["category"],
      });
    } else {
      setActive(link);
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "category",
        value: link.toLowerCase(),
      });
    }
    router.push(newUrl, { scroll: false });
  };

  return (
    <ul className="flex flex-nowrap justify-between gap-2 w-full">
      {links.map((link) => (
        <li key={link} className="flex-grow">
          <button
            onClick={() => handleFilter(link)}
            className={`
              ${active === link ? "bg-[#186116]" : "bg-bff_green"}
              w-full h-8 sm:h-10 rounded-lg px-2 sm:px-4 
              text-xs sm:text-sm capitalize text-white-800 
              transition-colors whitespace-nowrap overflow-hidden text-ellipsis
            `}
          >
            {link}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Filters;
