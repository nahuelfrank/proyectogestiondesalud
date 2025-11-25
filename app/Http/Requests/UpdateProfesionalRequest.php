<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'genero_id' => ['required', 'exists:generos,id'],
            'estado_civil_id' => ['required', 'exists:estados_civiles,id'],
            'tipo_documento_id' => ['required', 'exists:tipos_documento,id'],
            'nombre' => ['required', 'string'],
            'apellido' => ['required', 'string'],
            'numero_documento' => [
                'required',
                'string',
                Rule::unique('personas', 'numero_documento')->ignore($personaId)

            ],
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
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('personas', 'email')->ignore($personaId)
            ],

            // Datos de Profesional
            'especialidad_id' => ['required', 'integer', 'exists:especialidades,id'],
            'estado' => ['required', 'string', 'in:Activo,Inactivo'],
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
            'before_or_equal' => 'La :attribute no puede ser una fecha futura.',
            'genero_id.required' => 'El género es requerido.',
            'tipo_documento_id.required' => 'El tipo de documento es requerido.',
            'estado_civil_id.required' => 'El estado civil es requerido.',
            'email.required' => 'El email es requerido.',
            'email.email' => 'El email debe ser una dirección válida.',
            'email.unique' => 'El email ya existe en el sistema.',
            'especialidad_id.required' => 'La especialidad es requerida.',
            'estado.required' => 'El estado es requerido.',
            'estado.in' => 'El estado seleccionado no es válido. Solo puede ser "Activo" o "Inactivo".',
            'matricula.required' => 'La matrícula es requerida.',
            'disponibilidades_horarias.*.hora_fin_atencion.after' => 'La hora de fin debe ser mayor que la hora de inicio.',
        ];
    }
}
