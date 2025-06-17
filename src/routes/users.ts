import type {
  FastifyInstance,
  FastifyRegisterOptions,
  RegisterOptions,
  FastifyPluginCallback,
} from "fastify";
import { PrismaClient, Prisma } from "@/generated/prisma";

const prisma = new PrismaClient();

export const users: FastifyPluginCallback = (
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

  /**
   * ユーザー情報を全件取得する
   * @route GET /users
   */
  fastify.get("/", async (req, res) => {
    const users = await prisma.user.findMany();
    res.send(users);
  });

  /**
   * ユーザー情報をIDで取得する
   * @route GET /users/:id
   */
  fastify.get<{ Params: { id: string } }>("/:id", async (req, res) => {
    const { id } = req.params;
    const users = await prisma.user.findUnique({ where: { id: Number(id) } });
    res.send(users);
  });

  /**
   * ユーザーの投稿をIDで取得する
   * @route GET /users/:userId/posts
   */
  fastify.get<{ Params: { userId: string } }>(
    "/:userId/posts",
    async (req, res) => {
      const { userId } = req.params;
      const tasks = await prisma.post.findMany({
        where: { authorId: Number(userId) },
      });
      res.send(tasks);
    }
  );

  // fastify.post<{
  //   Body: {
  //     email: string;
  //     password: string;
  //     tasks: Prisma.PostCreateInput[];
  //   };
  // }>(`/`, async (req, res) => {
  //   const { email, password, tasks } = req.body;

  //   const taskData = tasks?.map((task: Prisma.TaskCreateInput) => {
  //     return { title: task?.title };
  //   });

  //   const result = await prisma.user.create({
  //     data: {
  //       email,
  //       password,
  //       tasks: {
  //         create: taskData,
  //       },
  //     },
  //   });
  //   res.send(result);
  // });

  // fastify.delete<{ Params: { id: string } }>("/:id", async (req, res) => {
  //   const { userId } = await req.jwtDecode();
  //   const { id } = req.params;

  //   if (userId !== id) {
  //     res.send({ err: 401 });
  //   }

  //   const users = await prisma.user.delete({
  //     where: {
  //       id,
  //     },
  //   });
  //   res.send(users);
  // });

  // fastify.post<{ Body: { title: string }; Params: { userId: string } }>(
  //   "/:userId/tasks",
  //   async (req, res) => {
  //     const { title } = req.body;
  //     const { userId } = req.params;
  //     const result = await prisma.task.create({
  //       data: {
  //         title,
  //         user: {
  //           connect: {
  //             id: userId,
  //           },
  //         },
  //       },
  //     });
  //     res.send(result);
  //   }
  // );

  done();
};
