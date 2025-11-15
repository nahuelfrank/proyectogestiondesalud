import { Profesional } from "./profesional";

export type ProfesionalDetalle = Profesional & {
  fechaNacimiento?: string | null;
  estadoCivil?: string | null;
  obraSocial?: string | null;
  nacionalidad?: string | null;
  notas?: string | null;
};
