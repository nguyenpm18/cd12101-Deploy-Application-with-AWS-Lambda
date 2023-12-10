import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { updateTodo } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/updateTodo.js');

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async event => {
    try {
      const todoId = event.pathParameters.todoId;
      const updatedTodo = JSON.parse(event.body);
      const userId = getUserId(event);

      logger.info(`Updating TODO item with todoId: ${todoId}`, { userId, updatedTodo });

      await updateTodo(todoId, updatedTodo, userId);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'TODO item updated successfully'
        })
      };
    } catch (error) {
      logger.error('Error updating TODO item', { error: error.message, todoId });
      throw new Error('Error updating TODO item');
    }
  });

export default handler;
