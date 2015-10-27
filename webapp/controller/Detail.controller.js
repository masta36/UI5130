/*global location */
sap.ui.define([
	"com/pr36/app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/pr36/app/model/formatter",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/ProgressIndicator",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/core/IntervalTrigger",
	"sap/ui/core/Icon"
], function(BaseController, JSONModel, formatter, MessageToast, Dialog, ProgressIndicator, Button, Device, IntervalTrigger, Icon) {
	"use strict";

	return BaseController.extend("com.pr36.app.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading"),
				documentItemTitle: this.getResourceBundle().getText("detailLineItemTableHeadingDocuments")
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().oWhenMetadataIsLoaded.then(this._onMetadataLoaded.bind(this));

			//Model for Classification Fragment --> not editable
			var classModel = new JSONModel({
				editable: false
			});

			this.setModel(classModel, "classView");

		},

		onBeforeRendering: function() {
			//set custom button for object-section:
			/*var sec = this.getView().byId("sec_pic");
			var icon = new Icon({src: "sap-icon://picture"});
			icon.setSize("128px");
			var btn = new Button({icon: icon.getSrc(), text:"Product Pictures"});
			sec.setCustomAnchorBarButton(btn);
			*/
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		toggleEdit: function(event){
			var fValue = event.getParameter("value");
		},

		/**
		 * Event handler when the share button has been clicked
		 * @param {sap.ui.base.Event} oEvent the butten press event
		 * @public
		 */
		onSharePress: function() {
			var oShareSheet = this.byId("shareSheet");
			oShareSheet.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oShareSheet.openBy(this.byId("shareButton"));
		},

		onOpenDocMan: function(evt){
			var bReplace = !Device.system.phone;
			var parts = evt.getSource().getBindingContext().toString().split("/");
			var id = parts[2];

			this.getRouter().navTo("doc", {
				obj: "doc",
				objectId: id //oItem.getBindingContext().getProperty("ProductID")
			}, bReplace);

			//this.getRouter().getTargets().display("doc");
		},

		onOpenClassMan: function(evt){
			var bReplace = !Device.system.phone;
			var parts = evt.getSource().getBindingContext().toString().split("/");
			var id = parts[2];

			this.getRouter().navTo("class", {
				obj: "class",
				objectId: id //oItem.getBindingContext().getProperty("ProductID")
			}, bReplace);

			//this.getRouter().getTargets().display("doc");
		},

		//simulate document download:
		doDownload: function(evt){
			var model = this.getModel();
			var path = evt.getSource().getBindingContext().getPath();
			var obj = model.getProperty(path);
			//MessageToast.show("Thanks for downloading document " + obj.DocName + " (" + obj.size + " kb) - the function is disabled in Demo-mode");

			// simulate download with timer:
			var interval = 1000;
			this.showProgress(obj.DocName, obj.size);

			this.al = 0;
			if(this.trigger != null && typeof this.trigger != 'undefined') this.trigger.destroy();
			this.trigger = new IntervalTrigger();
			this.trigger.addListener($.proxy(this.updateBar, this)); //WICHTIG: SCOPE FÜR FUNKTION AUF CONTROLLER SETZEN!!!!
			this.trigger.setInterval(50);
		},

		showProgress: function(docname, docsize){
			prog = new ProgressIndicator({
				percentValue: 0,
				displayValue: "0%",
				showValue: true
			});

			var dialog = new Dialog({
				title: 'Simulate Document Download: ' + docname + ' (' + docsize + ' kb)',
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
			prog.setDisplayValue( "downloading: "+this.al+"%" );
			if(this.al >= 100){
				this.al = 0;
				this.trigger.setInterval(-1);
			}
		},


	/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			var oElementBinding = this.getView().getElementBinding();
			var sPath = oElementBinding.getPath()
			var oModel = this.getView().getModel();
			var oObject = oModel.getProperty(sPath + "/prod_images");
			var c = this.getView().byId("carousel");
			c.removeAllPages();
			if(typeof oObject != "undefined" && oObject != null) {
				var index = 0;
				var found = false;

				for (index = 0; index < oObject.length; index++) {
					var img = new sap.m.Image({src: oObject[index]});
					c.addPage(img);
					found = true;
				}

				if(index == 0){
					var img = new sap.m.Image({src: "images/not-available.png"});
					c.addPage(img);
					found = true;
				}
			}else{
				var img = new sap.m.Image({src: "images/not-available.png"});
				c.addPage(img);
			}

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}

			if (this.byId("lineItemsList2").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCountDocuments", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingDocuments");
				}
				oViewModel.setProperty("/DocumentItemTitle", sTitle);
			}
		},

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinishedDocuments: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("lineItemsList2").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCountDocuments", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingDocuments");
				}
				oViewModel.setProperty("/DocumentItemTitle", sTitle);
			}
		},


		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

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
			var oViewModel = this.getModel("detailView");

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
				//sObjectId = oObject.ProductID,
				//sObjectName = oObject.ProductName,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			//dynamically build image carousel:
			var oModel = oView.getModel();
			var oData = oModel.getProperty(sPath + "/prod_images");
			/*var c = oView.byId("carousel");
			c.removeAllPages();
			if(typeof oObject != "undefined" && oObject != null && oObject.prod_images != null && typeof oObject.prod_images != "undefined") {
				var index = 0;
				var found = false;

				for (index = 0; index < oObject.prod_images.length; index++) {
					var img = new sap.m.Image({src: oObject.prod_images[index]});
					c.addPage(img);
					found = true;
				}

				if(index == 0){
					var img = new sap.m.Image({src: "images/not-available.png"});
					c.addPage(img);
					found = true;
				}
			}else{
				var img = new sap.m.Image({src: "images/not-available.png"});
				c.addPage(img);
			}*/

			/*oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
				*/
		},

		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView"),
				oLineItemTable = this.byId("lineItemsList"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		}

	});

});

var timer;
var prog;
var sim;
var al = 0;
var trigger;