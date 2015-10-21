/**
 * Created by pp on 20.10.2015.
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/commons/FormattedTextView",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/core/Icon"
], function (Control, FormattedTextView, RichTextEditor, Icon) {
    "use strict";
    return Control.extend("com.pr36.app.control.PR_InlineEditor", {
        metadata : {
            properties : {
                value: {type : "string", defaultValue : "Working"},
                icon: {type : "string", defaultValue : "Working"}
            },
            aggregations : {
                _formatted : {type : "sap.ui.commons.FormattedTextView", multiple: false, visibility : "visible"},
                _rich : {type : "sap.ui.richtexteditor.RichTextEditor", multiple: false, visibility : "hidden"},
                _icon : {type : "sap.ui.core.Icon", multiple: false, visibility : "visible"}
            },
            events : {
                change : {
                    parameters : {
                        value : {type : "string"}
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
                press : this._toggleEditor.bind(this),
                fontsize : "20px"
            }));
        },

        _toggleEditor: function(oEvent){
            this.getAggregation("_rich").setVisible(!this.getAggregation("_rich").getVisible());
            this.setValue(this.getAggregation("_rich").getValue());
            this.fireEvent("toggleEditor", {
                value: this.getValue()
            });
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


        renderer : function (oRM, oControl) {
            oRM.write("<div>");

            oRM.write("<div style='float:right'");
            oRM.writeControlData(oControl);
            oRM.addClass("compr36appcontrolPR_InlineEditorFade");
            oRM.writeClasses();
            oRM.write(">");
            oRM.renderControl(oControl.getAggregation("_icon"));
            oRM.write("</div>");
            oRM.write("<div style='display:inline'");
            oRM.renderControl(oControl.getAggregation("_formatted"));
            oRM.write("</div>");
            oRM.write("<div>");
            oRM.write("<br>");
            oRM.renderControl(oControl.getAggregation("_rich"));

            oRM.write("</div>");
        }
    });
});