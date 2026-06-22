import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Calendar as AriaCalendar,
    CalendarGridHeader as AriaCalendarGridHeader,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarHeaderCell,
    CalendarHeading,
    Text
} from 'react-aria-components';
import { useLocale } from 'react-aria-components/I18nProvider';
import { Button } from 'react-aria-components'
import { composeTailwindRenderProps } from '@/utils/helper';
import { CompletedCell, DefaultCell, FailedCell, InProgressCell, SkippedCell } from '@/components/HabitList/HabitCell';
import { HabitCellDropdown } from '@/components/HabitList/HabitCellDropdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getWeekStartsOn } from '@/services/profile';


export function CalendarCustom({ habitDataMap, onCellAction, isHabitDisabled, className, ...props }) {
    let { direction } = useLocale();
    let months = props.visibleDuration?.months || 1;
    const weekStartsOn = getWeekStartsOn();


    return (
        <AriaCalendar
            {...props}
            firstDayOfWeek={weekStartsOn === "sunday" ? "sun" : "mon"}
            className={composeTailwindRenderProps(
                props.className,
                'flex font-sans w-full max-w-fit overflow-auto gap-3'
            )}
        >
            {Array.from({ length: months }, (_, i) => (
                <div key={i} className={`@container flex flex-col ${className} w-[calc(9*var(--spacing)*9)]`}>
                    <header className="flex items-center mb-2">
                        {/* Logic chỉ hiển thị nút quay lại ở tháng đầu tiên kèm kiểm tra */}
                        {i === 0 && (
                            <Button variant="quiet" slot="previous"
                                className="
                                    data-[disabled]:opacity-30
                                    data-[disabled]:cursor-not-allowed
                                "
                            >
                                {direction === 'rtl' ? (
                                    <ChevronRight aria-hidden size={18} />
                                ) : (
                                    <ChevronLeft aria-hidden size={18} />
                                )}
                            </Button>
                        )}

                        <CalendarHeading
                            offset={{ months: i }}
                            className="flex-1 font-sans font-semibold [font-variation-settings:normal] text-sm text-center mx-2 my-0 text-neutral-900 dark:text-neutral-200"
                        />

                        {/* Logic chỉ hiển thị nút tiếp theo ở tháng cuối cùng kèm kiểm tra */}
                        {i === months - 1 && (
                            <Button variant="quiet" slot="next"
                                className="
                                    data-[disabled]:opacity-30
                                    data-[disabled]:cursor-not-allowed
                                "
                            >
                                {direction === 'rtl' ? (
                                    <ChevronLeft aria-hidden size={18} />
                                ) : (
                                    <ChevronRight aria-hidden size={18} />
                                )}
                            </Button>
                        )}
                    </header>

                    <CalendarGrid offset={{ months: i }} className="border-separate border-spacing-x-1 border-spacing-y-2">
                        <CalendarGridHeader />
                        <CalendarGridBody>
                            {(date) => {
                                const dateString = date.toString();
                                const record = habitDataMap[dateString];
                                
                                return (
                                    <CalendarCell
                                        date={date}
                                        className="aspect-square outline-none"
                                    >
                                        {({ formattedDate, isToday, isOutsideMonth, isDisabled }) => {
                                            if (isOutsideMonth) {
                                                return <div className="w-7 h-7" />;
                                            }
                                            let displayStatus = record?.status || 'none';
                                            const currentCount = record?.completedCount || 0;
                                            const target = record?.targetPerDay;
                                            if (displayStatus === "completed" && currentCount < target) {
                                                displayStatus = currentCount === 0 ? "not_checked" : "in_progress";
                                            } else if ( 
                                                (displayStatus === "in_progress" || displayStatus === "not_checked" || displayStatus === "none") &&
                                                currentCount >= target && target > 0
                                            ) {
                                                displayStatus = "completed";
                                            }

                                            let cellUI;
                                            switch (displayStatus) {
                                                case 'completed':
                                                    cellUI = <CompletedCell day={formattedDate} isToday={isToday} />;
                                                    break;
                                                case 'failed':
                                                    cellUI = <FailedCell day={formattedDate} isToday={isToday} />;
                                                    break;
                                                case 'skipped':
                                                    cellUI = <SkippedCell day={formattedDate} isToday={isToday} />;
                                                    break;
                                                case 'in_progress':
                                                    cellUI = (
                                                        <InProgressCell
                                                            day={formattedDate}
                                                            progress={record?.completedCount}
                                                            target={record?.targetPerDay}
                                                            isToday={isToday}
                                                        />
                                                    );
                                                    break;
                                                case 'not_checked':
                                                default:
                                                    cellUI = <DefaultCell day={formattedDate} isToday={isToday} />;
                                                    break;
                                            }

                                            const cellContent = (
                                                <div className='flex items-center justify-center'>
                                                    <div className={`relative flex flex-col gap-1 ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
                                                        <span
                                                            className={`flex items-center justify-center pt-1 text-xs  
                                                                ${isToday ? "text-blue-500" : "text-slate-500"
                                                                }`}
                                                        >
                                                            {formattedDate}
                                                        </span>
                                                        {cellUI}
                                                    </div>
                                                </div>
                                            );

                                            if (isDisabled) {
                                                return cellContent;
                                            }
                                            
                                            //archived / paused
                                            if (isHabitDisabled) {
                                                return (
                                                    <div className="cursor-default">
                                                        {cellContent}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <HabitCellDropdown
                                                    dateString={dateString}
                                                    onAction={onCellAction}
                                                    status={displayStatus}
                                                    progress={record?.completedCount}
                                                    mode='popover'
                                                    record={record}
                                                    canUndo={record?.canUndo}
                                                >
                                                    
                                                    <TooltipProvider delayDuration={100}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="inline-block">
                                                                    {cellContent}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="bottom"
                                                                className="text-xs w-40 text-center text-[var(--brand-muted-text)] bg-accent border-none shadow-sm z-60"
                                                            >
                                                                <p>Click to edit or Right click for more actions.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </HabitCellDropdown>
                                            );
                                        }}
                                    </CalendarCell>
                                )
                            }}
                        </CalendarGridBody>
                    </CalendarGrid>
                </div>
            ))}
        </AriaCalendar>
    );
}

export function CalendarGridHeader() {
    return (
        <AriaCalendarGridHeader>
            {(day) => (
                <CalendarHeaderCell className="text-xs text-neutral-500 font-semibold">
                    {day}
                </CalendarHeaderCell>
            )}
        </AriaCalendarGridHeader>
    );
}