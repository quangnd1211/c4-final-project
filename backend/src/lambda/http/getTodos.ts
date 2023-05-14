import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

import { createLogger } from '../../utils/logger'
import { MetricPublisher } from '../../utils/metrics'

const logger = createLogger('TodosAccess')
const metricPublisher = new MetricPublisher()

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    metricPublisher.requestsCountMetricPublish('GetTodoRequest')
    logger.info(`event: ${JSON.stringify(event)}`)

    // Write your code here
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId)

    return {
      statusCode : 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
