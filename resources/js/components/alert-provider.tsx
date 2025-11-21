// resources/js/components/AlertProvider.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { createContext, useContext, useState, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type AlertOptions = {
    title?: string;
    description?: string;
    okText?: string;
    cancelText?: string | null;
    icon?: "warning" | "info" | "error" | "success" | null;
};

type AlertContextType = {
    confirm: (options: AlertOptions) => Promise<boolean>;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [resolver, setResolver] = useState<(value: boolean) => void>();
    const [options, setOptions] = useState<AlertOptions>({});

    const confirm = (opts: AlertOptions) => {
        return new Promise<boolean>((resolve) => {
            setOptions(opts);
            setResolver(() => resolve);
            setOpen(true);
        });
    };

    const handleAction = (value: boolean) => {
        setOpen(false);
        resolver?.(value);
    };

    return (
        <AlertContext.Provider value={{ confirm }}>
            {children}

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {options.icon === "warning" && (
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                            )}
                            {options.title ?? "Confirmación"}
                        </AlertDialogTitle>

                        {options.description && (
                            <AlertDialogDescription>
                                {options.description}
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        {options.cancelText !== null && (
                            <AlertDialogCancel onClick={() => handleAction(false)}>
                                {options.cancelText ?? "Cancelar"}
                            </AlertDialogCancel>
                        )}

                        <AlertDialogAction onClick={() => handleAction(true)}>
                            {options.okText ?? "Aceptar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        throw new Error("useAlert must be used inside <AlertProvider>");
    }
    return ctx;
}
