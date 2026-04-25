// // lib/db.ts
// import { PrismaClient } from '@prisma/client'

// const prismaClientSingleton = () => {
//   return new PrismaClient()
// }

// declare const globalThis: {
//   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
// } & typeof global;

// const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// export { prisma }

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  // 1. Create a standard connection pool using the 'pg' library
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  
  // 2. Create the Prisma adapter for PostgreSQL
  const adapter = new PrismaPg(pool)
  
  // 3. Pass the adapter to the PrismaClient constructor (Mandatory in v7+)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
