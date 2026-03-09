import { useState, useEffect } from "react";

interface Props {
  targetDate: Date;
}

const CountdownTimer = ({ targetDate }: Props) => {
  const calcRemaining = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calcRemaining);

  useEffect(() => {
    const interval = setInterval(() => setTime(calcRemaining), 1000);
    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-5">
      {blocks.map((b) => (
        <div key={b.label} className="flex flex-col items-center">
          <div className="bg-card/10 backdrop-blur-sm border border-primary-foreground/20 rounded-lg w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <span className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">
              {String(b.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-primary-foreground/70 mt-1">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
