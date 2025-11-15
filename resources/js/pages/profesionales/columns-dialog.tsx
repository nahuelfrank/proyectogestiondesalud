import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { router } from "@inertiajs/react";

export type Persona = {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento?: string;
};

export const columns_dialog: ColumnDef<Persona>[] = [
    {
        id: "nombre_apellido",
        header: "Nombre y Apellido",
        enableSorting: true,
        accessorFn: (row) => `${row.nombre} ${row.apellido}`,
        cell: ({ row }) => {
            const persona = row.original;
            return `${persona.nombre} ${persona.apellido}`;
        },
    },
    {
        id: "numero_documento",
        header: "DNI",
        enableSorting: true,
        accessorFn: (row) => row.numero_documento ?? "NN",
        cell: ({ row }) => {
            const persona = row.original;
            return persona.numero_documento ?? "NN";
        },
    },
    {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => {
            const persona = row.original;

            return (
                <div className="flex items-center gap-2">
                    {/* Seleccionar */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get(`/profesionales/${persona.id}`)}
                        title="Seleccionar"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];