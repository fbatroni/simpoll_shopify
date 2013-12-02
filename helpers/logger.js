//SWITCH LOGGING ON AND OFF AT FILE LEVEL


function SwitchLog () {
	this.STATE = true;
}

SwitchLog.prototype.on = function () {
	this.STATE = true;
};

SwitchLog.prototype.off = function () {
	this.STATE = false;
}

SwitchLog.prototype.getState = function () {
	return this.STATE;
}

SwitchLog.prototype.log = function () {
	if (this.getState())
		console.log.apply(null, arguments);
}

module.exports.logger = SwitchLog;
