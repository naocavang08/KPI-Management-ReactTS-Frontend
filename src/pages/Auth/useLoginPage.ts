import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth.store";
import { useToggle } from "@/hooks/useCustomeHook";
import { useToastify } from "@/hooks/useToastify";
import type { LoginRequest } from "@/interfaces/auth.types";

const defaultValues: LoginRequest = {
    email: "",
    password: "",
};

export const useLoginPage = () => {
    const navigate = useNavigate();
    const isLoading = useAuthStore((state) => state.isLoading);
    const login = useAuthStore((state) => state.login);

    const form = useForm<LoginRequest>({
        defaultValues,
        mode: "onSubmit",
    });

    const [showPassword, togglePassword] = useToggle(false);
    const { success, error } = useToastify({
        position: "top-right",
        delay: 3500,
        speed: 18,
    });

    const onSubmit = useCallback(
        async (values: LoginRequest) => {
            try {
                await login(values);
                success("Signed in", "Welcome back.");
                navigate("/dashboard", { replace: true });
            } catch (err) {
                const message = err instanceof Error ? err.message : "Login failed";
                error("Sign in failed", message);
            }
        },
        [error, login, navigate, success]
    );

    return {
        form,
        onSubmit,
        isLoading,
        showPassword,
        togglePassword,
    };
};
