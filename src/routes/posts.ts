import type {
  FastifyInstance,
  FastifyRegisterOptions,
  RegisterOptions,
  FastifyPluginCallback,
} from "fastify";
import { PrismaClient, Prisma } from "@/generated/prisma";

const prisma = new PrismaClient();

export const posts: FastifyPluginCallback = (
  fastify: FastifyInstance,
  opts: FastifyRegisterOptions<RegisterOptions>,
  done: (err?: Error | undefined) => void
) => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // fastify.put<{
  //   Params: { id: string };
  //   Body: { title?: string; completed?: boolean };
  // }>("/:id", async (req, res) => {
  //   const { id } = req.params;
  //   const { title, completed } = req.body;
  //   const task = await prisma.task.update({
  //     data: {
  //       title,
  //       completed,
  //     },
  //     where: {
  //       id,
  //     },
  //   });
  //   res.send(task);
  // });

  // fastify.delete<{ Params: { id: string } }>("/:id", async (req, res) => {
  //   const { id } = req.params;
  //   const task = await prisma.task.findUnique({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (task === null) {
  //     res.send({ err: 404 });
  //     return;
  //   }

  //   const { userId } = await req.jwtDecode();

  //   if (userId !== task.userId) {
  //     res.send({ err: 401 });
  //     return;
  //   }

  //   await prisma.task.delete({
  //     where: {
  //       id,
  //     },
  //   });
  //   res.send(task);
  // });

  done();
};
