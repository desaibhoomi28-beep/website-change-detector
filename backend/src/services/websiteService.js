const axios = require("axios");
const cheerio = require("cheerio");

const fetchWebsiteContent = async (url) => {
  const response = await axios.get(url, {
    timeout: 15000,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const $ = cheerio.load(response.data);

  // Remove elements that usually don't represent
  // meaningful page content.
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("svg").remove();
  $("iframe").remove();

  const text = $("body").text();

  const cleanText = text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    throw new Error(
      "No readable content found on this webpage."
    );
  }

  return cleanText;
};

module.exports = {
  fetchWebsiteContent,
};