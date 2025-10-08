import { User as PrismaUser } from '@prisma/client';

declare module '@prisma/client' {
  interface User extends PrismaUser {
    phone?: string | null;
  }
}
