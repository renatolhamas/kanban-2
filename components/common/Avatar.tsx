import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  variant?: "primary" | "circle";
  size?: "sm" | "md" | "lg";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      name = "U",
      variant = "primary",
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    // Generate initials from name
    const getInitials = (fullName: string): string => {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Size classes
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
    };

    // Variant classes
    const variantClasses = {
      primary: "rounded-lg",
      circle: "rounded-full",
    };

    // Background colors for initials (cycling through accent colors)
    const bgColors = [
      "bg-primary",
      "bg-secondary",
      "bg-emerald-500",
      "bg-blue-500",
    ];

    const bgColor =
      bgColors[
        (name?.charCodeAt(0) || 0) % bgColors.length
      ];

    const shouldShowInitials = !src || imageError;

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "flex items-center justify-center",
          "flex-shrink-0",
          "font-semibold",
          "text-white",

          // Size
          sizeClasses[size],

          // Variant (radius)
          variantClasses[variant],

          // Image or initials background
          shouldShowInitials ? bgColor : "bg-gray-200",

          // Shadow
          "shadow-sm",

          className
        )}
        {...props}
      >
        {/* Image fallback chain: Image -> Initials -> Default Icon */}
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            className={cn(
              "w-full h-full object-cover",
              variantClasses[variant]
            )}
            onError={() => setImageError(true)}
          />
        ) : shouldShowInitials ? (
          <span>{getInitials(name)}</span>
        ) : (
          // Default icon (user silhouette)
          <svg
            className={cn("w-1/2 h-1/2 text-gray-400")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
