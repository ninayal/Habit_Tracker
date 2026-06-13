import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Pencil, Trash2, Pause, Play } from "lucide-react";

export function HabitCardDropdown({ children, open, setOpen, status, onEdit, onChangeStatus, onDelete }) {

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-32 text-slate-600"
                onClick={(e) => e.stopPropagation()}
            >
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                    className="cursor-pointer"
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>

                {/* ACTIVE */}

                {status === "Active" && (
                    <>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.("Paused");
                            }}
                        >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.("Archived");
                            }}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                        </DropdownMenuItem>
                    </>
                )}

                {/* PAUSED */}
                {status === "Paused" && (
                    <>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.("Active");
                            }}
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.("Archived");
                            }}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                        </DropdownMenuItem>
                    </>
                )}

                {/* ARCHIVED */}
                {status === "Archived" && (
                    <>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.("Active");
                            }}
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onChangeStatus?.("Paused");
                            }}
                        >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    className="cursor-pointer "
                >
                    <Trash2 className="mr-2 h-4 w-4 " />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}