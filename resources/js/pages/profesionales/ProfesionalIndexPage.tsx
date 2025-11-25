import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { Profesional } from '@/types/profesionales/profesional';
import { Button } from '@/components/ui/button';
import profesionales from '@/routes/profesionales';
import { UserCog } from 'lucide-react';
import { useEffect } from 'react';
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
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["items", "meta"],
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profesional" />
            <div className="container mx-auto py-10">

                <div className="ml-5">

                    <h1 className="text-3xl font-semibold mb-3">Lista de Profesionales</h1>
                    <p className="text-md text-muted-foreground mb-3">
                        El sistema muestra los profesionales registrados con información relevante.
                    </p>

                    <Link href={profesionales.crear_profesional.url()} className="inline-block">
                        <Button className="flex items-center gap-2 mr-2">
                            <UserCog className="h-4 w-4" />
                            Registrar profesional
                        </Button>
                    </Link>
                </div>

                <div className='m-2'>
                    <DataTable
                        columns={columns}
                        data={items}
                        meta={meta}
                        filters={filters}
                        routeName={profesionales.index.url()}
                        searchPlaceholder="Buscar por documento..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
