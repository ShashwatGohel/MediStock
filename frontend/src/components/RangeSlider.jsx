import { useState } from "react";
import { Sliders } from "lucide-react";

const RangeSlider = ({ value, onChange, min = 1, max = 50, unit = "km" }) => {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-400">Search Radius</label>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">
                        {value} {unit}
                    </span>
                </div>
            </div>

            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                        background: `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                />

                {/* Range markers */}
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs text-gray-500">{min}{unit}</span>
                    <span className="text-xs text-gray-500">{Math.floor((min + max) / 2)}{unit}</span>
                    <span className="text-xs text-gray-500">{max}{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default RangeSlider;

