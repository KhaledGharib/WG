const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function scrapeData(barcode) {
  try {
    const url = `https://barcode-list.com/barcode/EN/Search.htm?barcode=${barcode}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const items = [];

    $(".even").each(function () {
      const barcode = $(this).find("td:nth-child(2)").text();
      const description = $(this).find("td:nth-child(3)").text();
      const unit = $(this).find("td:nth-child(4)").text();
      const quantity = parseFloat($(this).find("td:nth-child(5)").text());

      items.push({ barcode, description, unit, quantity });
    });

    return items;
  } catch (error) {
    console.error("Error scraping data:", error);
    return [];
  }
}

app.post("/scrape", async (req, res) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode not provided" });
  }

  const scrapedData = await scrapeData(barcode);
  res.json(scrapedData);
  console.log(scrapedData);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
