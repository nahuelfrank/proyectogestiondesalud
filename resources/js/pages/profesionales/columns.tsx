import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Mail, Pencil, FileSpreadsheet, FileText } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import profesionales from "@/routes/profesionales";
import { useAlert } from "@/components/alert-provider";

import React from "react";

export type Profesional = {
  id: number;
  user_id: number | null;
  persona_id: number;
  especialidad_id: number;
  persona: {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento?: string;
    tipo: number;
    tipo_documento: {
      id: number;
      nombre: string;
    };
    email?: string;
  };
  especialidad: {
    id: number;
    nombre: string;
  };
  estado: string;
  matricula: string;
  disponibilidades_horarias: DisponibilidadHoraria[];
};

export type DisponibilidadHoraria = {
  id: number;
  profesional_id: number;
  dia_id: number;
  hora_inicio_atencion: string;
  hora_fin_atencion: string;
  dia: {
    id: number;
    nombre: string;
  };
};

/* ---------------------------------------------------------
   ✅ Componente React para la celda "Usuario"
--------------------------------------------------------- */
function UsuarioCell({ row }: any) {
  const profesional = row.original;

  const { auth } = usePage<{ auth: { user: { roles: Array<{ name: string }> } } }>().props;
  const { confirm: showConfirm } = useAlert();

  const isSuperAdmin = auth.user.roles.some(role => role.name === "super-admin");

  if (profesional.user_id) {
    return <Badge variant="outline" className="bg-success text-success-foreground">Cuenta activa</Badge>;
  }

  if (!profesional.persona.email) {
    return <Badge variant="secondary">Sin email registrado</Badge>;
  }

  if (!isSuperAdmin) {
    return <Badge variant="secondary">Sin cuenta</Badge>;
  }

  const handleInvite = async () => {
    const result = await showConfirm({
      title: "Crear cuenta de usuario",
      description:
        `¿Deseas crear una cuenta de usuario para ${profesional.persona.nombre} ${profesional.persona.apellido}?\n\n` +
        `Se enviará un email a: ${profesional.persona.email}`,
      okText: "Crear cuenta",
      cancelText: "Cancelar",
      icon: "warning",
    });

    if (!result) return;

    router.post(`/profesionales/${profesional.id}/invitar`, {}, {
      preserveScroll: true,
      onError: (errors) => console.error(errors),
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleInvite}>
      <Mail className="h-4 w-4 mr-2" />
      Invitar
    </Button>
  );
}

/* ---------------------------------------------------------
   📌 Columnas principales de la tabla
--------------------------------------------------------- */
export const columns: ColumnDef<Profesional>[] = [
  {
    id: "nombre_apellido",
    header: "Nombre y Apellido",
    enableSorting: true,
    accessorFn: (row) => `${row.persona.apellido} ${row.persona.nombre}`,
    cell: ({ row }) => `${row.original.persona.apellido}, ${row.original.persona.nombre}`,
  },
  {
    id: "tipo_documento",
    header: "Tipo de Documento",
    enableSorting: true,
    accessorFn: (row) => row.persona.tipo_documento.nombre,
    cell: ({ row }) => row.original.persona.tipo_documento.nombre,
  },
  {
    id: "dni",
    header: "Documento",
    enableSorting: true,
    accessorFn: (row) => row.persona.numero_documento,
    cell: ({ row }) => row.original.persona.numero_documento,
  },
  {
    id: "email",
    header: "Email",
    enableSorting: true,
    accessorFn: (row) => row.persona.email ?? "Sin email",
    cell: ({ row }) =>
      row.original.persona.email ? (
        <span>{row.original.persona.email}</span>
      ) : (
        <Badge variant="secondary">Sin email</Badge>
      ),
  },
  {
    id: "especialidad",
    header: "Especialidad",
    enableSorting: true,
    accessorFn: (row) => row.especialidad?.nombre ?? "Sin especialidad",
    cell: ({ row }) => row.original.especialidad?.nombre ?? "Sin especialidad",
  },
  {
    accessorKey: "disponibilidad_horaria",
    header: "Disponibilidad Horaria",
    enableSorting: false,
    cell: ({ row }) => {
      const profesional = row.original;
      const horarios = profesional.disponibilidades_horarias || [];

      const horariosPorDia = horarios.reduce((acc, horario) => {
        const diaNombre = horario.dia.nombre;
        acc[diaNombre] ??= [];
        acc[diaNombre].push(horario);
        return acc;
      }, {} as Record<string, DisponibilidadHoraria[]>);

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Ver Horarios
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Horarios de Atención</DialogTitle>
              <DialogDescription>
                {profesional.persona.nombre} {profesional.persona.apellido} - {profesional.especialidad?.nombre}
              </DialogDescription>
            </DialogHeader>

            {horarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay horarios de atención configurados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Día</TableHead>
                    <TableHead>Inicio Atención</TableHead>
                    <TableHead>Fin de Atención</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(horariosPorDia).map(([diaNombre, horariosDelDia]) =>
                    horariosDelDia.map((horario, index) => (
                      <TableRow key={horario.id}>
                        {index === 0 && (
                          <TableCell rowSpan={horariosDelDia.length} className="font-medium">
                            {diaNombre}
                          </TableCell>
                        )}
                        <TableCell>{horario.hora_inicio_atencion}</TableCell>
                        <TableCell>{horario.hora_fin_atencion}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            <DialogFooter>
              <Button
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(`/profesionales/reporte_horarios/${profesional.id}`, "_blank")
                }
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>

              <Button
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(`/profesionales/reporte_horarios_excel/${profesional.id}`, "_blank")
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>

              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    enableSorting: false,
    cell: ({ row }) => {
      const estado = row.original.estado;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            estado === "Activo"
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    enableSorting: false,
    cell: ({ row }) => {
      const profesional = row.original;

      return (
        <div>
          <Link href={profesionales.show(profesional.id).url} className="inline-block">
            <Button variant="ghost" size="icon" title="Ver">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.get(`/profesionales/edit/${profesional.id}`)}
            title="Modificar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },

  /* 👇 Aquí usamos el componente que sí permite hooks */
  {
    accessorKey: "user",
    header: "Usuario",
    enableSorting: false,
    cell: UsuarioCell,
  },
];
