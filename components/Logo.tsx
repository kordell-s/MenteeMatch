import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showIcon = true,
  className = "",
}: LogoProps) {
  const sizes = {
    sm: {
      text: "text-lg",
      icon: 20,
      iconStroke: 2,
    },
    md: {
      text: "text-2xl",
      icon: 24,
      iconStroke: 2.5,
    },
    lg: {
      text: "text-4xl",
      icon: 32,
      iconStroke: 3,
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <svg
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          {/* Left leaf - Turquoise */}
          <path
            d="M12 12 Q8 8 6 9 Q7 4 12 6"
            stroke="#219EBC"
            strokeWidth={sizeConfig.iconStroke}
            strokeLinecap="round"
            fill="none"
          />
          {/* Right leaf - Orange */}
          <path
            d="M12 6 Q16 2 18 3 Q17 8 12 9"
            stroke="#FB8500"
            strokeWidth={sizeConfig.iconStroke}
            strokeLinecap="round"
            fill="none"
          />
          {/* Stem - Turquoise */}
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="20"
            stroke="#219EBC"
            strokeWidth={sizeConfig.iconStroke}
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className={`font-bold ${sizeConfig.text}`}>
        <span className="text-brand-teal">Mentor</span>
        <span className="text-brand-orange">Match</span>
      </span>
    </div>
  );
}
