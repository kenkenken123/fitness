import React from 'react';
import { Flame, Clock, Dumbbell, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityRingsProps {
    calories: number;
    duration: number;
    workouts: number;
    streak: number;
    caloriesGoal?: number;
    durationGoal?: number;
    workoutsGoal?: number;
}

const ActivityRings: React.FC<ActivityRingsProps> = ({
    calories,
    duration,
    workouts,
    streak,
    caloriesGoal = 500,
    durationGoal = 45,
    workoutsGoal = 1
}) => {
    const size = 180;
    const strokeWidth = 12;
    const center = size / 2;

    // Ring configurations
    const rings = [
        {
            label: 'Calories',
            value: calories,
            goal: caloriesGoal,
            radius: 70,
            color: 'text-candy-pink',
            bgColor: 'text-candy-pink/20',
            icon: Flame,
        },
        {
            label: 'Duration',
            value: duration,
            goal: durationGoal,
            radius: 52,
            color: 'text-candy-mint',
            bgColor: 'text-candy-mint/20',
            icon: Clock,
        },
        {
            label: 'Workouts',
            value: workouts,
            goal: workoutsGoal,
            radius: 34,
            color: 'text-candy-blue',
            bgColor: 'text-candy-blue/20',
            icon: Dumbbell,
        }
    ];

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center p-4 gap-6 sm:gap-10">
                {/* Rings Container */}
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="transform -rotate-90">
                        {rings.map((ring, index) => {
                            const circumference = 2 * Math.PI * ring.radius;
                            const percent = Math.min(100, Math.max(0, (ring.value / ring.goal) * 100));
                            const offset = circumference - (percent / 100) * circumference;

                            return (
                                <React.Fragment key={ring.label}>
                                    {/* Background Ring */}
                                    <circle
                                        cx={center}
                                        cy={center}
                                        r={ring.radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        className={ring.bgColor}
                                        strokeLinecap="round"
                                    />
                                    {/* Progress Ring */}
                                    <circle
                                        cx={center}
                                        cy={center}
                                        r={ring.radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        className={cn(ring.color, "transition-all duration-1000 ease-out")}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                    />
                                </React.Fragment>
                            );
                        })}
                    </svg>

                    {/* Center Content - Streak */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black">{streak}</span>
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">连续天数</span>
                        </div>
                    </div>
                </div>

                {/* Legend / Data Display */}
                <div className="flex flex-col gap-3 min-w-[120px]">
                    {rings.map((ring) => {
                        const Icon = ring.icon;
                        return (
                            <div key={ring.label} className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", ring.bgColor.replace('text-', 'bg-'))}>
                                    <Icon className={cn("w-4 h-4", ring.color)} />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-700 leading-none">
                                        {ring.value}
                                        <span className="text-[10px] text-gray-400 ml-1 font-bold">
                                            {ring.label === 'Calories' ? 'kcal' : ring.label === 'Duration' ? 'min' : '次'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{ring.label === 'Calories' ? '卡路里' : ring.label === 'Duration' ? '时长' : '训练次数'}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActivityRings;
