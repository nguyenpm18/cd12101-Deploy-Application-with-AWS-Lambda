import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { deleteTodo } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/deleteTodo.js');

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async event => {
    try {
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event);

      logger.info(`Deleting TODO item with todoId: ${todoId}`, { userId });

      await deleteTodo(todoId, userId);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'TODO item deleted successfully'
        })
      };
    } catch (error) {
      logger.error('Error deleting TODO item', { error: error.message, todoId });
      throw new Error('Error deleting TODO item');
    }
  });

export default handler;
