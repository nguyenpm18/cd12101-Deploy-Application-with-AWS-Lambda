import * as uuid from 'uuid';

import { TodosAccess } from '../dataLayer/todosAccess.mjs';
import { getUploadUrl, getAttachmentUrl } from '../fileStorage/attachmentUtils.mjs';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('businessLogic/todos.mjs');
const todosAccess = new TodosAccess();

export async function getAllTodos(userId) {
    logger.info(`Get all todos of User_Id ${userId}`, { function: 'getAllTodos()' });
    return todosAccess.getAllTodos(userId);
}

export async function createTodo(createTodoRequest, userId) {
    logger.info(`Create a new todo for User_ID ${userId}`, { function: 'createTodo()' });

    const todoId = uuid.v4();
    const createdAt = new Date().toISOString();

    return await todosAccess.createTodo({
        todoId: todoId,
        userId: userId,
        attachmentUrl: "",
        dueDate: createTodoRequest.dueDate,
        createdAt: createdAt,
        name: createTodoRequest.name,
        done: false
    });
}

export async function updateTodo(todoId, updateTodoRequest, userId) {
    logger.info(`Update todoId ${todoId} for userId ${userId}`, { function: 'updateTodo()' });

    return await todosAccess.updateTodo({
        todoId,
        userId,
        ...updateTodoRequest
    });
}

export async function deleteTodo(todoId, userId) {
    logger.info(`Delete todoId ${todoId} for userId ${userId}`, { function: 'deleteTodo()' });

    return await todosAccess.deleteTodo({
        todoId,
        userId
    });
}

export async function getTodoFileUploadUrl(todoId, userId) {
    logger.info(`Get uploadUrl for todoId ${todoId} for userId ${userId}`, { function: 'getTodoFileUploadUrl()' });

    const fileId = uuid.v4();
    const uploadUrl = await getUploadUrl(fileId);

    if (uploadUrl) {
        const attachmentUrl = getAttachmentUrl(fileId);
        await todosAccess.updateTodoAttachmentUrl({
            userId,
            todoId,
            attachmentUrl
        });

        logger.info(`attachmentUrl = ${attachmentUrl}`, { function: 'getTodoFileUploadUrl()' });
    }

    return uploadUrl;
}
