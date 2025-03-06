import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const command = new ScanCommand({
      TableName: 'Procedures',
      Limit: 100,
    });

    const response = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(response.Items),
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
