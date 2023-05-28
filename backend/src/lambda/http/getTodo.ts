import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodoForUserAndTodoId as getTodoForUserAndTodoId } from '../../businessLogic/todos'
import { getUserId } from '../utils';

import { createLogger } from '../../utils/logger'
import { MetricPublisher } from '../../utils/metrics'

const logger = createLogger('TodosAccess')
const metricPublisher = new MetricPublisher()

// TODO: Get TODO item for a current user and todo id
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    metricPublisher.requestsCountMetricPublish('GetTodoRequest')
    logger.info(`event: ${JSON.stringify(event)}`)

    // Write your code here
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todo = await getTodoForUserAndTodoId(todoId, userId)

    return {
      statusCode : 200,
      body: JSON.stringify({
        item: todo
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
