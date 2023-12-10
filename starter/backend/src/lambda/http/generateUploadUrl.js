import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { getTodoFileUploadUrl } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../utils.mjs';

const logger = createLogger('http/generateUploadUrl');

const inputSchema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        todoId: { type: 'string', pattern: '^[a-zA-Z0-9-]+$' } // Adjust the regex pattern based on your todoId format
      },
      required: ['todoId']
    }
  }
};

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .use(validator({ inputSchema }))
  .handler(async event => {
    try {
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event);

      const uploadUrl = await getTodoFileUploadUrl(todoId, userId);
      logger.info(`Generated upload URL for todoId: ${todoId}`, { userId });

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ uploadUrl })
      };
    } catch (error) {
      logger.error(`Error generating upload URL: ${error.message}`, { todoId, userId });
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
  });

export default handler;
