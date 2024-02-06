import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export const voteOnPoll = async (app: FastifyInstance) => {
  app.post('/polls/:pollId/vote', async (request, reply) => {
    const voteOnPollParams = z.object({
      pollId: z.string().cuid2(),
    })

    const voteOnPollBody = z.object({
      pollOptionId: z.string().cuid2(),
    })

    const { pollId } = voteOnPollParams.parse(request.params)
    const { pollOptionId } = voteOnPollBody.parse(request.body)

    let { sessionId } = request.cookies

    if (sessionId) {
      const userPreviousVoted = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            pollId,
            sessionId,
          },
        },
      })

      if (
        userPreviousVoted &&
        userPreviousVoted.pollOptionId !== pollOptionId
      ) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoted.id,
          },
        })
      } else if (userPreviousVoted) {
        return reply.status(400).send({ message: 'Você já fez seu voto' })
      }
    } else {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true,
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    })

    return reply.status(201).send()
  })
}
