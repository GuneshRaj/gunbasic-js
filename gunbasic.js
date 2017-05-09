/*
	@Project:	GunBasic-JS
	@Website:	http://code.google.com/p/gunbasic-js/
	@Author: 	Gunesh Raj
	@Email: 	gunesh.raj@gmail.com
	@Version: 	0.5
	@License: 	GNU General Public License v2
	@Notes: 	The Author reserves the right to change the Licence.
				Please Send me bugs & Notices via http://code.google.com/p/gunbasic-js/
*/


function glog(item) {
	try {
		//window.console.log(item);
	} catch (error1) {
		//alert(error1);
	}	
}

function getNameValue(xname, xdata) {
	var xres = '';
	var start = '<!-- [SGUN:' + xname + '] -->';
	var end = '<!-- [EGUN:' + xname + '] -->';
	var a1 = xdata.indexOf(start) + start.length;
	var a2 = xdata.indexOf(end);
	if (a1 > 0 && a2 > 0) {
		xres = xdata.substring(a1, a2);
	}
	return xres;
}

function getMetaNameValue(xcode, xname, xdata) {
	var xres = '';
	try {
		var start = '<!-- [S' + xcode + ':' + xname + '] -->';
		var end = '<!-- [E' + xcode + ':' + xname + '] -->';
		var a1 = xdata.indexOf(start) + start.length;
		var a2 = xdata.indexOf(end);
		if (a1 > 0 && a2 > 0) {
			xres = xdata.substring(a1, a2);
		}
	} catch (error1) {
		//alert(error1);
	}
	return xres;
}

// Not exactly the GunBasic method, just added it for easier toggle access.
function toggleLayer( whichLayer ) {
  var elem, vis;
  if( document.getElementById ) 
    elem = document.getElementById( whichLayer );
  else if( document.all ) 
      elem = document.all[whichLayer];
  else if( document.layers ) 
    elem = document.layers[whichLayer];
  vis = elem.style;
  if(vis.display==''&&elem.offsetWidth!=undefined&&elem.offsetHeight!=undefined)
    vis.display = (elem.offsetWidth!=0&&elem.offsetHeight!=0)?'block':'none';
  vis.display = (vis.display==''||vis.display=='block')?'none':'block';
}

function autoajax(vdata) {
// get directory first.
// GUN - div
// VAR - Javasript variables - Ops, not done, VAL should suit better.
// VAL - Javascript evaluation

// <!-- [SGUN:] -->
// name|age|nric|
// <!-- [EGUN:] -->
//
// <!-- [SVAR:] -->
// name(1)|age(2)|nric(1)|
// <!-- [EVAR:] -->
//
// <!-- [SVAL:] -->
// name|age|nric|
// <!-- [EVAL:] -->
//

	var metadiv = getMetaNameValue('GUN', '', vdata);
	var metavar = getMetaNameValue('VAR', '', vdata);
	var metaval = getMetaNameValue('VAL', '', vdata);
	
// Parse to Array
	var arrdiv = metadiv.split("|");
	var arrvar = metavar.split("|");
	var arrval = metaval.split("|");

	var idiv = arrdiv.length;
	var ivar = arrvar.length;
	var ival = arrval.length;


	
// Val	
	for (i=0; i < ival; i++) {
		var sx = trim(arrval[i]);
		if (sx.length > 0) {
			var datax = '';
			try {	
				datax = trim(getMetaNameValue('VAL', sx, vdata));
				eval(datax);
			} catch (err) {
				glog("Error in Eval");	
			}	
		}	
	}		

// Div	
	for (i=0; i < idiv; i++) {
		var sx = trim(arrdiv[i]);
		//glog(sx);
		if (sx.length > 0) {
			var datax = '';
			try {
				datax = trim(getMetaNameValue('GUN', sx, vdata));
				//glog(datax);
				document.getElementById(sx).innerHTML = datax;
			} catch (err) {
			}	
		}	
	}	



}

function autoeval(objAJAX, path) {
	if (objAJAX == null) {
		objAJAX = new ajaxStriker();
		objAJAX.connectDiv(path,'GET','',autoevalresponse, null);	
 	} 	
}

function autoevalresponse(objAJAX) {
	var dx = (objAJAX.responseText);
	eval(dx);
}

function autoajaxcall (objAJAX, method, path, query) {
	if (objAJAX == null) {
		objAJAX = new ajaxStriker();
		objAJAX.connect(path,method,query,autoajaxcall);
		//glog("-1");
 	} else {
		var dx = (objAJAX.responseText);
		autoajax(dx);
		//glog("-2");
	}
}

