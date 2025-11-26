import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { columns } from './Columns';
import { DataTable } from '@/components/ui/data-table';
import { Atencion } from '@/types/atenciones/atencion';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import atenciones from '@/routes/atenciones';
import { useEffect } from 'react';
import { toast } from 'sonner';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atenciones',
        href: atenciones.index.url(),
    },
];

interface AtencionIndexPageProps {
    items: Atencion[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: "asc" | "desc";
    };
}

export default function AtencionIndexPage({ items, meta, filters }: AtencionIndexPageProps) {

    useEffect(() => {
        // 1. Suscribirse al canal 'atenciones'
        const channel = window.Echo.channel('atenciones');

        // 2. Escuchar el evento (nota el punto en el nombre si usaste broadcastAs)
        channel.listen('.atencion.creada', (e: any) => {
            console.log('Nueva atención recibida:', e.atencion);

            // 3. Recargar SOLO los datos de la tabla (items y meta)
            // Esto mantiene los filtros y la paginación actuales, 
            // pero refresca la data para ver el nuevo registro ordenado correctamente.
            router.reload({
                only: ['items', 'meta'],
                onSuccess: () => {
                    // Opcional: Sonido o Toast de notificación
                    toast.success("Nueva atención creada", {
                        description: `
                            Paciente: ${e.atencion.persona.nombre} ${e.atencion.persona.apellido}
                              Tipo de atención: ${e.atencion.tipo_de_atencion.nombre}
                     `,
                    });
                }
            });
        });

        channel.listen('.atencion.actualizada', (e: any) => {
            router.reload({ only: ['items', 'meta'] });
        });

        // 4. Limpieza al salir de la página
        return () => {
            channel.stopListening('.atencion.creada');
            channel.stopListening('.atencion.actualizada');
            // Opcional: window.Echo.leave('atenciones');
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Atenciones" />
            <div className="container mx-auto py-10">

                <div className="ml-5">

                    <h1 className="text-3xl font-semibold mb-3">Lista de Atenciones</h1>

                    <p className="text-muted-foreground mb-3">
                        Solo se muestran las atenciones del día actual.
                    </p>

                    <Link href={atenciones.crear_atencion.url()} className="inline-block">
                        <Button className="flex items-center gap-2 mr-2">
                            <FilePlus className="h-4 w-4" />
                            Registrar atención
                        </Button>
                    </Link>

                </div>

                <div className="m-3">
                    <DataTable
                        columns={columns}
                        data={items}
                        meta={meta}
                        filters={filters}
                        routeName={atenciones.index.url()}
                        searchPlaceholder="Buscar paciente o profesional..."
                    />
                </div>

            </div>
        </AppLayout>
    );
}
