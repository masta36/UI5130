/**
 * Created by pp on 27.10.2015.
 */
sap.ui.define([
    "com/pr36/app/controller/BaseController"
], function(BaseController) {
    "use strict";

    return BaseController.extend("com.pr36.app.controller.ClassMan_frag", {

        onInit: function () {
            alert("init");
        }
    });

});
