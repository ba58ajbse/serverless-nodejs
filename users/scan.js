const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    })
  : new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = { TableName: 'users' };
  const headers = { 'Content-Type': 'application/json' };
  let statusCode;
  let body;

  try {
    const data = await dynamodb.scan(params).promise();
    statusCode = 200;
    body = JSON.stringify({ users: data['Items'] });
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
