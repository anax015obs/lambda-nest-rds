#!/bin/bash
source cmd/load-env.sh aws
source cmd/load-env.sh local
source cmd/load-env.sh secrets

export DATABASE_URL=mysql://root:$DB_PW@localhost:$DB_PORT/local
echo DATABASE_URL: $DATABASE_URL
if [[ "$1" =~ ^deploy$ ]]; then
  npx prisma migrate dev
elif [[ "$1" =~ ^start$ ]]; then
  if [[ $(docker ps -q -f name=$CDK_STACK_NAME-mysql) || $(docker ps -q -f name=$CDK_STACK_NAME-redis) ]]; then
    echo "all containers are running"
    nest start -w --entryFile index.local  
  else
    docker-compose up -d
    nest start -w --entryFile index.local  
  fi
else 
  exit 1
fi

