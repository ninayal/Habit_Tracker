import { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useHabitWalkthrough = () => {
    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Got it!',
            nextBtnText: 'Next →',
            prevBtnText: '← Back',

            steps: [
                {
                    element: '#tour-date-picker',
                    popover: {
                        title: 'Time selector',
                        description: 'Select a date to view past habits.',
                        side: "bottom", align: 'start'
                    }
                },
                {
                    element: '#tour-create-habit',
                    popover: {
                        title: 'Create Habit',
                        description: 'Click here to create a new habit. You can set goals, frequencies, and icons.',
                        side: "bottom", align: 'end'
                    }
                },
                {
                    element: '#tour-filters',
                    popover: {
                        title: 'Filter & Sort',
                        description: 'Easily find your habits. You can switch between List and Kanban views!',
                        side: "bottom", align: 'center'
                    }
                },
                {
                    element: '.tour-habit-card-step', 
                    popover: {
                        title: 'Habit Details',
                        description: 'Click anywhere on the card to view details of this habit included streaks, statistics, and notes.',
                        side: "top", align: 'center'
                    }
                },
                {
                    element: '.tour-habit-checkin-btn',
                    popover: {
                        title: 'Check-in & Actions',
                        description: 'Click the circle to increase progress. Right-click to Decrease progress, Mark as Skipped/Failed or add a Note!',
                        side: "top", align: 'end'
                    }
                },
                {
                    element: '.tour-habit-dropdown-btn',
                    popover: {
                        title: 'More options',
                        description: 'You can edit, archive, or delete habit in here.',
                        side: "top", align: 'end'
                    }
                }
            ],
            
            onDestroyStarted: () => {
                if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
                    localStorage.setItem('habitTourCompleted', 'true');
                    driverObj.destroy();
                }
            },
        });

        driverObj.drive();
    };

    useEffect(() => {
        const isCompleted = localStorage.getItem('habitTourCompleted');

        if (!isCompleted) {
            const timer = setTimeout(() => {
                startTour();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    return { startTour };
};