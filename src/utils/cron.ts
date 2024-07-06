import prisma from "./prisma";
import cron from "node-cron";

export const initCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.warn("registering cron job");
      const now = new Date();
      const sevenDaysAgo = 7 * 24 * 60 * 60 * 1000;

      const usersToDelete = await prisma.user.findMany({
        where: {
          active: false,
          createdAt: {
            lte: new Date(now.getTime() - sevenDaysAgo),
          },
        },
      });

      const userIds = usersToDelete.map((user) => user.id);
      await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
      console.warn(`Deleted ${userIds.length} inactive users.`);
    } catch (error) {
      console.error("Error deleting inactive users:", error);
    }
  });
};
