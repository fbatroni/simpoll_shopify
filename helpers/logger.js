//SWITCH LOGGING ON AND OFF AT FILE LEVEL

// TOGGLE THIS TO TURN LOGGING ON/OFF PROJECT WIDE
var GLOBAL_STATE = true;

function SwitchLog (_args) {
	this.STATE = true;
	this.GLOBAL_STATE = true;
	this.location = _args.location;
}

SwitchLog.prototype.on = function () {
	this.STATE = true;
};

SwitchLog.prototype.off = function () {
	this.STATE = false;
};

SwitchLog.prototype.getState = function () {
	return this.STATE;
};

SwitchLog.prototype.getGlobalState = function () {
	return this.GLOBAL_STATE;
};

SwitchLog.prototype.log = function () {
	var args = [].slice.call(arguments);
	args.unshift(this.location);

	if (this.getState() && GLOBAL_STATE)
		console.log.apply(null, args);
};

module.exports.logger = SwitchLog;
