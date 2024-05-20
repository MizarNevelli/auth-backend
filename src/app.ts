import Fastify from "fastify";
import { userRoutes } from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";

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

async function main() {
  await app.listen({
    port: 8000,
    host: "0.0.0.0",
  });
}
main();

app.get("/healthcheck", (req, res) => {
  res.send({ message: "Success" });
});

for (let schema of [...userSchemas]) {
  app.addSchema(schema);
}
