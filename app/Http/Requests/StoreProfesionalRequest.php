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
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'fecha_de_nacimiento' => ['required', 'date'],
            'genero_id' => ['required', 'exists:generos,id'],
            'tipo_documento_id' => ['required', 'exists:tipos_documento,id'],
            'numero_documento' => ['required', 'string', 'unique:personas,numero_documento'],
            'estado_civil_id' => ['required', 'exists:estados_civiles,id'],
            'email' => ['required', 'email', 'max:255', 'unique:personas,email'], // ✅ Campo email agregado

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
            'numero_documento.unique' => 'El número de documento ya existe en el sistema.',
            'numero_documento.required' => 'El número de documento es requerido.',
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
            'disponibilidades_horarias.*.hora_inicio_atencion.required' => 'La hora de inicio es requerida.',
            'disponibilidades_horarias.*.hora_fin_atencion.required' => 'La hora de fin es requerida.',
        ];
    }
}