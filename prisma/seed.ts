import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import { TEST_USER_ID, TEST_USER_EMAIL, TEST_USER_NAME } from '../lib/constants';

// 1. Setup the connection pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// 2. Setup the Prisma adapter
const adapter = new PrismaPg(pool)

// 3. Pass the adapter to the constructor (Required in Prisma 7)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Delete existing data
  await prisma.application.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const user = await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      name: TEST_USER_NAME,
      profile: {
        create: {
          summary: '',
          skills: [],
          workHistory: [],
          education: [],
        }
      }
    },
    include: { profile: true }
  });

  console.log('Test user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// async function main() {
//   // Create a test user
//   const user = await prisma.user.upsert({
//     where: { email: 'test@example.com' },
//     update: {},
//     create: {
//       email: 'test@example.com',
//       name: 'Test User',
//       phone: '555-0123',
//       profile: {
//         create: {
//           summary: 'Full-stack developer with 3 years of experience',
//           skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
//           workHistory: [
//             {
//               company: 'Tech Corp',
//               title: 'Software Engineer',
//               startDate: '2021-06',
//               endDate: '2024-01',
//               description: 'Built web applications',
//               achievements: ['Improved performance by 40%', 'Led team of 3']
//             }
//           ],
//           education: [
//             {
//               school: 'State University',
//               degree: 'Bachelor of Science',
//               field: 'Computer Science',
//               startDate: '2017-09',
//               endDate: '2021-05',
//               gpa: '3.7'
//             }
//           ]
//         }
//       }
//     },
//   });

//   console.log('Seed data created:', user);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });