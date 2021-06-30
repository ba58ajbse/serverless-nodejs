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
    'Access-Control-Allow-Methods': 'POST'
  };
  const event_body = JSON.parse(event.body)
  const id = Number(event_body.id);
  const email = event_body.email;
  if (!id || !email)
  {
    return {statusCode: 403, body: JSON.stringify("Forbidden"), headers}
  }
  const params = {
    TableName: 'users',
    Item: {
      id,
      email,
    },
  };

  try {
    await dynamodb.put(params).promise();
    statusCode = 200;
    body = JSON.stringify(params.Item);
  } catch (error) {
    statusCode = 400;
    body = JSON.stringify({ error: error });
  }

  return {
    statusCode,
    body,
    headers,
  }
}
