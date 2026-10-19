"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { getEnquiryHref } from "@/lib/enquiry";
import { trackContactClick, type ContactMethod } from "@/lib/posthog";

interface ContactActionProps {
    method?: ContactMethod;
    href?: string;
    projectSlug?: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
}

export function ContactAction({
    method = "enquiry",
    href,
    projectSlug,
    className,
    children,
    onClick
}: ContactActionProps) {
    return (
        <Link
            href={(href ?? getEnquiryHref(projectSlug)) as Route}
            className={className}
            onClick={() => {
                trackContactClick(method, projectSlug);
                onClick?.();
            }}
        >
            {children}
        </Link>
    );
}
