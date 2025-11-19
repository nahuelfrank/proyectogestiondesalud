import { Head, Link } from '@inertiajs/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import profesionales from '@/routes/profesionales'
import { Undo2 } from 'lucide-react'

// Tipos
interface Genero {
  id: number
  nombre: string
}

interface EstadoCivil {
  id: number
  nombre: string
}

interface TipoDocumento {
  id: number
  nombre: string
}

interface Persona {
  id: number
  nombre: string
  apellido: string
  numero_documento: string
  fecha_de_nacimiento: string
  domicilio: string
  lugar_de_nacimiento?: string
  telefono_fijo?: string
  telefono_celular: string
  nacionalidad: string
  email: string
  genero?: Genero
  estado_civil?: EstadoCivil
  tipo_documento?: TipoDocumento
}

interface Especialidad {
  id: number
  nombre: string
}

interface Dia {
  id: number
  nombre: string
}

interface DisponibilidadHoraria {
  id: number
  dia_id: number
  hora_inicio_atencion: string
  hora_fin_atencion: string
  dia?: Dia
}

interface Profesional {
  id: number
  persona_id: number
  especialidad_id: number
  estado: string
  matricula: string
  persona?: Persona
  especialidad?: Especialidad
  disponibilidades_horarias?: DisponibilidadHoraria[]
}

interface ProfesionalShowPageProps {
  profesional: Profesional
  persona: Persona
}

// Componente para mostrar una etiqueta de información
function Info({ label, value }: { label: string; value: string | null | undefined | React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      {typeof value === 'string' || value === null || value === undefined ? (
        <span className="text-base font-medium text-foreground">{value ?? '-'}</span>
      ) : (
        <div className="text-base font-medium text-foreground">{value}</div>
      )}
    </div>
  )
}


export default function ProfesionalShowPage({ profesional, persona }: ProfesionalShowPageProps) {
  const disponibilidades = profesional.disponibilidades_horarias ?? []

  return (
    <AppLayout breadcrumbs={[
      { title: 'Profesionales', href: '/profesionales' },
      { title: 'Detalles', href: '#' }
    ]}>
      <div className="container mx-auto py-10">
        <Head title={`Detalles de ${persona.nombre} ${persona.apellido}`} />

        <div className="m-2 space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {persona.nombre} {persona.apellido}
            </h1>
            <p className="text-muted-foreground mb-4">
              Información del profesional y sus disponibilidades horarias.
            </p>

            <Link href={profesionales.index.url()} className="inline-block">
              <Button className="flex items-center gap-2">
                <Undo2 className="h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>

          <Separator />

          {/* Información Profesional */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <Info label="Especialidad" value={profesional.especialidad?.nombre} />
                <Info label="Matrícula" value={profesional.matricula} />
                <Info label="Estado" value={<span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${profesional.estado === "activo"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {profesional.estado.charAt(0).toUpperCase() + profesional.estado.slice(1)}
                </span>} />


              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <Info label="Nombre" value={`${persona.nombre} ${persona.apellido}`} />
                <Info label="Documento" value={persona.numero_documento} />
                <Info label="Tipo de documento" value={persona.tipo_documento?.nombre} />
                <Info label="Género" value={persona.genero?.nombre} />
                <Info label="Estado civil" value={persona.estado_civil?.nombre} />
                <Info label="Email" value={persona.email} />
                <Info label="Teléfono fijo" value={persona.telefono_fijo} />
                <Info label="Teléfono celular" value={persona.telefono_celular} />
                <Info label="Nacionalidad" value={persona.nacionalidad} />
                <Info label="Fecha de nacimiento" value={persona.fecha_de_nacimiento} />
                <Info label="Domicilio" value={persona.domicilio} />
                <Info label="Lugar de nacimiento" value={persona.lugar_de_nacimiento} />
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidades Horarias */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Disponibilidades Horarias</CardTitle>
            </CardHeader>
            <CardContent>
              {disponibilidades.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Día</TableHead>
                        <TableHead>Hora inicio</TableHead>
                        <TableHead>Hora fin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disponibilidades.map((disponibilidad) => (
                        <TableRow key={disponibilidad.id}>
                          <TableCell>{disponibilidad.dia?.nombre ?? '-'}</TableCell>
                          <TableCell>{disponibilidad.hora_inicio_atencion}</TableCell>
                          <TableCell>{disponibilidad.hora_fin_atencion}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay disponibilidades horarias configuradas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}