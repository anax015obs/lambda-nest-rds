#!/bin/bash
case "$1" in
  "diff"|"deploy"|"synth"|"destroy")
    source cmd/load-env.sh aws
    source cmd/load-env.sh production
    source cmd/load-env.sh secrets
    npm run build
    cdk $1 --profile $AWS_PROFILE
    ;;
  *)
    echo "Validation Error: Argument must be one of diff | deploy | synth" | "destroy"
    exit 1
    ;;
esac

