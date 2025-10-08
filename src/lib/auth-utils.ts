import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}
