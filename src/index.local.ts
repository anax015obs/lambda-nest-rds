import { getApp } from "./app";

async function bootstrap() {
  const app = await getApp();
  await app.listen(process.env.SERVER_PORT || 3000);
}

bootstrap();
