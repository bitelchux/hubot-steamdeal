// Description:
//   Get the current steam daily deal. Short version without the description
//   and the long version with its full description.
//
// Dependencies:
//   "cheerio": "latest"
//   "got": "latest"
//   "sanitize-html": "latest"
//
// Commands:
//   hubot steamdeal me - Show the current steam daily deal.
//   hubot steamdeal full - Show the current steam daily deal with its full description.
//
// Author:
//   sebastianwachter

'use strict';

const cheerio = require('cheerio');
const got = require('got');
const sanitize = require('sanitize-html');

module.exports = (robot) => {
  robot.respond(/steamdeal (.*)/i, (msg) => {
    var args = msg.match[1];
    got('http://store.steampowered.com').then((res) => {
      var body = res.body;
      if (res.statusCode !== 200) return msg.send('Steam currently unavailable!');

      let $ = cheerio.load(body);
      let idAttr = $('.dailydeal_desc .dailydeal_countdown').attr('id');
      let id = idAttr.substr(idAttr.length - 6);
      let url = `http://store.steampowered.com/api/appdetails/?appids=${id}`;
      got(url, { json: true }).then((res) => {
        let game = res.body[id].data;
        let name = game.name;
        let price = game.price_overview;
        let final = price.final / 100;
        let initial = price.initial / 100;
        let discount = price.discount_percent;
        msg.send(game.header_image);
        msg.send(`Instead of ${initial}€ you get ${name} for ${final}€! That\'s -${discount}%!`);
        if (args === 'me') {
          msg.send(`https://store.steampowered.com/app/${id}`);
        } else if (args === 'full') {
          let description = game.detailed_description;
          let clean = sanitize(description, {
            allowedTags: [],
            allowedAttributes: {}
          });
          msg.send(`Description:\n${clean}`);
          msg.send(`https://http://store.steampowered.com/app/${id}`);
        }
      });
    });
  });
};
