/*
	@Project:	GunBasic-JS 3.4
	@Website:	Updated from original http://code.google.com/p/gunbasic-js/
	@Author: 	Gunesh Raj
	@Email: 	gunesh.raj@gmail.com
	@Version: 	3.4
	@License: 	GNU General Public License v2
	@Notes: 	Modern framework with XML tags, clean HTML attributes, and ASP-style templating, with loading internal template and SwiftUI Style UI Declarations
				NO backward compatibility - clean, modern approach only
                FYI - Messed up merging workflows. Older functions may be missing in incremental versions as I would refactor into new functions and often forget to merge back. Not a feature, but an introduced bug.
*/


// Initialize GunBasic when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    GunBasic.init();
});

var GunBasic = {
    version: "3.4.0",
    debugMode: false,

    // === INITIALIZATION SYSTEM ===
    init: function() {
        this.glog("GunBasic " + this.version + " initializing...");
        this.bindHooks();
        this.glog("GunBasic initialization complete");
    },

    bindHooks: function() {
        this.glog("Binding DOM hooks...");
        
        var getElements = document.querySelectorAll('[g-get]');
        for (var i = 0; i < getElements.length; i++) {
            this.bindElement(getElements[i], 'GET');
        }

        var postElements = document.querySelectorAll('[g-post]');
        for (var i = 0; i < postElements.length; i++) {
            this.bindElement(postElements[i], 'POST');
        }
        
        this.glog("Bound " + (getElements.length + postElements.length) + " elements");
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
        
        this.glog("Bound " + method + " to " + url);
    },

    // === RESPONSE PROCESSING SYSTEM ===
    autoajax: function(vdata) {
        this.glog("Processing server response...");
        this.processXMLFormat(vdata);
    },

    processXMLFormat: function(vdata) {
        this.glog("Processing XML format response");
        
        // Process g-data tags
        var gdataRegex = /<g-data\s+id=["']([^"']+)["']>([\s\S]*?)<\/g-data>/gi;
        var match;
        var updateCount = 0;
        
        while ((match = gdataRegex.exec(vdata)) !== null) {
            var elementId = match[1];
            var content = match[2];
            
            // Process ASP tags in content
            content = this.parseASPTags(content);
            
            try {
                var element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = content;
                    updateCount++;
                    this.glog("Updated element: " + elementId);
                } else {
                    this.glog("Warning: Element not found: " + elementId);
                }
            } catch (err) {
                this.glog("Error updating element: " + elementId + " - " + err.message);
            }
        }

        // Process g-run tags
        var grunRegex = /<g-run>([\s\S]*?)<\/g-run>/gi;
        var scriptCount = 0;
        
        while ((match = grunRegex.exec(vdata)) !== null) {
            var jsCode = match[1];
            
            try {
                eval(jsCode);
                scriptCount++;
                this.glog("Executed g-run script block");
            } catch (err) {
                this.glog("Error in g-run execution: " + err.message);
            }
        }
        
        this.glog("Response processing complete: " + updateCount + " elements updated, " + scriptCount + " scripts executed");
    },

    // === CORE AJAX SYSTEM ===
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
                self.glog("AJAX response received, status: " + ajax.status);
                if (ajax.status === 200) {
                    var dx = ajax.responseText;
                    self.autoajax(dx);
                } else {
                    self.glog("AJAX error: " + ajax.status + " - " + ajax.statusText);
                }
                if (vfunctionOnComplete != null) {
                    self.glog("Calling complete function");
                    vfunctionOnComplete();
                }
            });
        }
    },

    // === LOGGING SYSTEM ===
    glog: function(msg) {
        if (this.debugMode) {
            try {
                if (window.console && console.log) {
                    console.log('[GunBasic] ' + msg);
                }
            } catch (error1) {
                // Silent fail
            }
        }
    },

    setDebug: function(debug) {
        this.debugMode = debug;
        this.glog("Debug mode " + (debug ? "enabled" : "disabled"));
    },

    // === UTILITY FUNCTIONS ===
    toggleElement: function(elementId) {
        var element = document.getElementById(elementId);
        if (!element) {
            this.glog("Warning: Element not found for toggle: " + elementId);
            return;
        }
        
        var isVisible = element.style.display !== 'none';
        element.style.display = isVisible ? 'none' : 'block';
        this.glog("Toggled element " + elementId + " to " + (isVisible ? "hidden" : "visible"));
    },

    // === AJAX WRAPPER ===
    ajaxStriker: function() {
        return {
            connect: function(url, method, data, callback) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                
                if (method.toUpperCase() === 'POST') {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (callback) {
                            callback({
                                status: xhr.status,
                                responseText: xhr.responseText,
                                statusText: xhr.statusText
                            });
                        }
                    }
                };
                
                if (method.toUpperCase() === 'GET' && data) {
                    url += (url.indexOf('?') > -1 ? '&' : '?') + data;
                    xhr.send();
                } else {
                    xhr.send(data || null);
                }
                
                return xhr;
            }
        };
    },

    // === ASP TEMPLATING SYSTEM ===
    parseASPTagsWithData: function(content, jsonData) {
        var self = this;
        
        try {
            this.glog("ASP: Starting parse with JSON data");
            
            var aspPattern = /<%\s*([\s\S]*?)\s*%>/g;
            var result = content.replace(aspPattern, function(match, code) {
                self.glog("ASP: Processing code block");
                
                try {
                    var variableDeclarations = [];
                    for (var key in jsonData) {
                        if (jsonData.hasOwnProperty(key)) {
                            variableDeclarations.push('var ' + key + ' = ' + JSON.stringify(jsonData[key]) + ';');
                        }
                    }
                    
                    var jsCode = 'var __output = "";\n' +
                        variableDeclarations.join('\n') + '\n' +
                        code + '\n' +
                        'if (typeof __output !== "undefined") { return __output; } else { return ""; }';
                    
                    var func = new Function(jsCode);
                    var output = func.call({});
                    self.glog("ASP: Code executed successfully, output length: " + output.length);
                    return output;
                } catch (err) {
                    self.glog("ASP: Error executing code: " + err.message);
                    return match;
                }
            });
            
            this.glog("ASP: Parse completed");
            return result;
            
        } catch (err) {
            this.glog("ASP: Error in parseASPTagsWithData: " + err.message);
            return content;
        }
    },

    parseASPTags: function(content) {
        var self = this;
        
        try {
            this.glog("ASP: Processing content with enhanced parser");
            
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
            
            // Execute the generated JavaScript
            try {
                var func = new Function(jsCode);
                var result = func.call({});
                this.glog("ASP: Execution successful, result length: " + result.length);
                return result;
            } catch (err) {
                this.glog("ASP: Error executing generated code: " + err.message);
                return content;
            }
            
        } catch (err) {
            this.glog("ASP: Error in parsing: " + err.message);
            return content;
        }
    },

    // === TEMPLATE LOADING SYSTEM ===
    loadTemplate: function(apiUrl, templateId, targetId, onComplete) {
        var self = this;
        
        this.glog("LoadTemplate: Starting - API: " + apiUrl + ", Template: " + templateId + ", Target: " + targetId);
        
        var ajax = new this.ajaxStriker();
        ajax.connect(apiUrl, 'GET', '', function(response) {
            try {
                self.glog("LoadTemplate: API response received, status: " + response.status);
                
                if (response.status === 200) {
                    var jsonData;
                    try {
                        jsonData = JSON.parse(response.responseText);
                        self.glog("LoadTemplate: JSON parsed successfully");
                    } catch (parseError) {
                        self.glog("LoadTemplate: JSON parse error - " + parseError.message);
                        return;
                    }
                    
                    var templateElement = document.querySelector('[g-data="' + templateId + '"], #' + templateId);
                    if (!templateElement) {
                        self.glog("LoadTemplate: Template element not found - " + templateId);
                        return;
                    }
                    
                    var templateContent = templateElement.innerHTML;
                    self.glog("LoadTemplate: Template content retrieved, length: " + templateContent.length);
                    
                    var processedContent = self.parseASPTagsWithData(templateContent, jsonData);
                    self.glog("LoadTemplate: Template processed, result length: " + processedContent.length);
                    
                    var targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.innerHTML = processedContent;
                        self.glog("LoadTemplate: Content inserted into target element");
                    } else {
                        self.glog("LoadTemplate: Error - Target element '" + targetId + "' not found");
                    }
                    
                    if (onComplete && typeof onComplete === 'function') {
                        self.glog("LoadTemplate: Calling completion callback");
                        onComplete(jsonData, processedContent);
                    }
                    
                } else {
                    self.glog("LoadTemplate: API error - Status: " + response.status);
                }
            } catch (error) {
                self.glog("LoadTemplate: Error processing response - " + error.message);
            }
        });
    },

    // UI processor integration
    // Dont modify this code. Its pretty bad. I will implement a plug in framework. Maybe by next year.
    processUI: function(uiCode, jsonData) {
        // ES5 Fix: Remove default parameter
        if (typeof jsonData === 'undefined') {
            jsonData = {};
        }
        
        var self = this;
        
        try {
            this.glog("UI: Processing UI code");
            
            // ES5 Fix: Create context object manually instead of using spread operator
            var context = {};
            
            // Add JSON data properties
            for (var key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {
                    context[key] = jsonData[key];
                }
            }
            
            // Add UI component functions
            context.VStack = this.createVStack.bind(this);
            context.HStack = this.createHStack.bind(this);
            context.Text = this.createText.bind(this);
            context.TextField = this.createTextField.bind(this);
            context.TextArea = this.createTextArea.bind(this);
            context.Button = this.createButton.bind(this);
            context.RadioGroup = this.createRadioGroup.bind(this);
            context.Select = this.createSelect.bind(this);
            context.DropdownMenu = this.createDropdownMenu.bind(this);
            context.Pagination = this.createPagination.bind(this);
            context.Checkbox = this.createCheckbox.bind(this);
            context.Toggle = this.createToggle.bind(this);
            context.Badge = this.createBadge.bind(this);
            context.Alert = this.createAlert.bind(this);
            context.Card = this.createCard.bind(this);
            context.Modal = this.createModal.bind(this);
            context.List = this.createList.bind(this);
            context.Spacer = this.createSpacer.bind(this);
            
            // ES5 Fix: Build variable declarations manually
            var variableDeclarations = [];
            for (var key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {
                    variableDeclarations.push('var ' + key + ' = arguments[0].' + key + ';');
                }
            }
            
            // Execute UI code in context
            var jsCode = '(function() {' +
                variableDeclarations.join('\n') +
                'var VStack = arguments[0].VStack;' +
                'var HStack = arguments[0].HStack;' +
                'var Text = arguments[0].Text;' +
                'var TextField = arguments[0].TextField;' +
                'var TextArea = arguments[0].TextArea;' +
                'var Button = arguments[0].Button;' +
                'var RadioGroup = arguments[0].RadioGroup;' +
                'var Select = arguments[0].Select;' +
                'var DropdownMenu = arguments[0].DropdownMenu;' +
                'var Pagination = arguments[0].Pagination;' +
                'var Checkbox = arguments[0].Checkbox;' +
                'var Toggle = arguments[0].Toggle;' +
                'var Badge = arguments[0].Badge;' +
                'var Alert = arguments[0].Alert;' +
                'var Card = arguments[0].Card;' +
                'var Modal = arguments[0].Modal;' +
                'var List = arguments[0].List;' +
                'var Spacer = arguments[0].Spacer;' +
                uiCode +
                '})';
            
            this.glog("UI: Generated execution code");
            
            try {
                var func = new Function('return ' + jsCode)();
                var component = func.call(null, context);
                
                if (component) {
                    var result = this.renderUIComponent(component);
                    this.glog("UI: Processing successful, result length: " + result.length);
                    return result;
                } else {
                    this.glog("UI: No component returned");
                    return '<div class="alert alert-warning">UI component could not be rendered</div>';
                }
            } catch (err) {
                this.glog("UI: Error executing code: " + err.message);
                return '<div class="alert alert-danger">UI Error: ' + err.message + '</div>';
            }
            
        } catch (err) {
            this.glog("UI: Error in processing: " + err.message);
            return '<div class="alert alert-danger">Processing Error: ' + err.message + '</div>';
        }
    },

    // Enhanced loadTemplate to support UI processing
    loadTemplateUI: function(apiUrl, uiCode, targetId, onComplete) {
        var self = this;
        
        this.glog("LoadTemplateUI: Starting - API: " + apiUrl + ", Target: " + targetId);
        
        var ajax = new this.ajaxStriker();
        ajax.connect(apiUrl, 'GET', '', function(response) {
            try {
                self.glog("LoadTemplateUI: API response received");
                
                var jsonData;
                try {
                    jsonData = JSON.parse(response.responseText);
                    self.glog("LoadTemplateUI: JSON parsed successfully");
                } catch (parseError) {
                    self.glog("LoadTemplateUI: JSON parse error - " + parseError.message);
                    return;
                }
                
                var processedContent = self.processUI(uiCode, jsonData);
                self.glog("LoadTemplateUI: UI processed, result length: " + processedContent.length);
                
                var targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.innerHTML = processedContent;
                    self.glog("LoadTemplateUI: Content inserted into target element");
                } else {
                    self.glog("LoadTemplateUI: Error - Target element '" + targetId + "' not found");
                }
                
                if (onComplete && typeof onComplete === 'function') {
                    self.glog("LoadTemplateUI: Calling completion callback");
                    onComplete(jsonData, processedContent);
                }
                
            } catch (error) {
                self.glog("LoadTemplateUI: Error processing response - " + error.message);
            }
        });
    },

    // === UI COMPONENT RENDERER ===
    renderUIComponent: function(component) {
        if (!component) return '';
        
        if (Array.isArray(component)) {
            var self = this;
            var results = [];
            for (var i = 0; i < component.length; i++) {
                results.push(self.renderUIComponent(component[i]));
            }
            return results.join('');
        }
        
        switch (component.type) {
            case 'VStack':
                return this.renderVStack(component);
            case 'HStack':
                return this.renderHStack(component);
            case 'Text':
                return this.renderText(component);
            case 'TextField':
                return this.renderTextField(component);
            case 'TextArea':
                return this.renderTextArea(component);
            case 'Button':
                return this.renderButton(component);
            case 'RadioGroup':
                return this.renderRadioGroup(component);
            case 'Select':
                return this.renderSelect(component);
            case 'DropdownMenu':
                return this.renderDropdownMenu(component);
            case 'Pagination':
                return this.renderPagination(component);
            case 'List':
                return this.renderList(component);
            case 'Spacer':
                return this.renderSpacer(component);
            case 'Checkbox':
                return this.renderCheckbox(component);
            case 'Toggle':
                return this.renderToggle(component);
            case 'Badge':
                return this.renderBadge(component);
            case 'Alert':
                return this.renderAlert(component);
            case 'Card':
                return this.renderCard(component);
            case 'Modal':
                return this.renderModal(component);
            default:
                return '<div>Unknown component: ' + (component.type || 'undefined') + '</div>';
        }
    },

    // Layout component renderers
    renderVStack: function(component) {
        var classes = ['d-flex', 'flex-column'];
        if (component.modifiers && component.modifiers.padding) {
            var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
            for (var i = 0; i < paddingClasses.length; i++) {
                classes.push(paddingClasses[i]);
            }
        }
        var childrenHTML = '';
        if (component.children) {
            for (var i = 0; i < component.children.length; i++) {
                childrenHTML += this.renderUIComponent(component.children[i]);
            }
        }
        return '<div class="' + classes.join(' ') + '">' + childrenHTML + '</div>';
    },

    renderHStack: function(component) {
        var classes = ['d-flex', 'flex-row'];
        if (component.modifiers) {
            if (component.modifiers.justify === 'end') {
                classes.push('justify-content-end');
            } else if (component.modifiers.justify === 'center') {
                classes.push('justify-content-center');
            } else if (component.modifiers.justify === 'between') {
                classes.push('justify-content-between');
            }
            if (component.modifiers.padding) {
                var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
                for (var i = 0; i < paddingClasses.length; i++) {
                    classes.push(paddingClasses[i]);
                }
            }
        }
        var childrenHTML = '';
        if (component.children) {
            for (var i = 0; i < component.children.length; i++) {
                childrenHTML += this.renderUIComponent(component.children[i]);
            }
        }
        return '<div class="' + classes.join(' ') + '">' + childrenHTML + '</div>';
    },

    renderText: function(component) {
        var tag = 'p';
        var classes = [];
        
        if (component.modifiers) {
            if (component.modifiers.font === 'title') {
                tag = 'h2';
                classes.push('fw-bold');
            } else if (component.modifiers.font === 'headline') {
                tag = 'h4';
            }
            if (component.modifiers.color === 'muted') {
                classes.push('text-muted');
            }
            if (component.modifiers.padding) {
                var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
                for (var i = 0; i < paddingClasses.length; i++) {
                    classes.push(paddingClasses[i]);
                }
            }
        }
        
        var classAttr = classes.length > 0 ? ' class="' + classes.join(' ') + '"' : '';
        return '<' + tag + classAttr + '>' + (component.content || '') + '</' + tag + '>';
    },

    // Form component renderers
    renderTextField: function(component) {
        var classes = ['form-control'];
        var attributes = [];
        
        if (component.modifiers) {
            if (component.modifiers.required) {
                attributes.push('required');
            }
            if (component.modifiers.placeholder) {
                attributes.push('placeholder="' + component.modifiers.placeholder + '"');
            }
            if (component.modifiers.value) {
                attributes.push('value="' + component.modifiers.value + '"');
            }
            var inputType = component.modifiers.type || 'text';
            attributes.push('type="' + inputType + '"');
        }
        
        if (component.label) {
            var required = component.modifiers && component.modifiers.required;
            return '<div class="mb-3">' +
                '<label class="form-label">' + component.label + (required ? ' <span class="text-danger">*</span>' : '') + '</label>' +
                '<input class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>' +
                '</div>';
        } else {
            return '<input class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>';
        }
    },

    renderTextArea: function(component) {
        var classes = ['form-control'];
        var attributes = [];
        
        if (component.modifiers) {
            if (component.modifiers.required) {
                attributes.push('required');
            }
            if (component.modifiers.placeholder) {
                attributes.push('placeholder="' + component.modifiers.placeholder + '"');
            }
            if (component.modifiers.rows) {
                attributes.push('rows="' + component.modifiers.rows + '"');
            }
        }
        
        var value = component.modifiers && component.modifiers.value ? component.modifiers.value : '';
        
        if (component.label) {
            var required = component.modifiers && component.modifiers.required;
            return '<div class="mb-3">' +
                '<label class="form-label">' + component.label + (required ? ' <span class="text-danger">*</span>' : '') + '</label>' +
                '<textarea class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>' + value + '</textarea>' +
                '</div>';
        } else {
            return '<textarea class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>' + value + '</textarea>';
        }
    },

    renderButton: function(component) {
        var classes = ['btn'];
        var style = component.modifiers && component.modifiers.style ? component.modifiers.style : 'primary';
        
        if (style === 'outline') {
            classes.push('btn-outline-primary');
        } else {
            classes.push('btn-' + style);
        }
        
        if (component.modifiers && component.modifiers.size) {
            classes.push('btn-' + component.modifiers.size);
        }
        
        var icon = '';
        if (component.modifiers && component.modifiers.icon === 'plus') {
            icon = '<i class="bi bi-plus"></i> ';
        }
        
        var onclick = '';
        if (component.action) {
            if (typeof component.action === 'string') {
                onclick = 'onclick="' + component.action + '()"';
            } else {
                onclick = 'onclick="(' + component.action + ')()"';
            }
        }
        
        return '<button class="' + classes.join(' ') + '" ' + onclick + '>' + icon + (component.label || '') + '</button>';
    },

    renderRadioGroup: function(component) {
        if (!component.options || component.options.length === 0) {
            return '<div class="text-muted">No options available</div>';
        }
        
        var inline = component.modifiers && component.modifiers.inline;
        var radioItems = [];
        
        for (var i = 0; i < component.options.length; i++) {
            var option = component.options[i];
            var value = typeof option === 'object' ? option.value : option;
            var label = typeof option === 'object' ? option.label : option;
            var checked = component.modifiers && component.modifiers.value === value ? 'checked' : '';
            var disabled = typeof option === 'object' && option.disabled ? 'disabled' : '';
            
            var radioClass = inline ? 'form-check form-check-inline' : 'form-check';
            
            radioItems.push('<div class="' + radioClass + '">' +
                '<input class="form-check-input" type="radio" name="' + component.binding + '" ' +
                'id="' + component.binding + '_' + i + '" value="' + value + '" ' + checked + ' ' + disabled + '>' +
                '<label class="form-check-label" for="' + component.binding + '_' + i + '">' + label + '</label>' +
                '</div>');
        }
        
        if (component.label) {
            return '<div class="mb-3">' +
                '<label class="form-label">' + component.label + '</label>' +
                radioItems.join('') +
                '</div>';
        } else {
            return radioItems.join('');
        }
    },

    renderSelect: function(component) {
        if (!component.options || component.options.length === 0) {
            return '<div class="text-muted">No options available</div>';
        }
        
        var classes = ['form-select'];
        if (component.modifiers && component.modifiers.size) {
            classes.push('form-select-' + component.modifiers.size);
        }
        
        var attributes = [];
        if (component.modifiers) {
            if (component.modifiers.required) {
                attributes.push('required');
            }
            if (component.modifiers.multiple) {
                attributes.push('multiple');
            }
            if (component.modifiers.disabled) {
                attributes.push('disabled');
            }
        }
        
        var optionItems = [];
        for (var i = 0; i < component.options.length; i++) {
            var option = component.options[i];
            var value = typeof option === 'object' ? option.value : option;
            var label = typeof option === 'object' ? option.label : option;
            var selected = component.modifiers && component.modifiers.value === value ? 'selected' : '';
            var disabled = typeof option === 'object' && option.disabled ? 'disabled' : '';
            
            optionItems.push('<option value="' + value + '" ' + selected + ' ' + disabled + '>' + label + '</option>');
        }
        
        var placeholder = '';
        if (component.modifiers && component.modifiers.placeholder) {
            placeholder = '<option value="" disabled ' + (!component.modifiers.value ? 'selected' : '') + '>' + component.modifiers.placeholder + '</option>';
        }
        
        var selectElement = '<select class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>' + placeholder + optionItems.join('') + '</select>';
        
        if (component.label) {
            var required = component.modifiers && component.modifiers.required;
            return '<div class="mb-3">' +
                '<label class="form-label">' + component.label + (required ? ' <span class="text-danger">*</span>' : '') + '</label>' +
                selectElement +
                '</div>';
        } else {
            return selectElement;
        }
    },

    renderCheckbox: function(component) {
        var checked = component.modifiers && component.modifiers.checked ? 'checked' : '';
        var disabled = component.modifiers && component.modifiers.disabled ? 'disabled' : '';
        var inline = component.modifiers && component.modifiers.inline;
        
        var checkboxClass = inline ? 'form-check form-check-inline' : 'form-check';
        
        return '<div class="' + checkboxClass + '">' +
            '<input class="form-check-input" type="checkbox" name="' + (component.binding || '') + '" ' +
            'id="' + (component.binding || 'checkbox') + '" value="' + (component.value || 'true') + '" ' + checked + ' ' + disabled + '>' +
            '<label class="form-check-label" for="' + (component.binding || 'checkbox') + '">' + (component.label || '') + '</label>' +
            '</div>';
    },

    renderToggle: function(component) {
        var checked = component.modifiers && component.modifiers.checked ? 'checked' : '';
        var disabled = component.modifiers && component.modifiers.disabled ? 'disabled' : '';
        
        return '<div class="form-check form-switch">' +
            '<input class="form-check-input" type="checkbox" role="switch" ' +
            'name="' + (component.binding || '') + '" id="' + (component.binding || 'toggle') + '" ' + checked + ' ' + disabled + '>' +
            '<label class="form-check-label" for="' + (component.binding || 'toggle') + '">' + (component.label || '') + '</label>' +
            '</div>';
    },

    renderDropdownMenu: function(component) {
        if (!component.items || component.items.length === 0) {
            return '<div class="text-muted">No menu items</div>';
        }
        
        var buttonStyle = component.modifiers && component.modifiers.style ? component.modifiers.style : 'primary';
        var buttonSize = component.modifiers && component.modifiers.size ? ' btn-' + component.modifiers.size : '';
        
        var menuItems = [];
        for (var i = 0; i < component.items.length; i++) {
            var item = component.items[i];
            if (item.divider) {
                menuItems.push('<li><hr class="dropdown-divider"></li>');
            } else if (item.header) {
                menuItems.push('<li><h6 class="dropdown-header">' + item.header + '</h6></li>');
            } else {
                var disabled = item.disabled ? ' disabled' : '';
                var onclick = item.action ? ' onclick="' + (typeof item.action === 'string' ? item.action + '()' : '(' + item.action + ')()') + '"' : '';
                menuItems.push('<li><a class="dropdown-item' + disabled + '" href="#"' + onclick + '>' + item.label + '</a></li>');
            }
        }
        
        return '<div class="dropdown">' +
            '<button class="btn btn-' + buttonStyle + buttonSize + ' dropdown-toggle" type="button" ' +
            'data-bs-toggle="dropdown" aria-expanded="false">' + (component.label || 'Menu') + '</button>' +
            '<ul class="dropdown-menu">' + menuItems.join('') + '</ul>' +
            '</div>';
    },

    renderPagination: function(component) {
        var currentPage = component.currentPage || 1;
        var totalPages = component.totalPages || 1;
        var size = component.modifiers && component.modifiers.size ? ' pagination-' + component.modifiers.size : '';
        var showFirst = component.modifiers && component.modifiers.showFirst !== false;
        var showLast = component.modifiers && component.modifiers.showLast !== false;
        var maxVisible = component.modifiers && component.modifiers.maxVisible ? component.modifiers.maxVisible : 5;
        
        var startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        var endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        var items = [];
        
        var prevDisabled = currentPage <= 1 ? ' disabled' : '';
        var prevAction = component.onPageChange ? ' onclick="' + component.onPageChange + '(' + (currentPage - 1) + ')"' : '';
        items.push('<li class="page-item' + prevDisabled + '"><a class="page-link" href="#"' + prevAction + '>Previous</a></li>');
        
        if (showFirst && startPage > 1) {
            var firstAction = component.onPageChange ? ' onclick="' + component.onPageChange + '(1)"' : '';
            items.push('<li class="page-item"><a class="page-link" href="#"' + firstAction + '>1</a></li>');
            if (startPage > 2) {
                items.push('<li class="page-item disabled"><span class="page-link">...</span></li>');
            }
        }
        
        for (var i = startPage; i <= endPage; i++) {
            var active = i === currentPage ? ' active' : '';
            var pageAction = component.onPageChange ? ' onclick="' + component.onPageChange + '(' + i + ')"' : '';
            items.push('<li class="page-item' + active + '"><a class="page-link" href="#"' + pageAction + '>' + i + '</a></li>');
        }
        
        if (showLast && endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push('<li class="page-item disabled"><span class="page-link">...</span></li>');
            }
            var lastAction = component.onPageChange ? ' onclick="' + component.onPageChange + '(' + totalPages + ')"' : '';
            items.push('<li class="page-item"><a class="page-link" href="#"' + lastAction + '>' + totalPages + '</a></li>');
        }
        
        var nextDisabled = currentPage >= totalPages ? ' disabled' : '';
        var nextAction = component.onPageChange ? ' onclick="' + component.onPageChange + '(' + (currentPage + 1) + ')"' : '';
        items.push('<li class="page-item' + nextDisabled + '"><a class="page-link" href="#"' + nextAction + '>Next</a></li>');
        
        return '<nav aria-label="Pagination">' +
            '<ul class="pagination' + size + '">' + items.join('') + '</ul>' +
            '</nav>';
    },

    renderList: function(component) {
        if (!component.data || component.data.length === 0) {
            return '<div class="text-muted">No items found</div>';
        }
        
        var listItems = [];
        for (var i = 0; i < component.data.length; i++) {
            var item = component.data[i];
            var itemComponent = component.itemBuilder ? component.itemBuilder(item) : { type: 'Text', content: JSON.stringify(item) };
            listItems.push('<div class="list-group-item border-0">' + this.renderUIComponent(itemComponent) + '</div>');
        }
        
        return '<div class="list-group list-group-flush">' + listItems.join('') + '</div>';
    },

    renderBadge: function(component) {
        var style = component.modifiers && component.modifiers.style ? component.modifiers.style : 'primary';
        var pill = component.modifiers && component.modifiers.pill ? ' rounded-pill' : '';
        
        return '<span class="badge bg-' + style + pill + '">' + (component.content || '') + '</span>';
    },

    renderAlert: function(component) {
        var style = component.modifiers && component.modifiers.style ? component.modifiers.style : 'info';
        var dismissible = component.modifiers && component.modifiers.dismissible;
        
        var alertClass = 'alert alert-' + style;
        if (dismissible) {
            alertClass += ' alert-dismissible fade show';
        }
        
        var closeButton = dismissible ? 
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : '';
        
        return '<div class="' + alertClass + '" role="alert">' +
            (component.content || '') +
            closeButton +
            '</div>';
    },

    renderCard: function(component) {
        var header = component.header ? '<div class="card-header">' + component.header + '</div>' : '';
        var footer = component.footer ? '<div class="card-footer">' + component.footer + '</div>' : '';
        var body = '';
        
        if (component.children) {
            var childrenHTML = '';
            for (var i = 0; i < component.children.length; i++) {
                childrenHTML += this.renderUIComponent(component.children[i]);
            }
            body = '<div class="card-body">' + childrenHTML + '</div>';
        } else {
            body = '<div class="card-body">' + (component.content || '') + '</div>';
        }
        
        var classes = ['card'];
        if (component.modifiers && component.modifiers.border) {
            classes.push('border-' + component.modifiers.border);
        }
        if (component.modifiers && component.modifiers.textAlign) {
            classes.push('text-' + component.modifiers.textAlign);
        }
        
        return '<div class="' + classes.join(' ') + '">' + header + body + footer + '</div>';
    },

    renderModal: function(component) {
        var size = component.modifiers && component.modifiers.size ? ' modal-' + component.modifiers.size : '';
        var centered = component.modifiers && component.modifiers.centered ? ' modal-dialog-centered' : '';
        var scrollable = component.modifiers && component.modifiers.scrollable ? ' modal-dialog-scrollable' : '';
        
        var header = component.title ? 
            '<div class="modal-header">' +
            '<h1 class="modal-title fs-5">' + component.title + '</h1>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
            '</div>' : '';
        
        var footer = '';
        if (component.actions) {
            var actionsHTML = '';
            for (var i = 0; i < component.actions.length; i++) {
                actionsHTML += this.renderUIComponent(component.actions[i]);
            }
            footer = '<div class="modal-footer">' + actionsHTML + '</div>';
        }
        
        var body = '';
        if (component.children) {
            var childrenHTML = '';
            for (var i = 0; i < component.children.length; i++) {
                childrenHTML += this.renderUIComponent(component.children[i]);
            }
            body = '<div class="modal-body">' + childrenHTML + '</div>';
        } else {
            body = '<div class="modal-body">' + (component.content || '') + '</div>';
        }
        
        return '<div class="modal fade" id="' + (component.id || 'modal') + '" tabindex="-1" aria-hidden="true">' +
            '<div class="modal-dialog' + size + centered + scrollable + '">' +
            '<div class="modal-content">' + header + body + footer + '</div>' +
            '</div>' +
            '</div>';
    },

    renderSpacer: function(component) {
        return '<div class="flex-grow-1"></div>';
    },

    // Utility functions
    // TODO - Havnt passed all the test.
    getPaddingClasses: function(padding) {
        var classes = [];
        
        for (var direction in padding) {
            if (padding.hasOwnProperty(direction)) {
                var value = padding[direction];
                
                if (direction === 'all') {
                    classes.push('p-' + value);
                } else if (direction === 'top') {
                    classes.push('pt-' + value);
                } else if (direction === 'bottom') {
                    classes.push('pb-' + value);
                } else if (direction === 'vertical') {
                    classes.push('py-' + value);
                } else if (direction === 'horizontal') {
                    classes.push('px-' + value);
                }
            }
        }
        
        return classes;
    },

    // UI component creator functions

    // Avoid VStack for now if you want perfect Vertical Responsive design.
    createVStack: function(children) {
        var component = { type: 'VStack', children: children, modifiers: {} };
        component.padding = function(direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        return component;
    },

    createHStack: function(children) {
        var component = { type: 'HStack', children: children, modifiers: {} };
        component.justify = function(alignment) {
            this.modifiers.justify = alignment;
            return this;
        };
        component.padding = function(direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        return component;
    },

    createText: function(content) {
        var component = { type: 'Text', content: content, modifiers: {} };
        component.font = function(size) {
            this.modifiers.font = size;
            return this;
        };
        component.color = function(color) {
            this.modifiers.color = color;
            return this;
        };
        component.padding = function(direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        return component;
    },

    createTextField: function(label, binding) {
        var component = { type: 'TextField', label: label, binding: binding, modifiers: {} };
        component.required = function(required) {
            this.modifiers.required = required;
            return this;
        };
        component.placeholder = function(text) {
            this.modifiers.placeholder = text;
            return this;
        };
        component.type = function(type) {
            this.modifiers.type = type;
            return this;
        };
        component.value = function(value) {
            this.modifiers.value = value;
            return this;
        };
        return component;
    },

    createTextArea: function(label, binding) {
        var component = { type: 'TextArea', label: label, binding: binding, modifiers: {} };
        component.required = function(required) {
            this.modifiers.required = required;
            return this;
        };
        component.placeholder = function(text) {
            this.modifiers.placeholder = text;
            return this;
        };
        component.rows = function(rows) {
            this.modifiers.rows = rows;
            return this;
        };
        component.value = function(value) {
            this.modifiers.value = value;
            return this;
        };
        return component;
    },

    createButton: function(label, action) {
        var component = { type: 'Button', label: label, action: action, modifiers: {} };
        component.style = function(style) {
            this.modifiers.style = style;
            return this;
        };
        component.size = function(size) {
            this.modifiers.size = size;
            return this;
        };
        component.icon = function(icon) {
            this.modifiers.icon = icon;
            return this;
        };
        return component;
    },

    createRadioGroup: function(label, binding, options) {
        var component = { type: 'RadioGroup', label: label, binding: binding, options: options || [], modifiers: {} };
        component.inline = function(inline) {
            this.modifiers.inline = inline;
            return this;
        };
        component.value = function(value) {
            this.modifiers.value = value;
            return this;
        };
        return component;
    },

    createSelect: function(label, binding, options) {
        var component = { type: 'Select', label: label, binding: binding, options: options || [], modifiers: {} };
        component.required = function(required) {
            this.modifiers.required = required;
            return this;
        };
        component.placeholder = function(text) {
            this.modifiers.placeholder = text;
            return this;
        };
        component.multiple = function(multiple) {
            this.modifiers.multiple = multiple;
            return this;
        };
        component.size = function(size) {
            this.modifiers.size = size;
            return this;
        };
        component.value = function(value) {
            this.modifiers.value = value;
            return this;
        };
        component.disabled = function(disabled) {
            this.modifiers.disabled = disabled;
            return this;
        };
        return component;
    },

    createDropdownMenu: function(label, items) {
        var component = { type: 'DropdownMenu', label: label, items: items || [], modifiers: {} };
        component.style = function(style) {
            this.modifiers.style = style;
            return this;
        };
        component.size = function(size) {
            this.modifiers.size = size;
            return this;
        };
        return component;
    },

    createPagination: function(currentPage, totalPages, onPageChange) {
        var component = { 
            type: 'Pagination', 
            currentPage: currentPage || 1, 
            totalPages: totalPages || 1,
            onPageChange: onPageChange,
            modifiers: {} 
        };
        component.size = function(size) {
            this.modifiers.size = size;
            return this;
        };
        component.maxVisible = function(max) {
            this.modifiers.maxVisible = max;
            return this;
        };
        component.showFirst = function(show) {
            this.modifiers.showFirst = show;
            return this;
        };
        component.showLast = function(show) {
            this.modifiers.showLast = show;
            return this;
        };
        return component;
    },

    createCheckbox: function(label, binding, value) {
        var component = { type: 'Checkbox', label: label, binding: binding, value: value, modifiers: {} };
        component.checked = function(checked) {
            this.modifiers.checked = checked;
            return this;
        };
        component.disabled = function(disabled) {
            this.modifiers.disabled = disabled;
            return this;
        };
        component.inline = function(inline) {
            this.modifiers.inline = inline;
            return this;
        };
        return component;
    },

    createToggle: function(label, binding) {
        var component = { type: 'Toggle', label: label, binding: binding, modifiers: {} };
        component.checked = function(checked) {
            this.modifiers.checked = checked;
            return this;
        };
        component.disabled = function(disabled) {
            this.modifiers.disabled = disabled;
            return this;
        };
        return component;
    },

    createBadge: function(content) {
        var component = { type: 'Badge', content: content, modifiers: {} };
        component.style = function(style) {
            this.modifiers.style = style;
            return this;
        };
        component.pill = function(pill) {
            this.modifiers.pill = pill;
            return this;
        };
        return component;
    },

    createAlert: function(content) {
        var component = { type: 'Alert', content: content, modifiers: {} };
        component.style = function(style) {
            this.modifiers.style = style;
            return this;
        };
        component.dismissible = function(dismissible) {
            this.modifiers.dismissible = dismissible;
            return this;
        };
        return component;
    },

    createCard: function(content) {
        var component = { type: 'Card', content: content, modifiers: {} };
        component.header = function(header) {
            this.header = header;
            return this;
        };
        component.footer = function(footer) {
            this.footer = footer;
            return this;
        };
        component.border = function(border) {
            this.modifiers.border = border;
            return this;
        };
        component.textAlign = function(align) {
            this.modifiers.textAlign = align;
            return this;
        };
        component.children = function(children) {
            this.children = children;
            return this;
        };
        return component;
    },

    createModal: function(id, title, content) {
        var component = { type: 'Modal', id: id, title: title, content: content, modifiers: {} };
        component.size = function(size) {
            this.modifiers.size = size;
            return this;
        };
        component.centered = function(centered) {
            this.modifiers.centered = centered;
            return this;
        };
        component.scrollable = function(scrollable) {
            this.modifiers.scrollable = scrollable;
            return this;
        };
        component.actions = function(actions) {
            this.actions = actions;
            return this;
        };
        component.children = function(children) {
            this.children = children;
            return this;
        };
        return component;
    },

    createList: function(data, keyPath, itemBuilder) {
        return { type: 'List', data: data, keyPath: keyPath, itemBuilder: itemBuilder, modifiers: {} };
    },

    createSpacer: function() {
        return { type: 'Spacer', modifiers: {} };
    }

}; // End of GunBasic object

// Global API functions
function loadTemplate(apiUrl, templateId, targetId, onComplete) {
    return GunBasic.loadTemplate(apiUrl, templateId, targetId, onComplete);
}

function loadTemplateUI(apiUrl, uiCode, targetId, onComplete) {
    return GunBasic.loadTemplateUI(apiUrl, uiCode, targetId, onComplete);
}

function processUI(uiCode, jsonData) {
    return GunBasic.processUI(uiCode, jsonData);
}

function autoajaxcall(objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete) {
    return GunBasic.autoajaxcall(objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete);
}

function toggleElement(elementId) {
    return GunBasic.toggleElement(elementId);
}

// Global UI component creator functions
function VStack(children) {
    return GunBasic.createVStack(children);
}

function HStack(children) {
    return GunBasic.createHStack(children);
}

function Text(content) {
    return GunBasic.createText(content);
}

function TextField(label, binding) {
    return GunBasic.createTextField(label, binding);
}

function TextArea(label, binding) {
    return GunBasic.createTextArea(label, binding);
}

function Button(label, action) {
    return GunBasic.createButton(label, action);
}

function RadioGroup(label, binding, options) {
    return GunBasic.createRadioGroup(label, binding, options);
}

function Select(label, binding, options) {
    return GunBasic.createSelect(label, binding, options);
}

function DropdownMenu(label, items) {
    return GunBasic.createDropdownMenu(label, items);
}

function Pagination(currentPage, totalPages, onPageChange) {
    return GunBasic.createPagination(currentPage, totalPages, onPageChange);
}

function Checkbox(label, binding, value) {
    return GunBasic.createCheckbox(label, binding, value);
}

function Toggle(label, binding) {
    return GunBasic.createToggle(label, binding);
}

function Badge(content) {
    return GunBasic.createBadge(content);
}

function Alert(content) {
    return GunBasic.createAlert(content);
}

function Card(content) {
    return GunBasic.createCard(content);
}

function Modal(id, title, content) {
    return GunBasic.createModal(id, title, content);
}

function List(data, keyPath, itemBuilder) {
    return GunBasic.createList(data, keyPath, itemBuilder);
}

function Spacer() {
    return GunBasic.createSpacer();
}

