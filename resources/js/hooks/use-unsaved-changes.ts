import React from 'react'
import { UseFormReturn } from 'react-hook-form'

export function useUnsavedChanges(form: UseFormReturn<any>) {
  const [isDirty, setIsDirty] = React.useState(false)

  // Detectar cambios en el formulario
  React.useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(form.formState.isDirty)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Prevenir cierre de pestaña/navegador con cambios sin guardar
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  return { isDirty, setIsDirty }
}