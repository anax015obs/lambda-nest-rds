import {
  aws_apigateway as apigw,
  aws_ec2 as ec2,
  aws_lambda as lambda,
  aws_rds as rds,
  aws_secretsmanager as sm,
  aws_ssm as ssm,
  Duration,
  RemovalPolicy,
  Stack as CdkStack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import required from "../env/required.json";

export class Stack extends CdkStack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, `${this.stackName}-vpc`, {
      vpcName: `${this.stackName}-vpc`,
      cidr: "14.0.0.0/16",
    });
    // We need this security group to allow our proxy to query our rds Instance
    let rdsSG = new ec2.SecurityGroup(this, `${this.stackName}-rds-sg`, {
      securityGroupName: `${this.stackName}-rds-sg`,
      vpc,
    });
    // We need this security group to add an ingress rule and allow our lambda to query the proxy
    let rdsProxySG = new ec2.SecurityGroup(this, `${this.stackName}-rds-proxy-sg`, {
      securityGroupName: `${this.stackName}-rds-proxy-sg`,
      vpc,
    });
    rdsSG.addIngressRule(rdsSG, ec2.Port.tcp(3306));
    rdsSG.addIngressRule(rdsProxySG, ec2.Port.tcp(3306));
    rdsSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306));
    // Dynamically generate the username and password, then store in secrets manager
    const rdsCredentials = new sm.Secret(this, `${this.stackName}-rds-credentials`, {
      secretName: `${this.stackName}-rds-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: `root`,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: "password",
      },
    });
    new ssm.StringParameter(this, `${this.stackName}-credentials-arn`, {
      parameterName: `${this.stackName}-credentials-arn`,
      stringValue: rdsCredentials.secretArn,
    });
    const rdsInstance = new rds.DatabaseInstance(this, `${this.stackName}-rds`, {
      instanceIdentifier: `${this.stackName}-rds`,
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_31,
      }),
      credentials: rds.Credentials.fromSecret(rdsCredentials),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      databaseName: `production`,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      removalPolicy: RemovalPolicy.RETAIN,
      publiclyAccessible: true,
      deletionProtection: true,
      securityGroups: [rdsSG],
    });
    const rdsProxy = rdsInstance.addProxy(`${this.stackName}-rds-proxy`, {
      dbProxyName: `${this.stackName}-rds-proxy`,
      secrets: [rdsCredentials],
      debugLogging: true,
      vpc,
      securityGroups: [rdsSG],
      requireTLS: false,
    });
    // Workaround for bug where TargetGroupName is not set but required
    let targetGroup = rdsProxy.node.children.find((child: any) => {
      return child instanceof rds.CfnDBProxyTargetGroup;
    }) as rds.CfnDBProxyTargetGroup;
    targetGroup.addPropertyOverride("TargetGroupName", `default`);
    const envSecrets = required.secrets.reduce((prev: { [k: string]: any }, cur: string) => {
      prev[cur] = process.env[cur];
      return prev;
    }, {});
    // Lambda to Interact with RDS Proxy
    const lambdaInstance = new lambda.Function(this, `${this.stackName}-lambda`, {
      functionName: `${this.stackName}-lambda`,
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("dist"),
      handler: "index.handler",
      vpc: vpc,
      securityGroups: [rdsProxySG],
      timeout: Duration.seconds(10),
      environment: {
        ...envSecrets,
        NODE_ENV: `production`,
        DB_HOST: rdsProxy.endpoint,
        RDS_CREDENTIALS_ARN: rdsCredentials.secretArn,
      },
    });
    rdsCredentials.grantRead(lambdaInstance);
    const apigwInstance = new apigw.LambdaRestApi(this, `${this.stackName}-apigw`, {
      restApiName: `${this.stackName}-apigw`,
      handler: lambdaInstance,
      deployOptions: {
        stageName: process.env.APIGW_STAGE,
        metricsEnabled: true,
        dataTraceEnabled: true,
        // cachingEnabled: true,
        // cacheTtl: Duration.hours(1),
        // cacheClusterEnabled: true,
        // cacheClusterSize: "0.5",
      },
    });
    lambdaInstance.addEnvironment(
      "SERVER_URL",
      `https://${apigwInstance.restApiId}.execute-api.${this.region}.amazonaws.com/${process.env.APIGW_STAGE}`
    );
  }
}
