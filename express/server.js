'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

let response = {
  "status" : {
    "code" : "200",
    "msg" : "Hi there?"
  },
  "log" : {
    "user_id" : "1",
    "log_id" : "1"
  }
};

router.get('/discord', (req, res)=> {

  // Get the data
  const permalink = req.body.permalink ? req.body.permalink : req.query.permalink;
  const DR_JSON_EP = `https://dps.report/getJson?permalink=${permalink}`;
  const DISCORD_EP = `https://discordapp.com/api/webhooks/646892584454848544/4QqmHrt-krxAR0ehONPF8yuItj_jVadNjYMkywOdQxtQms_hCXKwfgEQjsBC56cLsQ5h`;

  axios.get(DR_JSON_EP).then(response => {
    let { recordedBy, timeStart, duration, players } = response.data;
    let squadCount = players.length;
    let groupCount = players.reduce(function(total, currentValue, currentIndex, arr){
      if ( !total[currentValue.group] ) {
        total[currentValue.group] = 1;
      } else {
        total[currentValue.group]++;
      }
      return total;
    }, {});

    let start = moment(timeStart, "YYYY-MM-DD HH:mm:ss Z");
    
    let embed = {
      "content" : "",
      "embeds" : [
        {
          "color" : 2451166,
          "title" : `New Log`,
          "author" : {
            "name" : recordedBy
          },
          "description" : "",
          "fields" : [
            {
              "name" : "URL",
              "value" : permalink
            },
            {
              "name" : "Started",
              "value" : start.format("ddd, h:mmA"),
              "inline" : true
            },
            {
              "name" : "Duration",
              "value" : duration,
              "inline" : true
            },
            {
              "name" : "Subgroups",
              "value" : Object.keys(groupCount).length,
              "inline" : true
            },
            {
              "name" : "Squad Count",
              "value" : squadCount,
              "inline" : true
            }
          ],
          "timestamp" : new Date(),
        }
      ]
    };
    
    axios.post( DISCORD_EP, embed )
      .then(response=>{
        console.log(response)
      })
      .catch(error=>{
        console.error(error);
      });
  });

  res.json(response);

});

router.get('/discord/pingtest', (req, res)=> {
  res.json(response);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
