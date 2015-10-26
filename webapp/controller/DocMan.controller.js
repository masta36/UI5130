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

           var oModel = new sap.ui.model.json.JSONModel();
            // Load JSON in model
           /* oModel.loadData("model/docs.json");
            oModel.setProperty("templateShareable", true);
            this.getView().setModel(oModel);
            */
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
            this.trigger.addListener($.proxy(this.updateBar, this)); //WICHTIG: SCOPE FÜR FUNKTION AUF CONTROLLER SETZEN!!!!
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

        showProgress: function(docname, docsize){
            prog = new ProgressIndicator({
                percentValue: 0,
                displayValue: "0%",
                showValue: true
            });

            var dialog = new Dialog({
                title: 'Simulate Document Upload',
                id: 'prog',
                content: prog,
                beginButton: new Button({
                    text: 'Close',
                    press:
                        function () {
                            dialog.close();
                        }
                }),
                afterClose: function() {
                    dialog.destroy();
                }
            });

            //to get access to the global model
            this.getView().addDependent(dialog);
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
            tab.bindItems(path, oTemplate);
        }

    });

});

var trigger;
var al;
var prog;