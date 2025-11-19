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
        // Detectar qué tipo de mensaje hay
        let newAlert: { type: AlertType; message: string } | null = null;

        if (props.success) {
            newAlert = { type: 'success', message: props.success };
        } else if (props.error) {
            newAlert = { type: 'error', message: props.error };
        } else if (props.warning) {
            newAlert = { type: 'warning', message: props.warning };
        } else if (props.info) {
            newAlert = { type: 'info', message: props.info };
        }

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

    const variants = {
        success: 'default',
        error: 'destructive',
        warning: 'default',
        info: 'default',
    } as const;

    const styles = {
        success: 'bg-[var(--success)] text-[var(--success-foreground)] border-[var(--success)]',
        error: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] border-[var(--destructive)]',
        warning: 'bg-[var(--warning)] text-[var(--warning-foreground)] border-[var(--warning)]',
        info: 'bg-[var(--info)] text-[var(--info-foreground)] border-[var(--info)]',
    };

    const iconStyles = {
        success: 'text-[var(--success-foreground)]',
        error: 'text-[var(--destructive-foreground]',
        warning: 'text-[var(--warning-foreground)]',
        info: 'text-[var(--info-foreground)]',
    };

    const icons = {
        success: <CheckCircle className={`h-4 w-4 ${iconStyles.success}`} />,
        error: <XCircle className={`h-4 w-4 ${iconStyles.error}`} />,
        warning: <AlertCircle className={`h-4 w-4 ${iconStyles.warning}`} />,
        info: <Info className={`h-4 w-4 ${iconStyles.info}`} />,
    };

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-top-2">
            <Alert variant={variants[alert.type]} className={`pr-8 ${styles[alert.type]}`}>
                {icons[alert.type]}
                <AlertTitle>{titles[alert.type]}</AlertTitle>
                <AlertDescription className="text-muted">{alert.message}</AlertDescription>
                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-3 right-3 text-foreground/50 hover:text-foreground transition-colors"
                >
                    <XCircle className="h-4 w-4" />
                </button>
            </Alert>
        </div>
    );
}