import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Link } from "@inertiajs/react";
import type { Atencion } from "@/types/atenciones/atencion";
import atenciones from "@/routes/atenciones";

export const columns: ColumnDef<Atencion>[] = [

  {
    id: "fechaHora",
    header: "Fecha y Hora",
    enableSorting: false,
    cell: ({ row }) => {
      const at = row.original;

      // Formatear fecha YYYY-MM-DD -> DD/MM/YYYY
      const [year, month, day] = at.fecha.split("-");
      const fechaFormateada = `${day}/${month}/${year}`;

      // Formatear hora HH:MM:SS -> HH:MM
      const horaFormateada = at.hora.slice(0, 5);

      return (
        <span>
          {fechaFormateada} - {horaFormateada}
        </span>
      );
    },
  },


  {
    accessorKey: "servicio.nombre",
    header: "Servicio",
    enableSorting: false,
    cell: ({ row }) => <span>{row.original.servicio?.nombre ?? "—"}</span>,
  },

  {
    accessorKey: "tipo_atencion.nombre",
    header: "Tipo de Atención",
    enableSorting: false,
    cell: ({ row }) => {
      const tipo = row.original.tipo_atencion?.nombre ?? "—";
      const isEmergencia = tipo === "Emergencia";
      const isUrgencia = tipo === "Urgencia";

      const base = "px-2 py-0.5 rounded-full text-xs font-semibold";

      return (
        <span
          className={
            isEmergencia
              ? `${base} bg-red-100 text-red-800`
              : isUrgencia
                ? `${base} bg-orange-100 text-orange-800`
                : `${base} bg-blue-100 text-blue-800`
          }
        >
          {tipo}
        </span>
      );
    },
  },

  {
    id: "profesional",
    header: "Profesional",
    enableSorting: false,
    cell: ({ row }) => {
      const p = row.original.profesional?.persona;
      return p ? `${p.apellido}, ${p.nombre}` : "—";
    },
  },

  {
    id: "paciente",
    header: "Paciente",
    enableSorting: false,
    cell: ({ row }) => {
      const p = row.original.persona;
      return p ? `${p.apellido}, ${p.nombre}` : "—";
    },
  },

  {
    accessorKey: "estado_atencion.nombre",
    header: "Estado",
    enableSorting: false,
    cell: ({ row }) => {
      const estado = row.original.estado_atencion?.nombre;
      const base =
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

      let classes = "bg-gray-100 text-gray-800";

      if (estado === "En Espera") {
        classes = "bg-yellow-100 text-yellow-800";
      } else if (estado === "En Atención") {
        classes = "bg-blue-100 text-blue-800";
      } else if (estado === "Cancelado") {
        classes = "bg-red-100 text-red-800";
      }

      return <span className={`${base} ${classes}`}>{estado}</span>;
    },
  },

  {
    id: "acciones",
    header: "Acciones",
    enableSorting: false,
    cell: ({ row }) => {
      const atencion = row.original;

      return (
        <div>

          {/* Ver */}
          <Link href={atenciones.ver_atencion(atencion.id).url}>
            <Button variant="ghost" size="icon" title="Ver">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          {/* Editar Estado */}
          <Link href={atenciones.modificar_estado(atencion.id).url}>
            <Button variant="ghost" size="icon" title="Modificar estado">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>

        </div>
      );
    },
  },
];
