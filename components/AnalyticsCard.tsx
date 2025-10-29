
import React from 'react';

interface AnalyticsCardProps {
    title: string;
    value: string;
    icon: React.FC<{ className?: string }>;
    color: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
        </div>
    );
};

export default AnalyticsCard;
