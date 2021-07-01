const AWS = require('aws-sdk');
const dynamodb = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    })
  : new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let statusCode;
  let body;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'PUT',
    'Access-Control-Allow-Origin': '*',
  };

  const id = event.pathParameters.id;
  const event_body = JSON.parse(event.body);
  const email = event_body.email;
  const name = event_body.name;

  if (!id || !email || !name) {
    return {
      statusCode: 403,
      body: JSON.stringify('Forbidden'),
      headers,
    };
  }

  const dateTime = new Date();
  const updated_at = dateTime.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).replace(/\//g, '-');

  const params = {
    TableName: 'users',
    Key: { id },
    UpdateExpression: 'set #name = :n, #email = :e, #updated_at = :u',
    ExpressionAttributeNames: {
      '#name': 'name', // nameが予約語であるため（予約語がなければExpressionAttributeNameの項目不要）
      '#email': 'email',
      '#updated_at': 'updated_at',
    },
    ExpressionAttributeValues: {
      ':n': name,
      ':e': email,
      ':u': updated_at,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    await dynamodb.update(params).promise();
    statusCode = 200;
    body = JSON.stringify({ id, email, name, updated_at });
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
