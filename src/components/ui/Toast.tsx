import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  BookmarkCheck, 
  BookmarkX, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  X,
  ArrowRight
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <BookmarkCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'info':
        return <BookmarkX className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
  };

  const getBadgeBg = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200/80 dark:border-emerald-800/80';
      case 'info':
        return 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200/80 dark:border-indigo-800/80';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/80 border-amber-200/80 dark:border-amber-800/80';
      case 'error':
        return 'bg-rose-50 dark:bg-rose-950/80 border-rose-200/80 dark:border-rose-800/80';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200/80 dark:border-emerald-800/80';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      id={`toast-${toast.id}`}
      className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xl shadow-slate-900/10 dark:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.6)] relative overflow-hidden"
    >
      <div className="flex items-start gap-3">
        {/* Icon Pill */}
        <div className={`p-2 rounded-xl border shrink-0 ${getBadgeBg()}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1 space-y-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {toast.description}
            </p>
          )}

          {/* Optional Action Button */}
          {toast.action && (
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Auto-dismiss progress bar */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 ${
            toast.type === 'info'
              ? 'bg-indigo-500 dark:bg-indigo-400'
              : toast.type === 'error'
              ? 'bg-rose-500 dark:bg-rose-400'
              : toast.type === 'warning'
              ? 'bg-amber-500 dark:bg-amber-400'
              : 'bg-emerald-500 dark:bg-emerald-400'
          }`}
        />
      )}
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-2rem)] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
