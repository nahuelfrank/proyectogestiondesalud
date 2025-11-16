import { Head, Link } from '@inertiajs/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import personas from '@/routes/personas'
import type { PersonaShowPageProps } from '@/types/personas/persona';

// Componente para mostrar una etiqueta de información
function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-base font-medium text-foreground">{value ?? '-'}</span>
    </div>
  )
}

export default function PersonaShowPage({ persona }: PersonaShowPageProps) {
  const dependencias = persona.personas_dependencias_areas ?? []

  return (
    <AppLayout breadcrumbs={[{ title: 'Personas', href: personas.index.url() }, { title: 'Detalles', href: '#' }]}>
      <div className="container mx-auto py-10">

        <Head title={`Detalles de ${persona.nombre} ${persona.apellido}`} />

        <div className="m-2 space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {persona.nombre} {persona.apellido}
            </h1>
            <p className="text-muted-foreground mb-4">Detalles personales y dependencias asociadas.</p>

            <Link href={personas.index.url()} className="inline-block">
              <Button>Volver a la lista de Pacientes</Button>
            </Link>
          </div>

          <Separator />

          {/* Personal Info */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <Info label="Nombre" value={`${persona.nombre} ${persona.apellido}`} />
                <Info label="Documento" value={persona.numero_documento} />
                <Info label="Tipo de documento" value={persona.tipo_documento?.nombre || ""} />
                <Info label="Género" value={persona.genero?.nombre || ""} />
                <Info label="Estado civil" value={persona.estado_civil?.nombre || ""} />
                <Info label="Email" value={persona.email} />
                <Info label="Teléfono fijo" value={persona.telefono_fijo || ""} />
                <Info label="Teléfono celular" value={persona.telefono_celular} />
                <Info label="Nacionalidad" value={persona.nacionalidad} />
                <Info label="Fecha de nacimiento" value={persona.fecha_de_nacimiento} />
                <Info label="Domicilio" value={persona.domicilio} />
                <Info label="Lugar de nacimiento" value={persona.lugar_de_nacimiento || "-"} />
              </div>
            </CardContent>
          </Card>

          {/* Dependencias */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Dependencias Asociadas</CardTitle>
            </CardHeader>
            <CardContent>
              {dependencias.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claustro</TableHead>
                        <TableHead>Dependencia</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Fecha ingreso</TableHead>
                        <TableHead>Resolución</TableHead>
                        <TableHead>Expediente</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dependencias.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.claustro?.nombre}</TableCell>
                          <TableCell>{d.dependencia_area?.dependencia?.nombre}</TableCell>
                          <TableCell>{d.dependencia_area?.area?.nombre}</TableCell>
                          <TableCell>{d.fecha_ingreso ?? '-'}</TableCell>
                          <TableCell>{d.resolucion ?? '-'}</TableCell>
                          <TableCell>{d.expediente ?? '-'}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${d.estado === "activo"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {d.estado.charAt(0).toUpperCase() + d.estado.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay dependencias asociadas.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}