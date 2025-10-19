"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  readOnly = false,
  size = 24,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          disabled={readOnly}
          className={`${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform`}
        >
          <Star
            size={size}
            className={`${
              value <= displayRating
                ? "fill-brand-gold text-brand-gold"
                : "fill-none text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
