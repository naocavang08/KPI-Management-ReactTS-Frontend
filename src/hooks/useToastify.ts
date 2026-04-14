import { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ToastifyOptions = {
    position?: ToastPosition;
    delay?: number;
    speed?: number;
};

type ToastLevel = "default" | "info" | "success" | "error" | "warning";

type ToastFn = (title: string, body?: string) => void;

type ToastifyHook = {
    notify: (level: ToastLevel, title: string, body?: string) => void;
    info: ToastFn;
    success: ToastFn;
    warning: ToastFn;
    error: ToastFn;
};

const buildToastMessage = (title: string, body?: string) => {
    if (!body) return title;

    return `${title}: ${body}`;
};

const fireToast = (level: ToastLevel, title: string, body: string | undefined, options: ToastifyOptions) => {
    const message = buildToastMessage(title, body);
    const toastOptions = {
        position: options.position,
        autoClose: options.delay,
    };

    switch (level) {
        case "info":
            toast.info(message, toastOptions);
            break;
        case "success":
            toast.success(message, toastOptions);
            break;
        case "warning":
            toast.warning(message, toastOptions);
            break;
        case "error":
            toast.error(message, toastOptions);
            break;
        default:
            toast(message, toastOptions);
            break;
    }
};

export const useToastify = (options?: ToastifyOptions): ToastifyHook => {
    useEffect(() => {
        if (options?.speed) {
            // react-toastify does not support a speed option; keep for compatibility.
            void options.speed;
        }
    }, [options?.speed]);

    const resolvedOptions = useMemo<ToastifyOptions>(
        () => ({
            position: options?.position ?? "top-right",
            delay: options?.delay ?? 3500,
            speed: options?.speed,
        }),
        [options?.delay, options?.position, options?.speed]
    );

    const notify = useCallback(
        (level: ToastLevel, title: string, body?: string) => {
            fireToast(level, title, body, resolvedOptions);
        },
        [resolvedOptions]
    );

    const info = useCallback<ToastFn>((title, body) => {
        fireToast("info", title, body, resolvedOptions);
    }, [resolvedOptions]);

    const success = useCallback<ToastFn>((title, body) => {
        fireToast("success", title, body, resolvedOptions);
    }, [resolvedOptions]);

    const warning = useCallback<ToastFn>((title, body) => {
        fireToast("warning", title, body, resolvedOptions);
    }, [resolvedOptions]);

    const error = useCallback<ToastFn>((title, body) => {
        fireToast("error", title, body, resolvedOptions);
    }, [resolvedOptions]);

    return {
        notify,
        info,
        success,
        warning,
        error,
    };
};
