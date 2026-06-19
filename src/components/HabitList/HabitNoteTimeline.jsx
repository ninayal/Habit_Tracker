import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import { useCheckinContext } from '@/hooks/useCheckins';
import { HabitNoteDialog } from '@/components/HabitList/HabitNoteDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'react-toastify';


export default function HabitNoteTimeline({ habit, checkins }) {
    const { updateCheckin } = useCheckinContext();
    const [editingCheckin, setEditingCheckin] = useState(null);
    const [deletingCheckin, setDeletingCheckin] = useState(null);

    const notesList = checkins.filter(c => c.note && c.note.trim() !== '');

    const handleSaveNote = (newNote) => {
        if (editingCheckin) {
            updateCheckin(habit.id, editingCheckin.date, { note: newNote });
            setEditingCheckin(null);
        }
        toast.success("Saved note successfully!")
    };

    const handleClearNote = () => {
        if (!deletingCheckin) return;

        updateCheckin(habit.id, deletingCheckin.date, {
            note: "",
        });

        setDeletingCheckin(null);
    };

    if (notesList.length === 0) {
        return (
            <>
                <h4 className="font-semibold mt-4 text-lg text-slate-800 flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-500" />
                    Notes
                </h4>
                <div className="mt-3 flex flex-col items-center justify-center py-8 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">No notes yet</p>
                    <p className="text-xs text-slate-400 mt-1">Complete your habit and add some reflections!</p>
                </div>
            </>
        );
    }

    return (
        <div className="mt-8">
            <h4 className="font-semibold text-lg text-slate-800 mb-5 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                Notes
            </h4>

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4">
                {notesList.map((checkin) => (
                    <div key={checkin.id} className="relative pl-6 group">
                        <div
                            className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-[3px]  shadow-sm
                                ${checkin?.completionStatus === "completed" ? "border-blue-400" : ""}
                            `}
                        />

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    {format(parseISO(checkin.date), 'MMM dd, yyyy')}
                                </span>

                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingCheckin(checkin)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Edit note"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeletingCheckin(checkin)}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Clear note"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="  text-sm text-black leading-relaxed wrap-break-word whitespace-pre-wrap">
                                {checkin.note}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog
                open={!!deletingCheckin}
                onOpenChange={(open) => !open && setDeletingCheckin(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete note?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently remove the note for{" "}
                            {deletingCheckin?.date}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className={`brand-card`}>
                        <AlertDialogCancel className={`hover:bg-white`} variant='outline'>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction variant='destructive' onClick={handleClearNote}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <HabitNoteDialog
                open={!!editingCheckin}
                onOpenChange={(isOpen) => !isOpen && setEditingCheckin(null)}
                habitName={habit?.name}
                initialNote={editingCheckin?.note || ''}
                onSave={handleSaveNote}
            />
        </div>
    );
}