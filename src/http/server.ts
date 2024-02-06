import { Prisma, PrismaClient } from '@prisma/client'
import fastify from 'fastify'
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

app.post('/polls', async (request, reply) => {
  const createPollBody = z.object({
    title: z.string().min(4),
  })

  const { title } = createPollBody.parse(request.body)

  const poll = await prisma.poll.create({
    data: {
      title,
    },
  })

  return reply.status(201).send(poll)
})

app
  .listen({ port: 3333 })
  .then(() => console.log('Server is running at port http://localhost:3333'))