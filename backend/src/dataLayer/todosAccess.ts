import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

let AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess{
    constructor (
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME,
    ){}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get all todos function called.')

        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId' : userId
            },
            ScanIndexForward: false
        })
        .promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo item function called')

        const result = await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()

        logger.info('Todo item created', result)
        return todoItem as TodoItem
    }

    async updateTodoItem(
        todoId: string,
        userId: string,
        todoUpdate: TodoUpdate
    ): Promise<TodoUpdate> {
        logger.info('Update todo item function called')
        await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name' : todoUpdate.name,
                ':dueDate' : todoUpdate.dueDate,
                ':done' : todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name' : 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        })
        .promise()
        return todoUpdate as TodoUpdate
    }

    async deleteTodoItem(todoId: string, userId: string):Promise<void> {
        logger.info('Delete todo item function called')

        let params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }
        await this.docClient.delete(params).promise()

        logger.info(`Todo item deleted ${JSON.stringify(params)}`)
    }

    async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient
          .get({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
          })
          .promise()
    
        logger.info('Get TODO item: ', result.Item)
        return result.Item as TodoItem
    }

    async updateTodoAttachmentUrl(
        todoId: string,
        userId: string,
        attachmentUrl: string
    ): Promise<TodoItem> {
        logger.info('Udpdate todo attachment url function called')

        if (attachmentUrl !== undefined && attachmentUrl !== '') {
            await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl
                }
            })
            .promise()
        } else {
            await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: 'REMOVE attachmentUrl'
            })
            .promise()
        }
        
        logger.info('To-do Item updated!')
        return this.getTodoItem(todoId, userId)
    }    
}