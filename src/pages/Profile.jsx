import { useEffect, useRef, useState } from "react";

import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PreferencesCard from "@/components/profile/PreferencesCard";
import {
    getCurrentUserProfile,
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

export default function Profile() {
    const [profile, setProfile] = useState(() => getCurrentUserProfile());
    const [draftValues, setDraftValues] = useState(() => getProfileFormValues(profile));
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileSaveStatus, setProfileSaveStatus] = useState({ status: "idle", message: "" });
    const [preferencesSaveStatus, setPreferencesSaveStatus] = useState({ status: "idle", message: "" });
    const profileStatusTimerRef = useRef(null);
    const preferencesStatusTimerRef = useRef(null);
    const profileUpdateTimerRef = useRef(null);
    const preferencesUpdateTimerRef = useRef(null);

    if (!profile) {
        return (
            <div className="brand-page px-4 py-10 md:px-8">
                <div className="brand-card mx-auto max-w-3xl rounded-[2rem] p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold text-[color:var(--brand-text)]">No profile found</p>
                </div>
            </div>
        );
    }

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

            if (preferencesStatusTimerRef.current) {
                window.clearTimeout(preferencesStatusTimerRef.current);
            }

            if (profileUpdateTimerRef.current) {
                window.clearTimeout(profileUpdateTimerRef.current);
            }

            if (preferencesUpdateTimerRef.current) {
                window.clearTimeout(preferencesUpdateTimerRef.current);
            }
        },
        [],
    );

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

    const handlePreferenceUpdate = (updates) => {
        setPreferencesSaveStatus({ status: "saving", message: "Saving..." });

        if (preferencesUpdateTimerRef.current) {
            window.clearTimeout(preferencesUpdateTimerRef.current);
        }

        preferencesUpdateTimerRef.current = window.setTimeout(() => {
            try {
                const nextProfile = updateCurrentUserProfile(updates);

                if (!nextProfile) {
                    setPreferencesSaveStatus({ status: "error", message: "Save failed" });
                    return;
                }

                setProfile(nextProfile);
                setPreferencesSaveStatus({ status: "success", message: "Saved ✓" });
                scheduleStatusReset(setPreferencesSaveStatus, preferencesStatusTimerRef);
            } catch {
                setPreferencesSaveStatus({ status: "error", message: "Save failed" });
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
                    <PreferencesCard
                        reminderTime={profile.reminderTime}
                        defaultHabitCategory={profile.defaultHabitCategory}
                        weekStartsOn={profile.weekStartsOn}
                        saveStatus={preferencesSaveStatus}
                        onReminderTimeChange={(value) => handlePreferenceUpdate({ reminderTime: value })}
                        onDefaultHabitCategoryChange={(value) => handlePreferenceUpdate({ defaultHabitCategory: value })}
                        onWeekStartsOnChange={(value) => handlePreferenceUpdate({ weekStartsOn: value })}
                    />
                </div>
            </div>
        </div>
    );
}
