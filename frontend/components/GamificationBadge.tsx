import React from 'react';
import { Trophy, Star, Shield } from 'lucide-react';

interface GamificationBadgeProps {
    level?: number;
    title?: string;
    type?: 'newbie' | 'intermediate' | 'expert';
}

const GamificationBadge: React.FC<GamificationBadgeProps> = ({
    level = 1,
    title = "新手上路",
    type = 'newbie'
}) => {
    const getColors = () => {
        switch (type) {
            case 'expert': return 'bg-candy-yellow text-orange-600 border-orange-200';
            case 'intermediate': return 'bg-candy-blue text-blue-600 border-blue-200';
            case 'newbie': default: return 'bg-candy-mint text-teal-700 border-teal-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'expert': return <Trophy className="w-3 h-3 mr-1" />;
            case 'intermediate': return <Shield className="w-3 h-3 mr-1" />;
            case 'newbie': default: return <Star className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full border shadow-sm ${getColors()} transition-transform hover:scale-105`}>
            {getIcon()}
            <span className="text-xs font-bold mr-1">Lv.{level}</span>
            <span className="text-xs">{title}</span>
        </div>
    );
};

export default GamificationBadge;
