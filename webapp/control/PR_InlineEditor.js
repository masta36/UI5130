/**
 * Created by pp on 20.10.2015.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/commons/FormattedTextView",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/core/Icon",
    "sap/m/Button"
], function (Control, FormattedTextView, RichTextEditor, Icon, Button) {
    "use strict";
    return Control.extend("com.pr36.app.control.PR_InlineEditor", {
        metadata : {
            properties : {
                value: {type : "string", defaultValue : ""},
                icon: {type : "string", defaultValue : ""},
                phone: {type: "boolean", defaultValue : true},
                tablet: {type: "boolean", defaultValue : true}
            },
            aggregations : {
                _formatted : {type : "sap.ui.commons.FormattedTextView", multiple: false, visibility : "visible"},
                _rich : {type : "sap.ui.richtexteditor.RichTextEditor", multiple: false, visibility : "hidden"},
                _icon : {type : "sap.ui.core.Icon", multiple: false, visibility : "visible"},
                _button : {type : "sap.m.Button", multiple: false, visibility : "hidden"},
                _buttonR : {type : "sap.m.Button", multiple: false, visibility : "hidden"}
            },
            events : {
                change : {
                    parameters : {
                        value : {type : "string"},
                        enabled : {type : "boolean"}
                    }
                },

                toggleEditor : {
                    parameters : {
                        value : {type : "string"}
                    }
                }
            }
        },
        init : function () {

            this.setAggregation("_formatted", new FormattedTextView({
                htmlText : this.value, width : "600px", height : "300px"
            }));

            this.setAggregation("_rich", new RichTextEditor({
                value : this.value, width : "600px", height : "300px", visible : false
            }));

            this.setAggregation("_icon", new Icon({
                src : this.icon,
                press : this._discard.bind(this),
                fontsize : "20px"
            }));

            this.setAggregation("_button", new Button({
                ariaDescribedBy:"acceptButtonDescription genericButtonDescription",
                text: "Accept",
                type: "Accept",
                enabled: true,
                icon: "sap-icon://accept",
                visible: false,
                press : this._toggleEditor.bind(this)
            }));

            this.setAggregation("_buttonR", new Button({
                ariaDescribedBy:"acceptButtonDescription genericButtonDescription",
                text: "Discard",
                type: "Reject",
                enabled: true,
                icon: "sap-icon://sys-cancel",
                visible: false,
                press : this._discard.bind(this)
            }));
        },

        _toggleEditor: function(oEvent){
            this.getAggregation("_rich").setVisible(!this.getAggregation("_rich").getVisible());
            this.getAggregation("_button").setVisible(!this.getAggregation("_button").getVisible());
            this.getAggregation("_buttonR").setVisible(!this.getAggregation("_buttonR").getVisible());
            this.setValue(this.getAggregation("_rich").getValue());
            this.fireEvent("toggleEditor", {
                value: this.getValue()
            });
        },

        _discard: function(oEvent){
            this.getAggregation("_rich").setVisible(!this.getAggregation("_rich").getVisible());
            this.getAggregation("_button").setVisible(!this.getAggregation("_button").getVisible());
            this.getAggregation("_buttonR").setVisible(!this.getAggregation("_buttonR").getVisible());
            this.getAggregation("_rich").setValue(this.getProperty("value"));
            /*this.setValue(this.getAggregation("_rich").getValue());
            this.fireEvent("toggleEditor", {
                value: this.getValue()
            });*/
        },

        setValue: function (iValue) {
            this.setProperty("value", iValue, true);
            this.getAggregation("_formatted").setHtmlText(iValue);
            this.getAggregation("_rich").setValue(iValue);
        },

        setIcon: function (iValue) {
            this.setProperty("icon", iValue, true);
            this.getAggregation("_icon").setSrc(iValue);
        },

        setEnabled: function (iValue) {
            this.setProperty("enabled", iValue, true);
        },


        renderer : function (oRM, oControl) {
            oRM.write("<div>");

            oRM.write("<div style='float:right'");
            oRM.writeControlData(oControl);
            oRM.addClass("compr36appcontrolPR_InlineEditorFade");
            oRM.writeClasses();
            oRM.write(">");

            if(!oControl.getPhone() && !oControl.getTablet()) {
                oRM.renderControl(oControl.getAggregation("_icon"));
            }
            oRM.write("</div>");
            oRM.write("<div style='display:inline'");
            oRM.renderControl(oControl.getAggregation("_formatted"));
            oRM.write("</div>");
            oRM.write("<div>");
            oRM.write("<br>");
            oRM.renderControl(oControl.getAggregation("_rich"));
            oRM.write("</div><div style='float:left; padding:5px'>")

            oRM.write("<div style='float:right; padding:5px'>");
            oRM.renderControl(oControl.getAggregation("_buttonR"));
            oRM.write("</div>");
            oRM.write("<div style='float:right; padding:5px'>")
            oRM.renderControl(oControl.getAggregation("_button"));
            oRM.write("</div>");
            oRM.write("</div>");
        }
    });
});