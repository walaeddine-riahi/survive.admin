"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BIAFormPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers le nouveau formulaire intégré qui sauvegarde en base de données
    router.replace("/bia/processes/new");
  }, [router]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Redirection vers le nouveau formulaire BIA intégré...
        </p>
      </div>
    </div>
  );
}

