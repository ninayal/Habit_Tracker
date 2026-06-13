import React, { useEffect, useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import EmojiPicker from "emoji-picker-react"
import { useHabitForm } from "@/hooks/useHabitForm"
import { toast } from "react-toastify"

const categories = ["Health", "Study", "Work", "Mindfulness", "Other"]
const priorities = ["High", "Medium", "Low"]

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


export default function HabitForm({ children, open, setOpen, habit }) {
    const [showEmoji, setShowEmoji] = useState(false)

    const { form, errors, setErrors, loading, updateField,
        setForm, submit, isEdit
    } = useHabitForm({
        habit,
        onSuccess: () => {
            setOpen(false);
            toast.success(isEdit? "Update habit successfully!" : "Create habit successfully!")
        }
    });

    const toggleDay = (index) => {
        const exists = form.frequency.daysOfWeek.includes(index);
        updateField("frequency.daysOfWeek",
            exists ? form.frequency.daysOfWeek.filter(
                d => d !== index
            ) : [ ...form.frequency.daysOfWeek, index ]
        );
        setErrors(prev => ({
            ...prev,
            daysOfWeek: undefined,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="sm:max-w-xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">
                        {isEdit ? "Edit Habit" : "Create Habit"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 px-4 py-2">
                    <div className="space-y-2 relative">
                        {/* ICON */}
                        <div className="flex items-end justify-center gap-4">
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <button
                                    type="button"
                                    className={`text-base border rounded-md px-2 py-1 ${showEmoji ? 'border-pink-400' : ''}`}
                                    onClick={() => setShowEmoji((prev) => !prev)}
                                >
                                    {form.icon}
                                </button>
                            </div>
                            {/* NAME */}
                            <div className="space-y-2 flex-1">
                                <Label className={``}>Name</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) =>
                                        updateField("name", e.target.value)
                                    }
                                    placeholder="Drink water"
                                    className={`focus-visible:border-pink-400 focus-visible:ring-0 focus-visible:ring-transparent outline-none`}
                                />
                            </div>
                        </div>
                        {errors.name && (
                            <p className="text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}

                        {showEmoji && (
                            <div className="absolute z-50">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        updateField("icon", emojiData.emoji)
                                        setShowEmoji(false)
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        {/* CATEGORY */}
                        <div className="space-y-2 w-full">
                            <Label>Category</Label>

                            <Select
                                value={form.category}
                                onValueChange={(value) =>
                                    updateField("category", value)
                                }
                            >
                                <SelectTrigger className="w-full shadow-none ring-0 focus:ring-pink-400 focus-visible:border-pink-400 focus-visible:ring-pink-400">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem className={`p-2`} key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* PRIORITY */}
                        <div className="space-y-2 w-full">
                            <Label>Priority</Label>

                            <Select
                                value={form.priority}
                                onValueChange={(value) =>
                                    updateField("priority", value)
                                }
                            >
                                <SelectTrigger className="w-full shadow-none ring-0 focus:ring-pink-400 focus-visible:border-pink-400 focus-visible:ring-pink-400">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {priorities.map((p) => (
                                        <SelectItem className={`p-2`} key={p} value={p}>
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* START DATE */}
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={form.startDate}
                            onChange={(e) =>
                                updateField("startDate", e.target.value)
                            }
                            className={`focus-visible:border-pink-400 focus-visible:ring-0 focus-visible:ring-transparent outline-none`}
                        />
                        {errors.startDate && (
                            <p className="text-xs text-red-500">
                                {errors.startDate}
                            </p>
                        )}
                    </div>

                    {/* FREQUENCY */}
                    <div className="space-y-2">
                        <Label>Frequency</Label>

                        <Select
                            value={form.frequency.repeatType}
                            onValueChange={(value) =>
                                updateField(
                                    "frequency.repeatType",
                                    value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className={`p-2`} value="daily">Daily</SelectItem>
                                <SelectItem className={`p-2`} value="specific_days">
                                    Specific Days
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {form.frequency.repeatType === "specific_days" && (
                            <div className="grid grid-cols-7 gap-2 pt-2">
                                {days.map((d, idx) => (
                                    <button
                                        type="button"
                                        key={d}
                                        onClick={() => toggleDay(idx)}
                                        className={`text-sm p-2 rounded-md border ${form.frequency.daysOfWeek.includes(
                                            idx
                                        ) ? "bg-pink-200 border-0" : ""}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.daysOfWeek && (
                            <p className="text-xs text-red-500 mt-2">
                                {errors.daysOfWeek}
                            </p>
                        )}
                    </div>

                    {/* TARGET */}
                    <div className="space-y-2">
                        <Label>Target per day</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.targetPerDay}
                            onChange={(e) => {
                                const value = e.target.value
                                if (value === "") {
                                    updateField("targetPerDay", "")
                                    return
                                }
                                const num = Number(value)
                                if (num > 0) {
                                    updateField("targetPerDay", num)
                                }
                            }}
                            className="focus-visible:border-pink-400 focus-visible:ring-0 focus-visible:ring-transparent outline-none"
                        />
                        {errors.targetPerDay && (
                            <p className="text-xs text-red-500">
                                {errors.targetPerDay}
                            </p>
                        )}
                    </div>



                    {/* AUTO OPEN NOTE */}
                    <div className="flex items-center justify-between">
                        <Label>Auto open note</Label>
                        <Switch
                            checked={form.autoOpenNote}
                            onCheckedChange={(v) =>
                                updateField("autoOpenNote", v)
                            }
                            className={`data-checked:bg-pink-400`}
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={loading}
                            onClick={submit}
                            className="bg-pink-400 hover:bg-pink-500"
                        >
                            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}