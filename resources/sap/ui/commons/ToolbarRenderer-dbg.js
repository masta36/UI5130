/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides default renderer for control sap.ui.commons.Toolbar
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * @namespace
	 */
	var ToolbarRenderer = {
	};
	
	/**
	 * Renders the HTML for the given toolbar using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.commons.Toolbar} oToolbar An object representation of the control that should be rendered.
	 */
	ToolbarRenderer.render = function(oRenderManager, oToolbar) {
		var rm = oRenderManager;
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
	
		jQuery.sap.assert(oToolbar instanceof sap.ui.commons.Toolbar, "ToolbarRenderer.render: oToolbar must be a toolbar");
	
		rm.write("<div role='toolbar' tabindex='0'"); // Tab index required for ItemNavigation, the Toolbar is actually not tabable
		rm.writeControlData(oToolbar);
		if (oToolbar.getWidth()) {
			rm.addStyle("width", oToolbar.getWidth());
		}
	
		var sTooltip = oToolbar.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
	
		rm.addClass("sapUiTb");
		rm.addClass("sapUiTbDesign" + oToolbar.getDesign());
		if (oToolbar.getStandalone()) {
			rm.addClass("sapUiTbStandalone");
		}
	
		rm.writeStyles();
		rm.writeClasses();
		rm.write(">");
	
		var aRightItems = oToolbar.getRightItems();
		var iRightItemsLength =  aRightItems.length;
		var bHasRightItems = iRightItemsLength > 0;
	
	    if (bHasRightItems) {
				rm.write("<div class='sapUiTbCont sapUiTbContLeft'><div class='sapUiTbInner' >");
	    } else {
				rm.write("<div class='sapUiTbCont'><div class='sapUiTbInner'>");
	    }
	
	
		// Render each item, also the hidden ones, as they might become visible when the toolbar is resized
		var aItems = oToolbar.getItems();
		var iLength = aItems.length;
		for (var i = 0; i < iLength; i++) {
			var oToolbarItem = aItems[i];
			if (oToolbarItem) {
				jQuery.sap.assert(oToolbarItem.getMetadata().isInstanceOf("sap.ui.commons.ToolbarItem"), "ToolbarRenderer.render: oToolbarItem must be a ToolbarItem");
	
				// Render ToolbarSeparator elements internally, dispatch rendering of real controls
				if (oToolbarItem instanceof sap.ui.commons.ToolbarSeparator) {
					ToolbarRenderer.renderSeparator(rm, oToolbarItem);
				} else {
					rm.renderControl(oToolbarItem);
				}
			}
		}
	
		// Render the overflow menu button and the cover hiding it, if appropriate
		rm.write("<div id='");
		rm.write(oToolbar.getId());
		rm.write("-mn' class='sapUiTbOB' role='button' aria-haspopup='true' title='" + rb.getText("TOOLBAR_OVERFLOW") + "' tabindex='-1'></div></div></div>");
	
		// Render right side items if right items exist
		if (bHasRightItems) {
			rm.write("<div class='sapUiTbInnerRight' >");
			for (var i = 0; i < iRightItemsLength; i++) {
				var oToolbarItem = aRightItems[i];
				if (oToolbarItem) {
					jQuery.sap.assert(oToolbarItem.getMetadata().isInstanceOf("sap.ui.commons.ToolbarItem"), "ToolbarRenderer.render: oToolbarItem must be a ToolbarItem");
					// Render ToolbarSeparator elements internally, dispatch rendering of real controls
					if (oToolbarItem instanceof sap.ui.commons.ToolbarSeparator) {
						ToolbarRenderer.renderSeparator(rm, oToolbarItem);
					} else {
						rm.renderControl(oToolbarItem);
					}
				}
			}
			rm.write("</div>");
		}
		// Close div for the toolbar
		rm.write("</div>");
	
	};
	
	
	/**
	 * Renders the given ToolbarSeparator
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager
	 * @param {sap.ui.commons.ToolbarItem} oToolbarItem The ToolbarSeparator
	 * @private
	 */
	ToolbarRenderer.renderSeparator = function(oRm, oToolbarItem) {
		if (oToolbarItem.getDisplayVisualSeparator()) {
			oRm.write("<span ");
			oRm.writeElementData(oToolbarItem);
			if (oToolbarItem.getDesign() === sap.ui.commons.ToolbarSeparatorDesign.FullHeight) {
				oRm.write(" class='sapUiTbSeparator sapUiTbSepFullHeight' role='separator'></span>");
			} else {
				oRm.write(" class='sapUiTbSeparator' role='separator'></span>");
			}
		} else {
			oRm.write("<span ");
			oRm.writeElementData(oToolbarItem);
			oRm.write(" class='sapUiTbSpacer' role='separator'></span>");
		}
	};
	
	
	/**
	 * Fills the overflow popup with the currently invisible toolbar items.
	 *
	 * @param {sap.ui.commons.Toolbar} oToolbar
	 * @private
	 */
	ToolbarRenderer.fillOverflowPopup = function(oToolbar) {
		var oPopupHolder = oToolbar.getDomRef("pu");
		if (!oPopupHolder) {
			oPopupHolder = ToolbarRenderer.initOverflowPopup(oToolbar).firstChild;
		}
	
		// Move all invisible items from the second row of the toolbar to the popup
		var iVisibleItems = oToolbar.getVisibleItemInfo().count;
		var oToolbarCont = oToolbar.getDomRef().firstChild.firstChild;
		var iPos = 0;
		var oChild = oToolbarCont.firstChild;
		var sOverflowButtonId = oToolbar.getId() + "-mn";
		while (oChild) {
			var nextChild = oChild.nextSibling;
			if (iPos >= iVisibleItems) {
				if (oChild.id == sOverflowButtonId) { // do not move overflow button and cover
					break;
				}
	
				oPopupHolder.appendChild(oChild);
			}
			oChild = nextChild;
			iPos++;
		}
	};
	
	
	/**
	 * Creates the overflow popup inside the static area, but does not fill its contents (=no items).
	 *
	 * @param {sap.ui.commons.Toolbar} oToolbar
	 * @private
	 */
	ToolbarRenderer.initOverflowPopup = function(oToolbar) {
		var oStaticArea = sap.ui.getCore().getStaticAreaRef();
		var oPopupHolder = document.createElement("div");
		oPopupHolder.className = "sapUiTbDD sapUiTbDesignFlat";
		oPopupHolder.innerHTML = "<div id='" + oToolbar.getId() + "-pu' data-sap-ui=" + oToolbar.getId() + " tabindex='0' role='menu'></div>";
		oStaticArea.appendChild(oPopupHolder);
		return oPopupHolder;
	};
	
	
	/**
	 * Removes the toolbar items from the overflow popup and puts them back into the toolbar.
	 *
	 * @param {sap.ui.commons.Toolbar} oToolbar
	 * @private
	 */
	ToolbarRenderer.emptyOverflowPopup = function(oToolbar) {
		var oPopupHolder = oToolbar.getDomRef("pu");
		var oDomRef = oToolbar.getDomRef();
		
		if (oPopupHolder && oDomRef) {
			var oOverflowButton = oToolbar.getDomRef("mn");
			var oToolbarCont = oDomRef.firstChild.firstChild;
			while (oPopupHolder.hasChildNodes()) {
				oToolbarCont.insertBefore(oPopupHolder.firstChild, oOverflowButton);
			}
		}
	};
	
	
	/**
	 * Returns the area in which the overflow popup should be rendered.
	 *
	 * @param {sap.ui.commons.Toolbar} oToolbar The Toolbar whose popup area is requested
	 *
	 * @private
	 */
	ToolbarRenderer.getPopupArea = function(oToolbar) {
		return oToolbar.getDomRef("pu");
	};
	
	/**
	 * @param {sap.ui.commons.Toolbar} oToolbar The Toolbar where the overflow button should be set active
	 * @private
	 */
	ToolbarRenderer.setActive = function(oToolbar) {
		oToolbar.$("mn").addClass("sapUiTbOBAct");
	};
	
	/**
	 * @param {sap.ui.commons.Toolbar} oToolbar The Toolbar where the overflow button should be set not active
	 * @private
	 */
	ToolbarRenderer.unsetActive = function(oToolbar) {
		oToolbar.$("mn").removeClass("sapUiTbOBAct");
	};

	return ToolbarRenderer;

}, /* bExport= */ true);
