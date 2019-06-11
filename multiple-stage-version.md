# ApiGateway multiple stage and multiple lambda version deployment


## Publish lambda version and deploy to dev or prod stage

```
aws lambda publish-version --function-name "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X" --description "First stable version"
{
    "FunctionName": "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X",
    "FunctionArn": "arn:aws:lambda:us-west-2:408817061368:function:dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X:2",
...
...
    "Version": "1",
...
}
```

Record the version number and create an alias
```
aws lambda create-alias --function-name "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X"  --name "v-prod" --function-version "1"
```
or if you update alias later, use this to point it to a new version
```
aws lambda update-alias --function-name "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X"  --name "v-prod" --function-version "2"
```
Run get-alias to check which version your alias points to
```
aws lambda get-alias --function-name "dynamodb-lambda-HelloLambda-A5A7Y7VDYG5X" --name "v-prod"
```

## ApiGateway multiple stage

The stack.yaml creates 2 stages in ApiGateway, one is `dev` and the other is `prod`  
You can set `prod` all the `integration` to point to the lambda function's cerntain versions or alias  
If you did the 'v-prod' alias above, just point all the `prod` stage API `integration` to use lambda-HelloLambda-xxxx:v-prod
then use `Deploy API` to deploy the new change to `prod` stage

There is no need to change `dev` stage as it will keep using the $LATEST version of the function.  
Once you use `update-function-code` to update the function, `dev` stage automatically gets the newest code and `prod` stage still use the "pinned" `v-prod` version so `prod` won't be impacted by your update

