import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import atenciones from "@/routes/atenciones";

// 🚀 MOCK DATA — PARA PRUEBAS
const mockAtencion = {
  id: 12,
  paciente_nombre: "Juan Pérez",
  paciente_documento: "30123456",
  fecha: "2025-03-15 09:30",
  motivo: "Dolor abdominal",
  estado: "En espera",
};

const mockEstados = ["En espera", "En Atención", "Atendido", "Cancelado"];

export default function EditarAtencionPage({
  atencion = mockAtencion,
  estados = mockEstados,
}) {
  // Reglas de negocio
  const estadoActual = atencion.estado;

  const permitidoCambiar = estadoActual === "En espera";

  const estadosDisponibles = permitidoCambiar ? ["Cancelado"] : [];

  function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    console.log("💾 Enviando datos:");
    for (const entry of form.entries()) {
      console.log(entry[0], entry[1]);
    }

    alert("Simulación: Se envió el cambio de estado ✔");
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Atenciones", href: "#" },
        { title: "Editar", href: "#" },
      ]}
    >
      <Head title="Modificar estado de atención" />

      <div className="container mx-auto py-10 max-w-3xl">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Modificar estado del paciente
        </h1>

        <Card className="shadow-md">
          <CardContent className="p-6 space-y-6">
            {/* Datos visibles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Paciente</Label>
                <p className="font-medium">{atencion.paciente_nombre}</p>
              </div>

              <div>
                <Label>Número de Documento</Label>
                <p className="font-medium">{atencion.paciente_documento}</p>
              </div>

              <div>
                <Label>Fecha</Label>
                <p className="font-medium">{atencion.fecha}</p>
              </div>

              <div>
                <Label>Motivo</Label>
                <p className="font-medium">{atencion.motivo}</p>
              </div>

              <div className="col-span-2">
                <Label>Estado actual</Label>
                <p className="font-semibold text-blue-700">{estadoActual}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selector de nuevo estado */}
              <div>
                <Label>Nuevo estado del paciente</Label>

                {permitidoCambiar ? (
                  <Select name="estado_nuevo" required>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosDisponibles.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-red-600 mt-1">
                    No es posible modificar el estado porque la atención está en
                    "{estadoActual}".
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex justify-between mt-6">
                <Button variant="outline">Volver</Button>

                <Button type="submit" disabled={!permitidoCambiar}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
