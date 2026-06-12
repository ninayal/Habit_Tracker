import React, { useState } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Ellipsis } from 'lucide-react';
import { HabitCardDropdown } from '@/components/HabitList/HabitCardDropdown';

export default function HabitDetail({ children, open, onOpenChange, habit }) {
    const [openDropdown, setOpenDropdown] = useState(false);


    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            direction="right"
        >
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent
                className="
                    data-[vaul-drawer-direction=right]:w-125
                    data-[vaul-drawer-direction=right]:max-w-none
                    data-[vaul-drawer-direction=right]:rounded-none
                "
            >
                <DrawerHeader>
                    <DrawerTitle>
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-lg h-10 w-10 bg-pink-300 flex justify-center items-center rounded-full">
                                    {habit?.icon}
                                </div>

                                <h3
                                    className={` font-semibold text-lg`}
                                >
                                    {habit?.name}
                                </h3>
                            </div>
                            <div>
                                <HabitCardDropdown
                                    open={openDropdown}
                                    setOpen={setOpenDropdown}
                                >
                                    <button
                                        className=" p-1 rounded-md hover:bg-blue/40 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdown(true);
                                        }}
                                    >
                                        <Ellipsis size={22} />
                                    </button>
                                </HabitCardDropdown>

                            </div>
                        </div>
                    </DrawerTitle>

                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                    
                </div>

            </DrawerContent>
        </Drawer>
    )
}
