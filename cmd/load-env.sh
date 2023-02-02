#!/bin/bash
case "$1" in
  "local"|"production"|"aws"|"secrets")
    FILE=./env/.env.$1
    if [ -f "$FILE" ]; then
      echo "found $FILE."
    else 
      echo "$FILE does not exists."
      exit 1
    fi
    export `grep -v '^#' ./env/.env.$1 | xargs`
    required_vars=( $(jq -r '.'$1'[]' ./env/required.json) )
    for var in "${required_vars[@]}"
    do
    if [ -z "${!var:-}" ]; then
        echo "Error: environment variable $var is not set"
        exit 1
    fi
    done
    echo "All environment variables are set"
    ;;
  *)
    echo "Validation Error: Argument must be one of local | production | aws | secrets"
    exit 1
    ;;
esac
