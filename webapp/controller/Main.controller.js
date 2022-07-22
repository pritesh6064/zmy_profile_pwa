sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("pritesh.fiori.zmyprofilepwa.controller.Main", {
			onInit: function () {
				document.getElementById("splash-screen").remove();
			},
			onPress : function(){
				sap.m.MessageToast.show('Pressed');
			}
		});
	});
