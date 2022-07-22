/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"priteshfiori./zmy_profile_pwa/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
