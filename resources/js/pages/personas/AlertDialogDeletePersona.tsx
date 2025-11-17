import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { router } from "@inertiajs/react"

interface DeletePersonaButtonProps {
  persona: {
    id: number
    nombre: string
    apellido: string
  }
}

export function DeletePersonaButton({ persona }: DeletePersonaButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Eliminar">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Quieres eliminar a {persona.nombre} {persona.apellido}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Este paciente será marcado como inactivo y no aparecerá en la lista principal. 
            Podrás restaurarlo más adelante si lo necesitás.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              router.delete(`/pacientes/${persona.id}`, {
                onSuccess: () => {
                  router.reload({ only: ["pacientes"] })
                },
              })
            }
          >
            Eliminar paciente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
