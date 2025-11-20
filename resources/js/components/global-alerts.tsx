import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface PageProps {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function GlobalAlerts() {
    const props = usePage().props as PageProps;
    const [visible, setVisible] = useState(false);
    const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);

    useEffect(() => {
        let newAlert: { type: AlertType; message: string } | null = null;

        if (props.success) newAlert = { type: 'success', message: props.success };
        else if (props.error) newAlert = { type: 'error', message: props.error };
        else if (props.warning) newAlert = { type: 'warning', message: props.warning };
        else if (props.info) newAlert = { type: 'info', message: props.info };

        if (newAlert) {
            setAlert(newAlert);
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [props.success, props.error, props.warning, props.info]);

    if (!alert || !visible) return null;

    const titles = {
        success: 'Éxito',
        error: 'Error',
        warning: 'Advertencia',
        info: 'Información',
    };

    // Ahora usás directamente las variantes definidas en alert.tsx
    const variants = {
        success: 'success',
        error: 'destructive',
        warning: 'warning',
        info: 'info',
    } as const;

    // Íconos siguen estando acá porque son visuales, no de estilo
    const icons = {
        success: <CheckCircle className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
        warning: <AlertCircle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
    };

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-top-2">
            <Alert variant={variants[alert.type]} className="pr-8">
                {icons[alert.type]}
                <AlertTitle>{titles[alert.type]}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>

                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-3 right-3 opacity-60 hover:opacity-100 transition"
                >
                    <XCircle className="h-4 w-4" />
                </button>
            </Alert>
        </div>
    );
}
