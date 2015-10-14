/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides default renderer for control sap.ui.commons.ProgressIndicator
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * ProgressIndicator renderer.
	 * @namespace
	 */
	var ProgressIndicatorRenderer = {
	};
	
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.fw.RenderManager}.
	 *
	 * @param {sap.ui.fw.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.fw.Control} oControl an object representation of the control that should be rendered
	 */
	ProgressIndicatorRenderer.render = function(oRenderManager, oProgressIndicator){
		// .convenience variable
		var rm = oRenderManager;
		var widthControl = oProgressIndicator.getWidth();
		var widthBar = oProgressIndicator.getPercentValue();
		var widthBorder;
		oProgressIndicator.bRtl  = sap.ui.getCore().getConfiguration().getRTL();

		if (widthBar > 100) {
			widthBorder = (10000 / widthBar) + '%';
		} else {
			widthBorder = '100%';
		}
	
		// write the HTML into the render manager
		rm.write('<DIV');
		rm.writeControlData(oProgressIndicator);
	
		rm.writeAttribute('tabIndex', '0');
	
		//ARIA
		if ( sap.ui.getCore().getConfiguration().getAccessibility()) {
	//		rm.writeAttribute("role", sap.ui.core.AccessibleRole.Slider);
			rm.writeAttribute('role', 'progressbar');
			rm.writeAccessibilityState(oProgressIndicator, {valuemin: '0%'});
			rm.writeAccessibilityState(oProgressIndicator, {valuemax: '100%'});
			rm.writeAccessibilityState(oProgressIndicator, {valuenow: widthBar + '%'});
	//		rm.writeAccessibilityState(oProgressIndicator, {label:oSlider.getTooltip()});
	
	//		if (!oProgressIndicator.getEditable()) {
	//			rm.writeAccessibilityState(oProgressIndicator, {disabled: true});
	//		}else {
	//			rm.writeAccessibilityState(oProgressIndicator, {disabled: false});
	//		}
		}
	
		if (oProgressIndicator.getWidth() && oProgressIndicator.getWidth() != '') {
			rm.writeAttribute('style', 'height: 16px; width:' + widthControl + ';');
		}
	
		if (oProgressIndicator.getTooltip_AsString()) {
			rm.writeAttributeEscaped('title', oProgressIndicator.getDisplayValue() + '- ' + oProgressIndicator.getTooltip_AsString());
		} else {
			rm.writeAttributeEscaped('title', oProgressIndicator.getDisplayValue());
		}
	
		rm.addClass('sapUiProgInd');
		rm.writeClasses();
	
		rm.write('>');
	
		rm.write('<DIV');
		rm.writeAttribute('id', oProgressIndicator.getId() + '-box');
	
		if (oProgressIndicator.getWidth() && oProgressIndicator.getWidth() != '') {
			rm.writeAttribute('style', 'height: 16px; width:' + widthBorder + ';');
		}
	
		rm.addClass('sapUiProgIndBorder');
		rm.writeClasses();
	
		rm.write('>');
	
		rm.write('<DIV');
		rm.writeAttribute('id', oProgressIndicator.getId() + '-bar');
		rm.writeAttribute('onselectstart', "return false");
		rm.writeAttribute('style', 'height: 14px; width:' + oProgressIndicator.getPercentValue() + '%;');
	
		var sBarColor = oProgressIndicator.getBarColor();
		switch (sBarColor) {
			case "POSITIVE":
				rm.addClass('sapUiProgIndBarPos');
				break;
			case "NEGATIVE":
				rm.addClass('sapUiProgIndBarNeg');
				break;
			case "CRITICAL":
				rm.addClass('sapUiProgIndBarCrit');
				break;
			case "NEUTRAL":
				rm.addClass('sapUiProgIndBar');
				break;
			default:
				rm.addClass('sapUiProgIndBar');
				break;
		}
	
		rm.writeClasses();
	
		rm.write('>');
	
		rm.write('<DIV');
		rm.writeAttribute('id', oProgressIndicator.getId() + '-end');
	
		if (widthBar > 100) {
			switch (sBarColor) {
				case "POSITIVE":
					rm.addClass('sapUiProgIndPosEnd');
					break;
				case "NEGATIVE":
					rm.addClass('sapUiProgIndNegEnd');
					break;
				case "CRITICAL":
					rm.addClass('sapUiProgIndCritEnd');
					break;
				case "NEUTRAL":
					rm.addClass('sapUiProgIndEnd');
					break;
				default:
					rm.addClass('sapUiProgIndEnd');
					break;
			}
		} else {
			rm.addClass('sapUiProgIndEndHidden');
		}
	
		rm.writeClasses();
		if (oProgressIndicator.bRtl) {
			rm.writeAttribute('style', 'position: relative; right:' + widthBorder);
		} else {
			rm.writeAttribute('style', 'position: relative; left:' + widthBorder);
		}
	
		rm.write('>');
		rm.write('</DIV>');
	
		rm.write('<SPAN');
	
		rm.addClass('sapUiProgIndFont');
		rm.writeClasses();
	
		rm.write('>');
	
		if (oProgressIndicator.getShowValue() && oProgressIndicator.getShowValue() == true) {
			if (oProgressIndicator.getDisplayValue() && oProgressIndicator.getDisplayValue() != '') {
				rm.writeEscaped(oProgressIndicator.getDisplayValue());
			}
		}
	
		rm.write('</SPAN>');
		rm.write('</DIV>');
		rm.write('</DIV>');
		rm.write('</DIV>');
	};

	return ProgressIndicatorRenderer;

}, /* bExport= */ true);
