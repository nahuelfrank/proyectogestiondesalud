import { DependenciaArea } from '@/types/personas/persona.types'
import { PersonaFormValues } from '@/schemas/persona.squema'

export function transformFormDataForSubmit(
  values: PersonaFormValues,
  dependenciasAreas: DependenciaArea[]
) {
  return {
    ...values,
    dependencias: values.dependencias.map((dep) => {
      // Encontrar la dependenciaArea seleccionada
      const depArea = dependenciasAreas.find(
        da => `${da.dependencia_id}-${da.area_id}` === dep.dependencia_area_id
      )

      return {
        claustro_id: dep.claustro_id,
        dependencia_id: depArea?.dependencia_id,
        area_id: depArea?.area_id,
        fecha_ingreso: dep.fecha_ingreso,
        resolucion: dep.resolucion || null,
        expediente: dep.expediente || null,
        estado: dep.estado,
      }
    })
  }
}

export const defaultFormValues: Partial<PersonaFormValues> = {
  nombre: "",
  apellido: "",
  numero_documento: "",
  fecha_de_nacimiento: new Date(), // no undefined
  telefono_celular: "",
  nacionalidad: "",
  genero_id: "",
  estado_civil_id: "",
  tipo_documento_id: "",
  email: "",
  domicilio: "",
  lugar_de_nacimiento: "",
  telefono_fijo: "",
  dependencias: [
    {
      claustro_id: "",
      dependencia_area_id: "",
      fecha_ingreso: undefined,
      resolucion: "",
      expediente: "",
      estado: "",
    },
  ],
}