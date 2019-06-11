"use strict";

var AWS = require('aws-sdk');

// Get "Hello" Dynamo table name.  Replace DEFAULT_VALUE 
// with the actual table name from your stack.
const helloDBArn = process.env['HELLO_DB'] || 'DEFAULT_VALUE';  
const helloDBArnArr = helloDBArn.split('/');
const helloTableName = helloDBArnArr[helloDBArnArr.length - 1];

// handleHttpRequest is the entry point for Lambda requests
exports.handleHttpRequest = function(request, context, done) {
  try {
    const id = request.pathParameters && request.pathParameters.id;
    let response = {
      headers: {},
      body: '',
      statusCode: 200
    };

    switch (request.httpMethod) {
      case 'GET': {
        console.log('GET');
        let dynamo = new AWS.DynamoDB();
        var params = {
          TableName: helloTableName,
          //Key: { 'id' : { S: id } },
          //ProjectionExpression: 'email'
        };
        if (id != undefined && id != null) {
          params.Key = { 'id' : { S: id } };
          // Call DynamoDB to read the item from the table
          dynamo.getItem(params, function(err, data) {
            if (err) {
              console.log("Error", err);
              throw `Dynamo Get Error (${err})`
            } else {
              console.log("Success", data.Item);
              response.body = JSON.stringify(AWS.DynamoDB.Converter.unmarshall(data.Item));
              done(null, response);
            }
          });
        }else{
          dynamo.scan(params, function(err, data){
            if (err) {
              response.body = JSON.stringify(err);
              done(null, response);
              //console.log("Error", err);
              //throw `Dynamo Get Error (${err})`
            } else {
              console.log("Success", data);
              //response.body = "Got IT";
              //response.body = JSON.stringify(AWS.DynamoDB.Converter.unmarshall(data));
              let res = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));
              response.body = JSON.stringify(res);
              done(null, response);
            }            
          });
        }
        break;
      }
      case 'POST': {
        console.log('POST');
        let body = JSON.parse(request.body || '{}');
        let dynamo = new AWS.DynamoDB();
        let params = {
          TableName: helloTableName,
          Item: {
            'id': { S: id },
            'details': { 
              M: {
                "firstname": { S: body['details']['firstname'] },
                "lastname": { S: body['details']['lastname'] },
              }
            }
          }
        };
        dynamo.putItem(params, function(error, data) {
          if (error) throw `Dynamo Error (${error})`;
          else done(null, response);
        })
        break;
      }
    }
  } catch (e) {
    done(e, null);
  }
}