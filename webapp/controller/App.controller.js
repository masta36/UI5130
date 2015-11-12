sap.ui.define([
    "com/pr36/app/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.pr36.app.controller.App", {

        onInit: function() {
            var oViewModel,
                fnSetAppNotBusy,
                oListSelector = this.getOwnerComponent().oListSelector,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            this.getOwnerComponent().oWhenMetadataIsLoaded.
                then(fnSetAppNotBusy, fnSetAppNotBusy);

            //PP: fix Busy indicator for JSON-molde / TODO: find a good way for JSON as well ;)
            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/delay", iOriginalBusyDelay);

            // Makes sure that master view is hidden in split app
            // after a new list entry has been selected.
            oListSelector.attachListSelectionChange(function() {
                this.byId("idSplitContainerControl").hideMaster();
            }, this);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());


            var app = this.byId("idSplitContainerControl");
            if(typeof app === "undefined") return;

            app.setMode(sap.m.SplitAppMode.StretchCompressMode);

            //use EventBus to be able to call methods from this controller from master-controller:
            var obus = sap.ui.getCore().getEventBus();
            obus.subscribe("Master", "setMode", this.setMode, this);
            obus.subscribe("Detail1", "getDev", this.getDev, this);
        },

        onAfterRendering: function(){

        },

        setMode: function(){
            var app = this.byId("idSplitContainerControl");
            var device = this.getModel("device").getData();
            var d = device["system"];
            d = d["desktop"];

            if(d || typeof app === "undefined") return;
            app.setMode(sap.m.SplitAppMode.HideMode);
            app.hideMaster();
        },

        getDev: function(){
            var device = this.getModel("device").getData();
            var d = device["system"];
            d = d["phone"];

            return d;
        },



    });

});