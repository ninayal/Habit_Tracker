import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

function DefaultCell({ day, isToday }) {
    return (
        <div className="relative w-6 h-6 flex items-center justify-center text-sm text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-full">
            {/* {day} */}
        </div>
    );
}

function CompletedCell({ day, isToday }) {
    return (
        <div className="relative w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
            {/* {day} */}
            <Check size={18} />

            {/* {isToday && (
                <div className="absolute z-50 -bottom-2.5 left-1/2 -translate-x-1/2 text-lg text-blue-500">
                    _
                </div>
            )} */}
        </div>
    );
}

function FailedCell({ day, isToday }) {
    return (
        <div className="relative w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
            {/* {day} */}
            <X size={18} />

            {/* {isToday && (
                <div className="absolute z-50 -bottom-2.5 left-1/2 -translate-x-1/2 text-lg text-blue-500">
                    _
                </div>
            )} */}
        </div>
    );
}

function SkippedCell({ day, isToday }) {
    return (
        <div className="relative w-6 h-6 flex items-center justify-center text-sm rounded-full bg-gray-100  line-through">
            {/* {day} */}
            <ArrowRight className='' size={18} />

            {/* {isToday && (
                <div className="absolute z-50 -bottom-2.5 left-1/2 -translate-x-1/2 text-lg text-blue-500">
                    _
                </div>
            )} */}
        </div>
    );
}

function InProgressCell({ day, progress, target, isToday }) {
    const percentage = Math.round((progress / target) * 100);

    return (
        <div
            className="relative w-6 h-6 rounded-full flex items-center justify-center"
            style={{
                background: `conic-gradient(#3b82f6 ${percentage}%, #e2e8f0 ${percentage}%)`
            }}
        >
            <div className="absolute w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                {/* {day} */}
            </div>

            {/* {isToday && (
                <div className="absolute z-50 -bottom-2.5 left-1/2 -translate-x-1/2 text-lg text-blue-500">
                    _
                </div>
            )} */}
        </div>
    );
}

export { DefaultCell, CompletedCell, SkippedCell, InProgressCell, FailedCell }