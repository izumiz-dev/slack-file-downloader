const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { WebClient } = require('@slack/web-api');

// OAuth Tokens from .env file
const TOKEN = process.env.SLACK_TOKEN;
const CHANNEL = process.env.CHANNEL;
const web = new WebClient(TOKEN);

(async () => {

  try {
    const res = await web.files.list({
      channel: CHANNEL
    })

    const downloadFiles = res.files.map(file => {
      return {
        url: file.url_private_download,
        name: file.name
      }
    });

    Promise.all(downloadFiles.map(async (file, index) => {
      setTimeout(async () => {
        const res = await axios({
          method: 'get',
          url: file.url,
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          responseType: 'stream'
        });
        const savePath = path.resolve(__dirname, 'downloads', file.name)
        res.data.pipe(fs.createWriteStream(savePath))
      }, 1000 * index)
    }))
  } catch (error) {
    console.log(error);
  }

})();