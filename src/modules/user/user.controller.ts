import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput, LoginUserInput } from "./user.schema";
import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { sendMail } from "../../utils/mailServices";
import { registerMailTemplate } from "../../utils/mailTemplate";
import { DecodedJwt, MyRequest } from "../../utils/types";

const SALT_ROUNDS = 10;

export async function createUser(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const { password, email, userName } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    return reply.code(409).send({
      message: "User already exists with this email",
    });
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        password: hash,
        email,
        userName,
      },
    });

    const userToken = req.jwt.sign({
      user: user.id,
    });

    // TODO: catch if the email does not receive the message ??
    await sendMail(
      process.env.MAIL_USERNAME as string,
      email,
      "Register new account",
      registerMailTemplate(
        `${process.env.CLIENT_URL}/api/user/auth/?token=${userToken}`
      ),
      (error, info) => {
        if (error) {
          console.error("There was an error sending the email: ", error);
        } else {
          console.info("Email sent: ", info.response);
        }
      }
    );

    return reply.code(201).send(user);
  } catch (err) {
    return reply.code(500).send(err);
  }
}

export async function login(
  req: FastifyRequest<{
    Body: LoginUserInput;
  }>,
  reply: FastifyReply
) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email, active: true },
  });

  const isMatch = user && (await bcrypt.compare(password, user.password));

  if (!user || !isMatch) {
    return reply.code(401).send({
      message: "Invalid email or password",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
    userName: user.userName,
  };

  const token = req.jwt.sign(payload);

  reply.setCookie("access_token", token, {
    path: "/",
    httpOnly: true,
    secure: true,
  });

  return { ...payload, accessToken: token };
}

export async function getUsers(req: FastifyRequest, reply: FastifyReply) {
  const users = await prisma.user.findMany({
    select: {
      userName: true,
      id: true,
      email: true,
    },
  });
  return reply.code(200).send(users);
}

export async function checkToken(req: MyRequest, reply: FastifyReply) {
  try {
    const decodedToken = req.jwt.verify(req.query.token) as DecodedJwt;

    await prisma.user.update({
      where: {
        id: decodedToken.user,
      },
      data: {
        active: true,
      },
    });
    return reply.code(200).send({ message: "OK, the token is valid." });
  } catch (err) {
    return reply.code(401).send({
      message: "Invalid token.",
    });
  }
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("access_token");
  return reply.send({ message: "Logout successful" });
}
