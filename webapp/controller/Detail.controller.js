/*global location */
sap.ui.define([
	"com/pr36/app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/pr36/app/model/formatter",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/ProgressIndicator",
	"sap/m/Button",
	"sap/ui/Device"
], function(BaseController, JSONModel, formatter, MessageToast, Dialog, ProgressIndicator, Button, Device) {
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

		},

		onAfterRendering: function() {
			var count = 5;
			var img;


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
			this.progressInd();
			//this.sim = setInterval( this.progressInd() , 3000 );
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
					press: function () {
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

		progressInd: function () {
			prog.setPercentValue( parseInt(this.al) );
			this.al+= 1;
			prog.setDisplayValue( "downloading: "+this.al+"%" );
			this.sim = setTimeout( function(){this.progressInd(al);}, 3000 );
			if(this.al >= 100){
				alert("end");
				this.al = 0;
				clearTimeout(this.sim);
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
var al;