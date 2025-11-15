// Persona básica (para paciente y profesional)
export interface PersonaBasic {
  id: number;
  nombre: string;
  apellido: string;
}

// Servicio asociado a la atención
export interface Servicio {
  id: number;
  nombre: string;
}

// Tipo de atención (Urgencia, Emergencia, etc.)
export interface TipoAtencion {
  id: number;
  nombre: string;
}

// Estado de la atención (En Espera, Cancelado, etc.)
export interface EstadoAtencion {
  id: number;
  nombre: string;
}

// Profesional -> persona
export interface Profesional {
  persona: PersonaBasic;
}

// Modelo principal de Atencion
export interface Atencion {
  id: number;
  fecha: string;       // formato YYYY-MM-DD
  hora: string;        // formato HH:MM
  servicio: Servicio;
  tipo_atencion: TipoAtencion;
  estado_atencion: EstadoAtencion;
  profesional: Profesional;
  persona: PersonaBasic;   // paciente
}
