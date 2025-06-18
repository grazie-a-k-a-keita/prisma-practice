import type { FastifyInstance, FastifyRegisterOptions, RegisterOptions, FastifyPluginCallback } from 'fastify';
import { PrismaClient, Prisma } from '@/generated/prisma';

const prisma = new PrismaClient();

export const posts: FastifyPluginCallback = (
  fastify: FastifyInstance,
  opts: FastifyRegisterOptions<RegisterOptions>,
  done: (err?: Error | undefined) => void,
) => {
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  /**
   * 投稿を更新する
   * @route PUT /posts/:id
   */
  fastify.put<{
    Params: { id: string };
    Body: { title: string; content: string; published: boolean };
  }>('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, published } = req.body;

    const post = await prisma.post.update({
      data: {
        title,
        content,
        published,
      },
      where: {
        id: Number(id),
      },
    });

    res.send(post);
  });

  /**
   * 自身の指定の投稿を削除する
   * @route DELETE /posts/:id
   */
  fastify.delete<{ Params: { id: string } }>('/:id', async (req, res) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (post === null) return res.code(404).send({ error: 404, message: 'Post not found' });

    const { userId } = await req.jwtDecode<{ userId: number }>();

    if (userId !== post.authorId) return res.code(401).send({ error: 401, message: 'Unauthorized' });

    await prisma.post.delete({ where: { id: Number(id) } });
    res.send(post);
  });

  done();
};
