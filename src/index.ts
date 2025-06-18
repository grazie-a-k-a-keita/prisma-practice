import { PrismaClient } from '@/generated/prisma';
import jwt from '@fastify/jwt';
import Fastify from 'fastify';
import routes from './routes';

const prisma = new PrismaClient();

const fastify = Fastify({ logger: true });

fastify.register(jwt, { secret: 'supersecret', sign: { expiresIn: '10m' } });
fastify.register(routes.users, { prefix: 'users' });
fastify.register(routes.posts, { prefix: 'posts' });

fastify.post<{ Body: { email: string; name: string } }>('/signin', async (req, reply) => {
  const { email, name } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user === null) {
    reply.code(404).send({ error: '404' });
    return;
  }

  if (user.name === name) {
    const token = fastify.jwt.sign({ userId: user.id });
    reply.send({ token });
  } else {
    reply.code(401).send({ error: '401' });
  }
});

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
