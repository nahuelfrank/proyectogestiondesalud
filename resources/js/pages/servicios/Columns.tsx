import { ColumnDef } from "@tanstack/react-table";
import type { Servicio } from '@/types/servicios/servicio';

export const columns: ColumnDef<Servicio>[] = [
    {
        accessorKey: "nombre",
        header: "Nombre del Servicio",
        enableSorting: false,
    },
    {
        id: "estado",
        header: "Estado",
        enableSorting: false,
        cell: ({ row }) => {
            const estado = row.original.estado?.toLowerCase();

            const isActivo = estado === "activo";

            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActivo
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                >
                    {isActivo ? "Activo" : "Inactivo"}
                </span>
            );
        },
    },
];
