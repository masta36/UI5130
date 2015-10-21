sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/pr36/app/model/models",
    "com/pr36/app/controller/ListSelector",
    "com/pr36/app/controller/ErrorHandler",
    "com/pr36/app/model/formatter",
    "com/pr36/app/model/grouper"
], function(UIComponent, Device, models, ListSelector, ErrorHandler) {
    "use strict";

    return UIComponent.extend("com.pr36.app.Component", {

        metadata: {
            "version": "1.0.0",
            "rootView": "com.pr36.app.view.App",
            "dependencies": {
                "libs": ["sap.ui.core", "sap.m", "sap.ui.layout"]
            },
            "config": {
                "i18nBundle": "com.pr36.app.i18n.i18n",
                "serviceUrl": "http://services.odata.org/Northwind/Northwind.svc",
                "icon": "",
                "favIcon": "",
                "phone": "",
                "phone@2": "",
                "tablet": "",
                "tablet@2": ""
            },
            "routing": {
                "config": {
                    "routerClass": "sap.m.routing.Router",
                    "viewType": "XML",
                    "viewPath": "com.pr36.app.view",
                    "controlId": "idAppControl",
                    "controlAggregation": "detailPages",
                    "bypassed": {
                        "target": ["master", "notFound"]
                    }
                },

                "routes": [{
                    "pattern": "",
                    "name": "master",
                    "target": ["start", "master"]
                }, {
                    "pattern": "Products/{objectId}",
                    "name": "object",
                    "target": ["master", "object"]
                }],

                "targets": {
                    "master": {
                        "viewName": "Master",
                        "viewLevel": 1,
                        "viewId": "master",
                        "controlAggregation": "masterPages"
                    },
                    "object": {
                        "viewName": "Detail1",
                        "viewId": "detail",
                        "viewLevel": 2
                    },
                    "start": {
                        "viewName": "Start",
                        "viewId": "start",
                        "viewLevel": 2
                    },
                    "detailObjectNotFound": {
                        "viewName": "DetailObjectNotFound",
                        "viewId": "detailObjectNotFound"
                    },
                    "detailNoObjectsAvailable": {
                        "viewName": "DetailNoObjectsAvailable",
                        "viewId": "detailNoObjectsAvailable"
                    },
                    "notFound": {
                        "viewName": "NotFound",
                        "viewId": "notFound"
                    }
                }
            }
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * In this method, the resource and application models are set and the router is initialized.
         * @public
         * @override
         */
        init: function() {

            var mConfig = this.getMetadata().getConfig();

            // creating and setting the necessary models
            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            // set the FLP model
            this.setModel(models.createFLPModel(), "FLP");

            // REPLACE dafault OData-model by local JSON-model:
            /*
            // create and set the ODataModel
            var oModel = models.createODataModel({
                urlParametersForEveryRequest: [
                    "sap-server",
                    "sap-client",
                    "sap-language"
                ],
                url: this.getMetadata().getConfig().serviceUrl,
                config: {
                    metadataUrlParams: {
                        "sap-documentation": "heading"
                    }
                }
            });
            */

            var oModel = models.createJSONModel();

            this.setModel(oModel);
            this._createMetadataPromise(oModel);

            // set the i18n model
            this.setModel(models.createResourceModel(mConfig.i18nBundle), "i18n");

            this.oListSelector = new ListSelector();
            this._oErrorHandler = new ErrorHandler(this);
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            // create the views based on the url/hash
            this.getRouter().initialize();
        },

        /**
         * The component is destroyed by UI5 automatically.
         * In this method, the ListSelector and ErrorHandler are destroyed.
         * @public
         * @override
         */
        destroy: function() {
            this.oListSelector.destroy();
            this._oErrorHandler.destroy();
            this.getModel().destroy();
            this.getModel("i18n").destroy();
            this.getModel("FLP").destroy();
            this.getModel("device").destroy();
            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
         */
        getContentDensityClass: function() {
            if (this._sContentDensityClass === undefined) {
                // check whether FLP has already set the content density class; do nothing in this case
                if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

        /**
         * Creates a promise which is resolved when the metadata is loaded.
         * @param {sap.ui.core.Model} oModel the app model
         * @private
         */
        _createMetadataPromise: function(oModel) {
            this.oWhenMetadataIsLoaded = new Promise(function(fnResolve, fnReject) {
                oModel.attachEventOnce("metadataLoaded", fnResolve);
                oModel.attachEventOnce("metadataFailed", fnReject);
            });
        }

    });

});