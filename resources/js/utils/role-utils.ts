//Utilidad para ir a alguna pagina en concreto segun el rol del sistema del usuario

export function getHomeRoute(roles: string[]) {
    if (roles.includes("super-admin")) return "/roles";
    if (roles.includes("administrativo")) return "/pacientes";
    if (roles.includes("profesional")) return "/historias-clinicas/lista-espera";
    return "/dashboard";
}
