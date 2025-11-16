import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, Pencil  } from "lucide-react";
import { Link } from "@inertiajs/react";
import { DeletePersonaButton } from "@/pages/personas/AlertDialogDeletePersona";
import personas from "@/routes/personas";
import type { Persona } from "@/types/personas/persona";

export const columns: ColumnDef<Persona>[] = [

  {
    id: "nombreApellido",
    header: "Apellido y Nombre",
    enableSorting: false,
    cell: ({ row }) => {
      const persona = row.original;
      return `${persona.apellido}, ${persona.nombre}`;
    },
  },
  {
    accessorKey: "numero_documento",
    header: "Documento",
    enableSorting: false,
  },
  {
    accessorKey: "genero.nombre",
    header: "Género",
    enableSorting: false,
    cell: ({ row }) => <span>{row.original.genero?.nombre ?? "—"}</span>,
  },
  {
    accessorKey: "telefono_fijo",
    header: "Teléfono fijo",
    enableSorting: false,
    cell: ({ row }) => <span>{row.original.telefono_fijo ?? "—"}</span>,
  },
  {
    accessorKey: "telefono_celular",
    header: "Teléfono celular",
    enableSorting: false,
    cell: ({ row }) => <span>{row.original.telefono_celular ?? "—"}</span>,
  },
  {
    accessorKey: "domicilio",
    header: "Domicilio",
    enableSorting: false,
    cell: ({ row }) => <span>{row.original.domicilio ?? "—"}</span>,
  },
  {
    accessorKey: "email",
    header: "Correo",
    enableSorting: false,
    cell: ({ row }) => <span>{row.original.email ?? "—"}</span>,
  },
  {
   id: "acciones",
    header: "Acciones",
    enableSorting: false,
    cell: ({ row }) => {
      const persona = row.original;

      // Identificar carga rápida por email null
      const isFastCreate = !persona.email;

      return (
        <div>

          {/* Ver - deshabilitado si es carga rápida */}
          {isFastCreate ? (
            <Button 
              variant="ghost" 
              size="icon" 
              title="Completar datos primero para ver" 
              disabled
              className="mx-2 opacity-50 cursor-not-allowed"
            >
              <Eye className="h-4 w-4" />
            </Button>
          ) : (
            <Link href={personas.show(persona.id).url} className="mx-2 inline-block">
              <Button variant="ghost" size="icon" title="Ver">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Editar / Completar datos */}
          {isFastCreate ? (
            <Link href={personas.edit(persona.id).url} className="mx-2 inline-block">
              <Button
                variant="ghost"
                size="icon"
                title="Completar datos"
                className="text-yellow-600"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={personas.edit(persona.id).url} className="mx-2 inline-block">
              <Button
                variant="ghost"
                size="icon"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          )}

            <DeletePersonaButton persona={persona} />
        </div>
      );
    },
  },
];
