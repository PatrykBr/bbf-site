import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <li>
    <Link href={href}>{children}</Link>
  </li>
);

const DropdownNavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <DropdownMenuItem asChild>
    <Link href={href} className="w-full">
      {children}
    </Link>
  </DropdownMenuItem>
);

const Navbar: React.FC = () => {
  return (
    <nav className="flex-center fixed top-0 z-50 w-full border-b-2 border-bff_green/30 bg-bff_green/50 py-5 text-white backdrop-blur-sm">
      <div className="flex-between mx-auto w-full px-3 xs:px-8 sm:px-16">
        <Link href="#Home" className="relative w-[124px] h-[60px]">
          <Image
            src="/yellow-logo-outline.webp"
            alt="Logo"
            fill
            sizes="124px"
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>
        <div>
          <ul className="flex-center gap-x-3 md:gap-x-10">
            <li className="body-text max-[550px]:hidden">
              <Link href="tel:+447523706742">Call +44 7523 706742</Link>
            </li>
            <li className="h-8">
              <Button
                variant="secondary"
                className="h-full rounded-xl bg-secondary/90 px-4 text-xl text-bff_green hover:bg-secondary/80 transition-all duration-300 hover:shadow-glow-green max-[380px]:px-2 max-[380px]:text-base max-[380px]:w-32"
              >
                <Link href="#Contact" className="font-dmSans whitespace-nowrap">
                  Contact me &gt;
                </Link>
              </Button>
            </li>
            <li className="min-[550px]:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-40 bg-bff_green/90 text-white"
                  align="end"
                >
                  <DropdownNavLink href="#Home">Home</DropdownNavLink>
                  <DropdownNavLink href="#Work">Work</DropdownNavLink>
                  <DropdownNavLink href="#About">About</DropdownNavLink>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
          <ul className="mt-3 flex flex-row justify-end gap-5 pr-5 font-medium uppercase tracking-widest drop-shadow-md max-[550px]:hidden">
            <NavLink href="#Home">Home</NavLink>
            <NavLink href="#Work">Work</NavLink>
            <NavLink href="#About">About</NavLink>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
