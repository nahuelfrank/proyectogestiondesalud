import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { columns } from './Columns';
import { DataTable } from '@/components/ui/data-table';
import { Atencion } from '@/types/atenciones/atencion';
import atenciones from '@/routes/atenciones';
import { useEffect } from 'react';

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

export default function AtencionCompletedListPage({ items, meta, filters, flash }: AtencionIndexPageProps) {

    useEffect(() => {

        if (flash?.success || flash?.error) return; // No recargar si hay mensaje

        const interval = setInterval(() => {
            router.reload({
                only: ["items", "meta"],
            });
        }, 2500);

        return () => clearInterval(interval);
    }, [flash]);

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
