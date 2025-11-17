<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfesionalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $profesionalId = $this->route('profesional')->id;
        $personaId = $this->route('profesional')->persona_id;

        return [
            // Datos de Persona
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'fecha_de_nacimiento' => ['required', 'date'],
            'genero_id' => ['required', 'integer', 'exists:generos,id'],
            'tipo_documento_id' => ['required', 'integer', 'exists:tipos_documento,id'],
            'numero_documento' => [
                'required',
                'string',
                'unique:personas,numero_documento,' . $personaId
            ],
            'estado_civil_id' => ['required', 'integer', 'exists:estados_civiles,id'],
            'email' => [ 
                'required',
                'email',
                'max:255',
                'unique:personas,email,' . $personaId
            ],

            // Datos de Profesional
            'especialidad_id' => ['required', 'integer', 'exists:especialidades,id'],
            'estado' => ['required', 'string', 'in:activo,inactivo'],
            'matricula' => ['required', 'string', 'max:255'],

            // Disponibilidades Horarias (opcional)
            'disponibilidades_horarias' => ['nullable', 'array'],
            'disponibilidades_horarias.*.dia_id' => ['required', 'integer', 'exists:dias,id'],
            'disponibilidades_horarias.*.hora_inicio_atencion' => ['required', 'date_format:H:i'],
            'disponibilidades_horarias.*.hora_fin_atencion' => [
                'required',
                'date_format:H:i',
                'after:disponibilidades_horarias.*.hora_inicio_atencion'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'numero_documento.unique' => 'El número de documento ya existe en el sistema.',
            'nombre.required' => 'El nombre es requerido.',
            'apellido.required' => 'El apellido es requerido.',
            'fecha_de_nacimiento.required' => 'La fecha de nacimiento es requerida.',
            'genero_id.required' => 'El género es requerido.',
            'tipo_documento_id.required' => 'El tipo de documento es requerido.',
            'estado_civil_id.required' => 'El estado civil es requerido.',
            'email.required' => 'El email es requerido.',
            'email.email' => 'El email debe ser una dirección válida.',
            'email.unique' => 'El email ya existe en el sistema.',
            'especialidad_id.required' => 'La especialidad es requerida.',
            'estado.required' => 'El estado es requerido.',
            'matricula.required' => 'La matrícula es requerida.',
            'disponibilidades_horarias.*.hora_fin_atencion.after' => 'La hora de fin debe ser mayor que la hora de inicio.',
        ];
    }
}