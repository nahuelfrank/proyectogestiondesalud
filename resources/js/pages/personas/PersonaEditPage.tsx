import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import personas from '@/routes/personas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldLabel,
    FieldError,
} from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, TrashIcon, Undo2 } from 'lucide-react';
import { z } from 'zod';
import { PersonaEditPageProps } from '@/types/personas/persona';

// Schema de validación con Zod (mismo que en el formulario de creación)
const dependenciaSchema = z.object({
    claustro_id: z.string().min(1, "Debe seleccionar un claustro."),
    dependencia_id: z.string().min(1, "Debe seleccionar una dependencia."),
    area_id: z.string().min(1, "Debe seleccionar un área."),
    fecha_ingreso: z.string().min(1, "La fecha de ingreso es obligatoria."),
    resolucion: z.string().optional().nullable(),
    expediente: z.string().optional().nullable(),
    estado: z.enum(["activo", "inactivo"], {
        message: 'El estado debe ser "activo" o "inactivo".'
    })
});

const personaSchema = z.object({
    genero_id: z.string().min(1, "Debe seleccionar un género."),
    estado_civil_id: z.string().min(1, "Debe seleccionar un estado civil."),
    tipo_documento_id: z.string().min(1, "Debe seleccionar un tipo de documento."),
    nombre: z.string().min(1, "El nombre es obligatorio."),
    apellido: z.string().min(1, "El apellido es obligatorio."),
    numero_documento: z.string().min(1, "El número de documento es obligatorio."),
    fecha_de_nacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria."),
    domicilio: z.string().optional(),
    lugar_de_nacimiento: z.string().optional(),
    telefono_fijo: z.string().optional(),
    telefono_celular: z.string().min(1, "Debe ingresar un teléfono celular."),
    nacionalidad: z.string().min(1, "Debe ingresar la nacionalidad.").nullable(),
    email: z.email("El correo electrónico no es válido.")
        .min(1, "Debe ingresar un correo electrónico."),
    dependencias: z.array(dependenciaSchema)
        .min(1, "Debe agregar al menos una dependencia.")
});

//type PersonaFormData = z.infer<typeof personaSchema>;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: personas.index.url(),
    },
    {
        title: 'Modificar Paciente',
        href: '#',
    },

];

