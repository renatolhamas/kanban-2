import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open: _open = false,
      onOpenChange,
      title,
      description,
      children,
      footer,
      className,
      ...props
    },
    _ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(_open);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const focusTrapRef = React.useRef<HTMLDivElement>(null);

    // Controlled component: sync with open prop
    React.useEffect(() => {
      setIsOpen(_open);
    }, [_open]);

    // Handle close
    const handleClose = () => {
      setIsOpen(false);
      onOpenChange?.(false);
    };

    // Handle escape key
    React.useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isOpen]);

    // Focus trap: cycle through focusable elements
    React.useEffect(() => {
      if (!isOpen || !focusTrapRef.current) return;

      const focusableElements = focusTrapRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          // Shift+Tab: move to previous
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      firstElement.focus();
      focusTrapRef.current.addEventListener("keydown", handleKeyDown);

      return () => {
        focusTrapRef.current?.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop: Blurred overlay with tonal transparency */}
        <div
          onClick={handleClose}
          className={cn(
            "fixed inset-0 z-40",
            "bg-black/20 backdrop-blur-sm",
            "animate-fade-in",
            "transition-opacity duration-200"
          )}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          ref={modalRef}
          className={cn(
            "fixed inset-0 z-50",
            "flex items-center justify-center",
            "p-4"
          )}
          role="presentation"
        >
          {/* Dialog Element with Focus Trap */}
          <div
            ref={focusTrapRef}
            className={cn(
              // Container: 8px radius, surface-lowest background
              "bg-surface-lowest rounded-lg",
              // Elevation: Soft-breath shadow
              "shadow-ambient",
              // Max width and responsive
              "w-full max-w-md max-h-[90vh]",
              // Glassmorphism effect
              "glass-surface bg-white/95 backdrop-blur-md",
              // Animation: Fade + Scale
              "animate-scale-fade-in",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {/* Sticky Header with Glass Property */}
            {title && (
              <div
                className={cn(
                  "sticky top-0 z-10",
                  "px-6 py-4",
                  "border-b border-surface-high",
                  "bg-white/80 backdrop-blur-[20px]",
                  "rounded-t-lg"
                )}
              >
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-on-surface"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="text-sm text-secondary mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Modal Content */}
            <div className="overflow-y-auto px-6 py-6 flex-1">
              {children}
            </div>

            {/* Footer Actions */}
            {footer && (
              <div
                className={cn(
                  "sticky bottom-0 z-10",
                  "px-6 py-4",
                  "border-t border-surface-high",
                  "bg-surface-low",
                  "flex gap-3 justify-end",
                  "rounded-b-lg"
                )}
              >
                {footer}
              </div>
            )}

            {/* Close Button (top-right) */}
            <button
              onClick={handleClose}
              className={cn(
                "absolute top-4 right-4",
                "w-8 h-8 rounded-md",
                "flex items-center justify-center",
                "text-secondary hover:text-on-surface",
                "hover:bg-surface-low",
                "transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="Close modal"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
          }

          .animate-scale-fade-in {
            animation: scaleFadeIn 0.2s ease-out;
          }
        `}</style>
      </>
    );
  }
);

Modal.displayName = "Modal";

export { Modal };
