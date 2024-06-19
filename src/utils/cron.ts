import prisma from "./prisma";
import cron from "node-cron";

// Schedule tasks to be run on the server
cron.schedule("0 0 * * *", async () => {
  try {
    console.warn("registering cron job");
    const now = new Date();
    const usersToDelete = await prisma.user.findMany({
      where: {
        active: false,
        createdAt: {
          lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      },
    });

    if (usersToDelete.length > 0) {
      const userIds = usersToDelete.map((user) => user.id);
      await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
      console.warn(`Deleted ${userIds.length} inactive users.`);
    } else {
      console.warn("No inactive users to delete.");
    }
  } catch (error) {
    console.error("Error deleting inactive users:", error);
  }
});

export default cron;
