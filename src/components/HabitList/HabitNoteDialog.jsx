// src/components/HabitList/HabitNoteDialog.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function HabitNoteDialog({ open, onOpenChange, habitName, initialNote = "", dateStr, onSave }) {
    const [note, setNote] = useState(initialNote);

    useEffect(() => {
        if (open) {
            setNote(initialNote);
        }
    }, [open, initialNote]);

    const handleSave = () => {
        onSave(note);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className={`flex flex-col gap-2`}>
                        <span className="text-xs text-slate-500">{dateStr}</span>
                        Add note for today: {habitName}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <p className="text-sm text-muted-foreground">
                        Would you like to add a quick note about this check-in?
                    </p>
                    <Textarea
                        placeholder="How did it go? How are you feeling? (Optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px] focus-visible:border-pink-400 focus-visible:ring-0 focus-visible:ring-transparent outline-none"
                    />
                </div>
                <DialogFooter className={`brand-card`}>
                    <Button className={`hover:bg-pink-50`} variant="outline" onClick={() => onOpenChange(false)}>
                        Skip
                    </Button>
                    <Button onClick={handleSave} className="bg-pink-400 hover:bg-pink-500 text-white">
                        Save Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}