/*
	@Project:	GunBasic-JS 3.0
	@Website:	Updated from original http://code.google.com/p/gunbasic-js/
	@Author: 	Gunesh Raj
	@Email: 	gunesh.raj@gmail.com
	@Version: 	3.0
	@License: 	GNU General Public License v2
	@Notes: 	Modern framework with XML tags, clean HTML attributes, and ASP-style templating
				NO backward compatibility - clean, modern approach only
*/


// Initialize GunBasic when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    GunBasic.init();
});

var GunBasic = {
    
    init: function() {
        this.bindHooks();
    },

    bindHooks: function() {
        var getElements = document.querySelectorAll('[g-get]');
        for (var i = 0; i < getElements.length; i++) {
            this.bindElement(getElements[i], 'GET');
        }

        var postElements = document.querySelectorAll('[g-post]');
        for (var i = 0; i < postElements.length; i++) {
            this.bindElement(postElements[i], 'POST');
        }
    },

    bindElement: function(element, method) {
        var self = this;
        var urlAttribute = method === 'GET' ? 'g-get' : 'g-post';
        var url = element.getAttribute(urlAttribute);
        
        if (!url) return;

        var args = element.getAttribute('g-args') || element.getAttribute('g-data') || '';
        var onStart = element.getAttribute('g-start');
        var onComplete = element.getAttribute('g-complete');
        
        var startFunction = onStart ? window[onStart] : null;
        var completeFunction = onComplete ? window[onComplete] : null;
        
        if (onStart && typeof startFunction !== 'function') {
            this.glog("Warning: Start function '" + onStart + "' not found");
            startFunction = null;
        }
        if (onComplete && typeof completeFunction !== 'function') {
            this.glog("Warning: Complete function '" + onComplete + "' not found");
            completeFunction = null;
        }

        element.addEventListener('click', function(e) {
            e.preventDefault();
            self.autoajaxcall(null, method, url, args, startFunction, completeFunction);
        });
    },

    autoajax: function(vdata) {
        this.processXMLFormat(vdata);
    },

    processXMLFormat: function(vdata) {
        var gdataRegex = /<g-data\s+id=["']([^"']+)["']>([\s\S]*?)<\/g-data>/gi;
        var match;
        
        while ((match = gdataRegex.exec(vdata)) !== null) {
            var elementId = match[1];
            var content = match[2];
            
            // FIXED: Use the new ASP parsing logic
            content = this.parseASPTags(content);
            
            try {
                var element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = content;
                }
            } catch (err) {
                this.glog("Error updating element: " + elementId + " - " + err.message);
            }
        }

        var grunRegex = /<g-run>([\s\S]*?)<\/g-run>/gi;
        
        while ((match = grunRegex.exec(vdata)) !== null) {
            var jsCode = match[1];
            
            try {
                eval(jsCode);
            } catch (err) {
                this.glog("Error in g-run execution: " + err.message);
            }
        }
    },

    // COMPLETELY REWRITTEN ASP PARSER - FIXES LOOP ISSUE
    parseASPTags: function(content) {
        var self = this;
        
        try {
            this.glog("ASP: Processing content with new parser");
            
            // Convert ASP tags to JavaScript template approach
            var jsCode = 'var __output = "";\n';
            var currentPos = 0;
            
            // Find all ASP tags and content between them
            var aspRegex = /<%\s*(?!=)([\s\S]*?)%>|<%=\s*([\s\S]*?)\s*%>/g;
            var match;
            
            while ((match = aspRegex.exec(content)) !== null) {
                // Add any HTML content before this ASP tag as output
                var htmlContent = content.substring(currentPos, match.index);
                if (htmlContent) {
                    jsCode += '__output += ' + JSON.stringify(htmlContent) + ';\n';
                }
                
                if (match[1] !== undefined) {
                    // This is a statement block <% code %>
                    jsCode += match[1] + '\n';
                } else if (match[2] !== undefined) {
                    // This is an expression block <%= expression %>
                    jsCode += '__output += String(' + match[2] + ');\n';
                }
                
                currentPos = aspRegex.lastIndex;
            }
            
            // Add any remaining HTML content
            var remainingContent = content.substring(currentPos);
            if (remainingContent) {
                jsCode += '__output += ' + JSON.stringify(remainingContent) + ';\n';
            }
            
            jsCode += 'return __output;';
            
            // Log the generated JavaScript for debugging
            this.glog("ASP: Generated JavaScript:");
            this.glog(jsCode);
            
            // Execute the generated JavaScript
            try {
                var func = new Function(jsCode);
                var result = func.call({});
                this.glog("ASP: Execution successful, result length: " + result.length);
                return result;
            } catch (err) {
                this.glog("ASP: Error executing generated code: " + err.message);
                this.glog("ASP: Generated code was: " + jsCode);
                return content;
            }
            
        } catch (err) {
            this.glog("ASP: Error in parsing: " + err.message);
            return content;
        }
    },

    autoajaxcall: function(objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete) {
        if (objAJAX == null) {
            this.glog("Starting AJAX call: " + method + " " + path);
            if (vfunctionOnStart != null) {
                this.glog("Calling start function");
                vfunctionOnStart();
            }
            objAJAX = new this.ajaxStriker();
            var self = this;
            objAJAX.connect(path, method, query, function(ajax) {
                self.glog("AJAX response received");
                var dx = ajax.responseText;
                self.autoajax(dx);
                if (vfunctionOnComplete != null) {
                    self.glog("Calling complete function");
                    vfunctionOnComplete();
                }
            });
        }
    },

    glog: function(item) {
        try {
            if (window.console && console.log) {
                console.log('[GunBasic] ' + item);
            }
        } catch (error1) {
            // Silent fail
        }	
    },

    ajaxStriker: function() {
        var xmlHTTP = null;
        var isCompleted = false;
        var isProcessing = false;

        try { 
            xmlHTTP = new XMLHttpRequest(); 
        } catch (e) { 
            try { 
                xmlHTTP = new ActiveXObject("Msxml2.XMLHTTP"); 
            } catch (e) { 
                try { 
                    xmlHTTP = new ActiveXObject("Microsoft.XMLHTTP"); 
                } catch (e) { 
                    xmlHTTP = null; 
                }
            }
        }

        if (xmlHTTP == null) {
            return null;
        }

        this.connect = function(sUrlAjax, sAjaxMethod, sUrlParams, vfunctionOnComplete) {
            if (xmlHTTP == null) {
                return false;
            }
            
            this.isCompleted = false;
            this.isProcessing = true;
            
            sAjaxMethod = sAjaxMethod.toUpperCase();

            try {
                if (sAjaxMethod == "GET") {
                    var url = sUrlAjax;
                    if (sUrlParams) {
                        url += (sUrlAjax.indexOf('?') > -1 ? '&' : '?') + sUrlParams;
                    }
                    xmlHTTP.open(sAjaxMethod, url, true);
                } else {
                    xmlHTTP.open(sAjaxMethod, sUrlAjax, true);
                    xmlHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                }
                
                var self = this;
                xmlHTTP.onreadystatechange = function() {
                    if (xmlHTTP.readyState == 4 && !self.isCompleted) {
                        self.isCompleted = true;
                        self.isProcessing = false;
                        if (vfunctionOnComplete) {
                            vfunctionOnComplete(xmlHTTP);
                        }
                    }
                };
                
                xmlHTTP.send(sUrlParams || null);
            } catch(e) {
                return false;
            }
            
            return true;
        };

        return this;
    },

    toggleElement: function(elementId) {
        var element = document.getElementById(elementId);
        if (!element) return;
        
        var isVisible = element.style.display !== 'none';
        element.style.display = isVisible ? 'none' : 'block';
    }
};

// Public API functions
function autoajaxcall(objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete) {
    return GunBasic.autoajaxcall(objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete);
}

function toggleElement(elementId) {
    return GunBasic.toggleElement(elementId);
}