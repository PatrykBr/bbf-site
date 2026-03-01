const DEFAULT_SITE_URL = "https://www.broncelfurniture.com";

function normalizeUrl(value: string): string {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return DEFAULT_SITE_URL;
    }

    const withProtocol = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;

    try {
        const parsedUrl = new URL(withProtocol);
        return parsedUrl.origin;
    } catch {
        return DEFAULT_SITE_URL;
    }
}

export const SITE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);

export function getSiteUrl(pathname: string = ""): string {
    if (!pathname) {
        return SITE_URL;
    }

    if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
        return pathname;
    }

    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${SITE_URL}${normalizedPath}`;
}
