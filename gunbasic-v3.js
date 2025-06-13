/*
	@Project:	GunBasic-JS 3.1
	@Website:	Updated from original http://code.google.com/p/gunbasic-js/
	@Author: 	Gunesh Raj
	@Email: 	gunesh.raj@gmail.com
	@Version: 	3.1
	@License: 	GNU General Public License v2
	@Notes: 	Modern framework with XML tags, clean HTML attributes, and ASP-style templating, with loading internal template.
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

    // Bind g-get and g-post hooks to HTML elements
    bindHooks: function() {
        // Handle g-get attributes
        var getElements = document.querySelectorAll('[g-get]');
        for (var i = 0; i < getElements.length; i++) {
            this.bindElement(getElements[i], 'GET');
        }

        // Handle g-post attributes
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

        // Get additional parameters from separate attributes
        var args = element.getAttribute('g-args') || element.getAttribute('g-data') || '';
        var onStart = element.getAttribute('g-start');
        var onComplete = element.getAttribute('g-complete');
        
        // Convert function names to actual functions
        var startFunction = onStart ? window[onStart] : null;
        var completeFunction = onComplete ? window[onComplete] : null;
        
        // Validate functions exist
        if (onStart && typeof startFunction !== 'function') {
            this.glog("Warning: Start function '" + onStart + "' not found");
            startFunction = null;
        }
        if (onComplete && typeof completeFunction !== 'function') {
            this.glog("Warning: Complete function '" + onComplete + "' not found");
            completeFunction = null;
        }

        // Bind click event
        element.addEventListener('click', function(e) {
            e.preventDefault();
            self.autoajaxcall(null, method, url, args, startFunction, completeFunction);
        });
    },

    // Modern autoajax function - XML format only
    autoajax: function(vdata) {
        this.processXMLFormat(vdata);
    },

    processXMLFormat: function(vdata) {
        // Process g-data tags
        var gdataRegex = /<g-data\s+id=["']([^"']+)["']>([\s\S]*?)<\/g-data>/gi;
        var match;
        
        while ((match = gdataRegex.exec(vdata)) !== null) {
            var elementId = match[1];
            var content = match[2];
            
            // Process ASP-style tags within the content
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

        // Process g-run tags (execute after g-data updates)
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

    // Parse ASP-style tags within content
    parseASPTags: function(content) {
        var self = this;
        
        try {
            // Extract all statement blocks and combine them
            var statements = [];
            var tempContent = content;
            
            // Replace statement blocks with placeholders and collect them
            tempContent = tempContent.replace(/<%\s*(?!=)([\s\S]*?)%>/g, function(match, code) {
                statements.push(code);
                return '___ASP_STATEMENT_' + (statements.length - 1) + '___';
            });
            
            // Execute all statements in global scope to create variables
            if (statements.length > 0) {
                var combinedStatements = statements.join('\n');
                eval(combinedStatements);
            }
            
            // Remove statement placeholders
            tempContent = tempContent.replace(/___ASP_STATEMENT_\d+___/g, '');
            
            // Process expression blocks
            tempContent = tempContent.replace(/<%=\s*([\s\S]*?)\s*%>/g, function(match, expression) {
                try {
                    var result = eval(expression);
                    
                    // Convert result to string, handling various types
                    if (result === null || result === undefined) {
                        return '';
                    } else if (typeof result === 'object') {
                        return JSON.stringify(result);
                    } else {
                        return String(result);
                    }
                } catch (err) {
                    self.glog("Error in ASP expression: " + err.message);
                    return '[Error: ' + err.message + ']';
                }
            });
            
            return tempContent;
            
        } catch (err) {
            self.glog("Error in ASP processing: " + err.message);
            return content; // Return original content if processing fails
        }
    },

    // Core AJAX functionality
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

    // Utility functions
    glog: function(item) {
        try {
            if (window.console && console.log) {
                console.log('[GunBasic] ' + item);
            }
        } catch (error1) {
            // Silent fail
        }	
    },

    // Modern AJAX class
    ajaxStriker: function() {
        var xmlHTTP = null;
        var isCompleted = false;
        var isProcessing = false;

        // Initialize XMLHttpRequest (modern browsers)
        try { 
            xmlHTTP = new XMLHttpRequest(); 
        } catch (e) { 
            // Fallback for older browsers
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

    // Utility function for element visibility toggle
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

// loading interneal template, gets json and process and updates to the target id
function loadTemplate(apiUrl, templateId, targetId, onComplete) {
    return GunBasic.loadTemplate(apiUrl, templateId, targetId, onComplete);
}