import { PrismaClient } from "@/generated/prisma";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import routes from "./routes";
import type { IHeaders, IQuerystring, IReply } from "./types";

const prisma = new PrismaClient();

const fastify = Fastify({ logger: true });

fastify.register(jwt, { secret: "supersecret" });
fastify.register(routes.users, { prefix: "users" });
fastify.register(routes.posts, { prefix: "posts" });

fastify.post<{ Body: { email: string; name: string } }>(
  "/signin",
  async (req, reply) => {
    const { email, name } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user === null) {
      reply.send({ error: "404" });
      return;
    }

    if (user.name === name) {
      const token = fastify.jwt.sign({ userId: user.id });
      reply.send({ token });
    } else {
      reply.send({ error: "401" });
    }
  }
);

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
