interface ProgressBarProps {
  percentage: number;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  colorScheme?: "teal" | "gold" | "orange" | "green" | "blue" | "gray";
}

export default function ProgressBar({
  percentage,
  label,
  showLabel = true,
  size = "md",
  colorScheme = "teal",
}: ProgressBarProps) {
  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colors = {
    teal: "bg-brand-teal",
    gold: "bg-brand-gold",
    orange: "bg-brand-orange",
    green: "bg-green-500",
    blue: "bg-blue-600",
    gray: "bg-gray-400",
  };

  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || "Progress"}
          </span>
          <span className="text-sm font-semibold text-brand-navy">
            {clampedPercentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heights[size]}`}>
        <div
          className={`${colors[colorScheme]} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
