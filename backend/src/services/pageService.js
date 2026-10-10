const prisma = require("../utils/prisma");

/* =========================================================
   CREATE PAGE
========================================================= */

const createPage = async (name, url) => {
  const existingPage = await prisma.page.findUnique({
    where: {
      url,
    },
  });

  if (existingPage) {
    throw new Error(
      "This URL is already being monitored."
    );
  }

  return await prisma.page.create({
    data: {
      name,
      url,
    },
  });
};


/* =========================================================
   GET ALL PAGES
========================================================= */

const getAllPages = async () => {
  return await prisma.page.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          changes: true,
          snapshots: true,
        },
      },
    },
  });
};


/* =========================================================
   GET PAGE
========================================================= */

const getPageById = async (id) => {
  return await prisma.page.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      snapshots: {
        orderBy: {
          createdAt: "desc",
        },
      },

      changes: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};


/* =========================================================
   GET ALL CHANGES
========================================================= */

const getAllChanges = async () => {
  return await prisma.change.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      page: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
    },
  });
};


/* =========================================================
   DELETE PAGE
========================================================= */

const deletePage = async (id) => {
  return await prisma.page.delete({
    where: {
      id: Number(id),
    },
  });
};


/* =========================================================
   CHANGES TODAY
========================================================= */

const getChangesToday = async () => {
  const startOfDay = new Date();

  startOfDay.setHours(0, 0, 0, 0);

  return await prisma.change.count({
    where: {
      createdAt: {
        gte: startOfDay,
      },
    },
  });
};


module.exports = {
  createPage,
  getAllPages,
  getPageById,
  getAllChanges,
  deletePage,
  getChangesToday,
};