# cloudformation aws lambda

This repo is cloned from 
https://github.com/markhopson/cloudformation-serverless-api.git

I have customized it to fit my need, refer to the [Changes](#Changes) section for detais

## cloudformation-serverless-api

This Github repo contains the material needed for this tutorial:

https://www.freecodecamp.org/news/quickly-create-a-serverless-restful-api-with-nodejs-and-aws-lambda-api-gateway-and-a6be891cc16a/

A simple, RESTful API using AWS Serverless (Cloudformation, API Gateway, Lambda, and DynamoDB).

## Overview

This project creates (and deploys) a Restful API with API Gateway, Lambda (Node), and Dynamo using Cloudformation.

Use this project as a guide to learn about the AWS command line tool, and the stack creation and code deploy process for a serverless architecture on AWS.

## What's in this project

* hello.js
  * Javascript for your Lambda to run
* stack.yml
  * Definitions for your AWS resources (including Roles and Permissions, and Swagger)
  * This is a big file, but don't let it intimidate you

## Changes

* Modified Cosmodb table structure and Swagger API definitions
* Add LambdaFunctionLogGroup to have CloudWarch retention to 30 days
* Commented out the managed policies BaseLambdaExecutionPolicy
* Combine and add dynamodb related permissions, note: the scan/query requires a separated rule to work on the index too
```yml
    - Effect: Allow
    Action:
        - dynamodb:Query
        - dynamodb:Scan
    Resource: !Sub "arn:aws:dynamodb:${AWS::Region}:*:table/${HelloTable}/index/*"
```

* Add new API to handle the /users/id without parameter. 

> Note: httpMethod has to be POST, even that is a GET API otherwise get Authentication error
```yml
    /users/id:
    get:
        description: "Get all users"
        x-amazon-apigateway-integration:
        uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${HelloLambda.Arn}/invocations"
        credentials: !GetAtt MyApiGatewayRole.Arn
        passthroughBehavior: when_no_match
        httpMethod: POST
        type: aws_proxy
        operationId: getUsers
```

* Modify index.js javascript to handle new table structure
> NOTE:   
> Use `AWS.DynamoDB.Converter.unmarshall` and `marshall` to convert between Dynamodb document structure and JSON  
> Use `scan` to query the `select * from` kind of things.
> For single result, use data.Item.  For multiple result, the use data.Items  
> Then get the JSON result by `let res = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));`

## Test procedure

Goes to API Gateway and try /users/id, it should give {} empty result  
Use `/user/id/1` and POST test data like
```js
{
    "details": {
        "firstname": "Onica",
        "lastname": "test"
    }
}
```
Then test `/usr/id/1`, you should see record comes back  
test `/usr/id` will show a JSON result which is the list of all the records

## Commandline CLI process

List Statcks
```
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

Create Stacks
```
aws cloudformation create-stack --stack-name dynamodb-lambda --template-body file://./stack.yaml --capabilities CAPABILITY_IAM
```

List resources
```
aws cloudformation list-stack-resources --stack-name dynamodb-lambda
```

(optional) Get the template if you made change manually
```
aws cloudformation get-template --stack-name dynamodb-lambda
```

(optional) Update stack if you have changed stack.yml
```
aws cloudformation update-stack --stack-name dynamodb-lambda --template-body file://stack.yaml --capabilities CAPABILITY_IAM
```

List lambda function
```
$ aws lambda list-functions --max-items 10
{
    "Functions": [
        {
            "FunctionName": "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X",
            ...
```

Update function code
```
zip function.zip ./index.js

aws lambda update-function-code --function-name "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X" --zip-file fileb://function.zip
```


Test

1. You can test using API Gateway showed above
2. Then API Gateway to find out the URL for the lambda for given stage, it's in the "Stage" sidebar menu<br>
Our example is :  Invoke URL: https://m94n9z5sob.execute-api.us-west-2.amazonaws.com/prod


Refer to [multiple stage management](./multiple-stage-version.md) to manage `dev` and `prod` stage in ApiGateway