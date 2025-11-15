
export interface Genero {
  id: number
  nombre: string
}

export interface EstadoCivil {
  id: number
  nombre: string
}

export interface TipoDocumento {
  id: number
  nombre: string
}

export interface Claustro {
  id: number
  nombre: string
}

export interface Area {
  id: number
  nombre: string
}

export interface Dependencia {
  id: number
  nombre: string
}

export interface DependenciaArea {
  dependencia_id: number
  area_id: number
  dependencia: Dependencia
  area: Area
}

export interface PersonaDependenciaArea {
  claustro_id: number
  dependencia_id: number
  area_id: number
  fecha_ingreso: string
  resolucion?: string | null
  expediente?: string | null
  estado: string
  // Relaciones pobladas (opcional, dependiendo del endpoint)
  claustro?: Claustro
  dependencia_area?: DependenciaArea
}

export interface Persona {
  id: number
  nombre: string
  apellido: string
  numero_documento: string
  genero?: { nombre: string } | null
  telefono_fijo?: string | null
  telefono_celular?: string | null
  domicilio?: string | null
  email?: string | null
}

export interface DetallePersona extends Persona {
  genero_id: number
  estado_civil_id: number
  tipo_documento_id: number
  fecha_de_nacimiento: string
  domicilio: string
  lugar_de_nacimiento?: string | null
  telefono_celular: string
  nacionalidad: string
  email: string
  // Relaciones pobladas
  genero?: Genero
  estado_civil?: EstadoCivil
  tipo_documento?: TipoDocumento
  personas_dependencias_areas?: PersonaDependenciaArea[]
}

// Props comunes para los formularios
export interface PersonaFormProps {
  generos: Genero[]
  estadosCiviles: EstadoCivil[]
  tiposDocumento: TipoDocumento[]
  claustros: Claustro[]
  dependenciasAreas: DependenciaArea[]
  estados: { value: string; label: string }[]
}

export interface PersonaShowPageProps {
  persona: DetallePersona
}

export interface PersonaCreatePageProps {
  generos: Genero[]
  estadosCiviles: EstadoCivil[]
  tiposDocumento: TipoDocumento[]
  claustros: Claustro[]
  dependenciasAreas: DependenciaArea[]
  estados: { value: string; label: string }[]
}

export interface PersonaEditPageProps extends PersonaCreatePageProps {
  persona: DetallePersona
}

export interface FastCreateProps {
    tiposDocumento: TipoDocumento[];
}