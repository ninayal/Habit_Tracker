import { useEffect, useRef, useState } from "react";

import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileSettingsCard from "@/components/profile/ProfileSettingsCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
    getCurrentUserProfile,
    getHabitDefaultFormValues,
    getProfileFormValues,
    updateCurrentUserProfile,
} from "@/services/profile";

function validateProfileForm(values) {
    const errors = {};

    if (!values.fullName.trim()) {
        errors.fullName = "Full name is required.";
    }

    if (!values.email.trim()) {
        errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
        errors.email = "Enter a valid email address.";
    }

    return errors;
}

function updateNestedValue(source, path, value) {
    const keys = path.split(".");

    const nextValue = Array.isArray(source) ? [...source] : { ...source };
    let current = nextValue;

    for (let index = 0; index < keys.length - 1; index += 1) {
        const key = keys[index];
        const currentValue = current[key];
        current[key] = Array.isArray(currentValue) ? [...currentValue] : { ...currentValue };
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;

    return nextValue;
}

function getProfileSettingsDraft(profile) {
    return {
        ...getHabitDefaultFormValues(profile),
        weekStartsOn: profile?.weekStartsOn || "monday",
    };
}

export default function Profile() {
    const [profile, setProfile] = useState(() => getCurrentUserProfile());
    const [draftValues, setDraftValues] = useState(() => getProfileFormValues(profile));
    const [profileSettingsDraft, setProfileSettingsDraft] = useState(() => getProfileSettingsDraft(profile));
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileSaveStatus, setProfileSaveStatus] = useState({ status: "idle", message: "" });
    const [profileSettingsSaveStatus, setProfileSettingsSaveStatus] = useState({ status: "idle", message: "" });
    const profileStatusTimerRef = useRef(null);
    const profileSettingsStatusTimerRef = useRef(null);
    const profileUpdateTimerRef = useRef(null);
    const profileSettingsUpdateTimerRef = useRef(null);

    const openEditMode = () => {
        setDraftValues(getProfileFormValues(profile));
        setErrors({});
        setIsEditing(true);
    };

    const cancelEditMode = () => {
        setDraftValues(getProfileFormValues(profile));
        setErrors({});
        setIsEditing(false);
    };

    const scheduleStatusReset = (setter, timerRef, delay = 2500) => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            setter({ status: "idle", message: "" });
            timerRef.current = null;
        }, delay);
    };

    useEffect(
        () => () => {
            if (profileStatusTimerRef.current) {
                window.clearTimeout(profileStatusTimerRef.current);
            }

            if (profileSettingsStatusTimerRef.current) {
                window.clearTimeout(profileSettingsStatusTimerRef.current);
            }

            if (profileUpdateTimerRef.current) {
                window.clearTimeout(profileUpdateTimerRef.current);
            }

            if (profileSettingsUpdateTimerRef.current) {
                window.clearTimeout(profileSettingsUpdateTimerRef.current);
            }
        },
        [],
    );

    if (!profile) {
        return (
            <div className="brand-page px-4 py-10 md:px-8">
                <div className="brand-card mx-auto max-w-3xl rounded-[2rem] p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold text-[color:var(--brand-text)]">No profile found</p>
                </div>
            </div>
        );
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setDraftValues((current) => ({
            ...current,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((current) => ({
                ...current,
                [name]: undefined,
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const nextErrors = validateProfileForm(draftValues);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setProfileSaveStatus({ status: "error", message: "Save failed" });
            return;
        }

        setIsSaving(true);
        setProfileSaveStatus({ status: "saving", message: "Saving..." });

        if (profileUpdateTimerRef.current) {
            window.clearTimeout(profileUpdateTimerRef.current);
        }

        profileUpdateTimerRef.current = window.setTimeout(() => {
            try {
                const updatedProfile = updateCurrentUserProfile({
                    fullName: draftValues.fullName.trim(),
                    email: draftValues.email.trim(),
                });

                if (!updatedProfile) {
                    setProfileSaveStatus({ status: "error", message: "Save failed" });
                    return;
                }

                setProfile(updatedProfile);
                setDraftValues(getProfileFormValues(updatedProfile));
                setProfileSettingsDraft(getProfileSettingsDraft(updatedProfile));
                setErrors({});
                setIsEditing(false);
                setProfileSaveStatus({ status: "success", message: "Saved ✓" });
                scheduleStatusReset(setProfileSaveStatus, profileStatusTimerRef);
            } catch {
                setProfileSaveStatus({ status: "error", message: "Save failed" });
            } finally {
                setIsSaving(false);
            }
        }, 120);
    };

    const handleProfileSettingsUpdate = (path, value) => {
        const nextProfileSettings = updateNestedValue(profileSettingsDraft, path, value);
        setProfileSettingsDraft(nextProfileSettings);
        setProfileSettingsSaveStatus({ status: "saving", message: "Saving..." });

        if (profileSettingsUpdateTimerRef.current) {
            window.clearTimeout(profileSettingsUpdateTimerRef.current);
        }

        profileSettingsUpdateTimerRef.current = window.setTimeout(() => {
            try {
                const { weekStartsOn, ...habitDefaults } = nextProfileSettings;
                const nextProfile = updateCurrentUserProfile({
                    habitDefaults,
                    weekStartsOn,
                });

                if (!nextProfile) {
                    setProfileSettingsSaveStatus({ status: "error", message: "Save failed" });
                    return;
                }

                setProfile(nextProfile);
                setProfileSettingsDraft(getProfileSettingsDraft(nextProfile));
                setProfileSettingsSaveStatus({ status: "success", message: "Saved ✓" });
                scheduleStatusReset(setProfileSettingsSaveStatus, profileSettingsStatusTimerRef);
            } catch {
                setProfileSettingsSaveStatus({ status: "error", message: "Save failed" });
            }
        }, 120);
    };

    return (
        <div className="brand-page relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-6xl space-y-6">
                <ProfileHeader
                    profile={profile}
                    isEditing={isEditing}
                    onEdit={openEditMode}
                    saveStatus={profileSaveStatus}
                />

                {isEditing ? (
                    <ProfileEditForm
                        values={draftValues}
                        errors={errors}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={cancelEditMode}
                        isSaving={isSaving}
                    />
                ) : null}

                <div className="grid gap-6">
                    <ProfileSettingsCard
                        profileSettings={profileSettingsDraft}
                        saveStatus={profileSettingsSaveStatus}
                        onFieldChange={handleProfileSettingsUpdate}
                    />
                </div>
            </div>
        </div>
    );
}
