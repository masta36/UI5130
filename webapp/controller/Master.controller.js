sap.ui.define([
	"com/pr36/app/controller/BaseController",
	'jquery.sap.global',
	'sap/m/Label',
	'sap/m/Link',
	'sap/m/MessageToast',
	'sap/m/Text',
	'./Formatter',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, jQuery, Label, Link, MessageToast, Text, Formatter, Fragment, Controller, JSONModel, Device, FilterOperator, Filter) {
	"use strict";

	var PageController = BaseController.extend("com.pr36.app.controller.Master", {

		// Setup crumb info, the collection root
		// and an initial product selection / order state
		sCollection: "/ProductHierarchy",
		aCrumbs: ["Catalog", "Categories", "Products"],
		mInitialOrderState: {
			products: {},
			count: 0,
			hasCounts: false
		},

		// Pull in the table row template fragment, grab
		// a reference to the table, work out the initial crumb path
		// and create the order model, setting it on the view
		onInit: function (oEvent) {

			// Control state model
			var oList = this.byId("idProductsTable"),
				oViewModel = new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "Name",
					groupBy: "None"
				}),
			// Put down master list's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the master list is
			// taken care of by the master list itself.
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();

			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};

			this.setModel(oViewModel, "masterView");

			// set demo model on this sample
			var sPath = "model/productHierarchy.json";//jQuery.sap.getModulePath("/model", "/productHierarchy.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
			this.getView().setModel(new JSONModel(this.mInitialOrderState), "Order");

			if (! this.oTemplate) {
				this.oTemplate = sap.ui.xmlfragment("com.pr36.app.view.Row");
			}
			this._oTable = this.byId("idProductsTable");

			var sPath = this._getInitialPath();
			this._setAggregation(sPath);

			//Routing:
			this.getRouter().getRoute("_master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);

			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};

			//this._showStart();

		},

		onNavBack: function(){
			var bReplace = !Device.system.phone;

			this.getRouter().navTo("", {
			}, bReplace);
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function() {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");

			if(aFilters.length == 0){
				//var oTemplate = this.oTemplate = sap.ui.xmlfragment("com.pr36.app.view.Row");

				this._oList.setModel(this.getView().getModel());
				//this._oList.bindItems("/ProductHierarchy/Catalog", oTemplate);
				this._setAggregation("/ProductHierarchy/Catalog");
				return;
			}

			//custom search for hierarchy:
			var data = this.getModel().getData();
			var tmp_model = new JSONModel({
				tmp: true
			});

			var search = aFilters[0].oValue1;

			data = data["ProductHierarchy"];

			var a = 0;
			var n = 0;
			var c = 0;
			var products = new Array();
			var catalog_coll = data.Catalog;
			for(c = 0; c < catalog_coll.length; c++) {
				var catalog = catalog_coll[c];
					var cat = catalog.Categories;
					for (n = 0; n < cat.length; n++) {
						//products
						var p = 0;
						var pro = cat[n].Products;
						for (p = 0; p < pro.length; p++) {
							pro[p].Path = catalog.Name + "/" + cat[n].Name + "/";
							products.push(pro[p]);
						}
					}
			}

			var FilteredData = _.filter(products, function(item) {
				var fields = [
					'Name',
					'prod_short'
				];
				var concat = _.chain(fields)
					.map(function (field) {
						return _.property(field)(item);
					})
					.filter(function (result) {
						return result !== undefined && result !== null
					})
					.value()
					.join(' ');
				return _.every(search.split(' '), function (searchTerm) {
					return concat.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
				});
			});

			var i = 0;
			var prods = new Array();
			var prodItem;
			for(i = 0; i < FilteredData.length; i++){
				prodItem = {"Name": FilteredData[i].Name, "ProductID":FilteredData[i].ProductID, "prod_short": FilteredData[i].Path};
				prods.push(prodItem);
			}

			var search = {"search": prods};
			tmp_model.setData(search);
			this._oList.setModel(tmp_model);
			this.setModel(tmp_model, "tmp_model");

			var oTemplate = new sap.m.ColumnListItem({
				cells : [
					new sap.m.ObjectIdentifier({
						title : "{Name}",
						text : "{prod_short}"
					})
				]
			});

			this._setAggregation("/search");

			/*this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
			*/
		},

		// Initial path is the first crumb appended to the collection root
		_getInitialPath: function () {
			return [this.sCollection, this.aCrumbs[0]].join("/");
		},


		// Find the next crumb that follows the given crumb
		_nextCrumb: function (sCrumb) {
			for (var i = 0, ii = this.aCrumbs.length; i < ii; i++) {
				if (this.aCrumbs[i] === sCrumb) {
					return this.aCrumbs[i + 1];
				}
			}
		},


		// Remove the numeric item binding from a path
		_stripItemBinding: function (sPath) {
			var aParts = sPath.split("/");
			return aParts.slice(0, aParts.length - 1).join("/");
		},


		// Build the crumb links for display in the toolbar
		_maintainCrumbLinks: function (sPath) {
			// Determine trail parts
			var aPaths = [];
			var aParts = sPath.split("/");
			while (aParts.length > 1) {
				aPaths.unshift(aParts.join("/"));
				aParts = aParts.slice(0, aParts.length - 2);
			}

			// Re-build crumb toolbar based on trail parts
			var oCrumbToolbar = this.byId("idCrumbToolbar");
			oCrumbToolbar.destroyContent();

			aPaths.forEach(jQuery.proxy(function (sPath, iPathIndex) {

				var bIsFirst = iPathIndex === 0;
				var bIsLast = iPathIndex === aPaths.length - 1;

				// Special case for 1st crumb: fixed text
				var sText = bIsFirst ? this.aCrumbs[0] : "{Name}";

				// Context is one level up in path
				var sContext = this._stripItemBinding(sPath);

				var oCrumb = bIsLast
					? new Text({
					text: sText
				}).addStyleClass("crumbLast")
					: new Link({
					text: sText,
					target: sPath,
					press: [this.handleLinkPress, this]
				});
				oCrumb.bindElement(sContext);

				oCrumbToolbar.addContent(oCrumb);
				if (! bIsLast) {
					var oArrow = new Label({
						textAlign: "Center",
						text: ">"
					}).addStyleClass("crumbArrow");
					oCrumbToolbar.addContent(oArrow);
				}

			}, this));
		},


		// Navigate through the product hierarchy by rebinding the
		// table's items aggregation. Navigation is either through
		// branches (Suppliers, Categories) or leaves (Products)
		_setAggregation: function (sPath) {
			// If we're at the leaf end, turn off navigation
			var sPathEnd = sPath.split("/").reverse()[0];
			if (sPathEnd === this.aCrumbs[this.aCrumbs.length - 1]) {
				this._oTable.setMode("SingleSelectMaster");
			}
			else {
				this._oTable.setMode("SingleSelectMaster");
			}

			// Set the new aggregation
			this._oTable.bindAggregation("items", sPath, this.oTemplate);

			this._maintainCrumbLinks(sPath);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;

			this.getRouter().navTo("object", {
				objectId: oItem//oItem.getBindingContext().getProperty("ProductID")
			}, bReplace);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showStart: function() {
			var bReplace = !Device.system.phone;

			this.getRouter().navTo("masterO", {
			}, bReplace);
		},

		/**
		 * If the master route was hit (empty hash) we have to set
		 * the hash to to the first item in the list as soon as the
		 * listLoading is done and the first item in the list is known
		 * @private
		 */
		_onMasterMatched: function() {
			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
				function(mParams) {
					if (mParams.list.getMode() === "None") {
						return;
					}
					var sObjectId = mParams.firstListitem.getBindingContext().getProperty("ProductID");
					this.getRouter().navTo("object", {
						objectId: sObjectId
					}, true);
				}.bind(this),
				function(mParams) {
					if (mParams.error) {
						return;
					}
					this.getRouter().getTargets().display("detailNoObjectsAvailable");
				}.bind(this)
			);
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * @public
		 */
		onBypassed: function() {
			this._oList.removeSelections(true);
		},



		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				//this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				this._oListFilterState.aSearch = [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery)];
			} else {
				this._oListFilterState.aSearch = [];
			}
			this._applyFilterSearch();

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			this._oList.getBinding("items").refresh();
		},




		// Add to the order based on the selection
		_updateOrder: function (oSelectionInfo) {
			/*var oOrderModel = this.getView().getModel("Order");
			oOrderModel.setData({products: oSelectionInfo}, true);
			var aProductsSelected = Formatter.listProductsSelected(this.getView());
			oOrderModel.setData({
				count: aProductsSelected.length,
				hasCounts: aProductsSelected.length > 0
			}, true);
			*/
		},


		// Navigation means a new aggregation to work our
		// way through the ProductHierarchy
		handleLinkPress: function (oEvent) {
			this._setAggregation(oEvent.getSource().getTarget());
		},


		// Show a message toast only if there are products selected
		handleOrderPress: function (oEvent) {
			/*var aProductsSelected = Formatter.listProductsSelected(this.getView());
			if (aProductsSelected) {
				MessageToast.show("Ordering: " + aProductsSelected.map(function (mProduct) {
						return mProduct.ProductName;
					}));
			}
			*/
		},


		// Take care of the navigation through the hierarchy when the
		// user selects a table row
		handleSelectionChange: function (oEvent) {
			// Determine where we are right now
			var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var aPath = sPath.split("/");
			var sCurrentCrumb = aPath[aPath.length - 2];

			// If we're on a leaf, remember the selections;
			// otherwise navigate
			if (sCurrentCrumb === this.aCrumbs[this.aCrumbs.length - 1] || sCurrentCrumb === "search") {
				var oSelectionInfo = {};
				var bSelected = oEvent.getParameter("selected");
				oEvent.getParameter("listItems").forEach(function (oItem) {
					oSelectionInfo[oItem.getBindingContext().getPath()] = bSelected;
				});

				//call Detail-view:

				var pid = oEvent.getParameter("listItem").getBindingContext().getObject().ProductID;
				this._showDetail(pid);//(oEvent.getParameter("listItem") || oEvent.getSource());

				this._updateOrder(oSelectionInfo);
			} else {
				var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");
				this._setAggregation(sNewPath);
			}

			//clear selection:
			var item = oEvent.getParameter("listItem");
			item.setSelected(false);
		}

	});

	return PageController;

});