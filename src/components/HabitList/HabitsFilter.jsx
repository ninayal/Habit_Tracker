import React, { Fragment } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Search, ArrowDownUp, SlidersHorizontal, Siren, Check } from 'lucide-react'

const statusList = ["Active", "Paused", "Archived"];
const PRIORITIES = ["All", "High", "Medium", "Low"];
const CATEGORIES = ["All", "Health", "Study", "Work", "Mindfulness", "Other"];

export default function HabitsFilter({ query, setQuery }) {
    const toggleStatus = (status, setQuery) => {
        setQuery(prev => ({
            ...prev,
            status: prev.status === status ? "" : status
        }));
    };

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3`}>
            <span className='text-base font-medium text-gray-500'>Tìm kiếm</span>
            <div className='flex items-center border border-gray-300 rounded-md px-2 focus-within:border-gray-600'>
                <input
                    type='text'
                    placeholder='Enter name...'
                    className='text-[14px] outline-none flex-1'
                    value={query.search}

                    onChange={(e) =>
                        setQuery(prev => ({
                            ...prev,
                            search: e.target.value
                        }))

                    }

                />
                <button className='p-1 hover:bg-gray-100 rounded-full'>
                    <Search className='text-gray-500 text-[20px]' />
                </button>
            </div>

            <div className='flex items-center gap-2 ml-auto flex-wrap'>
                <div
                    className="py-2 px-3 flex items-center bg-white gap-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                    <SortDropdown query={query} setQuery={setQuery}>
                        <ArrowDownUp size={20}></ArrowDownUp>
                    </SortDropdown>
                </div>
                <div
                    className="py-2 px-3 flex items-center bg-white gap-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                    <FilterDropdown query={query} setQuery={setQuery}>
                        <SlidersHorizontal size={20}></SlidersHorizontal>
                    </FilterDropdown>

                </div>

                <div className="flex items-center gap-1 rounded-2xl border border-gray-300 p-1 text-sm">
                    {statusList.map((status, idx) => (
                        <div key={status}>
                            <button
                                onClick={() => toggleStatus(status, setQuery)}
                                className={`rounded-xl px-3 py-1 transition-colors ${query.status === status
                                    ? "bg-blue"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                {status}
                            </button>

                            {idx !== statusList.length - 1 && (
                                <Separator orientation="vertical" className="bg-gray-300" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


const FilterDropdown = ({ children, query, setQuery }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="focus-visible:outline-none focus-visible:ring-0">
                    {children}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2">
                <DropdownMenuLabel>Filters</DropdownMenuLabel>

                {/* PRIORITY */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {PRIORITIES.map((item) => (
                                <DropdownMenuItem
                                    key={item}
                                    onSelect={() =>
                                        setQuery(prev => ({
                                            ...prev,
                                            priority: item
                                        }))
                                    }
                                    className="flex items-center gap-2"
                                >
                                    {item}
                                    {query.priority === item && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* CATEGORY */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Category</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {CATEGORIES.map((item) => (
                                <DropdownMenuItem
                                    key={item}
                                    onSelect={() =>
                                        setQuery(prev => ({
                                            ...prev,
                                            category: item
                                        }))
                                    }
                                    className="flex items-center gap-2"
                                >
                                    {item}
                                    {query.category === item && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const SortDropdown = ({ children, query, setQuery }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className='focus-visible:outline-none focus-visible:ring-0'
                >
                    {children}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`p-2 w-45`}>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>View</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, view: "list" }))
                    }}>
                        List (Default)
                        {query.view === "list" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, view: "kanban" }))
                    }}>
                        Kanban
                        {query.view === "kanban" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Group By</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, groupBy: "priority" }))
                    }}>
                        Priority (Default)
                        {query.groupBy === "priority" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, groupBy: "category" }))
                    }}>
                        Category
                        {query.groupBy === "category" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, sortBy: "order" }))
                    }}>
                        Order (Default)
                        {query.sortBy === "order" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, sortBy: "newest" }))
                    }}>
                        Newest
                        {query.sortBy === "newest" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => {
                        setQuery(prev => ({ ...prev, sortBy: "oldest" }))
                    }}>
                        Oldest
                        {query.sortBy === "oldest" && (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
