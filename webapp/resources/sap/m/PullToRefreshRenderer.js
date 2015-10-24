/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/IconPool'],function(q,I){"use strict";I.insertFontFaceStyle();var P={};P.render=function(r,c){var s=c.getShowIcon();var C=c.getCustomIcon();var t=c.getTooltip_AsString();r.write("<div");r.writeControlData(c);r.addClass("sapMPullDown");if(!c._bTouchMode){r.addClass("sapMPullDownNontouch");}else{r.addClass("sapMPullDownTouch");}if(s&&!C){r.addClass("sapMPullDownLogo");}r.writeClasses();if(t){r.writeAttributeEscaped("title",t);}r.write(" tabindex=\"0\"");r.write(" role='button' aria-controls='"+c.getParent().sId+"-cont'>");if(s&&C){var o=c.getCustomIconImage();if(o){r.write("<div class=\"sapMPullDownCI\">");r.renderControl(o);r.write("</div>");}}r.write("<span class=\"sapMPullDownIcon\"></span>");r.write("<span class=\"sapMPullDownBusy\">");r.renderControl(c._oBusyIndicator);r.write("</span>");r.write("<span id="+c.getId()+"-T class=\"sapMPullDownText\">");r.writeEscaped(c.oRb.getText(c._bTouchMode?"PULL2REFRESH_PULLDOWN":"PULL2REFRESH_REFRESH"));r.write("</span>");r.write("<span id="+c.getId()+"-I class=\"sapMPullDownInfo\">");r.writeEscaped(c.getDescription());r.write("</span>");r.write("</div>");};return P;},true);
