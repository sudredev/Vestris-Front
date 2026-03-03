import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "gray" | "blue" | "green" | "red" | "orange";
  className?: string;
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  gray: "background: #eee; color: #333;",
  blue: "background: #e6f0ff; color: #0b63d6;",
  green: "background: #e6ffef; color: #0a7a3d;",
  red: "background: #ffe6e6; color: #b30b0b;",
  orange: "background: #fff4e6; color: #7a4b00;",
};

export const SimpleBadge: React.FC<BadgeProps> = ({
  children,
  color = "gray",
  className,
}) => {
  const style = colorMap[color];
  return (
    <span
      style={
        {
          display: "inline-block",
          padding: "0.15rem 0.5rem",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          ...Object.fromEntries(
            (style || "")
              .split(";")
              .filter(Boolean)
              .map((s) => {
                const [k, v] = s.split(":");
                return [
                  k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
                  v?.trim(),
                ];
              }),
          ),
        } as React.CSSProperties
      }
      className={className}
      data-testid="simple-badge"
    >
      {children}
    </span>
  );
};
