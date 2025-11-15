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
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {isActivo ? "Activo" : "Inactivo"}
                </span>
            );
        },
    },
];
