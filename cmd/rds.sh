#!/bin/bash
source cmd/load-env.sh aws

RDS_CREDENTIALS_ARN=`aws ssm get-parameter \
--name ${CDK_STACK_NAME}-credentials-arn \
--profile ${AWS_PROFILE} \
| jq -r '.Parameter.Value'`
echo RDS_CREDENTIALS_ARN: $RDS_CREDENTIALS_ARN
RDS_CREDENTIALS=`aws secretsmanager get-secret-value \
--secret-id ${RDS_CREDENTIALS_ARN} \
--profile ${AWS_PROFILE} \
| jq -r '.SecretString'`
DB_HOST=`echo ${RDS_CREDENTIALS} | jq -r '.host'`
DB_PORT=`echo ${RDS_CREDENTIALS} | jq -r '.port'`
DB_USER=`echo ${RDS_CREDENTIALS} | jq -r '.username'`
DB_PW=`echo ${RDS_CREDENTIALS} | jq -r '.password'`
DB_NAME=`echo ${RDS_CREDENTIALS} | jq -r '.dbname'`
RDS_ENDPOINT=mysql://root:$DB_PW@$DB_HOST:$DB_PORT/$DB_NAME
echo RDS_ENDPOINT: $RDS_ENDPOINT
export DATABASE_URL=mysql://$DB_USER:$DB_PW@$DB_HOST:$DB_PORT/$DB_NAME

if [[ "$1" =~ ^deploy$ ]]; then
  npx prisma migrate deploy
else
  exit 1
fi