export default function PersonaEditPage({
    persona,
    generos,
    estadosCiviles,
    tiposDocumento,
    claustros,
    dependenciasAreas,
    estados
}: PersonaEditPageProps) {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const isFastCreate = !persona.email;

    const { data, setData, put, processing, errors } = useForm({
        genero_id: persona.genero_id ? String(persona.genero_id) : "",
        estado_civil_id: persona.estado_civil_id ? String(persona.estado_civil_id) : "",
        tipo_documento_id: persona.tipo_documento_id ? String(persona.tipo_documento_id) : "",
        nombre: persona.nombre,
        apellido: persona.apellido ?? "",
        numero_documento: persona.numero_documento ?? "",
        fecha_de_nacimiento: persona.fecha_de_nacimiento ?? "",
        domicilio: persona.domicilio ?? "",
        lugar_de_nacimiento: persona.lugar_de_nacimiento ?? "",
        telefono_fijo: persona.telefono_fijo ?? "",
        telefono_celular: persona.telefono_celular ?? "",
        nacionalidad: persona.nacionalidad ?? "",
        email: persona.email ?? "",
        dependencias: persona.personas_dependencias_areas?.length
            ? persona.personas_dependencias_areas.map((d) => ({
                claustro_id: String(d.claustro_id),
                dependencia_id: String(d.dependencia_id),
                area_id: String(d.area_id),
                fecha_ingreso: d.fecha_ingreso ?? "",
                resolucion: d.resolucion ?? "",
                expediente: d.expediente ?? "",
                estado: String(d.estado),
            }))
            : [
                {
                    claustro_id: "",
                    dependencia_id: "",
                    area_id: "",
                    fecha_ingreso: "",
                    resolucion: "",
                    expediente: "",
                    estado: "",
                },
            ],
    })

    // --- Helpers para identificar IDs de "No Docente" y "Externo" según nombre (case-insensitive) ---
    const findClaustroIdByName = (name: string) => {
        const found = claustros.find(c => String(c.nombre).toLowerCase() === String(name).toLowerCase());
        return found ? String(found.id) : null;
    };

    const NO_DOCENTE_ID = findClaustroIdByName('No Docente');
    const EXTERNO_ID = findClaustroIdByName('Externo');

    // Devuelve array de claustro_id seleccionados, opcionalmente excluyendo un índice (útil al evaluar una fila)
    const getSelectedClaustros = (excludeIndex?: number) => {
        return data.dependencias
            .map((d, i) => (i === excludeIndex ? "" : d.claustro_id))
            .filter(id => id && id !== "");
    };

    // Validación central: recibe array de dependencias y retorna ok/error
    function validarClaustros(dependencias: typeof data.dependencias) {
        const claustrosElegidos = dependencias
            .map(dep => dep.claustro_id)
            .filter(id => id !== "");

        // Regla 1: No más de un “No Docente”
        if (NO_DOCENTE_ID) {
            const noDocentes = claustrosElegidos.filter(id => id === NO_DOCENTE_ID);
            if (noDocentes.length > 1) {
                return {
                    ok: false,
                    error: "Solo puedes seleccionar un claustro 'No Docente'."
                };
            }
        }

        // Regla 2: Externo NO se puede combinar con ningún otro (si existe EXTERNO_ID en tu catálogo)
        if (EXTERNO_ID) {
            const escogioExterno = claustrosElegidos.includes(EXTERNO_ID);
            if (escogioExterno && claustrosElegidos.length > 1) {
                return {
                    ok: false,
                    error: "El claustro 'Externo' no puede combinarse con otros claustros."
                };
            }
        }
        return { ok: true };
    }


    const handleUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            // Validar con Zod
            personaSchema.parse(data);

            // Validación adicional de claustros antes de enviar
            const validClaustros = validarClaustros(data.dependencias);
            if (!validClaustros.ok) {
                setValidationErrors({ dependencias: validClaustros.error ?? "" });
                return;
            }

            // Si la validación pasa, enviar el formulario
            put(personas.update(persona.id).url);
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Convertir errores de Zod al formato que usa el componente
                const formattedErrors: Record<string, string> = {};
                error.issues.forEach((err) => {
                    const path = err.path.join('.');
                    formattedErrors[path] = err.message;
                });
                setValidationErrors(formattedErrors);
            }
        }
    }


    // Función helper para obtener errores (de Zod/local o del servidor)
    const getError = (field: string): string | null => {
        const backendErrors = errors as unknown as Record<string, unknown>;
        const fromBackend =
            typeof backendErrors[field] === "string" ? backendErrors[field] : null;

        return validationErrors[field] || (fromBackend as string | null);
    };

    // Verifica si ya existe un Externo seleccionado en las dependencias
    const existeExternoSeleccionado = () => {
        return data.dependencias.some(dep => dep.claustro_id === EXTERNO_ID);
    };

    // Verifica si ya existe un No Docente seleccionado en las dependencias
    const existeNoDocenteSeleccionado = () => {
        return data.dependencias.some(dep => dep.claustro_id === NO_DOCENTE_ID);
    };

    // --- lógica para determinar si una opción de claustro concreta debe deshabilitarse en una fila ---
    const shouldDisableClaustroOption = (optionId: string, rowIndex: number) => {
        // Si optionId es vacío -> no deshabilitar
        if (!optionId) return false;

        // Selected en otras filas (excluyendo la actual)
        const selectedOther = getSelectedClaustros(rowIndex);

        // Si option es Externo -> deshabilitar si ya hay otra selección distinta a vacío
        if (EXTERNO_ID && optionId === EXTERNO_ID) {
            // si hay cualquier otro seleccionado en otras filas -> NO se puede elegir Externo aquí
            return selectedOther.length > 0;
        }

        // Si alguna otra fila ya tiene Externo -> no permitir seleccionar cualquier otro claustro aquí
        if (EXTERNO_ID && selectedOther.includes(EXTERNO_ID) && optionId !== EXTERNO_ID) {
            return true;
        }

        // Si option es No Docente -> deshabilitar si ya existe otro No Docente en otras filas
        if (NO_DOCENTE_ID && optionId === NO_DOCENTE_ID) {
            const alreadyNoDocenteElsewhere = selectedOther.filter(id => id === NO_DOCENTE_ID).length > 0;
            return alreadyNoDocenteElsewhere;
        }

        // En cualquier otro caso, permitir
        return false;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes | Modificar" />
            <div className="container mx-auto py-10">

                <div className="ml-5 mb-4">
                    {isFastCreate ? (
                        <h1 className="text-3xl font-semibold mb-2">Completar Datos de Paciente</h1>

                    ) : (
                        <h1 className="text-3xl font-semibold mb-2">Modificar Datos de Paciente</h1>
                    )}

                    {isFastCreate ? (
                        <p className="text-md text-muted-foreground mb-4">
                            Complete los datos del paciente.
                            Los campos con <span className="text-red-500">*</span> son obligatorios.
                        </p>
                    ) : (
                        <p className="text-md text-muted-foreground mb-4">
                            Modifique los datos del paciente.
                            Los campos con <span className="text-red-500">*</span> son obligatorios.
                        </p>

                    )}

                    <Link
                        href={personas.index.url()}
                        className="inline-block"
                    >
                        <Button
                            className="flex items-center gap-2"
                        >
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>


                <form onSubmit={handleUpdate} className="m-2 space-y-4">

                    {/* Datos Personales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos Personales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Field>
                                <FieldLabel htmlFor="nombre">Nombre <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Nombre"
                                />
                                {getError('nombre') && <FieldError>{getError('nombre')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="apellido">Apellido <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="apellido"
                                    value={data.apellido}
                                    onChange={(e) => setData('apellido', e.target.value)}
                                    placeholder="Apellido"
                                />
                                {getError('apellido') && <FieldError>{getError('apellido')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="fecha_de_nacimiento">Fecha de Nacimiento <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    type="date"
                                    id="fecha_de_nacimiento"
                                    value={data.fecha_de_nacimiento}
                                    onChange={(e) => setData('fecha_de_nacimiento', e.target.value)}
                                />
                                {getError('fecha_de_nacimiento') && <FieldError>{getError('fecha_de_nacimiento')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel>Género <span className="text-red-500">*</span></FieldLabel>
                                <Select
                                    onValueChange={(value) => setData('genero_id', value)}
                                    value={data.genero_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {generos.map(g => (
                                            <SelectItem key={g.id} value={String(g.id)}>
                                                {g.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getError('genero_id') && <FieldError>{getError('genero_id')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel>Estado Civil <span className="text-red-500">*</span></FieldLabel>
                                <Select
                                    onValueChange={(value) => setData('estado_civil_id', value)}
                                    value={data.estado_civil_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un estado civil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estadosCiviles.map(ec => (
                                            <SelectItem key={ec.id} value={String(ec.id)}>
                                                {ec.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getError('estado_civil_id') && <FieldError>{getError('estado_civil_id')}</FieldError>}
                            </Field>

                        </CardContent>
                    </Card>

                    {/* Documentación */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentación</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Field>
                                <FieldLabel>Tipo de Documento <span className="text-red-500">*</span></FieldLabel>
                                <Select
                                    onValueChange={(value) => setData('tipo_documento_id', value)}
                                    value={data.tipo_documento_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un tipo de documento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposDocumento.map(td => (
                                            <SelectItem key={td.id} value={String(td.id)}>
                                                {td.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getError('tipo_documento_id') && <FieldError>{getError('tipo_documento_id')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="numero_documento">Número de Documento <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="numero_documento"
                                    value={data.numero_documento}
                                    onChange={(e) => setData('numero_documento', e.target.value)}
                                    placeholder="Número de Documento"
                                />
                                {getError('numero_documento') && <FieldError>{getError('numero_documento')}</FieldError>}
                            </Field>

                        </CardContent>
                    </Card>

                    {/* Contacto */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Field>
                                <FieldLabel htmlFor="email">Email <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Email"
                                />
                                {getError('email') && <FieldError>{getError('email')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="domicilio">Domicilio</FieldLabel>
                                <Input
                                    id="domicilio"
                                    value={data.domicilio}
                                    onChange={(e) => setData('domicilio', e.target.value)}
                                    placeholder="Domicilio"
                                />
                                {getError('domicilio') && <FieldError>{getError('domicilio')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="lugar_de_nacimiento">Lugar de Nacimiento</FieldLabel>
                                <Input
                                    id="lugar_de_nacimiento"
                                    value={data.lugar_de_nacimiento}
                                    onChange={(e) => setData('lugar_de_nacimiento', e.target.value)}
                                    placeholder="Lugar de Nacimiento"
                                />
                                {getError('lugar_de_nacimiento') && <FieldError>{getError('lugar_de_nacimiento')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="telefono_fijo">Teléfono Fijo</FieldLabel>
                                <Input
                                    id="telefono_fijo"
                                    value={data.telefono_fijo}
                                    onChange={(e) => setData('telefono_fijo', e.target.value)}
                                    placeholder="Teléfono Fijo"
                                />
                                {getError('telefono_fijo') && <FieldError>{getError('telefono_fijo')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="telefono_celular">Teléfono Celular  <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="telefono_celular"
                                    value={data.telefono_celular}
                                    onChange={(e) => setData('telefono_celular', e.target.value)}
                                    placeholder="Teléfono Celular"
                                />
                                {getError('telefono_celular') && <FieldError>{getError('telefono_celular')}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="nacionalidad">Nacionalidad <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="nacionalidad"
                                    value={data.nacionalidad}
                                    onChange={(e) => setData('nacionalidad', e.target.value)}
                                    placeholder="Nacionalidad"
                                />
                                {getError('nacionalidad') && <FieldError>{getError('nacionalidad')}</FieldError>}
                            </Field>

                        </CardContent>
                    </Card>

                    {/* Dependencias por Área */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>
                                Dependencias por Área <span className="text-red-500">*</span>
                                <p className="text-sm text-muted-foreground font-normal mt-2">
                                    Debe agregar al menos una dependencia
                                </p>

                                {existeExternoSeleccionado() && (
                                    <p className="text-red-500 text-sm mt-1">
                                        No puedes agregar más dependencias cuando seleccionas un claustro Externo.
                                    </p>
                                )}

                                {existeNoDocenteSeleccionado() && (
                                    <p className="text-red-500 text-sm mt-1">
                                        Seleccionaste un claustro No Docente — solo puede existir uno en el sistema.
                                    </p>
                                )}
                            </CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={existeExternoSeleccionado()}
                                onClick={() => {
                                    setData('dependencias', [
                                        ...data.dependencias,
                                        {
                                            claustro_id: "",
                                            dependencia_id: "",
                                            area_id: "",
                                            fecha_ingreso: "",
                                            resolucion: "",
                                            expediente: "",
                                            estado: "",
                                        }
                                    ])
                                }}
                            >
                                <PlusIcon className="h-4 w-4" />
                                Agregar Dependencia
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.dependencias.map((dependencia, index) => (
                                <Card key={index} className="border-2">
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`claustro-${index}`}>
                                                    Claustro <span className="text-red-500">*</span>
                                                </FieldLabel>
                                                <Select
                                                    value={dependencia.claustro_id}
                                                    onValueChange={(value) => {
                                                        const newDependencias = [...data.dependencias];
                                                        newDependencias[index].claustro_id = value;

                                                        const valid = validarClaustros(newDependencias);

                                                        if (!valid.ok) {
                                                            setValidationErrors({
                                                                ...validationErrors,
                                                                [`dependencias.${index}.claustro_id`]: valid.error ?? "",
                                                                dependencias: valid.error ?? "",
                                                            });
                                                            return;
                                                        }

                                                        // Si pasa la validación, limpiamos errores y actualizamos
                                                        const newErrors = { ...validationErrors };
                                                        delete newErrors[`dependencias.${index}.claustro_id`];
                                                        delete newErrors.dependencias;

                                                        setValidationErrors(newErrors);
                                                        setData("dependencias", newDependencias);
                                                    }}

                                                >
                                                    <SelectTrigger id={`claustro-${index}`}>
                                                        <SelectValue placeholder="Seleccione un claustro" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {claustros.map(c => (
                                                            <SelectItem
                                                                key={c.id}
                                                                value={String(c.id)}
                                                                disabled={shouldDisableClaustroOption(String(c.id), index)}
                                                            >
                                                                {c.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {getError(`dependencias.${index}.claustro_id`) && (
                                                    <FieldError>
                                                        {getError(`dependencias.${index}.claustro_id`)}
                                                    </FieldError>
                                                )}
                                            </Field>

                                            <Field>
                                                <FieldLabel htmlFor={`dependencia-area-${index}`}>
                                                    Dependencia - Área <span className="text-red-500">*</span>
                                                </FieldLabel>
                                                <Select
                                                    value={
                                                        dependencia.dependencia_id && dependencia.area_id
                                                            ? `${dependencia.dependencia_id}-${dependencia.area_id}`
                                                            : ""
                                                    }
                                                    onValueChange={(value) => {
                                                        const [dep_id, area_id] = value.split('-')
                                                        const newDependencias = [...data.dependencias]
                                                        newDependencias[index].dependencia_id = dep_id
                                                        newDependencias[index].area_id = area_id
                                                        setData('dependencias', newDependencias)
                                                    }}
                                                >
                                                    <SelectTrigger id={`dependencia-area-${index}`}>
                                                        <SelectValue placeholder="Seleccione dependencia y área" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dependenciasAreas.map(da => (
                                                            <SelectItem
                                                                key={`${da.dependencia_id}-${da.area_id}`}
                                                                value={`${da.dependencia_id}-${da.area_id}`}
                                                            >
                                                                {da.dependencia.nombre} - {da.area.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {(getError(`dependencias.${index}.dependencia_id`) ||
                                                    getError(`dependencias.${index}.area_id`)) && (
                                                        <FieldError>
                                                            {getError(`dependencias.${index}.dependencia_id`) ||
                                                                getError(`dependencias.${index}.area_id`)}
                                                        </FieldError>
                                                    )}
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`fecha-ingreso-${index}`}>
                                                    Fecha de ingreso <span className="text-red-500">*</span>
                                                </FieldLabel>
                                                <Input
                                                    type="date"
                                                    id={`fecha-ingreso-${index}`}
                                                    value={
                                                        dependencia.fecha_ingreso
                                                            ? new Date(dependencia.fecha_ingreso).toISOString().split('T')[0]
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        const newDependencias = [...data.dependencias]
                                                        newDependencias[index].fecha_ingreso = e.target.value
                                                        setData('dependencias', newDependencias)
                                                    }}
                                                />
                                                {getError(`dependencias.${index}.fecha_ingreso`) && (
                                                    <FieldError>
                                                        {getError(`dependencias.${index}.fecha_ingreso`)}
                                                    </FieldError>
                                                )}
                                            </Field>

                                            <Field>
                                                <FieldLabel htmlFor={`estado-${index}`}>
                                                    Estado <span className="text-red-500">*</span>
                                                </FieldLabel>
                                                <Select
                                                    value={dependencia.estado ?? ""}
                                                    onValueChange={(value) => {
                                                        const newDependencias = [...data.dependencias]
                                                        newDependencias[index].estado = value
                                                        setData('dependencias', newDependencias)
                                                    }}
                                                >
                                                    <SelectTrigger id={`estado-${index}`}>
                                                        <SelectValue placeholder="Seleccione un estado" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {estados.map(e => (
                                                            <SelectItem key={e.value} value={e.value}>
                                                                {e.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {getError(`dependencias.${index}.estado`) && (
                                                    <FieldError>
                                                        {getError(`dependencias.${index}.estado`)}
                                                    </FieldError>
                                                )}
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`resolucion-${index}`}>
                                                    Resolución
                                                </FieldLabel>
                                                <Input
                                                    id={`resolucion-${index}`}
                                                    placeholder="Número de resolución"
                                                    value={dependencia.resolucion || ""}
                                                    onChange={(e) => {
                                                        const newDependencias = [...data.dependencias]
                                                        newDependencias[index].resolucion = e.target.value
                                                        setData('dependencias', newDependencias)
                                                    }}
                                                />
                                                {getError(`dependencias.${index}.resolucion`) && (
                                                    <FieldError>
                                                        {getError(`dependencias.${index}.resolucion`)}
                                                    </FieldError>
                                                )}
                                            </Field>

                                            <Field>
                                                <FieldLabel htmlFor={`expediente-${index}`}>
                                                    Expediente
                                                </FieldLabel>
                                                <Input
                                                    id={`expediente-${index}`}
                                                    placeholder="Número de expediente"
                                                    value={dependencia.expediente || ""}
                                                    onChange={(e) => {
                                                        const newDependencias = [...data.dependencias]
                                                        newDependencias[index].expediente = e.target.value
                                                        setData('dependencias', newDependencias)
                                                    }}
                                                />
                                                {getError(`dependencias.${index}.expediente`) && (
                                                    <FieldError>
                                                        {getError(`dependencias.${index}.expediente`)}
                                                    </FieldError>
                                                )}
                                            </Field>
                                        </div>

                                        {data.dependencias.length > 1 && (
                                            <div className="flex justify-end mt-4">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newDependencias = data.dependencias.filter((_, i) => i !== index)
                                                        setData('dependencias', newDependencias)
                                                    }}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                    Eliminar
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {getError('dependencias') && (
                                <p className="text-sm font-medium text-destructive">
                                    {getError('dependencias')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2 border-t pt-4 mr-5">
                        <Link href={personas.index.url()}>
                            <Button variant="outline">
                                Cancelar
                            </Button>
                        </Link>

                        {isFastCreate ? (
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Guardando...' : 'Completar Datos del Paciente'}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Guardando...' : 'Modificar Paciente'}
                            </Button>
                        )}
                    </div>

                </form>

            </div>
        </AppLayout>
    );
}