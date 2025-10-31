declare module "react-responsive-masonry" {
    import { ReactNode } from "react";

    interface ResponsiveMasonryProps {
        columnsCountBreakPoints?: {
            [key: number]: number;
        };
        children: ReactNode;
    }

    interface MasonryProps {
        gutter?: string | number;
        children: ReactNode;
        columnsCount?: number;
    }

    export default function Masonry(props: MasonryProps): JSX.Element;
    export function ResponsiveMasonry(props: ResponsiveMasonryProps): JSX.Element;
}
