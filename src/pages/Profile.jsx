import { useState } from "react";

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
    const [statusMessage, setStatusMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

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
        setStatusMessage("");
        setIsEditing(true);
    };

    const cancelEditMode = () => {
        setDraftValues(getProfileFormValues(profile));
        setErrors({});
        setStatusMessage("");
        setIsEditing(false);
    };

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
            return;
        }

        setIsSaving(true);

        const updatedProfile = updateCurrentUserProfile({
            fullName: draftValues.fullName.trim(),
            email: draftValues.email.trim(),
        });

        setProfile(updatedProfile);
        setDraftValues(getProfileFormValues(updatedProfile));
        setErrors({});
        setStatusMessage("Profile updated.");
        setIsEditing(false);
        setIsSaving(false);
    };

    const handlePreferenceUpdate = (updates) => {
        const nextProfile = updateCurrentUserProfile(updates);
        setProfile(nextProfile);
        setStatusMessage("Preferences updated.");
    };

    return (
        <div className="brand-page relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-6xl space-y-6">
                <ProfileHeader
                    profile={profile}
                    isEditing={isEditing}
                    onEdit={openEditMode}
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
                        onReminderTimeChange={(value) => handlePreferenceUpdate({ reminderTime: value })}
                        onDefaultHabitCategoryChange={(value) => handlePreferenceUpdate({ defaultHabitCategory: value })}
                        onWeekStartsOnChange={(value) => handlePreferenceUpdate({ weekStartsOn: value })}
                    />
                </div>

                {statusMessage ? (
                    <div className="inline-flex rounded-full bg-brand-yellow px-4 py-2 text-sm text-[color:var(--brand-text)] shadow-sm">
                        {statusMessage}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
