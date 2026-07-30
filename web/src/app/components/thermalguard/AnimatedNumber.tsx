import React, { useEffect, useState } from "react";

export interface AnimatedNumberProps {
  value: number | string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({ value, decimals = 1, className = "" }: AnimatedNumberProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const [displayValue, setDisplayValue] = useState<number>(isNaN(numericValue) ? 0 : numericValue);

  useEffect(() => {
    if (isNaN(numericValue)) return;
    
    let startTimestamp: number | null = null;
    const duration = 800; // ms
    const initial = Math.max(0, numericValue * 0.7);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const current = initial + (numericValue - initial) * easeOutQuad;
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [numericValue]);

  if (isNaN(numericValue)) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {displayValue.toFixed(decimals)}
    </span>
  );
}