function autoajaxcall (objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete) {
	if (objAJAX == null) {
		if (vfunctionOnStart != null) {
			vfunctionOnStart();
		}
		objAJAX = new ajaxStriker();
		objAJAX.connect(path,method,query,autoajaxcall,vfunctionOnComplete);
		//glog("-1");
 	} else {
		var dx = (objAJAX.responseText);
		autoajax(dx);
		//glog("-2");
		//vfunctionOnComplete();
	}
}


function autoloadtodiv(objAJAX, path, todiv) {
	if (objAJAX == null) {
		objAJAX = new ajaxStriker();
		objAJAX.connectDiv(path,'GET','',loadtodivfromajax, todiv);	
 	} 	
}

function loadtodivfromajax(objAJAX, todiv) {
	var dx = (objAJAX.responseText);
	document.getElementById(todiv).innerHTML = dx;
}

function trim(stringToTrim) {
	var res = '';
	try {
		if (stringToTrim.length > 0) {
			res = stringToTrim.replace(/^\s+|\s+$/g,"");
		}
	} catch (err) {
	}		
	return res;
}

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}

function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}


function ajaxStriker() {
  this.connect = function(sUrlAjax, sAjaxMethod, sUrlParams, vfunctionOnComplete, vfunctionClientOnComplete) {
    if(null==xmlHTTP) {
		return(false);
	}
	  
    this.isCompleted = false;
	this.isProcessing = true;
	
    sAjaxMethod = sAjaxMethod.toUpperCase();

    try {
      if (sAjaxMethod == "GET") {
        xmlHTTP.open(sAjaxMethod, sUrlAjax+"?"+sUrlParams, true);
				this.sPreviousCall = sUrlAjax+"?"+sUrlParams;
        sUrlParams = "";
      } else {
        xmlHTTP.open(sAjaxMethod, sUrlAjax, true);
        xmlHTTP.setRequestHeader("Method", "POST "+sUrlAjax+" HTTP/1.1");
        xmlHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      }
	  
      xmlHTTP.onreadystatechange = function() {
      if (xmlHTTP.readyState == 4 && !isCompleted) {
        this.isCompleted = true;
		  	this.isProcessing = false;
        vfunctionOnComplete(xmlHTTP);
		  if (vfunctionClientOnComplete != null) {
		  	vfunctionClientOnComplete();
		  }
        }
	  };
	  
      xmlHTTP.send(sUrlParams);
    } catch(e) {
	  return(false);
	}
    return(true);
  };



	this.connectDiv = function(sUrlAjax, sAjaxMethod, sUrlParams, vfunctionOnComplete, sDivRecieving) {
    if(null==xmlHTTP) {
		return(false);
	}
	  
    this.isCompleted = false;
	this.isProcessing = true;
	
    sAjaxMethod = sAjaxMethod.toUpperCase();

    try {
      if (sAjaxMethod == "GET") {
        xmlHTTP.open(sAjaxMethod, sUrlAjax+"?"+sUrlParams, true);
		this.sPreviousCall = sUrlAjax+"?"+sUrlParams;
        sUrlParams = "";
      } else {
        xmlHTTP.open(sAjaxMethod, sUrlAjax, true);
        xmlHTTP.setRequestHeader("Method", "POST "+sUrlAjax+" HTTP/1.1");
        xmlHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      }
	  
      xmlHTTP.onreadystatechange = function() {
        if (xmlHTTP.readyState == 4 && !isCompleted) {
          this.isCompleted = true;
		  this.isProcessing = false;
          vfunctionOnComplete(xmlHTTP, sDivRecieving);
        }
	  };
	  
      xmlHTTP.send(sUrlParams);
    } catch(e) {
	  return(false);
	}
	
    return(true);		
		
	};


  var xmlHTTP = null;
  var isCompleted = false;
  var isProcessing = false;
  var sPreviousCall = "";
  
  try { 
  	xmlHTTP = new ActiveXObject("Msxml2.XMLHTTP"); 
  } catch (e) { 
    try { 
	  xmlHTTP = new ActiveXObject("Microsoft.XMLHTTP"); 
	} catch (e) { 
	  try { 
	    xmlHTTP = new XMLHttpRequest(); 
	  } catch (e) { 
	    xmlHTTP = null; 
	  }
	}
  }
  
  if(null==xmlHTTP) {
    return(null);
  }
  return(this);
}


