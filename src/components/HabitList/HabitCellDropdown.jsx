import { useEffect, useState } from "react";
import { ChevronLast, RotateCcw, X } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, } from "@/components/ui/context-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HabitCellDropdown({
    children,
    dateString,
    onAction,
    status,
    progress = 0,
}) {
    const [value, setValue] = useState(progress);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setValue(progress);
    }, [progress]);

    return (
        <div className="">
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <PopoverTrigger asChild>
                            <div
                                className="cursor-pointer outline-none w-full h-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                {children}
                            </div>
                        </PopoverTrigger>
                    </ContextMenuTrigger>

                    <PopoverContent
                        className="w-52 z-50"
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-3">
                            <div className="mb-2">
                                <p className="leading-none font-medium text-sm mb-2">{dateString}</p>
                                <p className="text-xs text-gray-400">
                                    How many times have been achieved on this day?
                                </p>
                            </div>

                            <Input
                                autoFocus
                                type="number"
                                value={value}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                        setValue("");
                                        return;
                                    }
                                    const num = Number(val);
                                    setValue(Math.max(0, num));
                                }}
                                className="
                                    focus-visible:border-blue focus-visible:ring-0 focus-visible:ring-transparent outline-none
                                "
                            />

                            <Button
                                className="w-full bg-blue hover:bg-blue/80 text-slate-600"
                                onClick={() => {
                                    onAction("update_progress", dateString, Number(value));
                                    setOpen(false); 
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </PopoverContent>

                    <ContextMenuContent className="w-52 z-50">
                        {status !== "skipped" && (
                            <ContextMenuItem onSelect={() => onAction("skipped", dateString)}>
                                <ChevronLast size={16} className="mr-2" />
                                Mark as Skipped
                            </ContextMenuItem>
                        )}

                        {status !== "failed" && (
                            <ContextMenuItem onSelect={() => onAction("failed", dateString)}>
                                <X size={16} className="mr-2" />
                                Mark as Failed
                            </ContextMenuItem>
                        )}

                        {(status === "skipped" || status === "failed" || status === "completed" || status === "in_progress") && (
                            <ContextMenuItem onSelect={() => onAction("reset", dateString)}>
                                <RotateCcw size={16} className="mr-2" />
                                Reset
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ContextMenu>
            </Popover>
        </div>
    );
}