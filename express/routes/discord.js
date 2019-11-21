'use strict';
const express = require('express');
const axios = require('axios');
const moment = require('moment');

const router = express.Router();

let status = {
  "status": {
    "code": "200",
    "msg": "Message sent to Discord!"
  }
};

router.post('/', (req, res) => {

  // Get the data
  const permalink = req.body.permalink ? req.body.permalink : req.query.permalink;
  const DR_JSON_EP = `https://dps.report/getJson?permalink=${permalink}`;
  const DISCORD_EP = `https://discordapp.com/api/webhooks/646892584454848544/4QqmHrt-krxAR0ehONPF8yuItj_jVadNjYMkywOdQxtQms_hCXKwfgEQjsBC56cLsQ5h`;

  axios.post(DR_JSON_EP).then(response => {
    let {
      recordedBy,
      timeStart,
      duration,
      players
    } = response.data;
    let squadCount = players.length;
    let groupCount = players.reduce(function (total, currentValue, currentIndex, arr) {
      if (!total[currentValue.group]) {
        total[currentValue.group] = 1;
      } else {
        total[currentValue.group]++;
      }
      return total;
    }, {});

    let start = moment(timeStart, "YYYY-MM-DD HH:mm:ss Z");

    let embed = {
      "content": "",
      "embeds": [{
        "color": 2451166,
        "title": `New Log`,
        "author": {
          "name": recordedBy
        },
        "description": "",
        "fields": [{
            "name": "URL",
            "value": permalink
          },
          {
            "name": "Started",
            "value": start.format("ddd, h:mmA"),
            "inline": true
          },
          {
            "name": "Duration",
            "value": duration,
            "inline": true
          },
          {
            "name": "Subgroups",
            "value": Object.keys(groupCount).length,
            "inline": true
          },
          {
            "name": "Squad Count",
            "value": squadCount,
            "inline": true
          }
        ],
        "timestamp": new Date(),
      }]
    };

    axios.post(DISCORD_EP, embed)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.error(error);
      });
  });

  res.json(status);

});

router.get('/pingtest', (req, res) => {
  res.json(status);
});

module.exports = router;
