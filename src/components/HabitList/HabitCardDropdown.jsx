import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Pencil, Trash2 } from "lucide-react";

export function HabitCardDropdown({ children, open, setOpen, onEdit, onArchive, onDelete }) {

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

                    }}
                    className="cursor-pointer"
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();

                    }}
                    className="cursor-pointer"
                >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                </DropdownMenuItem>

                <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                        e.stopPropagation();

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