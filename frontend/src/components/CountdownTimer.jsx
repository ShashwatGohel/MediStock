import { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();

            if (difference <= 0) {
                setTimeLeft("EXPIRED");
                return;
            }

            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <span className={`font-mono text-xl font-black ${timeLeft === "EXPIRED" ? "text-red-500" : "text-emerald-400"}`}>
            {timeLeft}
        </span>
    );
};

export default CountdownTimer;
