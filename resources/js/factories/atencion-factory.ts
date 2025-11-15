import { Atencion } from "@/types/atenciones/atencion";

// Helpers
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}

function randomName(): string {
  const names = ["Juan", "María", "Luis", "Ana", "Pedro", "Lucía", "Carlos", "Sofía"];
  return randomItem(names);
}

function randomLastName(): string {
  const lastNames = ["Gómez", "Pérez", "Rodríguez", "Sánchez", "Torres", "Romero", "López"];
  return randomItem(lastNames);
}

function randomTime(): string {
  const hour = String(Math.floor(Math.random() * 8) + 8).padStart(2, "0"); // 08 a 15
  const minute = ["00", "15", "30", "45"][Math.floor(Math.random() * 4)];
  return `${hour}:${minute}`;
}

// Catálogos
const tiposAtencion = ["Consulta", "Urgencia", "Emergencia"];
const estados = ["En Espera", "En Atención", "Cancelado"];
const servicios = ["Odontología", "Clínica Médica", "Pediatría", "Traumatología"];


// 🎯 Factory Principal
export function makeAtencion(overrides: Partial<Atencion> = {}): Atencion {
  return {
    id: randomId(),
    fecha: new Date().toISOString().slice(0, 10),
    hora: randomTime(),

    servicio: {
      id: randomId(),
      nombre: randomItem(servicios),
    },

    tipo_atencion: {
      id: randomId(),
      nombre: randomItem(tiposAtencion),
    },

    estado_atencion: {
      id: randomId(),
      nombre: randomItem(estados),
    },

    profesional: {
      persona: {
        id: randomId(),
        nombre: randomName(),
        apellido: randomLastName(),
      },
    },

    persona: {
      id: randomId(),
      nombre: randomName(),
      apellido: randomLastName(),
    },

    ...overrides,
  };
}

// 🎯 Factory para lista
export function makeAtenciones(count: number): Atencion[] {
  return Array.from({ length: count }, () => makeAtencion());
}
