import { JWT } from "@fastify/jwt";
import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

type UserPayload = {
  id: string;
  email: string;
  userName: string;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}

export type MyRequest = FastifyRequest<{
  Querystring: { token: string };
}>;

export interface DecodedJwt {
  user: string;
}
