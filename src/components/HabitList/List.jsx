import HabitCard from '@/components/HabitList/HabitCard'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import React from 'react'

export default function List({
    groupedHabits, habits, statusMap, groupBy, onHabitClick, date,
    onEditHabit, onChangeStatus, onDeleteHabit
}) {
    return (
        <div className="w-full pb-4 mt-6">
            <div className="flex flex-col gap-2">
                {groupedHabits ? (
                    groupedHabits.map(([key, items]) => (
                        <Collapsible
                            key={key}
                            defaultOpen
                            className="rounded-lg"
                        >
                            <CollapsibleTrigger className="group flex w-full gap-4 items-center px-4 py-2 font-semibold">
                                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                <span className='text-sm'>
                                    {key} ({items.length})
                                </span>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="flex flex-col gap-3 px-4 py-2 pt-0">
                                    {items.map((habit) => (
                                        <HabitCard
                                            key={habit.id}
                                            habit={habit}
                                            checkin={statusMap[habit.id].checkin}
                                            groupBy={groupBy}
                                            onClick={() => onHabitClick(habit)}

                                            onEdit={onEditHabit}
                                            onChangeStatus={onChangeStatus}
                                            onDelete={onDeleteHabit}
                                            date={date}
                                        />
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))
                ) : (
                    habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            checkin={statusMap[habit.id].checkin}
                            groupBy={groupBy}
                            onClick={() => onHabitClick(habit)}

                            onEdit={onEditHabit}
                            onChangeStatus={onChangeStatus}
                            onDelete={onDeleteHabit}
                            date={date}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
