import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
import { MetricPublisher } from '../../utils/metrics'

const logger = createLogger('TodosAccess')
const metricPublisher = new MetricPublisher()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    metricPublisher.requestsCountMetricPublish('DeleteTodoRequest')
    logger.info(`event: ${JSON.stringify(event)}`)
    
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    
    const userId = getUserId(event)
    console.log('User id', userId)
    await deleteTodo(
      todoId,
      userId
    )

    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
