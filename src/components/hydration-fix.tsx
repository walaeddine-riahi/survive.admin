"use client";

import { useEffect } from "react";

export function HydrationFix() {
  useEffect(() => {
    // Supprimer les attributs ajoutés par les extensions de navigateur après l'hydratation
    const body = document.body;
    if (body) {
      // Attributs de Grammarly
      body.removeAttribute("data-new-gr-c-s-check-loaded");
      body.removeAttribute("data-gr-ext-installed");

      // Autres attributs d'extensions communes
      body.removeAttribute("data-new-gr-c-s-loaded");
      body.removeAttribute("cz-shortcut-listen");
      body.removeAttribute("data-lt-installed");
    }
  }, []);

  return null;
}
