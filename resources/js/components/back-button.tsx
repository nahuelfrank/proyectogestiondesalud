import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

interface BackButtonProps {
    fallback?: string; // ruta a donde redirigir si el usuario ingresó por URL
}

export default function BackButton({ fallback = "/" }: BackButtonProps) {
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        // Si history.length > 1 significa que el usuario navegó antes
        setCanGoBack(window.history.length > 1);
    }, []);

    const handleBack = () => {
        if (canGoBack) {
            window.history.back();
        } else {
            router.visit(fallback); // redirección segura
        }
    };

    return (
        <Button
            variant="default"
            onClick={handleBack}
            className="flex items-center gap-2"
        >
            <Undo2 className="h-4 w-4" />
            Volver
        </Button>
    );
}
