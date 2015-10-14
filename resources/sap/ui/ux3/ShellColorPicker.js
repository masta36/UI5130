/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/EventProvider','sap/ui/commons/Button','sap/ui/core/Popup'],function(Q,E,B,P){"use strict";var S=E.extend("sap.ui.ux3.ShellColorPicker",{constructor:function(i){E.apply(this);this.id=i;}});S.M_EVENTS={liveChange:"liveChange"};S.prototype.attachLiveChange=function(f,l){this.attachEvent(S.M_EVENTS.liveChange,f,l);};S.prototype.detachLiveChange=function(f,l){this.detachEvent(S.M_EVENTS.liveChange,f,l);};S.prototype.fireLiveChange=function(c){var p={cssColor:S.hslToCss(c)};this.fireEvent(S.M_EVENTS.liveChange,p);};S.prototype.isOpen=function(){return(this.oPopup&&this.oPopup.isOpen());};S.prototype.open=function(c,d,m,a,o,b,e){if(this.oPopup&&this.oPopup.isOpen()){return;}this.oSlider=new sap.ui.commons.Slider({width:"225px",liveChange:[this.handleSlider,this]});this.oOkBtn=new B({text:"OK",press:[this.handleOk,this]});this.oCancelBtn=new B({text:"Cancel",press:[this.handleCancel,this]});this.oInitialColor=c;this.oCurrentColor=Q.extend({},this.oInitialColor);this.oSlider.setValue(this.oCurrentColor.l);var r=sap.ui.getCore().createRenderManager();var f=document.createElement("div");var s=sap.ui.getCore().getStaticAreaRef();s.appendChild(f);this.renderHtml(r);r.flush(f);r.destroy;this.oPopup=new P(f.firstChild,false,true,true).attachClosed(this.handleClose,this);this.oPopup.setAutoCloseAreas([f.firstChild]);this.oPopup.open(d,m,a,o,b,e);s.removeChild(f);f=null;Q.sap.byId(this.id).bind("mousedown",Q.proxy(this.handleGeneralMouseDown,this));Q.sap.byId(this.id+"-img").bind("mousedown",Q.proxy(this.handleMouseDown,this));Q.sap.byId(this.id+"-marker").bind("mousedown",Q.proxy(this.handleMouseDown,this));this._imgOffset=Q.sap.byId(this.id+"-img").offset();this.adaptSliderBar(this.oCurrentColor);this.markColorOnImage(this.oCurrentColor);this.adaptPreview(this.oCurrentColor);};S.parseCssRgbString=function(r){r=Q.trim(r.replace(/rgb\(/,"").replace(/\)/,""));var R=r.split(",");var o={r:parseInt(R[0],10),g:parseInt(R[1],10),b:parseInt(R[2],10)};return S.rgbToHsl(o);};S.prototype.renderHtml=function(r){r.write("<div id='"+this.id+"' class='sapUiUx3ShellColorPicker'>");r.write("<img id='"+this.id+"-img' src='"+sap.ui.resource('sap.ui.ux3','img/colors-h.png')+"' />");r.renderControl(this.oSlider);r.write("<div id='"+this.id+"-grad' class='sapUiUx3ShellColorPickerGradient'></div>");r.write("<div id='"+this.id+"-marker' class='sapUiUx3ShellColorPickerMarker'></div>");r.write("<div id='"+this.id+"-preview' class='sapUiUx3ShellColorPickerPreview'></div>");r.renderControl(this.oOkBtn);r.renderControl(this.oCancelBtn);r.write("</div>");};S.prototype.markColorOnImage=function(c){var x=c.h*225;var y=(1-c.s)*75;Q.sap.byId(this.id+"-marker").css("left",x+10).css("top",y+10);};S.prototype.markColorOnSlider=function(c){this.oSlider.setValue(c.l);};S.prototype.adaptSliderBar=function(c){var g="";var m=Q.extend({},c);m.l=50;var a=S.hslToCss(m);if(!!sap.ui.Device.browser.firefox){g="-moz-linear-gradient(left, black, "+a+", white)";}else if(!!sap.ui.Device.browser.webkit){g="-webkit-gradient(linear, left center, right center, from(#000), color-stop(0.5, "+a+"), to(#FFF))";}Q.sap.byId(this.id+"-grad").css("background-image",g);};S.prototype.adaptPreview=function(c){Q.sap.byId(this.id+"-preview").css("background-color",S.hslToCss(c));};S.prototype.handleSlider=function(e){var l=e.getParameter("value");this.oCurrentColor.l=l;this.adaptPreview(this.oCurrentColor);this.fireLiveChange(this.oCurrentColor);};S.prototype.handleGeneralMouseDown=function(e){e.preventDefault();};S.prototype.handleMouseDown=function(e){this.handleMousePos(e);e.preventDefault();Q(document).bind("mousemove",Q.proxy(this.handleMousePos,this)).bind("mouseup",Q.proxy(this.handleMouseUp,this));};S.prototype.handleMouseUp=function(e){this.handleMousePos(e);Q(document).unbind("mousemove",this.handleMousePos).unbind("mouseup",this.handleMouseUp);};S.prototype.handleMousePos=function(e){var x=e.pageX-this._imgOffset.left;var y=e.pageY-this._imgOffset.top;x=Math.min(Math.max(x,0),225);y=Math.min(Math.max(y,0),75);var h=x/225;var s=1-y/75;this.oCurrentColor.h=h;this.oCurrentColor.s=s;this.adaptSliderBar(this.oCurrentColor);this.markColorOnImage(this.oCurrentColor);this.adaptPreview(this.oCurrentColor);this.fireLiveChange(this.oCurrentColor);};S.prototype.handleOk=function(){this.fireLiveChange(this.oCurrentColor);this.oPopup.close();};S.prototype.handleCancel=function(){this.fireLiveChange(this.oInitialColor);this.oPopup.close();};S.prototype.handleClose=function(){Q.sap.byId(this.id+"-img").unbind("mousedown",this.handleMouseDown);Q.sap.byId(this.id+"-marker").unbind("mousedown",this.handleMouseDown);Q(document).unbind("mousemove",this.handleMousePos).unbind("mouseup",this.handleMouseUp);Q.sap.byId(this.id).unbind("mousedown",this.handleGeneralMouseDown);this.oSlider.destroy();this.oSlider=null;this.oOkBtn.destroy();this.oOkBtn=null;this.oCancelBtn.destroy();this.oCancelBtn=null;var d=Q.sap.domById(this.id);d.parentNode.removeChild(d);this.oPopup.destroy();this.oPopup=null;};S.rgbToHsl=function(c){var r=c.r/255,g=c.g/255,b=c.b/255;var m=Math.max(r,g,b);var a=Math.min(r,g,b);var h,s,l=(m+a)/2;if(m==a){h=s=0;}else{var d=m-a;s=l>0.5?d/(2-m-a):d/(m+a);switch(m){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return{h:h,s:s,l:l*100};};S.hslToRgb=function(c){var r,g,b;var l=c.l/100;if(c.s==0){r=g=b=l;}else{var q=l<0.5?l*(1+c.s):l+c.s-l*c.s;var p=2*l-q;r=S.hueToRgb(p,q,c.h+1/3);g=S.hueToRgb(p,q,c.h);b=S.hueToRgb(p,q,c.h-1/3);}return[r*255,g*255,b*255];};S.hueToRgb=function(p,q,t){if(t<0){t+=1;}if(t>1){t-=1;}if(t<1/6){return p+(q-p)*6*t;}if(t<1/2){return q;}if(t<2/3){return p+(q-p)*(2/3-t)*6;}return p;};S.hslToCss=function(c){var r=S.hslToRgb(c);return"rgb("+Math.round(r[0])+","+Math.round(r[1])+","+Math.round(r[2])+")";};return S;},true);
