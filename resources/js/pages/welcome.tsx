import { useAuthData } from '@/hooks/use-permissions';
import { dashboard, login, register } from '@/routes';
import personas from '@/routes/personas';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const { roles } = useAuthData();

    const getDashboardRoute = () => {
        if (roles.includes("super-admin")) {
            return "/roles";
        }

        if (roles.includes("profesional")) {
            return "/historias-clinicas/lista-espera";
        }

        if (roles.includes("administrativo")) {
            return "/pacientes";
        }

        return "/dashboard";
    };

    return (
        <>
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (

                            <Link
                                href={getDashboardRoute()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Panel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Iniciar Sesión
                                </Link>

                                {/*
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Registrarse
                                    </Link>
                                )}
                                */}
                            </>
                        )}
                    </nav>
                </header>
                {/* CONTENEDOR CENTRAL */}
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row lg:gap-0">

                        {/* COLUMNA TEXTO DEL SISTEMA */}
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-12 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-6 text-3xl font-semibold lg:text-4xl">
                                Sistema de Gestión de Salud Universitaria
                            </h1>

                            <p className="mb-4 text-base leading-relaxed text-[#1b1b18]/80 dark:text-[#EDEDEC]/80">
                                Bienvenido a la plataforma de la Dirección de Salud Universitaria.
                            </p>

                            <p className="text-sm leading-relaxed text-[#1b1b18]/70 dark:text-[#EDEDEC]/70">
                                Atención médica para toda la comunidad universitaria.
                            </p>
                        </div>

                        {/* COLUMNA IZQUIERDA (LOGO + TEXTOS) */}
                        <div className="flex flex-col justify-center items-center text-center bg-[#f5f5f5] dark:bg-[#1a1a1a] lg:w-1/2 p-8 rounded-tr-lg rounded-tl-lg lg:rounded-tl-none lg:rounded-br-lg">
                            <img
                                src="unsa_logo.png"
                                alt="Logo Unsa"
                                className="h-36 w-auto object-contain mb-6 lg:h-52"
                            />

                            <p className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                Universidad Nacional de Salta
                            </p>

                            <p className="text-sm text-[#1b1b18]/70 dark:text-[#EDEDEC]/70">
                                Dirección de Salud Universitaria
                            </p>
                        </div>

                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
