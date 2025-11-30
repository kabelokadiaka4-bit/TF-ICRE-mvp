"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TickerItem {
  id: string;
  label: string;
  value: string;
  change: string; // e.g., "+0.5%", "-0.2%"
  changeType: 'up' | 'down' | 'neutral';
}

interface LiveTickerProps {
  data: TickerItem[];
  interval?: number; // in ms
  className?: string;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ data, interval = 3000, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, interval);

    return () => clearInterval(timer);
  }, [data, interval]);

  const currentItem = data[currentIndex];

  const changeColorClass = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-on-surface-variant',
  };

  return (
    <div className={`overflow-hidden h-10 flex items-center bg-surface border border-white/5 rounded-xl ${className}`}>
      <AnimatePresence mode="wait">
        {currentItem && (
          <motion.div
            key={currentItem.id}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between w-full px-4 text-sm"
          >
            <span className="font-medium text-on-surface">{currentItem.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-on-surface">{currentItem.value}</span>
              <span className={`text-xs font-semibold ${changeColorClass[currentItem.changeType]}`}>{currentItem.change}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
