const express = require("express");

const {
  createPage,
  getAllPages,
  getPageById,
  getAllChanges,
  deletePage,
  manuallyCheckPage,
  getChangesToday,
} = require("../controllers/pageController");

const router = express.Router();


/* =========================================================
   CREATE
========================================================= */

router.post("/", createPage);


/* =========================================================
   STATS
========================================================= */

router.get(
  "/stats/changes-today",
  getChangesToday
);


/* =========================================================
   ALL CHANGES
========================================================= */

router.get(
  "/changes/all",
  getAllChanges
);


/* =========================================================
   LIST PAGES
========================================================= */

router.get("/", getAllPages);


/* =========================================================
   SINGLE PAGE
========================================================= */

router.get("/:id", getPageById);


/* =========================================================
   DELETE
========================================================= */

router.delete("/:id", deletePage);


/* =========================================================
   MANUAL CHECK
========================================================= */

router.post(
  "/:id/check",
  manuallyCheckPage
);

module.exports = router;