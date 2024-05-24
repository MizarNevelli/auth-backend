import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import cors from "@fastify/cors";

const app = Fastify({ logger: true }); // you can disable logging

// graceful shutdown
const listeners = ["SIGINT", "SIGTERM"];

listeners.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
});

// routes
app.register(userRoutes, { prefix: "api/users" });

app.register(cors, {
  origin: "*",
});

async function main() {
  await app.listen({
    port: 8000,
    host: "0.0.0.0",
  });
}

main();

// test routing
app.get("/healthcheck", (req, res) => {
  res.send({ message: "Success" });
});

for (let schema of [...userSchemas]) {
  app.addSchema(schema);
}

// jwt
app.register(fjwt, { secret: "supersecretcode-CHANGE_THIS-USE_ENV_FILE" }); //TODO use env

app.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.access_token;

    if (!token)
      return reply.status(401).send({ message: "Authentication required" });

    // here decoded will be a different type by default but we want it to be of user-payload type
    const decoded = req.jwt.verify<FastifyJWT["user"]>(token);
    req.user = decoded;
  }
);

app.addHook("preHandler", (req, res, next) => {
  req.jwt = app.jwt;
  return next();
});

// cookies
app.register(fCookie, {
  secret: "some-secret-key",
  hook: "preHandler",
});
