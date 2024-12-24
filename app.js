const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to fetch the download link
app.post("/api/fetch", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const response = await axios.post(
            "https://terabox-downloader-direct-download-link-generator.p.rapidapi.com/fetch",
            { url },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-host": "terabox-downloader-direct-download-link-generator.p.rapidapi.com",
                    "x-rapidapi-key": "45dba972cfmshf2b773f4098e154p186f8cjsnebb121b1c2e8",
                },
            }
        );

        const { data } = response;
        if (data.directDownloadLink) {
            res.json({ directDownloadLink: data.directDownloadLink });
        } else {
            res.status(500).json({ error: "Failed to fetch download link" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the link." });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
