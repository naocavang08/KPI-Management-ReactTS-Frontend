import { useCallback, useState } from "react";
import { forgotPassword, resetPassword } from "../api/auth.api";
import type { ForgotPasswordRequest, ResetPasswordRequest } from "../interfaces/auth.types";
import { useToastify } from "./useToastify";

const getErrorMessage = (err: unknown, fallback: string) => {
    const errorWithResponse = err as {
        response?: { data?: { message?: string; error?: { message?: string } } };
        message?: string;
    };

    return (
        errorWithResponse.response?.data?.error?.message ||
        errorWithResponse.response?.data?.message ||
        (err instanceof Error ? err.message : errorWithResponse.message) ||
        fallback
    );
};

export const useForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useToastify();

    const submit = useCallback(
        async (payload: ForgotPasswordRequest) => {
            try {
                setIsLoading(true);
                const response = await forgotPassword(payload);
                success("OTP sent", response.message);
                return response;
            } catch (err) {
                error("Request failed", getErrorMessage(err, "Could not send OTP"));
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [error, success]
    );

    return { isLoading, submit };
};

export const useResetPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { success, error } = useToastify();

    const submit = useCallback(
        async (payload: ResetPasswordRequest) => {
            try {
                setIsLoading(true);
                const response = await resetPassword(payload);
                success("Password reset", response.message);
                return response;
            } catch (err) {
                error("Reset failed", getErrorMessage(err, "Could not reset password"));
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [error, success]
    );

    return { isLoading, submit };
};
