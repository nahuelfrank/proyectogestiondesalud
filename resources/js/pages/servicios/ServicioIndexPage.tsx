import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { columns } from './Columns';
import { DataTable } from '@/components/ui/data-table';
import servicios from '@/routes/servicios';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Servicios',
        href: servicios.index.url(),
    },
];

interface Servicio {
    id: number;
    nombre: string;
    estado: string;
}

interface ServicioIndexPageProps {
    items: Servicio[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: "asc" | "desc";
        perPage?: number;
    };
}


export default function ServicioIndexPage({ items, meta, filters }: ServicioIndexPageProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Atenciones" />
            <div className="container mx-auto py-10">

                <div className="ml-5">
                    <h1 className="text-3xl font-semibold mb-6">Lista de Servicios</h1>
                </div>

                <div className='m-3'>
                    <DataTable
                        columns={columns}
                        data={items}
                        meta={meta}
                        filters={filters}
                        routeName={servicios.index.url()}
                        searchPlaceholder="Buscar servicio..."
                    />
                </div>

            </div>
        </AppLayout>
    );
}
