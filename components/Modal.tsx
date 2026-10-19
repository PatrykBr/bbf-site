"use client";

import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { lockPageScroll } from "@/lib/scroll-lock";

export function Modal({
    children,
    label,
    onClose,
    onKeyDown,
    isOpen = true,
    className = "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none items-center justify-center overflow-hidden border-0 bg-black/95 p-0 text-white backdrop:bg-black/50 open:flex"
}: {
    children: ReactNode;
    label: string;
    onClose: () => void;
    onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
    isOpen?: boolean;
    className?: string;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useLayoutEffect(() => {
        if (!isOpen) return;
        const dialog = ref.current!;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const unlockScroll = lockPageScroll("#000");
        dialog.showModal();
        dialog.focus({ preventScroll: true });
        return () => {
            dialog.close();
            unlockScroll();
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [isOpen]);

    return (
        <dialog
            ref={ref}
            tabIndex={-1}
            aria-label={label}
            className={`modal-surface ${className}`}
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
