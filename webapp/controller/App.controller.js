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

           // app.setMode(sap.m.SplitAppMode.PopoverMode);
        },

        onAfterRendering: function(){

        }

    });

});