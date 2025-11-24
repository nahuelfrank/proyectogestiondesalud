<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProfesionalRequest extends FormRequest
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
            // Datos de Persona
            'genero_id' => ['required', 'exists:generos,id'],
            'estado_civil_id' => ['required', 'exists:estados_civiles,id'],
            'tipo_documento_id' => ['required', 'exists:tipos_documento,id'],
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'numero_documento' => ['required', 'string', 'unique:personas,numero_documento'],
            'fecha_de_nacimiento' => ['required', 'date'],
            'domicilio' => ['nullable', 'string'],
            'lugar_de_nacimiento' => ['nullable', 'string'],
            'telefono_fijo' => ['nullable', 'string'],
            'telefono_celular' => ['required', 'string'],
            'nacionalidad' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255', 'unique:personas,email'],


            // Datos de Profesional
            'especialidad_id' => ['required', 'exists:especialidades,id'],
            'estado' => ['required', 'string', 'in:activo,inactivo'],
            'matricula' => ['required', 'string', 'max:255'],

            // Disponibilidades Horarias (opcional)
            'disponibilidades_horarias' => ['nullable', 'array'],
            'disponibilidades_horarias.*.dia_id' => ['required', 'exists:dias,id'],
            'disponibilidades_horarias.*.hora_inicio_atencion' => ['required', 'date_format:H:i'],
            'disponibilidades_horarias.*.hora_fin_atencion' => ['required', 'date_format:H:i', 'after:disponibilidades_horarias.*.hora_inicio_atencion'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
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

            'especialidad_id.required' => 'La especialidad es requerida.',
            'estado.required' => 'El estado es requerido.',
            'matricula.required' => 'La matrícula es requerida.',
            'disponibilidades_horarias.*.hora_fin_atencion.after' => 'La hora de fin debe ser mayor que la hora de inicio.',
            'disponibilidades_horarias.*.hora_inicio_atencion.required' => 'La hora de inicio es requerida.',
            'disponibilidades_horarias.*.hora_fin_atencion.required' => 'La hora de fin es requerida.',
        ];
    }
}