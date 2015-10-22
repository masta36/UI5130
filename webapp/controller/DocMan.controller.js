sap.ui.define([
    "com/pr36/app/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function(BaseController, JSONModel, Device) {
    "use strict";

    return BaseController.extend("com.pr36.app.controller.DocMan", {

        onInit: function() {
            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "docView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            this.getOwnerComponent().oWhenMetadataIsLoaded.
                then(fnSetAppNotBusy, fnSetAppNotBusy);

            //PP: fix Busy indicator for JSON-molde
            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/delay", iOriginalBusyDelay);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            this.getRouter().getRoute("doc").attachPatternMatched(this._onObjectMatched, this);
        },


        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function(oEvent) {

            var sObjectPath = "/Products/" + oEvent.getParameter("arguments").objectId;
            this._bindView(sObjectPath);
        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function(sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("docView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function() {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function() {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function() {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the master list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return;
            }
            var p = oElementBinding.getPath();

            var m = oView.getModel().getObject(p);

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                oViewModel = this.getModel("docView");

        },

        /**
         * Navigates back in the browser history, if the entry was created by this app.
         * If not, it navigates to the Fiori Launchpad home page
         * @override
         * @public
         */
        onNavBack: function(evt) {
            var bReplace = !Device.system.phone;
            var parts = evt.getSource().getBindingContext().toString().split("/");
            var id = parts[2];

            this.getRouter().navTo("object", {
                objectId: id //oItem.getBindingContext().getProperty("ProductID")
            }, bReplace);
        },

        doSelect: function(evt){
            var path = evt.getParameter("listItem").getBindingContext(); //has full path
            var tab = this.getView().byId("lineItemsList5");
            var bind = tab.getBindingInfo("items");

          // tab.bindItems({path: path, template: tab.getBindingInfo("items").template});

            var aColumnData = [{
                columnId: "Metadata"
            }, {
                columnId: "Value"
            }];


            var aData = [{
                Firstname: "Rajesh",
                Lastname: "Kumar"
            },
                {
                    Firstname: "Harish",
                    Lastname: "Kumar"
                }];
            var oModel = new sap.ui.model.json.JSONModel();

            oModel.setData({
                columns: aColumnData,
                rows: aData
            });

            var oTable = this.getView().byId("lineItemsList5");
            //oModel = this.getView().getModel();
            oTable.setModel(oModel);

           oTable.bindAggregation("columns", "/columns", function(index, context) {
                return new sap.m.Column({
                    header: new sap.m.Label({text: context.getObject().columnId}),
                });
            });


            oTable.bindItems("/rows", function(index, context) {
                var obj = context.getObject();
                var row = new sap.m.ColumnListItem();

                row.addCell(new sap.m.Text({text : "Document Name"}));
                row.addCell(new sap.m.Text({text : obj["DocName"]}));

                var row = new sap.m.ColumnListItem();
                row.addCell(new sap.m.Text({text : "Document Version"}));
                row.addCell(new sap.m.Text({text : obj["Version"]}));

                var row = new sap.m.ColumnListItem();
                row.addCell(new sap.m.Text({text : "Document Owner"}));
                row.addCell(new sap.m.Text({text : obj["Owner"]}));

                var row = new sap.m.ColumnListItem();
                row.addCell(new sap.m.Text({text : "Document Size"}));
                row.addCell(new sap.m.Text({text : obj["size"]}));

                return row;
            });

        }

    });

});