const cron = require("node-cron");

const prisma = require("../utils/prisma");

const {
  checkPage,
} = require("../services/checkService");

const startCheckJob = () => {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "  CHANGEWATCH - SCHEDULED CHECK"
      );
      console.log(
        "======================================"
      );

      try {
        const pages =
          await prisma.page.findMany({
            orderBy: {
              id: "asc",
            },
          });

        if (pages.length === 0) {
          console.log(
            "No tracked websites found."
          );
          return;
        }

        console.log(
          `Checking ${pages.length} website(s)...`
        );

        for (const page of pages) {
          try {
            const result =
              await checkPage(page.id);

            if (result.firstCheck) {
              console.log(
                `📌 BASELINE: ${page.url}`
              );
            } else if (result.changed) {
              console.log(
                `🚨 CHANGE DETECTED: ${page.url}`
              );
            } else {
              console.log(
                `✓ NO CHANGE: ${page.url}`
              );
            }
          } catch (error) {
            console.error(
              `❌ ERROR: ${page.url}`
            );

            console.error(
              `   ${error.message}`
            );
          }
        }

        console.log(
          "Scheduled check completed."
        );
      } catch (error) {
        console.error(
          "Scheduled job failed:",
          error.message
        );
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log(
    "✓ Website checker scheduled every 5 minutes."
  );
};

module.exports = {
  startCheckJob,
};