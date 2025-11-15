import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Profesional } from '@/types/profesionales/profesional';
import { Button } from '@/components/ui/button';
import profesionales from '@/routes/profesionales';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profesionales',
        href: profesionales.index.url(),
    },
];

interface ProfesionalIndexPageProps {
    items: Profesional[];
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

export default function ProfesionalIndexPage({ items, meta, filters }: ProfesionalIndexPageProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profesional" />
            <div className="container mx-auto py-10">

                <Link href={profesionales.crear_profesional.url()} className="mx-2 inline-block">
                    <Button>Crear profesional</Button>
                </Link>

                <div className='m-2'>
                    <DataTable
                        columns={columns}
                        data={items}
                        meta={meta}
                        filters={filters}
                        routeName= {profesionales.index.url()}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
