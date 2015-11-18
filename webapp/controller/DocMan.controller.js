sap.ui.define([
    "com/pr36/app/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/m/MessageToast",
    "sap/m/ProgressIndicator",
    "sap/ui/core/IntervalTrigger",
    "sap/m/Dialog",
    "sap/m/Button"
], function(BaseController, JSONModel, Device, MessageToast, ProgressIndicator, IntervalTrigger, Dialog, Button) {
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

            //Model for classification:
           var oModel = new sap.ui.model.json.JSONModel({
               editable: true
           });

            this.setModel(oModel, "classView");

            //no footer on phone:
            var d = Device.system.phone;
            if(d){
                this.byId("page").setShowFooter(false);
            }

            var obus = sap.ui.getCore().getEventBus();
            obus.subscribe("Dia", "clearInt", this.clearInt, this);
        },

        onBeforeUploadStarts: function(evt){
            var fName = evt.getParameter("fileName");
            //create new document in Model:
            var model = this.getView().getModel();
            var path = this.getView().getBindingContext().getPath();
            var parts = path.split("/");
            var data = model.getData();
            var prod = data[parts[1]][parts[2]];
            var docs = prod['Product_Docs'];
            var new_doc = new Array();
            new_doc['DocName'] = fName;
            new_doc['Version'] = '1.0';
            new_doc['Owner'] = 'User1';
            new_doc['size'] = 999;
            docs.push(new_doc);
            model.setData(data);

            var x = 2;

        },

        onStartUpload : function(oEvent) {
            var oUploadCollection = this.getView().byId("upload");
            var cFiles = oUploadCollection.getItems().length;
            var uploadInfo = "";

            oUploadCollection.upload();

            uploadInfo = cFiles + " file(s)";

            if (cFiles > 0) {
            this.showProgress("DocName", "hh");

            this.al = 0;
            if (this.trigger != null && typeof this.trigger != 'undefined') this.trigger.destroy();
            this.trigger = new IntervalTrigger();
            this.trigger.addListener($.proxy(this.updateBar, this)); //WICHTIG: SCOPE F�R FUNKTION AUF CONTROLLER SETZEN!!!!
            this.trigger.setInterval(50);
            }else {
                    MessageToast.show("No documents selected");
                }

            /*var oPage = this.getView().byId("container");
            // destroy old UploadCollection instance and create a new one

            var upl = oUploadCollection.clone();

            var sid = oUploadCollection.sId;
            oPage.removeContent(oUploadCollection);
            upl.sId = sid;
            oUploadCollection.destroy();

            oPage.insertContent(upl, 3);
            */
        },

        clearInt: function(){
            this.trigger.setInterval(-1);
        },

        showProgress: function(docname, docsize){

            if(this.byId("prog1") || this.byId("prog1") != null || typeof this.byId("prog1") != "undefined") {
                var p = this.byId("prog1");
                //$.(p).remove();
                //prog.destroy();
            }

            prog = new ProgressIndicator({
                percentValue: 0,
                displayValue: "0%",
                showValue: true
            });

            if(dialog != null || typeof dialog != "undefined") {
                dialog.destroy();
            }

            var dialog = new Dialog({
                title: 'Simulate Document Upload',
                id: 'prog1',
                content: prog,
                beginButton: new Button({
                    text: 'Close',
                    press:
                        function () {
                            //eventbus:
                            var obus = sap.ui.getCore().getEventBus();
                            obus.publish("Dia", "clearInt", {});
                            dialog.close();
                            dialog.destroy();
                        }
                }),
                afterClose: function() {
                    dialog.destroy();
                }
            });

            //to get access to the global model
           // this.getView().addDependent(dialog);
            dialog.open();
        },

        /**
         * Event handler to update progress bar
         * @public
         */
        updateBar: function() {
            prog.setPercentValue( parseInt(this.al) );
            this.al+= 1;
            prog.setDisplayValue( "uploading: "+this.al+"%" );
            if(this.al >= 100){
                this.al = 0;
                this.trigger.setInterval(-1);
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

            //clear selections if present:
            this.byId("lineItemsList2").removeSelections();

            //bind meta-table to empty at start:
            var tab = this.getView().byId("lineItemsList5");
            var oTemplate = new sap.m.ColumnListItem({
                cells : [
                    new sap.m.Text({
                        text : "{char}",
                        wrapping : false
                    }),
                    new sap.m.Text({
                        text : "{value}",
                        wrapping : false
                    })
                ]
            });

            var path = "/";
            tab.bindAggregation("items", path, oTemplate);


            //bind classif table to empty at start:
            oTemplate = new sap.m.ColumnListItem({
                cells : [
                    new sap.m.Text({
                        text : "",
                        wrapping : false
                    })
                ]
            });
            path = "/";
            tab = this.byId(sap.ui.core.Fragment.createId("class_fragment", "lineItemsList3"));
            tab.bindAggregation("items", path, oTemplate);
            tab = this.byId(sap.ui.core.Fragment.createId("class_fragment", "lineItemsList4"));
            tab.bindAggregation("items", path, oTemplate);
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


                sap.ui.getCore().byId(this.inputID).setValue(value);

            }
            oEvent.getSource().getBinding("items").filter([]);
            if(this._oDialog){
                this._oDialog.unbindItems();
                this._oDialog.destroy();
            }
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

            var tab = this.getView().byId("lineItemsList5");
            var oTemplate = new sap.m.ColumnListItem({
                cells : [
                    new sap.m.Text({
                        text : "xxx",
                        wrapping : false
                    }),
                    new sap.m.Text({
                        text : "yyy",
                        wrapping : false
                    }),
                    ,
                    new sap.m.Text({
                        text : "yyy",
                        wrapping : false
                    }),
                    ,
                    new sap.m.Text({
                        text : "yyy",
                        wrapping : false
                    })
                ]
            });

           // var path = sPath + "/meta"; alert(path);
           // tab.bindItems(path, oTemplate);


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
            obus.publish("DocMan", "showMasterdata", {});

            this.getRouter().navTo("object", {
                objectId: id //oItem.getBindingContext().getProperty("ProductID")
            }, bReplace);
        },

        doSelect: function(evt){
            var path = evt.getParameter("listItem").getBindingContext(); //has full path
            var tab = this.getView().byId("lineItemsList5");
            var bind = tab.getBindingInfo("items");

            var oTemplate = new sap.m.ColumnListItem({
                cells : [
                    new sap.m.Text({
                        text : "{char}",
                        wrapping : false
                    }),
                    new sap.m.Text({
                        text : "{value}",
                        wrapping : false
                    })
                ]
            });

            path = path + "/meta";
            tab.bindAggregation("items", path, oTemplate);

            //classif table:
            var frag = sap.ui.xmlfragment("com.pr36.app.view.ClassManRow", this);
            oTemplate = frag;

            tab = this.byId(sap.ui.core.Fragment.createId("class_fragment", "lineItemsList3"));
            path = evt.getParameter("listItem").getBindingContext()  + "/Doc_Class/Basic";
            tab.bindAggregation("items", path, oTemplate);
            path = evt.getParameter("listItem").getBindingContext()  + "/Doc_Class/Publication";
            tab = this.byId(sap.ui.core.Fragment.createId("class_fragment", "lineItemsList4"));
            tab.bindAggregation("items", path, oTemplate);
        }

    });

});

var trigger;
var al;
var prog;
var inputID;