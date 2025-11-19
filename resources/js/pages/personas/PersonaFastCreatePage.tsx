import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import personas from "@/routes/personas";
import { BreadcrumbItem } from "@/types";
import { FormEventHandler, useState } from "react";
import { z } from 'zod';
import type { FastCreateProps } from "@/types/personas/persona";
import { Undo2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: personas.index.url()
    },
    {
        title: 'Registrar Paciente',
        href: personas.create.url(),
    },
    {
        title: 'Carga Rápida Paciente',
        href: personas.fastCreate.url(),
    },
];

const personaFastCreateSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    apellido: z.string().optional(),
    tipo_documento_id: z.string().optional(),
    numero_documento: z.string().optional(),
}).refine(
    (data) =>
        // si uno existe, el otro también debe existir
        !data.tipo_documento_id || !!data.numero_documento,
    {
        message: "Debes ingresar el número de documento.",
        path: ["numero_documento"], // marca el error en este campo
    }
)
    .refine(
        (data) =>
            !data.numero_documento || !!data.tipo_documento_id,
        {
            message: "Debes seleccionar el tipo de documento.",
            path: ["tipo_documento_id"],
        }
    );

type PersonaFastCreateFormData = z.infer<typeof personaFastCreateSchema>;

export default function PersonaFastCreatePage({ tiposDocumento }: FastCreateProps) {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const { data, setData, post, errors, processing } = useForm<PersonaFastCreateFormData>({
        nombre: "",
        apellido: "",
        tipo_documento_id: "",
        numero_documento: "",
    });

    // Envío del formulario
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setValidationErrors({});
        try {
            // Validar con Zod
            personaFastCreateSchema.parse(data);
            // Si la validación pasa, enviar el formulario
            post(personas.fastStore.url());
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

    // Función helper para obtener errores (de Zod o del servidor)
    const getError = (field: string): string | undefined => {
        return validationErrors[field] || (errors as Record<string, string>)[field];
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carga Rápida de Paciente" />
            <div className="container mx-auto py-10">

                <div className="ml-5">
                    <h1 className="text-3xl font-semibold mb-2">Registrar Nuevo Paciente (Carga Rápida)</h1>

                    <p className="text-muted-foreground mb-4">Los campos con <span className="text-destructive">*</span> son obligatorios.</p>

                    <Link
                        href={personas.create.url()}
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

                <div className="max-w-2xl mx-auto py-2">

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-destructive">
                                CARGA RÁPIDA Emergencia/Urgencia
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                “Está a punto de realizar una carga rápida. Esta opción debe usarse únicamente en casos de Emergencia/Urgencia.
                                Recuerde completar el resto de los campos después”.
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">

                                <Field>
                                    <FieldLabel>Nombre <span className="text-red-500">*</span></FieldLabel>
                                    <Input
                                        value={data.nombre}
                                        onChange={e => setData("nombre", e.target.value)}
                                    />
                                    {getError('nombre') && <FieldError>{getError('nombre')}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel>Apellido</FieldLabel>
                                    <Input
                                        value={data.apellido}
                                        onChange={e => setData("apellido", e.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>Tipo Documento</FieldLabel>
                                    <Select
                                        value={data.tipo_documento_id}
                                        onValueChange={value => setData("tipo_documento_id", value)}
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
                                </Field>
                                {getError('tipo_documento_id') && <FieldError>{getError('tipo_documento_id')}</FieldError>}

                                <Field>
                                    <FieldLabel>Número de Documento</FieldLabel>
                                    <Input
                                        value={data.numero_documento}
                                        onChange={e => setData("numero_documento", e.target.value)}
                                    />
                                </Field>
                                {getError('numero_documento') && <FieldError>{getError('numero_documento')}</FieldError>}

                                <div className="flex justify-end gap-2 border-t pt-4">
                                    <Link href={personas.create.url()}>
                                        <Button variant="outline">
                                            Cancelar
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creando Paciente...' : 'Atender Emergencia'}
                                    </Button>
                                </div>

                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}


