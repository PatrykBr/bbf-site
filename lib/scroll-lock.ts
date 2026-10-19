export function lockPageScroll(background?: string) {
    const root = document.documentElement;
    const body = document.body;
    const { scrollX, scrollY } = window;
    const previousRootOverflow = root.style.overflowY;
    const previousRootBackground = root.style.backgroundColor;
    const previousScrollbarBackground = root.style.getPropertyValue("--scrollbar-background");
    const previousBody = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        width: body.style.width,
        overflow: body.style.overflow
    };

    root.style.overflowY = window.innerWidth > root.clientWidth ? "scroll" : "hidden";
    if (background) {
        root.style.backgroundColor = background;
        root.style.setProperty("--scrollbar-background", background);
    }
    Object.assign(body.style, {
        position: "fixed",
        top: `${-scrollY}px`,
        left: `${-scrollX}px`,
        width: "100%",
        overflow: "hidden"
    });

    return () => {
        Object.assign(body.style, previousBody);
        root.style.overflowY = previousRootOverflow;
        root.style.backgroundColor = previousRootBackground;
        root.style.setProperty("--scrollbar-background", previousScrollbarBackground);
        window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
}
