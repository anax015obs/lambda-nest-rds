#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import "source-map-support/register";
import { Stack } from "../lib/stack";

const bootstrap = () => {
  const app = new App();
  new Stack(app, process.env.CDK_STACK_NAME!, {
    stackName: process.env.CDK_STACK_NAME,
  });
};

bootstrap();
