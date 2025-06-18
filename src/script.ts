import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.user.findMany({ include: { posts: true } });
  console.dir(posts, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
