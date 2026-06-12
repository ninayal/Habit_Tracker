import { useEffect, useState } from "react";
import { habitService } from "@/services/habits";

export function useHabitForm({ habit, onSuccess }) {
    const isEdit = !!habit;

    const getInitialValues = () => ({
        icon: habit?.icon || "💧",
        name: habit?.name || "",
        category: habit?.category || "Health",
        startDate: habit?.startDate || "",
        frequency: habit?.frequency || {
            repeatType: "specific_days",
            daysOfWeek: [],
        },
        targetPerDay: habit?.targetPerDay || 1,
        priority: habit?.priority || "Medium",
        autoOpenNote: habit?.autoOpenNote || false,
    });

    const [form, setForm] = useState(getInitialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(getInitialValues());
        setErrors({});
    }, [habit]);

    const updateField = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))
        setErrors((prev) => ({
            ...prev,
            [key]: undefined,
        }))
    }

    const validate = () => {
        const newErrors = {}
        if (!form.name.trim()) {
            newErrors.name = "Name is required"
        }
        if (!form.startDate) {
            newErrors.startDate = "Start date is required"
        }
        if (!form.targetPerDay || form.targetPerDay < 1) {
            newErrors.targetPerDay =
                "Target per day must be greater than 0"
        }

        if (form.frequency.repeatType === "specific_days" && form.frequency.daysOfWeek.length === 0) {
            newErrors.daysOfWeek = "Please select at least one day"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const submit = async () => {
        if (!validate()) {
            return false;
        }

        try {
            setLoading(true);
            let result;
            if (isEdit) {
                result = habitService.updateHabit(habit.id, form);
            } else {
                result = habitService.createHabit(form);
            }

            onSuccess?.(result);
            return result;
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        errors,
        updateField,
        setForm,
        submit,
        isEdit,
    };
}