import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'

import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'

const app = fastify()

app.register(fastifyCookie, {
  secret: 'b767a8a6-159c-4924-8d4b-9c556f5f75b1',
  hook: 'onRequest',
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app
  .listen({ port: 3333 })
  .then(() => console.log('Server is running at port http://localhost:3333'))
