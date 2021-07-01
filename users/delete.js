const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    })
  : new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let statusCode = 200;
  let body;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'DELETE',
    'Access-Control-Allow-Origin': '*',
  };
  const id = event.pathParameters.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify('Forbidden'),
      headers,
    };
  }

  const params = {
    TableName: 'users',
    Key: { id },
  };

  try {
    await dynamodb.delete(params).promise();
    statusCode = 200;
    body = JSON.stringify({ id });
  } catch (error) {
    statusCode = error.statusCode;
    body = JSON.stringify({ statusCode, error: error.message });
  }

  return {
    statusCode,
    body,
    headers,
  };
};
