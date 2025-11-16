import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import profesionales from '@/routes/profesionales';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Controller, useForm } from 'react-hook-form';
import * as z from "zod";
import React from 'react';
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Undo2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Profesionales',
    href: profesionales.index.url(),
  },
  {
    title: 'Registrar Profesional',
    href: '#',
  },
];

type Genero = {
  id: number;
  nombre: string;
};

type TipoDocumento = {
  id: number;
  nombre: string;
};

type EstadoCivil = {
  id: number;
  nombre: string;
};

type Especialidad = {
  id: number;
  nombre: string;
};

type Dia = {
  id: number;
  nombre: string;
};

type Horario = {
  dia_id: number;
  hora_inicio_atencion: string;
  hora_fin_atencion: string;
};

type ProfesionalCreatePageProps = {
  generos: Genero[];
  tipos_documento: TipoDocumento[];
  estados_civiles: EstadoCivil[];
  especialidades: Especialidad[];
  dias: Dia[];
};

// Schema para los horarios de atención
const horarioSchema = z.object({
  dia_id: z.number(),
  hora_inicio_atencion: z.string().min(1, "La hora de inicio es requerida"),
  hora_fin_atencion: z.string().min(1, "La hora de fin es requerida"),
}).refine((data) => {
  return data.hora_fin_atencion > data.hora_inicio_atencion;
}, {
  message: "La hora de fin debe ser mayor que la hora de inicio",
  path: ["hora_fin_atencion"],
});

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  apellido: z.string().min(1, "El apellido es requerido."),
  fecha_de_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida."),
  genero_id: z.string().min(1, "El género es requerido"),
  tipo_documento_id: z.string().min(1, "El tipo de documento es requerido"),
  numero_documento: z.string().min(1, "El número de documento es requerido"),
  estado_civil_id: z.string().min(1, "El estado civil es requerido"),
  especialidad_id: z.string().min(1, "Debe seleccionar una especialidad."),
  estado: z.string().min(1, "Debe seleccionar un estado."),
  matricula: z.string().min(1, "La matrícula es requerida."),
  disponibilidades_horarias: z.array(horarioSchema).optional(),
});

