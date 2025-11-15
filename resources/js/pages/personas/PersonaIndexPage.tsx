import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { columns } from './Columns';
import { DataTable } from '@/components/ui/data-table';
import { Persona } from '@/types/personas/persona';
import { Button } from '@/components/ui/button';
import personas from '@/routes/personas';
import { UserRoundPlus } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: personas.index.url(),
    },
];

interface PersonaIndexPageProps {
    items: Persona[];
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

export default function PersonaIndexPage({ items, meta, filters }: PersonaIndexPageProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes" />
            <div className="container mx-auto py-10">

                <div className="ml-5">

                    <h1 className="text-3xl font-semibold mb-6">Lista de Pacientes</h1>

                    <Link href={personas.create.url()} className="inline-block">
                        <Button className="flex items-center gap-2 mr-2">
                            <UserRoundPlus className="h-4 w-4" />
                            Registrar paciente
                        </Button>
                    </Link>
                </div>


                <div className='m-3'>
                    <DataTable
                        columns={columns}
                        data={items}
                        meta={meta}
                        filters={filters}
                        routeName={personas.index.url()}
                        searchPlaceholder="Buscar por documento..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
