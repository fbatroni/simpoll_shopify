//SWITCH LOGGING ON AND OFF AT FILE LEVEL

// TOGGLE THIS TO TURN LOGGING ON/OFF PROJECT WIDE
var GLOBAL_STATE = true;

function SwitchLog () {
	this.STATE = true;
	this.GLOBAL_STATE = true;
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
}

SwitchLog.prototype.log = function () {
	if (this.getState() && GLOBAL_STATE)
		console.log.apply(null, arguments);
};

module.exports.logger = SwitchLog;
