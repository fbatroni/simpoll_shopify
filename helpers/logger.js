//SWITCH LOGGING ON AND OFF AT FILE LEVEL


function logger () {
	this.STATE = true;
}

logger.prototype.on = function () {
	this.STATE = true;
};

logger.prototype.off = function () {
	this.STATE = false;
}

logger.prototype.getState = function () {
	return this.STATE;
}

logger.prototype.log = function (msg) {
	if (this.getState())
		console.log(msg);
}

module.exports.logger = new logger();
