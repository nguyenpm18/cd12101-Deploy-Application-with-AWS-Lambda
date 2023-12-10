import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { createTodo } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/createTodo.js');

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    try {
      const newTodoRequest = JSON.parse(event.body);
      logger.info(`Creating new TODO item`, { newTodoRequest });

      const userId = getUserId(event);
      const newTodoItem = await createTodo(newTodoRequest, userId);

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          item: newTodoItem
        })
      };
    } catch (error) {
      logger.error('Error creating new TODO item', { error: error.message });
      throw new Error('Error creating new TODO item');
    }
  });

export default handler;
