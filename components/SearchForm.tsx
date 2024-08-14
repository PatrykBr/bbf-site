"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { formUrlQuery } from "@/sanity/utils";

const SearchForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";
      if (search) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: search,
        });
      } else {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }
      router.push(newUrl, { scroll: false });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <form className="w-full">
      <label className="relative flex items-center">
        <Image
          src="/magnifying-glass.svg"
          className="absolute left-3"
          width={20}
          height={20}
          alt="Search icon"
        />
        <Input
          className="h-10 w-full pl-10 pr-4 text-sm bg-bff_green border-0 text-white-800 placeholder:text-white-800 focus:ring-0 focus:ring-offset-0"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
    </form>
  );
};

export default SearchForm;
