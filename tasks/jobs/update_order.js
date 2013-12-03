console.log("...........START SEQUENCE...........");

var Shopnode = require('shopnode');

var shopnode = new Shopnode({
    storeHost:'stopify-2.myshopify.com',
    apiKey:'605075c920bf57435fa1f4d2214a0387',
    sharedSecret:'ce77b131edf91493e35a449190267dc5'
});

console.log(shopnode.products.getAll(function (e, re, rs, da) {
	console.log(e, re, rs, da);
}));

// shopnode.webhooks.getAll(function (err, req, res, obj) {
//     if (err) throw err

//     console.log('Server returned: %j', obj.body);
// });
