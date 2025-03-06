import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { Procedure } from '../models/procedure';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const create = async (event: APIGatewayProxyEvent) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing body in request' }),
      };
    }
    const { PK, SK, createdAt, prices, title } =
      event.body as unknown as Procedure;

    if (!PK || !SK || !createdAt || !prices.length || !title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request body' }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify('Hello'),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error retrieving data',
        error: (error as Error).message,
      }),
    };
  }
};

export const handler = middy(create).use(httpJsonBodyParser());
