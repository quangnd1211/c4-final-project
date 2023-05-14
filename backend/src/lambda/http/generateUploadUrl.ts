import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, updateTodoImgUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
import { MetricPublisher } from '../../utils/metrics'

const logger = createLogger('TodosAccess')
const metricPublisher = new MetricPublisher()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    metricPublisher.requestsCountMetricPublish('GenerateUploadUrlRequest')
    logger.info(`event: ${JSON.stringify(event)}`)

    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
   
    const url = await createAttachmentPresignedUrl(todoId, userId)    
    updateTodoImgUrl(
      todoId,
      userId
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
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
