import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// get todos function
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos for user function called')
    let todoItems = todosAccess.getAllTodos(userId)  

    return todoItems
}

// write create todo function 
export async function createTodo (
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    logger.info('Create todo function called')

    const todoId = uuid.v4()
    const createdAt =new Date().toISOString()
    // const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        // attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
    return await todosAccess.createTodoItem(newItem)
}

export async function updateTodo(
    todoId: string,
    userId: string,
    updateTodo: UpdateTodoRequest
): Promise<TodoUpdate> {
    logger.info('Update todo function called')

    let attachmentUrl = undefined;
    if (updateTodo.attachmentUrl !== undefined && updateTodo.attachmentUrl !== '') {
        attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    }
    await todosAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl)
     
    const todoUpdate = {
        name: updateTodo.name,
        dueDate : updateTodo.dueDate,
        done: updateTodo.done,
        ...updateTodo
    }
    return await todosAccess.updateTodoItem(todoId, userId, todoUpdate)
}

export async function deleteTodo(
    todoId: string,
    userId: string,
): Promise<void> {
    logger.info('Delete todo function called')
    await todosAccess.deleteTodoItem(todoId, userId)
}

export async function updateTodoImgUrl(
    todoId: string,
    userId: string
  ) {
    const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)

    return await todosAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl)
}

export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
): Promise<string> {
    logger.info('Create attachment function called user', todoId, userId)
    return await attachmentUtils.getUploadUrl(todoId)
}

// get todo function
export async function getTodoForUserAndTodoId(
    todoId: string,
    userId: string): Promise<TodoItem> {
    logger.info('Get todo for user and todo_id function called')
    let todoItem = todosAccess.getTodoItem(todoId, userId)  

    return todoItem
}