import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function useUserSession() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Ne pas rediriger si on est déjà sur une page publique
      const publicPages = [
        "/connection",
        "/signup",
        "/password-reset",
        "/register",
        "/payments",
      ];
      if (!publicPages.includes(pathname)) {
        router.push("/connection");
      }
    } else if (status === "authenticated") {
      // Rediriger les utilisateurs connectés qui essaient d'accéder aux pages de connexion
      const authPages = [
        "/connection",
        "/signup",
        "/password-reset",
        "/register",
      ];
      if (authPages.includes(pathname)) {
        router.push("/");
      }

      // Vérifier les permissions admin
      if (pathname.startsWith("/admin") && session?.user?.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [status, router, pathname, session?.user?.role]);

  const isAdmin = session?.user?.role === "ADMIN";
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    session,
    status,
    user: session?.user,
    profile: session?.user?.profile,
    isAuthenticated,
    isLoading,
    isAdmin,
    role: session?.user?.role,
    // Fonctions utilitaires
    hasRole: (role: string) => session?.user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(session?.user?.role || ""),
  };
}
