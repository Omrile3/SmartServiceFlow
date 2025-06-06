import * as React from "react"
import { X } from "lucide-react"

// Use local cn function since we can't import from lib/utils
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ToastProvider = ({ children }) => (
  <div className="toast-provider">{children}</div>
);

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport";

const Toast = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = variant === "destructive" 
    ? "bg-red-600 text-white border-red-700" 
    : "bg-white border-gray-200 text-gray-900";
  
  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg",
        "animate-in fade-in slide-in-from-top-full duration-300",
        variantClasses,
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors",
      "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity",
      "hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
))
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription";

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };

export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(
    ({ title, description, action, ...props }) => {
      // For simplicity and to avoid errors, just use a standard alert
      if (title && description) {
        alert(`${title}: ${description}`);
      } else if (title) {
        alert(title);
      } else if (description) {
        alert(description);
      }
      return null;
    },
    []
  );

  const dismissToast = React.useCallback(() => {}, []);

  const Toaster = React.useCallback(() => null, []);

  return {
    toast,
    dismissToast,
    Toaster,
  };
};