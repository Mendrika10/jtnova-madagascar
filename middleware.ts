import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOGIN_PATH = "/admin/login";

/**
 * Protège /admin/** : rafraîchit la session Supabase, redirige les visiteurs
 * anonymes vers /admin/login, et renvoie les utilisateurs déjà connectés hors
 * de la page de connexion. Si Supabase n'est pas configuré, laisse passer
 * (les pages admin gèrent alors leur propre cas).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Rafraîchit la session (obligatoire : ne rien faire entre createServerClient
  // et getUser, sinon les cookies de rafraîchissement peuvent être perdus).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;

  // Visiteur anonyme hors page de connexion → /admin/login.
  // Le rôle (`admin`) est vérifié dans le layout admin, pas ici (évite une
  // requête base par requête et toute boucle de redirection pour un
  // utilisateur connecté non-admin).
  if (!user && !isLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = LOGIN_PATH;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
