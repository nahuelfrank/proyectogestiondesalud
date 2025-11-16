import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { columns } from './Columns';
import { DataTable } from '@/components/ui/data-table';
import { Atencion } from '@/types/atenciones/atencion';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import atenciones from '@/routes/atenciones';

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
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Atenciones" />
            <div className="container mx-auto py-10">

                <div className="ml-5">

                    <h1 className="text-3xl font-semibold mb-6">Lista de Atenciones</h1>

                    <Link href={atenciones.crear_atencion.url()} className="inline-block">
                        <Button className="flex items-center gap-2 mr-2">
                            <FilePlus className="h-4 w-4" />
                            Registrar atención
                        </Button>
                    </Link>
                </div>

                <div className='m-3'>
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
