import crypto from "crypto";

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET || "default_secret_for_signing_magic_tokens_123456789";
}

/**
 * Génère un jeton signé cryptographiquement contenant l'adresse e-mail.
 */
export function generateMagicToken(email: string): string {
  // Expiration à 30 jours pour garantir que l'accès reste valide pour l'exercice
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const payload = JSON.stringify({ email, expiresAt });
  
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  const signature = hmac.digest("hex");
  
  return Buffer.from(JSON.stringify({ payload, signature })).toString("base64url");
}

/**
 * Vérifie un jeton signé et retourne l'adresse e-mail si le jeton est valide et non expiré.
 */
export function verifyMagicToken(token: string): string | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    const { payload, signature } = decoded;
    
    const hmac = crypto.createHmac("sha256", getSecret());
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    
    if (signature !== expectedSignature) {
      console.error("Signature du Magic Token non valide.");
      return null;
    }
    
    const parsedPayload = JSON.parse(payload);
    if (Date.now() > parsedPayload.expiresAt) {
      console.error("Magic Token expiré.");
      return null;
    }
    
    return parsedPayload.email;
  } catch (error) {
    console.error("Erreur lors de la vérification du Magic Token:", error);
    return null;
  }
}
