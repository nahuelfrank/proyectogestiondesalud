// resources/js/types/profesional.ts

import { DisponibilidadHoraria } from "@/pages/profesionales/columns";

export type Profesional = {
  id: number;
  persona_id: number;
  especialidad_id: number;
  persona: {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento?: string;
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
