import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const handleClick = (newValue: number) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseEnter = (newValue: number) => {
    if (!readOnly) {
      setHoveredValue(newValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredValue(null);
    }
  };

  const displayValue = hoveredValue !== null ? hoveredValue : value;

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readOnly}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              star <= displayValue
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
