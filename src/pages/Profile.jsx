import { useEffect, useMemo, useRef, useState } from "react";

import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfileSettingsCard from "@/components/profile/ProfileSettingsCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useCheckinContext } from "@/hooks/useCheckins";
import { useHabitContext } from "@/hooks/useHabits";
import {
    getCurrentUserProfile,
    getHabitDefaultFormValues,
    getProfileFormValues,
    formatJoinedDate,
    updateCurrentUserProfile,
} from "@/services/profile";
import { formatDate } from "@/utils/helper";
import { calculateLongestStreak, calculateTotalCompletions } from "@/utils/statsHelper";

function validateProfileForm(values) {
    const errors = {};

    if (!values.fullName.trim()) {
        errors.fullName = "Full name is required.";
    }

    if (values.dateOfBirth && values.dateOfBirth > formatDate()) {
        errors.dateOfBirth = "Date of birth cannot be in the future.";
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

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read image file."));
        reader.readAsDataURL(file);
    });
}

function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to load image."));
        image.src = dataUrl;
    });
}

async function compressAvatarFile(file) {
    const sourceDataUrl = await readFileAsDataUrl(file);
    const image = await loadImageFromDataUrl(sourceDataUrl);

    const maxDimension = 512;
    const widthScale = maxDimension / image.width;
    const heightScale = maxDimension / image.height;
    const scale = Math.min(1, widthScale, heightScale);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Unable to process image.");
    }

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.82);
}

export default function Profile() {
    const [profile, setProfile] = useState(() => getCurrentUserProfile());
    const [draftValues, setDraftValues] = useState(() => getProfileFormValues(profile));
    const [profileSettingsDraft, setProfileSettingsDraft] = useState(() => getProfileSettingsDraft(profile));
    const [avatarError, setAvatarError] = useState("");
    const [avatarSaveStatus, setAvatarSaveStatus] = useState({ status: "idle", message: "" });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileSaveStatus, setProfileSaveStatus] = useState({ status: "idle", message: "" });
    const [profileSettingsSaveStatus, setProfileSettingsSaveStatus] = useState({ status: "idle", message: "" });
    const profileStatusTimerRef = useRef(null);
    const profileSettingsStatusTimerRef = useRef(null);
    const avatarStatusTimerRef = useRef(null);
    const profileUpdateTimerRef = useRef(null);
    const profileSettingsUpdateTimerRef = useRef(null);
    const { allHabits } = useHabitContext();
    const { checkins } = useCheckinContext();

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

    const summaryCards = useMemo(() => {
        const checkinsByHabitId = new Map();

        (checkins || []).forEach((checkin) => {
            if (!checkinsByHabitId.has(checkin.habitId)) {
                checkinsByHabitId.set(checkin.habitId, []);
            }

            checkinsByHabitId.get(checkin.habitId).push(checkin);
        });

        const habits = allHabits || [];

        const completedCount = habits.reduce((total, habit) => {
            const habitCheckins = checkinsByHabitId.get(habit.id) || [];
            return total + calculateTotalCompletions(habit, habitCheckins);
        }, 0);

        const bestStreak = habits.reduce((maxStreak, habit) => {
            const habitCheckins = checkinsByHabitId.get(habit.id) || [];
            return Math.max(maxStreak, calculateLongestStreak(habit, habitCheckins));
        }, 0);

        return [
            {
                label: "Joined",
                value: profile?.createdAt ? formatJoinedDate(profile.createdAt) : "Unknown",
                tone: "bg-brand-blue/30",
            },
            {
                label: "Week starts",
                value: profile?.weekStartsOn === "sunday" ? "Sunday" : "Monday",
                tone: "bg-brand-green/30",
            },
            {
                label: "Completed",
                value: completedCount.toLocaleString(),
                tone: "bg-brand-pink/10",
            },
            {
                label: "Best streak",
                value: `${bestStreak} day${bestStreak === 1 ? "" : "s"}`,
                tone: "bg-brand-yellow/40",
            },
        ];
    }, [allHabits, checkins, profile?.createdAt, profile?.weekStartsOn]);

    useEffect(
        () => () => {
            if (profileStatusTimerRef.current) {
                window.clearTimeout(profileStatusTimerRef.current);
            }

            if (profileSettingsStatusTimerRef.current) {
                window.clearTimeout(profileSettingsStatusTimerRef.current);
            }

            if (avatarStatusTimerRef.current) {
                window.clearTimeout(avatarStatusTimerRef.current);
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
                    dateOfBirth: draftValues.dateOfBirth?.trim() || "",
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

    const handleAvatarFilePick = async (file, event) => {
        if (event?.target) {
            event.target.value = "";
        }

        if (!file) {
            return;
        }

        if (!file.type?.startsWith("image/")) {
            setAvatarError("Please choose an image file.");
            setAvatarSaveStatus({ status: "error", message: "Save failed" });
            return;
        }

        setAvatarError("");
        setAvatarSaveStatus({ status: "saving", message: "Saving..." });

        try {
            const compressedDataUrl = await compressAvatarFile(file);
            const nextProfile = updateCurrentUserProfile({ image: compressedDataUrl });

            if (!nextProfile) {
                setAvatarSaveStatus({ status: "error", message: "Save failed" });
                return;
            }

            setProfile(nextProfile);
            setAvatarSaveStatus({ status: "success", message: "Avatar updated" });
            scheduleStatusReset(setAvatarSaveStatus, avatarStatusTimerRef);
        } catch {
            setAvatarError("Image is too large or unsupported.");
            setAvatarSaveStatus({ status: "error", message: "Save failed" });
        }
    };

    return (
        <div className="brand-page relative overflow-visible px-4 py-6 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-6xl space-y-6">
                <ProfileHeader
                    profile={profile}
                    summaryCards={summaryCards}
                    isEditing={isEditing}
                    onEdit={openEditMode}
                    saveStatus={profileSaveStatus}
                    avatarError={avatarError}
                    avatarSaveStatus={avatarSaveStatus}
                    onAvatarFilePick={handleAvatarFilePick}
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
