import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

export const createPoll = async (app: FastifyInstance) => {
  app.post('/polls', async (request, reply) => {
    const createPollBody = z.object({
      title: z.string().min(4),
      options: z.array(z.string()),
    })

    const { title, options } = createPollBody.parse(request.body)

    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map((option) => ({
              title: option,
            })),
          },
        },
      },
      include: { options: true },
    })

    return reply.status(201).send(poll)
  })
}
