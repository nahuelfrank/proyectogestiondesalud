import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { columns } from './Columns';
import { DataTable } from '@/components/ui/data-table';
import { Atencion } from '@/types/atenciones/atencion';
import atenciones from '@/routes/atenciones';
import { useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atenciones Hechas',
        href: atenciones.index_atendidas().url
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
    flash: {
        success?: string;
        error?: string;
    };
}

export default function AtencionCompletedListPage({ items, meta, filters }: AtencionIndexPageProps) {

    useEffect(() => {
        const channel = window.Echo.channel('atenciones');

        channel.listen('.atencion.actualizada', (e: any) => {
            router.reload({
                only: ['items', 'meta'],
                onSuccess: () => {
                    toast.success("Atención Completada", {
                        description: `Se acaba de completar un nueva atención" 
                     `,
                    });
                }
            });
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
            <Head title="Atenciones Hechas" />
            <div className="container mx-auto py-10">

                <div className="ml-5">

                    <h1 className="text-3xl font-semibold mb-3">Atenciones Hechas</h1>
                </div>

                <div className='m-3'>
                    <DataTable
                        columns={columns}
                        data={items}
                        meta={meta}
                        filters={filters}
                        routeName={atenciones.index_atendidas().url}
                        searchPlaceholder="Buscar paciente o profesional..."
                    />
                </div>

            </div>
        </AppLayout>
    );
}
