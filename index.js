const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { WebClient } = require("@slack/web-api");

// OAuth Tokens from .env file
const TOKEN = process.env.SLACK_TOKEN;
const CHANNEL = process.env.CHANNEL;
const web = new WebClient(TOKEN);

(async () => {
  try {
    const res = await web.files.list({
      channel: CHANNEL,
      count: 1000,
    });

    const allFiles = res.files.length;

    const downloadFiles = res.files.map((file) => {
      return {
        url: file.url_private_download,
        name: file.name,
      };
    });

    Promise.all(
      downloadFiles.map(async (file, index) => {
        setTimeout(async () => {
          const res = await axios({
            method: "get",
            url: file.url,
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
            responseType: "stream",
          });
          const savePath = path.resolve(__dirname, "downloads", file.name);
          console.log(`Saving: [${index + 1}/${allFiles}]: ${file.name}`);
          index++;
          res.data.pipe(fs.createWriteStream(savePath));
        }, 200 * index);
      })
    );
  } catch (error) {
    console.log(error);
  }
})();
