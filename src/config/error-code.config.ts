import { registerAs } from "@nestjs/config";

export default registerAs("errorCode", () => ({
  ER_DUPLICATED: "ER_DUPLICATED",
}));
