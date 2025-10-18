import React, { useState, useEffect } from 'react';
import { tattooTips } from '../data/tips';
import { LightbulbIcon } from './Icons';

export const DailyTips: React.FC = () => {
    const [tip, setTip] = useState('');

    useEffect(() => {
        // Select a random tip from the list when the component mounts
        const randomIndex = Math.floor(Math.random() * tattooTips.length);
        setTip(tattooTips[randomIndex]);
    }, []);

    return (
        <div className="p-4 bg-purple-500/10 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-start space-x-4">
            <div className="flex-shrink-0 pt-1">
                <LightbulbIcon />
            </div>
            <div>
                <h4 className="font-bold text-purple-700 dark:text-purple-300">Consejo del Día</h4>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{tip}</p>
            </div>
        </div>
    );
};