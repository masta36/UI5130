sap.ui.define([
    "com/pr36/app/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    'sap/ui/model/Filter',
    'sap/m/MessageToast',
    "sap/ui/model/Sorter"
], function(BaseController, JSONModel, Device, Filter, MessageToast, Sorter) {
    "use strict";

    return BaseController.extend("com.pr36.app.controller.ClassMan", {

        onInit: function() {
            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "classView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            this.getOwnerComponent().oWhenMetadataIsLoaded.
                then(fnSetAppNotBusy, fnSetAppNotBusy);

            //PP: fix Busy indicator for JSON-molde
            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/delay", iOriginalBusyDelay);

            oViewModel.setProperty("/editable", true); // for classification fragment

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            this.getRouter().getRoute("class").attachPatternMatched(this._onObjectMatched, this);

            //no footer on phone:
            var d = Device.system.phone;
            if(d){
                this.byId("page").setShowFooter(false);
            }

        },

        onAfterRendering: function(){

        },

        getF4: function(evt){
          this.handleTableSelectDialogPress(evt);
        },

        handleTableSelectDialogPress: function(oEvent) {

            //which value help is needed (which model to load)
            var m = oEvent.getSource().data("value_model");
            var combo_model  = "model/value_help_" + m + ".json";

            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }
                this._oDialog = sap.ui.xmlfragment("com.pr36.app.view.Dialog", this);
                var value_model = new sap.ui.model.json.JSONModel();
                // Load JSON in model
                value_model.loadData(combo_model);
                this._oDialog.setModel(value_model);




            // Multi-select if required
            var bMultiSelect = oEvent.getSource().data("multi");
            this._oDialog.setMultiSelect(bMultiSelect);

            // Remember selections if required
            var s = oEvent.getSource();
            this.inputID = oEvent.getSource().getId();
            var val = oEvent.getSource().getValue();
            var bRemember = !!oEvent.getSource().data("remember");
            this._oDialog.setRememberSelections(bRemember);

           // this.getView().addDependent(this._oDialog);

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
            this._oDialog.open();
        },

        handleSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("name", sap.ui.model.FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        handleClose: function(oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts.length) {

                var value = aContexts.map(function (oContext) {
                    return oContext.getObject().name + " (" + oContext.getObject().ID + ")";
                });


                this.getView().byId(this.inputID).setValue(value);

            }
            oEvent.getSource().getBinding("items").filter([]);
            if(this._oDialog){
                this._oDialog.unbindItems();
                this._oDialog.destroy();
            }
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
            var oViewModel = this.getModel("classView");

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
                oViewModel = this.getModel("classView");

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

            var obus = sap.ui.getCore().getEventBus();
            obus.publish("ClassMan", "showMasterdata", {});

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

var inputID;