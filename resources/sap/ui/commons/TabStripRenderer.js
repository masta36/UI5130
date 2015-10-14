/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],function(q){"use strict";var T=function(){};T.render=function(r,c){var a=r;var b=sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");a.write("<div role='presentation'");a.addClass("sapUiTabStrip");a.addStyle("height",c.getHeight());a.addStyle("width",c.getWidth());a.writeClasses();a.writeStyles();a.writeControlData(c);a.write("><div class=\"sapUiTabBar\" tabIndex=\"0\"");if(c.getTooltip_AsString()){a.writeAttributeEscaped('title',c.getTooltip_AsString());}a.write("><div class=\"sapUiTabMenu\"></div><ul class=\"sapUiTabBarCnt\" role=\"tablist\">");var t=c.getTabs();var w=false;var s=c.getSelectedIndex();if(s<0){s=0;c.setProperty('selectedIndex',0,true);}var S=t[s];if(!S||!S.getVisible()||!S.getEnabled()){c._warningInvalidSelectedIndex(s,S);w=true;}c.iVisibleTabs=0;for(var i=0;i<t.length;i++){var o=t[i];if(o.getVisible()===false){continue;}c.iVisibleTabs++;}var v=0;for(var i=0;i<t.length;i++){var o=t[i];if(o.getVisible()===false){continue;}if(w&&o.getEnabled()){c.setProperty('selectedIndex',i,true);s=i;w=false;}a.write("<li");if(o.getEnabled()==false){a.addClass("sapUiTabDsbl");}else if(i==s){a.addClass("sapUiTabSel");}else{a.addClass("sapUiTab");}if(i==s-1){a.addClass("sapUiTabBeforeSel");}else if(i==s+1){a.addClass("sapUiTabAfterSel");}a.writeControlData(o);a.writeAttribute("tabidx",i);v++;a.writeAttribute("tabindex","-1");a.writeAttribute("role","tab");a.writeAccessibilityState(o,{selected:i==s,controls:o.getId()+"-panel",disabled:!o.getEnabled(),posinset:v,setsize:c.iVisibleTabs});if(o.getClosable()){a.writeAccessibilityState(o,{describedby:o.getId()+"-close"});}if(v==c.iVisibleTabs){a.addClass("sapUiTabLast");}a.writeClasses();var d=o.getTitle();if(d&&d.getTooltip_AsString()){a.writeAttributeEscaped('title',d.getTooltip_AsString());}else if(o.getTooltip_AsString()){a.writeAttributeEscaped('title',o.getTooltip_AsString());}a.write(">");if(d){var I=d.getIcon();if(I){var C=[];var A={};C.push("sapUiTabIco");a.writeIcon(I,C,A);}a.writeEscaped(d.getText());}else{q.sap.log.warning("No title configured for "+o+". Either set a string as 'text' property or a sap.ui.core.Title as 'title' aggregation.");}if(o.getClosable()){a.write("<button id='"+o.getId()+"-close' type=\"button\" tabindex= \"-1\" class=\"sapUiTabClose\" title=\""+b.getText("TAB_CLOSE_TEXT")+"\"></button>");}a.write("</li>");}a.write("</ul></div>");if(w){c.setProperty('selectedIndex',-1,true);s=-1;a.write("<div id=\""+c.getId()+"-panel"+"\" role=\"tabpanel\"");a.addClass("sapUiTabPanel");if(c.getHeight()){a.addClass("sapUiTabPanelHeight");}a.writeClasses();a.write("></div>");}else{for(var i=0;i<t.length;i++){var o=t[i];if(i!=s||o.getVisible()===false){continue;}a.write("<div id=\""+o.getId()+"-panel"+"\" role=\"tabpanel\" aria-labelledby=\""+o.getId()+"\"");a.addClass("sapUiTabPanel");if(c.getHeight()){a.addClass("sapUiTabPanelHeight");}a.writeClasses();a.write(">");T.renderTabContents(a,o);a.write("</div>");}}a.write("</div>");c.invalidated=false;};T.renderTabContents=function(r,c){var C=c.getContent(),l=C.length;for(var i=0;i<l;i++){r.renderControl(C[i]);}};return T;},true);
