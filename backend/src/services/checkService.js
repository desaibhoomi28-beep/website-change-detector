const prisma = require("../utils/prisma");

const {
  fetchWebsiteContent,
} = require("./websiteService");

const {
  generateDiff,
  hasChanged,
} = require("./diffService");

const checkPage = async (pageId) => {
  const page = await prisma.page.findUnique({
    where: {
      id: Number(pageId),
    },
    include: {
      snapshots: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!page) {
    throw new Error("Page not found");
  }

  const currentContent =
    await fetchWebsiteContent(page.url);

  const previousSnapshot =
    page.snapshots[0];

  /*
   * FIRST CHECK
   *
   * First check creates a baseline.
   * It must NOT create a Change record.
   */

  if (!previousSnapshot) {
    const snapshot =
      await prisma.snapshot.create({
        data: {
          pageId: page.id,
          content: currentContent,
        },
      });

    await prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        lastCheckedAt: new Date(),
      },
    });

    return {
      changed: false,
      firstCheck: true,
      snapshot,
      change: null,
    };
  }

  /*
   * NORMAL CHECK
   */

  const changed = hasChanged(
    previousSnapshot.content,
    currentContent
  );

  let change = null;

  if (changed) {
    const diff = generateDiff(
      previousSnapshot.content,
      currentContent
    );

    change = await prisma.change.create({
      data: {
        pageId: page.id,
        previousContent:
          previousSnapshot.content,
        currentContent,
        diff,
      },
    });
  }

  /*
   * Always save the latest snapshot.
   */

  const snapshot =
    await prisma.snapshot.create({
      data: {
        pageId: page.id,
        content: currentContent,
      },
    });

  /*
   * Update last checked time.
   */

  await prisma.page.update({
    where: {
      id: page.id,
    },
    data: {
      lastCheckedAt: new Date(),
    },
  });

  return {
    changed,
    firstCheck: false,
    snapshot,
    change,
  };
};

module.exports = {
  checkPage,
};