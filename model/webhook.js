/*
* Module Dependencies
*/
var mongoose = require('mongoose'),
  Webhook = mongoose.model('Webhook');

function save(webhooks, callback) {
  webhooks = (webhooks instanceof Array) ? webhooks : [webhooks];
  Webhook.create(webhooks, function (err) {
    if (err) callback(err);
    else {
      var saved = Array.prototype.slice.call(arguments, 1);
      callback(null, saved[0]);
    }
  });
}

function byID(id, callback) {
  Webhook.findOne({
    _id: id
  })
  .exec(function (err, webhook) {
    if (err) callback(err);
    else callback(null, webhook);
  });
}

function byShopifyID(id, callback) {
  Webhook.findOne({
    shopifyID: id
  })
  .exec(function (err, webhook) {
    if (err) callback(err);
    else callback(null, webhook);
  });
}

exports.save = save;
exports.findByID = byID;
exports.findByShopifyID = byShopifyID;