export default function ProfesionalCreatePage({
  generos,
  tipos_documento,
  estados_civiles,
  especialidades,
  dias,
}: ProfesionalCreatePageProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = React.useState<number[]>([]);

  // Estado local para manejar horarios - CLAVE para que funcione
  const [horariosPorDia, setHorariosPorDia] = React.useState<Map<number, Horario[]>>(
    new Map()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      fecha_de_nacimiento: "",
      genero_id: "",
      tipo_documento_id: "",
      numero_documento: "",
      estado_civil_id: "",
      especialidad_id: "",
      estado: "",
      matricula: "",
      disponibilidades_horarias: [],
    },
  });

  // Sincronizar Map con el form
  const sincronizarConForm = (nuevoMapa: Map<number, Horario[]>) => {
    const todosLosHorarios: Horario[] = [];
    nuevoMapa.forEach((horarios) => {
      todosLosHorarios.push(...horarios);
    });
    form.setValue('disponibilidades_horarias', todosLosHorarios);
  };

  // Manejar selección/deselección de días
  const handleDiaToggle = (diaId: number, checked: boolean) => {
    const nuevoMapa = new Map(horariosPorDia);

    if (checked) {
      setDiasSeleccionados([...diasSeleccionados, diaId]);
      // Agregar un horario vacío para este día
      nuevoMapa.set(diaId, [{
        dia_id: diaId,
        hora_inicio_atencion: "",
        hora_fin_atencion: "",
      }]);
    } else {
      setDiasSeleccionados(diasSeleccionados.filter(id => id !== diaId));
      // Remover todos los horarios de este día
      nuevoMapa.delete(diaId);
    }

    setHorariosPorDia(nuevoMapa);
    sincronizarConForm(nuevoMapa);
  };

  // Agregar un horario adicional al mismo día
  const handleAgregarHorario = (diaId: number) => {
    const nuevoMapa = new Map(horariosPorDia);
    const horariosActuales = nuevoMapa.get(diaId) || [];

    nuevoMapa.set(diaId, [
      ...horariosActuales,
      {
        dia_id: diaId,
        hora_inicio_atencion: "",
        hora_fin_atencion: "",
      }
    ]);

    setHorariosPorDia(nuevoMapa);
    sincronizarConForm(nuevoMapa);
  };

  // Eliminar un horario específico
  const handleEliminarHorario = (diaId: number, index: number) => {
    const nuevoMapa = new Map(horariosPorDia);
    const horariosActuales = nuevoMapa.get(diaId) || [];

    // Si es el único horario, no eliminar (mantener al menos uno)
    if (horariosActuales.length === 1) {
      return;
    }

    const nuevosHorarios = horariosActuales.filter((_, i) => i !== index);
    nuevoMapa.set(diaId, nuevosHorarios);

    setHorariosPorDia(nuevoMapa);
    sincronizarConForm(nuevoMapa);
  };

  // Actualizar un horario específico
  const handleHorarioChange = (
    diaId: number,
    index: number,
    field: 'hora_inicio_atencion' | 'hora_fin_atencion',
    value: string
  ) => {
    const nuevoMapa = new Map(horariosPorDia);
    const horariosActuales = nuevoMapa.get(diaId) || [];

    const horariosActualizados = horariosActuales.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    );

    nuevoMapa.set(diaId, horariosActualizados);
    setHorariosPorDia(nuevoMapa);
    sincronizarConForm(nuevoMapa);
  };

  const onSubmit = (rhfData: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    const payload = {
      nombre: rhfData.nombre,
      apellido: rhfData.apellido,
      fecha_de_nacimiento: rhfData.fecha_de_nacimiento,
      genero_id: parseInt(rhfData.genero_id),
      tipo_documento_id: parseInt(rhfData.tipo_documento_id),
      numero_documento: rhfData.numero_documento,
      estado_civil_id: parseInt(rhfData.estado_civil_id),
      especialidad_id: parseInt(rhfData.especialidad_id),
      estado: rhfData.estado,
      matricula: rhfData.matricula,
      disponibilidades_horarias: rhfData.disponibilidades_horarias || [],
    };

    console.log('Payload a enviar:', payload); // Debug

    router.post('/profesionales/guardar_profesional', payload, {
      onSuccess: () => {
        // Redirige al index
      },
      onError: (errors) => {
        console.error('Error al crear profesional:', errors);
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profesional | Registrar" />
      <div className='container mx-auto py-10'>

        <div className="ml-5 mb-4">
          <h1 className="text-3xl font-semibold mb-2">Registrar Nuevo Profesional</h1>

          <p className="text-sm text-muted-foreground mb-4">Complete el siguiente formulario para registrar un nuevo profesional
            en el sistema. Los campos con <span className="text-red-500">*</span> son obligatorios</p>

          <Link
            href={profesionales.index.url()}
            className="inline-block "
          >
            <Button
              className="flex items-center gap-2 mr-2"
            >
              <Undo2 className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Datos Personales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="nombre">Nombre <span className='text-red-500'>*</span></FieldLabel>
                  <Input
                    id="nombre"
                    placeholder='Ingresar Nombre'
                    {...form.register("nombre")}
                  />
                  {form.formState.errors.nombre && (
                    <FieldError>{form.formState.errors.nombre.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="apellido">Apellido <span className='text-red-500'>*</span></FieldLabel>
                  <Input
                    id="apellido"
                    placeholder='Ingresar Apellido'
                    {...form.register("apellido")}
                  />
                  {form.formState.errors.apellido && (
                    <FieldError>{form.formState.errors.apellido.message}</FieldError>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="fecha_de_nacimiento">Fecha de Nacimiento <span className='text-red-500'>*</span></FieldLabel>
                  <Input
                    type='date'
                    id="fecha_de_nacimiento"
                    {...form.register("fecha_de_nacimiento")}
                  />
                  {form.formState.errors.fecha_de_nacimiento && (
                    <FieldError>{form.formState.errors.fecha_de_nacimiento.message}</FieldError>
                  )}
                </Field>

                <Controller
                  name="genero_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="genero_id">Género <span className='text-red-500'>*</span></FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {generos.map((genero) => (
                            <SelectItem key={genero.id} value={String(genero.id)}>
                              {genero.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="estado_civil_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="estado_civil_id">Estado Civil <span className='text-red-500'>*</span></FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados_civiles.map((estadoCivil) => (
                            <SelectItem key={estadoCivil.id} value={String(estadoCivil.id)}>
                              {estadoCivil.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="tipo_documento_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="tipo_documento_id">Tipo de Documento <span className='text-red-500'>*</span></FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipos_documento.map((tipo) => (
                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                              {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="numero_documento">Número de Documento <span className='text-red-500'>*</span></FieldLabel>
                  <Input
                    id="numero_documento"
                    placeholder='Ingresar Número'
                    {...form.register("numero_documento")}
                  />
                  {form.formState.errors.numero_documento && (
                    <FieldError>{form.formState.errors.numero_documento.message}</FieldError>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Datos Profesionales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Profesionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="especialidad_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="especialidad_id">Especialidad <span className='text-red-500'>*</span></FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {especialidades.map((especialidad) => (
                            <SelectItem key={especialidad.id} value={String(especialidad.id)}>
                              {especialidad.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="matricula">Matrícula <span className='text-red-500'>*</span></FieldLabel>
                  <Input
                    id="matricula"
                    placeholder='Ingresar Matrícula'
                    {...form.register("matricula")}
                  />
                  {form.formState.errors.matricula && (
                    <FieldError>{form.formState.errors.matricula.message}</FieldError>
                  )}
                </Field>

                <Controller
                  name="estado"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="estado">Estado <span className='text-red-500'>*</span></FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Horarios de Atención */}
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
              <p className="text-sm text-gray-500">
                Selecciona los días y define uno o más horarios de atención por día
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {dias.map((dia) => {
                const isSelected = diasSeleccionados.includes(dia.id);
                const horariosDelDia = horariosPorDia.get(dia.id) || [];

                return (
                  <div key={dia.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          id={`dia-${dia.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleDiaToggle(dia.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`dia-${dia.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dia.nombre}
                        </label>
                      </div>

                      {isSelected && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAgregarHorario(dia.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar horario
                        </Button>
                      )}
                    </div>

                    {isSelected && horariosDelDia.map((horario, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 ml-6 mt-3">
                        <Field>
                          <FieldLabel>Hora de Inicio</FieldLabel>
                          <Input
                            type="time"
                            value={horario.hora_inicio_atencion}
                            onChange={(e) => handleHorarioChange(dia.id, index, 'hora_inicio_atencion', e.target.value)}
                          />
                        </Field>

                        <Field>
                          <FieldLabel>Hora de Fin</FieldLabel>
                          <Input
                            type="time"
                            value={horario.hora_fin_atencion}
                            onChange={(e) => handleHorarioChange(dia.id, index, 'hora_fin_atencion', e.target.value)}
                          />
                        </Field>

                        {horariosDelDia.length > 1 && (
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleEliminarHorario(dia.id, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 border-t pt-4 mr-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.get(profesionales.index.url())}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? 'Registrando Profesional...' : 'Registrar Profesional'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}