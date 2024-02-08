import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { redis } from '../../lib/redis'

export const getPoll = async (app: FastifyInstance) => {
  app.get('/polls/:pollId', async (request, reply) => {
    const getPollParams = z.object({
      pollId: z.string().cuid2(),
    })

    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    })

    if (!poll) {
      return reply.status(400).send({ message: 'Not found' })
    }

    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

    const votes = result.reduce((obj, value, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1]

        obj = {
          ...obj,
          [value]: Number(score),
        }
      }
      return obj
    }, {} as Record<string, number>)

    return reply.send({
      poll: {
        ...poll,
        options: poll.options.map((option) => ({
          ...option,
          score: option.id in votes ? votes[option.id] : 0,
        })),
      },
    })
  })
}
