import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Mail, Pencil } from "lucide-react";
import { router } from "@inertiajs/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText } from 'lucide-react';
import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { usePage } from "@inertiajs/react";

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
    }
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

export const columns: ColumnDef<Profesional>[] = [
  {
    id: "nombre_apellido",
    header: "Nombre y Apellido",
    enableSorting: true,
    accessorFn: (row) => `${row.persona.apellido} ${row.persona.nombre}`,
    cell: ({ row }) => {
      const profesional = row.original;
      return `${profesional.persona.apellido}, ${profesional.persona.nombre}`;
    },
  },
  {
    id: "tipo_documento",
    header: "Tipo de Documento",
    enableSorting: true,
    accessorFn: (row) => `${row.persona.tipo_documento.nombre}`,
    cell: ({ row }) => {
      const profesional = row.original;
      return `${profesional.persona.tipo_documento.nombre}`;
    },
  },
  {
    id: "dni",
    header: "Documento",
    enableSorting: true,
    accessorFn: (row) => `${row.persona.numero_documento}`,
    cell: ({ row }) => {
      const profesional = row.original;
      return `${profesional.persona.numero_documento}`;
    },
  },
  {
    id: "email",
    header: "Email",
    enableSorting: true,
    accessorFn: (row) => row.persona.email ?? "Sin email",
    cell: ({ row }) => {
      const profesional = row.original;
      return profesional.persona.email ? (
        <span>{profesional.persona.email}</span>
      ) : (
        <Badge variant="secondary">Sin email</Badge>
      );
    },
  },
  {
    id: "especialidad",
    header: "Especialidad",
    enableSorting: true,
    accessorFn: (row) => row.especialidad?.nombre ?? "Sin especialidad",
    cell: ({ row }) => {
      return row.original.especialidad?.nombre ?? "Sin especialidad";
    },
  },
  {
    accessorKey: "disponibilidad_horaria",
    header: "Disponibilidad Horaria",
    enableSorting: false,
    cell: ({ row }) => {
      const profesional = row.original;
      const horarios = profesional.disponibilidades_horarias || [];

      // Agrupar horarios por día
      const horariosPorDia = horarios.reduce((acc, horario) => {
        const diaNombre = horario.dia.nombre;
        if (!acc[diaNombre]) {
          acc[diaNombre] = [];
        }
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
                  {Object.entries(horariosPorDia).map(([diaNombre, horariosDelDia]) => (
                    horariosDelDia.map((horario, index) => (
                      <TableRow key={horario.id}>
                        {/* Mostrar el nombre del día solo en la primera fila */}
                        {index === 0 ? (
                          <TableCell className="font-medium" rowSpan={horariosDelDia.length}>
                            {diaNombre}
                          </TableCell>
                        ) : null}
                        <TableCell>{horario.hora_inicio_atencion}</TableCell>
                        <TableCell>{horario.hora_fin_atencion}</TableCell>
                      </TableRow>
                    ))
                  ))}
                </TableBody>
              </Table>
            )}

            <DialogFooter>
              <Button
                className="flex items-center gap-2 mr-2"
                onClick={() => window.open(`/profesionales/reporte_horarios/${profesional.id}`, '_blank')}
              >
                <FileText className="h-4 w-4" />
                PDF
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
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estado === "activo"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
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
          {/* Ver */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.get(`/profesionales/${profesional.id}`)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Editar */}
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
  {
    accessorKey: "user",
    header: "Usuario",
    enableSorting: false,
    cell: ({ row }) => {
      const profesional = row.original;
      const { auth } = usePage<{ auth: { user: { roles: Array<{ name: string }> } } }>().props;

      // Verificar si el usuario actual es super-admin
      const isSuperAdmin = auth.user.roles.some(role => role.name === 'super-admin');

      // Si el profesional ya tiene usuario
      if (profesional.user_id) {
        return <Badge variant="outline" className="bg-green-50 text-green-700">Cuenta activa</Badge>;
      }

      // Si no tiene email
      if (!profesional.persona.email) {
        return <Badge variant="secondary">Sin email registrado</Badge>;
      }

      // Si no es super-admin, mostrar badge sin acción
      if (!isSuperAdmin) {
        return <Badge variant="secondary">Sin cuenta</Badge>;
      }

      // Si es super-admin y el profesional no tiene usuario, mostrar botón invitar
      const handleInvite = () => {
        if (confirm(`¿Deseas crear una cuenta de usuario para ${profesional.persona.nombre} ${profesional.persona.apellido}?\n\nSe enviará un email a: ${profesional.persona.email}`)) {
          router.post(`/profesionales/${profesional.id}/invitar`, {}, {
            preserveScroll: true,
            onSuccess: () => {
              // Success message handled by flash
            },
            onError: (errors) => {
              console.error('Error al crear usuario:', errors);
            },
          });
        }
      };

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInvite}
        >
          <Mail className="h-4 w-4 mr-2" />
          Invitar
        </Button>
      );
    },
  },
];