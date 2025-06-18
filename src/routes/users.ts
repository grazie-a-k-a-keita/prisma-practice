import type { FastifyInstance, FastifyRegisterOptions, RegisterOptions, FastifyPluginCallback } from 'fastify';
import { PrismaClient, Prisma } from '@/generated/prisma';

const prisma = new PrismaClient();

export const users: FastifyPluginCallback = (
  fastify: FastifyInstance,
  opts: FastifyRegisterOptions<RegisterOptions>,
  done: (err?: Error | undefined) => void,
) => {
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send(err);
    }
  });

  /**
   * ユーザー情報を全件取得する
   * @route GET /users
   */
  fastify.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    res.send(users);
  });

  /**
   * ユーザー情報をIDで取得する
   * @route GET /users/:id
   */
  fastify.get<{ Params: { id: string } }>('/:id', async (req, res) => {
    const { id } = req.params;
    const users = await prisma.user.findUnique({ where: { id: Number(id) } });
    res.send(users);
  });

  /**
   * ユーザーの投稿をIDで取得する
   * @route GET /users/:userId/posts
   */
  fastify.get<{ Params: { userId: string } }>('/:userId/posts', async (req, res) => {
    const { userId } = req.params;
    const tasks = await prisma.post.findMany({
      where: { authorId: Number(userId) },
    });
    res.send(tasks);
  });

  /**
   * ユーザーを新規作成する
   * @route POST /users
   */
  fastify.post<{
    Body: {
      email: string;
      name: string;
    };
  }>('/', async (req, res) => {
    const { email, name } = req.body;

    const result = await prisma.user.create({
      data: {
        email,
        name,
        posts: undefined,
      },
    });
    res.send(result);
  });

  /**
   * ユーザーの投稿を新規作成する
   * @route POST /users/:userId/posts
   */
  fastify.post<{ Body: { title: string; content: string; published: boolean }; Params: { userId: string } }>(
    '/:userId/posts',
    async (req, res) => {
      const { userId } = req.params;
      const { title, content, published } = req.body;

      const result = await prisma.post.create({
        data: {
          title,
          content,
          published,
          authorId: Number(userId),
        },
      });
      res.send(result);
    },
  );

  /**
   * 自身のユーザー情報を削除する
   * @route DELETE /users/:id
   */
  fastify.delete<{ Params: { id: string } }>('/:id', async (req, res) => {
    const { userId } = await req.jwtDecode<{ userId: number }>();
    const { id } = req.params;

    if (userId !== Number(id)) return res.code(401).send({ error: 401 });

    await prisma.$transaction([
      prisma.post.deleteMany({ where: { authorId: Number(id) } }),
      prisma.user.delete({ where: { id: Number(id) } }),
    ]);

    res.send({ message: 'User deleted successfully' });
  });

  done();
};
