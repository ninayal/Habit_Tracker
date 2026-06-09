import mockData from "@/mockData";
import { storage, STORAGE_KEYS } from "@/utils/storage";


export function initializeData() {
    if (!storage.get(STORAGE_KEYS.USERS)) {
        storage.set(
            STORAGE_KEYS.USERS,
            mockData.users
        );
    }

    if (!storage.get(STORAGE_KEYS.HABITS)) {
        storage.set(
            STORAGE_KEYS.HABITS,
            mockData.habits
        );
    }

    if (!storage.get(STORAGE_KEYS.CHECKINS)) {
        storage.set(
            STORAGE_KEYS.CHECKINS,
            mockData.checkins
        );
    }

    if (!storage.get(STORAGE_KEYS.GOALS)) {
        storage.set(
            STORAGE_KEYS.GOALS,
            mockData.goals
        );
    }
}