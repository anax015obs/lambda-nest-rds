import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    if (process.env.NODE_ENV === "production") {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
      const command = new GetSecretValueCommand({
        SecretId: process.env.RDS_CREDENTIALS_ARN,
      });
      const { SecretString } = await client.send(command);
      if (!SecretString) {
        throw new Error("can not find RDS credentials secret");
      }
      const secret = JSON.parse(SecretString);
      process.env.DATABASE_URL = `mysql://${secret.username}:${secret.password}@${process.env.DB_HOST}:${secret.port}/${secret.dbname}`;
    }
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
