'use strict';
const express = require('express');
const axios = require('axios');
const embedFromDR = require('../discord/embeds').embedFromDR;
const baseResponse = require('../discord/embeds').baseResponse;

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

    let embed_response = baseResponse( "", embedFromDR( response, permalink ) ); 

    axios.post( DISCORD_EP, JSON.stringify(embed_response) )
      .then(response => {
        //console.log(response)
        res.json(status);
      })
      .catch(error => {
        //console.error(error);
        res.json(error);
      });
  });

  

});

router.get('/pingtest', (req, res) => {
  res.json(status);
});

module.exports = router;
