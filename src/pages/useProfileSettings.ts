import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useToastify } from "../hooks/useToastify";
import type { AuthUser, ChangePasswordRequest } from "../interfaces/auth.types";

type ProfileForm = {
    fullname: string;
    avatarUrl: string;
};

type PasswordForm = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const emptyProfile: ProfileForm = {
    fullname: "",
    avatarUrl: "",
};

const emptyPassword: PasswordForm = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
};

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

export const useProfileSettings = () => {
    const user = useAuthStore((state) => state.user);
    const permissions = useAuthStore((state) => state.permissions);
    const isProfileLoading = useAuthStore((state) => state.isProfileLoading);
    const fetchMe = useAuthStore((state) => state.fetchMe);
    const updateProfileName = useAuthStore((state) => state.updateProfileName);
    const updateAvatar = useAuthStore((state) => state.updateAvatar);
    const changePassword = useAuthStore((state) => state.changePassword);
    const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
    const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPassword);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const { success, error } = useToastify();

    useEffect(() => {
        void fetchMe().catch((err) => {
            error("Load profile failed", getErrorMessage(err, "Could not load profile"));
        });
    }, [error, fetchMe]);

    useEffect(() => {
        if (!user) return;

        setProfileForm({
            fullname: user.displayName ?? "",
            avatarUrl: user.avatarUrl ?? "",
        });
    }, [user]);

    const roleNames = useMemo(
        () => user?.roles?.map((role) => role.displayName || role.name).join(", ") || "No roles",
        [user?.roles]
    );

    const updateProfileField = useCallback(
        <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
            setProfileForm((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const updatePasswordField = useCallback(
        <K extends keyof PasswordForm>(field: K, value: PasswordForm[K]) => {
            setPasswordForm((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const saveProfile = useCallback(async () => {
        const fullname = profileForm.fullname.trim();
        const avatarUrl = profileForm.avatarUrl.trim();

        if (!fullname) {
            error("Validation failed", "Full name is required");
            return;
        }

        try {
            setIsSavingProfile(true);
            if (fullname !== (user?.displayName ?? "")) {
                await updateProfileName(fullname);
            }
            if (avatarUrl !== (user?.avatarUrl ?? "")) {
                await updateAvatar(avatarUrl);
            }
            success("Profile updated", "Your profile information has been saved.");
        } catch (err) {
            error("Update failed", getErrorMessage(err, "Could not update profile"));
            throw err;
        } finally {
            setIsSavingProfile(false);
        }
    }, [error, profileForm.avatarUrl, profileForm.fullname, success, updateAvatar, updateProfileName, user]);

    const savePassword = useCallback(async () => {
        const payload: ChangePasswordRequest = {
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword,
        };

        if (!payload.oldPassword || !payload.newPassword || !payload.confirmPassword) {
            error("Validation failed", "Please fill in all password fields");
            return;
        }

        if (payload.newPassword !== payload.confirmPassword) {
            error("Validation failed", "Password confirmation does not match");
            return;
        }

        try {
            setIsSavingPassword(true);
            await changePassword(payload);
            setPasswordForm(emptyPassword);
            success("Password updated", "Your password has been changed.");
        } catch (err) {
            error("Password update failed", getErrorMessage(err, "Could not change password"));
            throw err;
        } finally {
            setIsSavingPassword(false);
        }
    }, [changePassword, error, passwordForm, success]);

    return {
        user: user as AuthUser | null,
        permissions,
        profileForm,
        passwordForm,
        roleNames,
        isProfileLoading,
        isSavingPassword,
        isSavingProfile,
        updateProfileField,
        updatePasswordField,
        saveProfile,
        savePassword,
    };
};
