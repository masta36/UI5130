sap.ui.define([
    "com/pr36/app/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.pr36.app.controller.Start", {

        onInit: function() {
            var oViewModel,
                fnSetAppNotBusy,
                oListSelector = this.getOwnerComponent().oListSelector,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "startView");

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
                this.byId("idAppControl").hideMaster();
            }, this);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            var oModel = new sap.ui.model.json.JSONModel();
            // Load JSON in model
            oModel.loadData("model/tiles.json");
            this.getView().setModel(oModel);
        }

    });

});