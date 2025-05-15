
import { useState, useEffect, createContext, useContext } from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

type ToastType = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
  duration?: number;
};

type ToasterToast = ToastType;

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToastState = {
  toasts: ToasterToast[];
};

type ToasterContextType = ToasterToastState & {
  toast: (props: ToastType) => void;
  dismiss: (toastId: string) => void;
};

const ToastContext = createContext<ToasterContextType | null>(null);

const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ToasterToastState>({
    toasts: [],
  });

  const toast = (props: ToastType) => {
    const id = props.id || String(Date.now());

    setState((state) => {
      const toasts = state.toasts.concat({
        ...props,
        id,
        duration: props.duration || 3000,
      }).slice(-TOAST_LIMIT);

      return {
        ...state,
        toasts,
      };
    });

    return id;
  };

  const dismiss = (toastId: string) => {
    setState((state) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }));
  };

  useEffect(() => {
    const timeouts = state.toasts.map((t) => {
      if (toastTimeouts.has(t.id)) {
        return null;
      }

      const timeout = setTimeout(() => {
        dismiss(t.id);
        toastTimeouts.delete(t.id);
      }, t.duration || 3000);

      toastTimeouts.set(t.id, timeout);

      return () => {
        clearTimeout(timeout);
        toastTimeouts.delete(t.id);
      };
    });

    return () => {
      timeouts.forEach((cleanup) => cleanup && cleanup());
    };
  }, [state.toasts]);

  return (
    <ToastContext.Provider value={{ ...state, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

export { useToast, ToastProvider };

export const toast = ({ title, description, variant = "default", duration = 3000 }: Omit<ToastType, "id">) => {
  const { toast } = useToast();
  
  return toast({
    id: String(Date.now()),
    title,
    description,
    variant,
    duration,
  });
};
