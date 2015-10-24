/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.controller("sap.ui.demokit.explored.view.app",{onInit:function(){this._afterRenderingDone=false;this._component=sap.ui.core.Component.getOwnerComponentFor(this.getView());this._component.getEventBus().subscribe("app","applyAppConfiguration",this._applyAppConfiguration,this);},onAfterRendering:function(){if(this.hasOwnProperty("_compactOn")){jQuery('body').toggleClass("sapUiSizeCompact",this._compactOn).toggleClass("sapUiSizeCozy",!this._compactOn);}if(this.hasOwnProperty("_themeActive")&&!jQuery.sap.getUriParameters().get("sap-theme")){sap.ui.getCore().applyTheme(this._themeActive);}this._afterRenderingDone=true;},_applyAppConfiguration:function(c,e,d){if(this._afterRenderingDone){sap.ui.getCore().applyTheme(d.themeActive);jQuery('body').toggleClass("sapUiSizeCompact",d.compactOn).toggleClass("sapUiSizeCozy",!d.compactOn);}else{this._themeActive=d.themeActive;this._compactOn=d.compactOn;}}});
