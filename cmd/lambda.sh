#!/bin/bash
source cmd/load-env.sh aws
source cmd/load-env.sh production

REST_API_ID=`aws apigateway get-rest-apis \
--query 'items[?name==\`'${CDK_STACK_NAME}'-apigw\`].id' \
--profile ${AWS_PROFILE} \
--output text`
REGION=`aws configure get region --profile ${AWS_PROFILE}`
echo LAMBDA_ENDPOINT: https://$REST_API_ID.execute-api.$REGION.amazonaws.com/$APIGW_STAGE