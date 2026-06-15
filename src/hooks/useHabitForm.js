import { useEffect, useState } from "react";
import { useHabitContext } from "@/hooks/useHabits";
import { formatDate, normalizeFrequency } from "@/utils/helper";

export function useHabitForm({ habit, onSuccess }) {
    const isEdit = !!habit;

    const today = formatDate();

    const getInitialValues = () => ({
        icon: habit?.icon || "💧",
        name: habit?.name || "",
        category: habit?.category || "Health",
        startDate: habit?.startDate || today,
        frequency: habit?.frequency || {
            repeatType: "specific_days",
            daysOfWeek: [],
        },
        targetPerDay: habit?.targetPerDay || 1,
        priority: habit?.priority || "Medium",
        autoOpenNote: habit?.autoOpenNote || false,
    });

    const { createHabit, updateHabit } = useHabitContext();

    const [form, setForm] = useState(() => getInitialValues());
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(getInitialValues());
        setErrors({});
    }, [habit]);

    const updateField = (path, value) => {
        const keys = path.split(".");
        setForm(prev => {
            const newForm = { ...prev };
            let current = newForm;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newForm;
        });

        setErrors(prev => ({
            ...prev,
            [path]: undefined,
        }));
    };

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

    const submit = () => {
        if (!validate()) {
            return false;
        }

        const habitData = {
            ...form,
            frequency: normalizeFrequency(form.frequency),
        };

        try {
            setLoading(true);
            let result;
            if (isEdit) {
                result = updateHabit(habit.id, habitData);
            } else {
                result = createHabit(habitData);
                // console.log(habitData)
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
        setErrors,
        updateField,
        setForm,
        submit,
        isEdit,
    };
}