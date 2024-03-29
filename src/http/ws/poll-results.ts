import { FastifyInstance } from 'fastify'
import { voting } from '../../utils/voting-pub-sub'
import { z } from 'zod'

export const pollResults = async (app: FastifyInstance) => {
  app.get(
    '/polls/:pollId/results',
    { websocket: true },
    (connection, request) => {
      const pollResultsParams = z.object({
        pollId: z.string().cuid(),
      })

      const { pollId } = pollResultsParams.parse(request.params)
      voting.subscribe(pollId, (message) => {
        connection.socket.send(JSON.stringify(message))
      })
    }
  )
}
