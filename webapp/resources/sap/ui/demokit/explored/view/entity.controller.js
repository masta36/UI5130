/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/demokit/EntityInfo"],function(C,E){"use strict";return C.extend("sap.ui.demokit.explored.view.entity",{onInit:function(){this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRoutePatternMatched(this.onRouteMatched,this);this._component=sap.ui.core.Component.getOwnerComponentFor(this.getView());},onTypeLinkPress:function(e){var t=e.getSource().data("type");this.router.navTo("entity",{id:t,part:"samples"},false);this._component.getEventBus().publish("app","selectEntity",{id:t});},onIntroLinkPress:function(e){var p=document.location.pathname.split("/"),b=document.location.origin+p.splice(0,p.length-1).join("/")+"/";window.open(b+this.getView().getModel().getProperty("/docuLink"),"_blank");},onTabSelect:function(e){var t=e.getParameter("key");this.router.navTo("entity",{id:this._sId,part:t},true);},onNavBack:function(e){this.router.myNavBack("home",{});},onNavToSample:function(e){var p=e.getSource().getBindingContext("entity").getPath();var s=this.getView().getModel("entity").getProperty(p);this.router.navTo("sample",{id:s.id});},_TAB_KEYS:["sampes","about","properties","aggregations","associations","events","methods"],onRouteMatched:function(e){var r=e.getParameter("name"),n=e.getParameter("arguments").id,N=e.getParameter("arguments").part;if(r!=="entity"){return;}var o=this.getView().getModel("entity");var p=sap.ui.demokit.explored.util.ObjectSearch.getEntityPath(o.getData(),n);var a=(p)?o.getProperty(p):null;var b=!!p;var h=sap.ui.core.routing.History.getInstance();var P=h.getPreviousHash();var s=sap.ui.Device.system.phone||(!b&&!!P);this.getView().byId("page").setShowNavButton(s);var d;if(this._sId!==n){var D=E.getEntityDocu(n);if(!a&&!D){this.router.myNavToWithoutHash("sap.ui.demokit.explored.view.notFound","XML",false,{path:n});return;}d=this._getViewData(n,D,a);var m=new sap.ui.model.json.JSONModel(d);this.getView().setModel(m);this.getView().bindElement("entity>"+p);this._sId=n;}else{d=this.getView().getModel().getData();}if(this._TAB_KEYS.indexOf(N)===-1){N="samples";}if(!d.show[N]){N="samples";}var t=this.getView().byId("tabBar");if(N!==t.getSelectedKey()&&t.getExpanded()){t.setSelectedKey(N);}},onToggleFullScreen:function(e){sap.ui.demokit.explored.util.ToggleFullScreenHandler.updateMode(e,this.getView());},_getViewData:function(i,d,e){var D=this._convertEntityInfo(i,d),s=false,S=0;if(e){if(!D.shortDescription&&e.description){D.shortDescription=e.description;}if(e.docuLink){D.show.introLink=true;D.docuLink=e.docuLink;}s=e.samples.length>0;S=e.samples.length;}D.show.samples=s;D.count.samples=S;return D;},_convertEntityInfo:function(I,d){var D={name:I,deprecated:(d)?this._formatDeprecated(d.deprecation):null,deprecatedMark:(d)?this._createDeprecatedMark(d.deprecation):null,baseType:(d)?this._formatType(d.baseType):null,baseTypeText:(d)?this._formatTypeText(d.baseType):"-",baseTypeNav:(d)?this._formatTypeNav(d.baseType):null,shortDescription:(d)?this._formatDeprecatedDescription(d.deprecation):null,description:(d)?this._wrapInSpanTag(d.doc):null,docuLink:null,properties:[],events:[],methods:[],aggregations:[],associations:[],values:[],show:{baseType:(d)?!!d.baseType:false,about:!!d,properties:false,events:false,methods:false,aggregations:false,associations:false,values:false,introActive:false},count:{properties:0,events:0,methods:0,aggregations:0,associations:0},appComponent:this._takeControlComponent(I)};var m=0,e=0;if(!d){return D;}var k=null;for(k in d.properties){if(d.properties.hasOwnProperty(k)&&k.indexOf("_")!==0){var P=d.properties[k];P.name=k;P.deprecatedDescription=this._formatDeprecatedDescription(P.deprecation);P.deprecated=this._formatDeprecated(P.deprecation);P.doc=this._wrapInSpanTag(P.doc);P.typeText=this._formatTypeText(P.type);P.typeNav=this._formatTypeNav(P.type);P.type=this._formatType(P.type);P.defaultValue=(P.defaultValue)?String(P.defaultValue).replace("empty/undefined","-"):"";D.properties.push(P);}}for(k in d.events){if(d.events.hasOwnProperty(k)&&k.indexOf("_")!==0){var o=d.events[k];o.name=k;o.deprecatedDescription=this._formatDeprecatedDescription(o.deprecation);o.deprecated=this._formatDeprecated(o.deprecation);o.doc=this._wrapInSpanTag(o.doc);D.events.push(o);e++;for(var p in o.parameters){if(o.parameters.hasOwnProperty(p)&&p.indexOf("_")!==0){D.events.push({param:p,since:o.parameters[p].since,typeText:this._formatTypeText(o.parameters[p].type),typeNav:this._formatTypeNav(o.parameters[p].type),type:this._formatType(o.parameters[p].type),doc:this._wrapInSpanTag(o.parameters[p].doc),deprecatedDescription:this._formatDeprecatedDescription(o.parameters[p].deprecation),deprecated:this._formatDeprecated(o.parameters[p].deprecation)});}}}}for(k in d.methods){if(d.methods.hasOwnProperty(k)&&k.indexOf("_")!==0){var M=d.methods[k];M.name=k;M.deprecatedDescription=this._formatDeprecatedDescription(M.deprecation);M.deprecated=this._formatDeprecated(M.deprecation);M.doc=this._wrapInSpanTag(M.doc);M.param="returnValue";M.typeText=this._formatTypeText(M.type);M.typeNav=this._formatTypeNav(M.type);M.type=this._formatType(M.type);D.methods.push(M);m++;for(var i=0;i<M.parameters.length;i++){var s=M.parameters[i].name;if(s.indexOf("_")!==0){D.methods.push({param:s,since:M.parameters[i].since,typeText:this._formatTypeText(M.parameters[i].type),typeNav:this._formatTypeNav(M.parameters[i].type),type:this._formatType(M.parameters[i].type),doc:this._wrapInSpanTag(M.parameters[i].doc),deprecatedDescription:this._formatDeprecatedDescription(M.parameters[i].deprecation),deprecated:this._formatDeprecated(M.parameters[i].deprecation)});}}}}for(k in d.aggregations){var a=d.aggregations[k];var n=(!a.hasOwnProperty("visibility")||a.visibility!=="hidden");if(d.aggregations.hasOwnProperty(k)&&k.indexOf("_")!==0&&n){a.name=k;a.deprecated=this._formatDeprecated(a.deprecation);a.deprecatedDescription=this._formatDeprecatedDescription(a.deprecation);a.doc=this._wrapInSpanTag(a.doc);a.typeText=this._formatTypeText(a.type);a.typeNav=this._formatTypeNav(a.type);a.type=this._formatType(a.type);D.aggregations.push(a);}}for(k in d.associations){if(d.associations.hasOwnProperty(k)&&k.indexOf("_")!==0){var A=d.associations[k];A.name=k;A.deprecatedDescription=this._formatDeprecatedDescription(A.deprecation);A.deprecated=this._formatDeprecated(A.deprecation);A.doc=this._wrapInSpanTag(A.doc);A.typeText=this._formatTypeText(A.type);A.typeNav=this._formatTypeNav(A.type);A.type=this._formatType(A.type);D.associations.push(A);}}for(k in d.values){if(d.values.hasOwnProperty(k)&&k.indexOf("_")!==0){var v=d.values[k];v.name=k;v.deprecatedDescription=this._formatDeprecatedDescription(v.deprecation);v.deprecated=this._formatDeprecated(v.deprecation);D.values.push(v);}}D.show.properties=D.properties.length>0;D.show.events=e>0;D.show.methods=m>0;D.show.aggregations=D.aggregations.length>0;D.show.associations=D.associations.length>0;D.show.values=D.values.length>0;D.count.properties=D.properties.length;D.count.events=e;D.count.methods=m;D.count.aggregations=D.aggregations.length;D.count.associations=D.associations.length;return D;},_wrapInSpanTag:function(t){return'<span class="fs0875">'+t+'</span>';},_formatDeprecated:function(d){return(d&&d.length>0)?"true":"false";},_formatDeprecatedDescription:function(d){return(d&&d.length>0)?(this._createDeprecatedMark(d)+": "+d):null;},_formatType:function(t){if(!t){return null;}else{return t.replace("[]","");}},_formatTypeText:function(t){if(!t){return null;}else{t=t.replace("sap.ui.core.","");var i=t.lastIndexOf(".");return(i!==-1)?t.substr(i+1):t;}},_createDeprecatedMark:function(d){return(d)?this.getView().getModel("i18n").getProperty("deprecated"):"";},_baseTypes:["sap.ui.core.any","sap.ui.core.object","sap.ui.core.function","sap.ui.core.number","sap.ui.core.float","sap.ui.core.int","sap.ui.core.boolean","sap.ui.core.string","sap.ui.core.URI","sap.ui.core.ID","sap.ui.core.void","sap.ui.core.CSSSize","any","object","function","float","int","boolean","string"],_formatTypeNav:function(t){return this._baseTypes.indexOf(t)===-1;},_takeControlComponent:function(c){var l=sap.ui.demokit.explored.data.libComponentInfos;jQuery.sap.require("sap.ui.core.util.LibraryInfo");var L=new sap.ui.core.util.LibraryInfo();var a=L._getActualComponent(l,c);return a;}});});
