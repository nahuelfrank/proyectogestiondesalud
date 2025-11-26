<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Reglas de validación al momento de crear una nueva persona (paciente) en el sistema
            'genero_id' => ['required', 'exists:generos,id'],
            'estado_civil_id' => ['required', 'exists:estados_civiles,id'],
            'tipo_documento_id' => ['required', 'exists:tipos_documento,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'numero_documento' => ['required', 'string', 'unique:personas,numero_documento'],
            'fecha_de_nacimiento' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'domicilio' => ['nullable', 'string'],
            'lugar_de_nacimiento' => ['nullable', 'string'],
            'telefono_fijo' => ['nullable', 'string'],
            'telefono_celular' => ['required', 'string'],
            'nacionalidad' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255', 'unique:personas,email'],

            // Reglas de validación basadas en la migración de la tabla personas_dependencias
            'dependencias' => ['required', 'array', 'min:1'],
            'dependencias.*.claustro_id' => ['required', 'exists:claustros,id'],
            'dependencias.*.dependencia_id' => ['required', 'exists:dependencias,id'],
            'dependencias.*.area_id' => ['required', 'exists:areas,id'],
            'dependencias.*.fecha_ingreso' => ['required', 'date', 'before_or_equal:today'],
            'dependencias.*.resolucion' => ['nullable', 'string'],
            'dependencias.*.expediente' => ['nullable', 'string'],
            'dependencias.*.estado' => ['required', 'in:activo,inactivo']
        ];
    }

    public function messages(): array
    {
        return [

            // ---------------------------
            // PERSONA
            // ---------------------------

            // Género
            'genero_id.required' => 'Debe seleccionar un género.',
            'genero_id.exists' => 'El género seleccionado no es válido.',

            // Estado civil
            'estado_civil_id.required' => 'Debe seleccionar un estado civil.',
            'estado_civil_id.exists' => 'El estado civil seleccionado no existe.',

            // Tipo de documento
            'tipo_documento_id.required' => 'Debe seleccionar un tipo de documento.',
            'tipo_documento_id.exists' => 'El tipo de documento seleccionado no existe.',

            // Nombre y apellido
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',

            // Documento
            'numero_documento.required' => 'El número de documento es obligatorio.',
            'numero_documento.unique' => 'El número de documento ya existe en el sistema.',

            // Fecha de nacimiento
            'fecha_de_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_de_nacimiento.date' => 'La fecha de nacimiento no tiene un formato válido.',
            'before_or_equal' => 'La :attribute no puede ser una fecha futura.',

            // Domicilio
            'domicilio.string' => 'El domicilio debe ser una cadena de texto.',

            // Lugar de nacimiento
            'lugar_de_nacimiento.string' => 'El lugar de nacimiento debe ser una cadena de texto.',

            // Teléfonos
            'telefono_fijo.string' => 'El teléfono fijo debe ser una cadena de texto.',
            'telefono_celular.required' => 'Debe ingresar un teléfono celular.',
            'telefono_celular.string' => 'El teléfono celular debe ser una cadena de texto.',

            // Nacionalidad
            'nacionalidad.required' => 'Debe ingresar la nacionalidad.',
            'nacionalidad.string' => 'La nacionalidad debe ser una cadena de texto.',

            // Email
            'email.required' => 'Debe ingresar un correo electrónico.',
            'email.string' => 'El correo electrónico debe ser una cadena válida.',
            'email.email' => 'El email debe ser una dirección válida.',
            'email.unique' => 'El email ya existe en el sistema.',


            // ---------------------------
            // DEPENDENCIAS
            // ---------------------------

            'dependencias.required' => 'Debe agregar al menos una dependencia.',
            'dependencias.array' => 'La lista de dependencias no tiene un formato válido.',
            'dependencias.min' => 'Debe ingresar al menos una dependencia.',


            // Campos individuales de cada dependencia
            'dependencias.*.claustro_id.required' => 'Debe seleccionar un claustro.',
            'dependencias.*.claustro_id.exists' => 'El claustro seleccionado no existe.',

            'dependencias.*.dependencia_id.required' => 'Debe seleccionar una dependencia.',
            'dependencias.*.dependencia_id.exists' => 'La dependencia seleccionada no existe.',

            'dependencias.*.area_id.required' => 'Debe seleccionar un área.',
            'dependencias.*.area_id.exists' => 'El área seleccionada no existe.',

            // Fecha ingreso
            'dependencias.*.fecha_ingreso.required' => 'Debe ingresar una fecha de ingreso.',
            'dependencias.*.fecha_ingreso.date' => 'La fecha de ingreso no tiene un formato válido.',
            

            // Resolución
            'dependencias.*.resolucion.string' => 'La resolución debe ser una cadena de texto.',

            // Expediente
            'dependencias.*.expediente.string' => 'El expediente debe ser una cadena de texto.',

            // Estado
            'dependencias.*.estado.required' => 'Debe indicar el estado (activo o inactivo).',
            'dependencias.*.estado.in' => 'El estado debe ser "activo" o "inactivo".',

        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            $dependencias = $this->input('dependencias', []);

            if (!is_array($dependencias) || empty($dependencias)) {
                return;
            }

            // Extraer solo los claustro_id
            $claustros = array_column($dependencias, 'claustro_id');

            // IDs especiales
            $NO_DOCENTE_ID = 2; // 
            $EXTERNO_ID = 4;    //

            /*
            |--------------------------------------------------------------------------
            | REGLA 1: Máximo un "No Docente"
            |--------------------------------------------------------------------------
            */
            $noDocentes = array_filter($claustros, fn($id) => $id == $NO_DOCENTE_ID);

            if (count($noDocentes) > 1) {
                $validator->errors()->add(
                    'dependencias',
                    "Solo puedes seleccionar un claustro 'No Docente'."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | REGLA 2: 'Externo' NO se puede combinar con otros claustros
            |--------------------------------------------------------------------------
            */
            if (in_array($EXTERNO_ID, $claustros) && count($claustros) > 1) {

                $validator->errors()->add(
                    'dependencias',
                    "El claustro 'Externo' no puede combinarse con otros claustros."
                );
            }
        });
    }
}
