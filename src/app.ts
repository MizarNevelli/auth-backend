import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { userRoutes } from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";

const app = Fastify({ logger: true });

const schema = {
  type: "object",
  required: [
    "DATABASE_URL",
    "MAIL_HOST",
    "MAIL_PASSWORD",
    "MAIL_USERNAME",
    "JWT_SECRET",
    "COOKIE_SECRET",
    "CLIENT_URL",
  ],
};

const options = {
  schema: schema,
  dotenv: true,
};

app.register(fastifyEnv, options).ready(async (err) => {
  if (err) {
    console.error(err);
    await app.close();
    process.exit(0);
  }
});

// graceful shutdown
const listeners = ["SIGINT", "SIGTERM"];

listeners.forEach((signal) => {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
});

// register routes
app.register(userRoutes, { prefix: "api/users" });

app.register(cors, {
  origin: "*",
});

app.listen({
  port: 8000,
  host: "0.0.0.0",
});

// test routing
app.get("/healthcheck", (req, res) => {
  res.send({ message: "Success" });
});

for (let schema of [...userSchemas]) {
  app.addSchema(schema);
}

// jwt
app.register(fjwt, { secret: process.env.JWT_SECRET as string });

app.addHook("preHandler", (req, res, next) => {
  req.jwt = app.jwt;
  return next();
});

// cookies
app.register(fCookie, {
  secret: process.env.COOKIE_SECRET as string,
  hook: "preHandler",
});

app.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.access_token;

    if (!token)
      return reply.status(403).send({ message: "Authentication required" });

    // here decoded will be a different type by default but we want it to be of user-payload type
    const decoded = req.jwt.verify<FastifyJWT["user"]>(token);
    req.user = decoded;
  }
);
