import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

export function Modal({
    children,
    label,
    onClose,
    onKeyDown
}: {
    children: ReactNode;
    label: string;
    onClose: () => void;
    onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current!;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            // React removes the dialog before this cleanup runs.
            // Return focus to the element that opened it if that element still exists.
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, []);

    return (
        <dialog
            ref={ref}
            aria-label={label}
            className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none items-center justify-center overflow-hidden border-0 bg-black/95 p-0 text-white backdrop:bg-black/50 open:flex"
            onCancel={event => {
                event.preventDefault();
                onClose();
            }}
            onKeyDown={onKeyDown}
            onClick={event => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            {children}
        </dialog>
    );
}
