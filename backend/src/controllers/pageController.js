const pageService = require("../services/pageService");

const {
  checkPage,
} = require("../services/checkService");


/* =========================================================
   CREATE PAGE
========================================================= */

const createPage = async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        message: "Name and URL are required",
      });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        message: "Please enter a valid URL",
      });
    }

    const page = await pageService.createPage(
      name.trim(),
      url.trim()
    );

    res.status(201).json({
      message: "Page added successfully",
      page,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message.includes(
        "already being monitored"
      )
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create page",
      error: error.message,
    });
  }
};


/* =========================================================
   GET ALL PAGES
========================================================= */

const getAllPages = async (req, res) => {
  try {
    const pages = await pageService.getAllPages();

    res.json(pages);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch pages",
      error: error.message,
    });
  }
};


/* =========================================================
   GET SINGLE PAGE
========================================================= */

const getPageById = async (req, res) => {
  try {
    const page = await pageService.getPageById(
      req.params.id
    );

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    res.json(page);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch page",
      error: error.message,
    });
  }
};


/* =========================================================
   GET ALL CHANGES
========================================================= */

const getAllChanges = async (req, res) => {
  try {
    const changes = await pageService.getAllChanges();

    res.json(changes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch changes",
      error: error.message,
    });
  }
};


/* =========================================================
   DELETE PAGE
========================================================= */

const deletePage = async (req, res) => {
  try {
    await pageService.deletePage(
      req.params.id
    );

    res.json({
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete page",
      error: error.message,
    });
  }
};


/* =========================================================
   MANUAL CHECK
========================================================= */

const manuallyCheckPage = async (req, res) => {
  try {
    const result = await checkPage(
      req.params.id
    );

    let message;

    if (result.firstCheck) {
      message = "Baseline snapshot created";
    } else if (result.changed) {
      message = "Change detected";
    } else {
      message = "No changes detected";
    }

    res.json({
      message,
      changed: result.changed,
      firstCheck: result.firstCheck,
      change: result.change,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to check page",
      error: error.message,
    });
  }
};


/* =========================================================
   CHANGES TODAY
========================================================= */

const getChangesToday = async (req, res) => {
  try {
    const count =
      await pageService.getChangesToday();

    res.json({
      changesToday: count,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch today's changes",
      error: error.message,
    });
  }
};


module.exports = {
  createPage,
  getAllPages,
  getPageById,
  getAllChanges,
  deletePage,
  manuallyCheckPage,
  getChangesToday,
};