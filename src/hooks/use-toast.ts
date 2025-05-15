
// This is a wrapper around the toast library
import { useToast as useShadcnToast } from "@/components/ui/toast"

export const useToast = useShadcnToast;

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export const toast = ({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
  const { toast } = useShadcnToast();
  
  return toast({
    title,
    description,
    variant,
    duration,
  });
};
