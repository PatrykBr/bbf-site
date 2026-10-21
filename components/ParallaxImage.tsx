import Image, { type ImageProps } from "next/image";

export function ParallaxImage({
    src,
    alt,
    sizes = "100vw",
    preload = false,
    unoptimized = false
}: {
    src: ImageProps["src"];
    alt: string;
    sizes?: string;
    preload?: boolean;
    unoptimized?: boolean;
}) {
    return (
        <div className="parallax-image absolute inset-x-0 -inset-y-[20%]">
            <Image
                src={src}
                alt={alt}
                fill
                preload={preload}
                unoptimized={unoptimized}
                sizes={sizes}
                className="object-cover object-center"
            />
        </div>
    );
}
