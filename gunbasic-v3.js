/*
    @Project:	GunBasic-JS 3.6.1 - COMPLETE IMPLEMENTATION WITH SWIFTUI PADDING & SPACING
    @Website:	Updated from original http://code.google.com/p/gunbasic-js/
    @Author: 	Gunesh Raj
    @Email: 	gunesh.raj@gmail.com
    @Version: 	3.6.1
    @License: 	GNU General Public License v2
    @Notes: 	Adding in new functions in the framework with ALL UI components implemented.
*/

// Initialize GunBasic when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    GunBasic.init();
});

var GunBasic = {
    version: "3.6.1",
    debugMode: false,

    // === INITIALIZATION SYSTEM ===
    init: function () {
        this.glog("GunBasic " + this.version + " initializing...");
        this.bindHooks();
        this.glog("GunBasic initialization complete");
    },

    bindHooks: function () {
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

    bindElement: function (element, method) {
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
        element.addEventListener('click', function (e) {
            e.preventDefault();
            self.autoajaxcall(null, method, url, args, startFunction, completeFunction);
        });
        this.glog("Bound " + method + " to " + url);
    },

    // === RESPONSE PROCESSING SYSTEM ===
    autoajax: function (vdata) {
        this.glog("Processing server response...");
        this.processXMLFormat(vdata);
    },

    processXMLFormat: function (vdata) {
        this.glog("Processing XML format response");
        var gdataRegex = /<g-data\s+id=["']([^"']+)["']>([\s\S]*?)<\/g-data>/gi;
        var match;
        var updateCount = 0;
        while ((match = gdataRegex.exec(vdata)) !== null) {
            var elementId = match[1];
            var content = match[2];
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
    autoajaxcall: function (objAJAX, method, path, query, vfunctionOnStart, vfunctionOnComplete) {
        if (objAJAX == null) {
            this.glog("Starting AJAX call: " + method + " " + path);
            if (vfunctionOnStart != null) {
                this.glog("Calling start function");
                vfunctionOnStart();
            }
            objAJAX = new this.ajaxStriker();
            var self = this;
            objAJAX.connect(path, method, query, function (ajax) {
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
    glog: function (msg) {
        if (this.debugMode) {
            try {
                if (window.console && console.log) {
                    console.log('[GunBasic] ' + msg);
                }
            } catch (error1) { }
        }
    },

    setDebug: function (debug) {
        this.debugMode = debug;
        this.glog("Debug mode " + (debug ? "enabled" : "disabled"));
    },

    // === UTILITY FUNCTIONS ===
    toggleElement: function (elementId) {
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
    ajaxStriker: function () {
        return {
            connect: function (url, method, data, callback) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                if (method.toUpperCase() === 'POST') {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                }
                xhr.onreadystatechange = function () {
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
    parseASPTagsWithData: function (content, jsonData) {
        var self = this;
        try {
            this.glog("ASP: Starting parse with JSON data");
            var aspPattern = /<%\s*([\s\S]*?)\s*%>/g;
            var result = content.replace(aspPattern, function (match, code) {
                self.glog("ASP: Processing code block");
                try {
                    var variableDeclarations = [];
                    for (var key in jsonData) {
                        if (jsonData.hasOwnProperty(key)) {
                            variableDeclarations.push('var ' + key + ' = ' + JSON.stringify(jsonData[key]) + ';');
                        }
                    }

                    // Add UI component functions to context
                    var componentDeclarations = [
                        'var VStack = GunBasic.createVStack.bind(GunBasic);',
                        'var HStack = GunBasic.createHStack.bind(GunBasic);',
                        'var Text = GunBasic.createText.bind(GunBasic);',
                        'var TextField = GunBasic.createTextField.bind(GunBasic);',
                        'var TextArea = GunBasic.createTextArea.bind(GunBasic);',
                        'var Button = GunBasic.createButton.bind(GunBasic);',
                        'var RadioGroup = GunBasic.createRadioGroup.bind(GunBasic);',
                        'var Select = GunBasic.createSelect.bind(GunBasic);',
                        'var Checkbox = GunBasic.createCheckbox.bind(GunBasic);',
                        'var Toggle = GunBasic.createToggle.bind(GunBasic);',
                        'var DropdownMenu = GunBasic.createDropdownMenu.bind(GunBasic);',
                        'var List = GunBasic.createList.bind(GunBasic);',
                        'var Pagination = GunBasic.createPagination.bind(GunBasic);',
                        'var Badge = GunBasic.createBadge.bind(GunBasic);',
                        'var Alert = GunBasic.createAlert.bind(GunBasic);',
                        'var Card = GunBasic.createCard.bind(GunBasic);',
                        'var Modal = GunBasic.createModal.bind(GunBasic);',
                        'var Spacer = GunBasic.createSpacer.bind(GunBasic);'
                    ];

                    var jsCode = 'var __output = "";\n' +
                        variableDeclarations.join('\n') + '\n' +
                        componentDeclarations.join('\n') + '\n' +
                        code +
                        '\nif (typeof __output !== "undefined") { return __output; } else { return ""; }';
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

    parseASPTags: function (content) {
        var self = this;
        try {
            this.glog("ASP: Processing content with enhanced parser");
            var jsCode = 'var __output = "";\n';

            // Add UI component functions to context
            var componentDeclarations = [
                'var VStack = GunBasic.createVStack.bind(GunBasic);',
                'var HStack = GunBasic.createHStack.bind(GunBasic);',
                'var Text = GunBasic.createText.bind(GunBasic);',
                'var TextField = GunBasic.createTextField.bind(GunBasic);',
                'var TextArea = GunBasic.createTextArea.bind(GunBasic);',
                'var Button = GunBasic.createButton.bind(GunBasic);',
                'var RadioGroup = GunBasic.createRadioGroup.bind(GunBasic);',
                'var Select = GunBasic.createSelect.bind(GunBasic);',
                'var Checkbox = GunBasic.createCheckbox.bind(GunBasic);',
                'var Toggle = GunBasic.createToggle.bind(GunBasic);',
                'var DropdownMenu = GunBasic.createDropdownMenu.bind(GunBasic);',
                'var List = GunBasic.createList.bind(GunBasic);',
                'var Pagination = GunBasic.createPagination.bind(GunBasic);',
                'var Badge = GunBasic.createBadge.bind(GunBasic);',
                'var Alert = GunBasic.createAlert.bind(GunBasic);',
                'var Card = GunBasic.createCard.bind(GunBasic);',
                'var Modal = GunBasic.createModal.bind(GunBasic);',
                'var Spacer = GunBasic.createSpacer.bind(GunBasic);'
            ];

            jsCode += componentDeclarations.join('\n') + '\n';

            var currentPos = 0;
            var aspRegex = /<%\s*(?!=)([\s\S]*?)%>|<%=\s*([\s\S]*?)\s*%>/g;
            var match;
            while ((match = aspRegex.exec(content)) !== null) {
                var htmlContent = content.substring(currentPos, match.index);
                if (htmlContent) {
                    jsCode += '__output += ' + JSON.stringify(htmlContent) + ';\n';
                }
                if (match[1] !== undefined) {
                    jsCode += match[1] + '\n';
                } else if (match[2] !== undefined) {
                    jsCode += '__output += String(' + match[2] + ');\n';
                }
                currentPos = aspRegex.lastIndex;
            }
            var remainingContent = content.substring(currentPos);
            if (remainingContent) {
                jsCode += '__output += ' + JSON.stringify(remainingContent) + ';\n';
            }
            jsCode += 'return __output;';
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
    loadTemplate: function (apiUrl, templateId, targetId, onComplete) {
        var self = this;
        this.glog("LoadTemplate: Starting - API: " + apiUrl + ", Template: " + templateId + ", Target: " + targetId);
        var ajax = new this.ajaxStriker();
        ajax.connect(apiUrl, 'GET', '', function (response) {
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

                    // Decode HTML entities
                    templateContent = templateContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

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
    processUI: function (uiCode, jsonData) {
        if (typeof jsonData === 'undefined') {
            jsonData = {};
        }
        var self = this;
        try {
            this.glog("UI: Processing UI code");
            var context = {};
            for (var key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {
                    context[key] = jsonData[key];
                }
            }
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
            var variableDeclarations = [];
            for (var key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {
                    variableDeclarations.push('var ' + key + ' = arguments[0].' + key + ';');
                }
            }
            var jsCode = '(function() {' + variableDeclarations.join('\n') + 'var VStack = arguments[0].VStack; var HStack = arguments[0].HStack; var Text = arguments[0].Text; var TextField = arguments[0].TextField; var TextArea = arguments[0].TextArea; var Button = arguments[0].Button; var RadioGroup = arguments[0].RadioGroup; var Select = arguments[0].Select; var DropdownMenu = arguments[0].DropdownMenu; var Pagination = arguments[0].Pagination; var Checkbox = arguments[0].Checkbox; var Toggle = arguments[0].Toggle; var Badge = arguments[0].Badge; var Alert = arguments[0].Alert; var Card = arguments[0].Card; var Modal = arguments[0].Modal; var List = arguments[0].List; var Spacer = arguments[0].Spacer;' + uiCode + '})';
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

    loadTemplateUI: function (apiUrl, uiCode, targetId, onComplete) {
        var self = this;
        this.glog("LoadTemplateUI: Starting - API: " + apiUrl + ", Target: " + targetId);
        var ajax = new this.ajaxStriker();
        ajax.connect(apiUrl, 'GET', '', function (response) {
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
    renderUIComponent: function (component) {
        if (!component) return '';
        if (Array.isArray(component)) {
            var self = this;
            var results = [];
            for (var i = 0; i < component.length; i++) {
                results.push(self.renderUIComponent(component[i]));
            }
            return results.join('');
        }

        // Check componentType instead of type
        var compType = component.componentType || component.type;

        switch (compType) {
            case 'VStack': return this.renderVStack(component);
            case 'HStack': return this.renderHStack(component);
            case 'Text': return this.renderText(component);
            case 'TextField': return this.renderTextField(component);
            case 'TextArea': return this.renderTextArea(component);
            case 'Button': return this.renderButton(component);
            case 'RadioGroup': return this.renderRadioGroup(component);
            case 'Select': return this.renderSelect(component);
            case 'DropdownMenu': return this.renderDropdownMenu(component);
            case 'Pagination': return this.renderPagination(component);
            case 'List': return this.renderList(component);
            case 'Spacer': return this.renderSpacer(component);
            case 'Checkbox': return this.renderCheckbox(component);
            case 'Toggle': return this.renderToggle(component);
            case 'Badge': return this.renderBadge(component);
            case 'Alert': return this.renderAlert(component);
            case 'Card': return this.renderCard(component);
            case 'Modal': return this.renderModal(component);
            default: return '<div>Unknown component: ' + (compType || 'undefined') + '</div>';
        }
    },

    // === ENHANCED UTILITY FUNCTIONS ===
    getPaddingClasses: function (padding) {
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
                } else if (direction === 'left' || direction === 'leading') {
                    classes.push('ps-' + value);  // Bootstrap 5 uses 'ps' for start
                } else if (direction === 'right' || direction === 'trailing') {
                    classes.push('pe-' + value);  // Bootstrap 5 uses 'pe' for end
                } else if (direction === 'vertical') {
                    classes.push('py-' + value);
                } else if (direction === 'horizontal') {
                    classes.push('px-' + value);
                }
            }
        }
        return classes;
    },

// === ENHANCED LAYOUT COMPONENT RENDERERS ===
    renderVStack: function (component) {
        var classes = ['d-flex', 'flex-column'];
        
        // Add spacing between children
        if (component.spacing) {
            classes.push('gap-' + component.spacing);
        }
        
        // Add padding classes
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

    renderHStack: function (component) {
        var classes = ['d-flex', 'flex-row'];
        
        // Add spacing between children
        if (component.spacing) {
            classes.push('gap-' + component.spacing);
        }
        
        // Add justify content and padding
        if (component.modifiers) {
            if (component.modifiers.justify === 'end') {
                classes.push('justify-content-end');
            } else if (component.modifiers.justify === 'center') {
                classes.push('justify-content-center');
            } else if (component.modifiers.justify === 'between') {
                classes.push('justify-content-between');
            }
            
            // Add padding classes
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

    renderSpacer: function (component) {
        return '<div class="flex-grow-1"></div>';
    },

    // === TEXT COMPONENT RENDERERS ===
    renderText: function (component) {
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

    renderBadge: function (component) {
        var classes = ['badge'];
        var style = component.modifiers && component.modifiers.style ? component.modifiers.style : 'primary';
        classes.push('bg-' + style);
        
        var pill = component.modifiers && component.modifiers.pill ? ' rounded-pill' : '';
        if (pill) {
            classes.push('rounded-pill');
        }
        
        // Add padding classes
        if (component.modifiers && component.modifiers.padding) {
            var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
            for (var i = 0; i < paddingClasses.length; i++) {
                classes.push(paddingClasses[i]);
            }
        }
        
        return '<span class="' + classes.join(' ') + '">' + (component.content || '') + '</span>';
    },

    // === ENHANCED FORM COMPONENT RENDERERS ===
    renderTextField: function (component) {
        var classes = ['form-control'];
        var attributes = [];
        if (component.modifiers) {
            if (component.modifiers.required) attributes.push('required');
            if (component.modifiers.placeholder) attributes.push('placeholder="' + component.modifiers.placeholder + '"');
            if (component.modifiers.value) attributes.push('value="' + component.modifiers.value + '"');
            var inputType = component.modifiers.type || 'text';
            attributes.push('type="' + inputType + '"');
        }
        
        var wrapperClasses = ['mb-3'];
        // Add padding classes to wrapper
        if (component.modifiers && component.modifiers.padding) {
            var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
            for (var i = 0; i < paddingClasses.length; i++) {
                wrapperClasses.push(paddingClasses[i]);
            }
        }
        
        if (component.label) {
            var required = component.modifiers && component.modifiers.required;
            return '<div class="' + wrapperClasses.join(' ') + '"><label class="form-label">' + component.label + (required ? ' <span class="text-danger">*</span>' : '') + '</label><input class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '></div>';
        } else {
            // For standalone input, apply padding directly
            if (component.modifiers && component.modifiers.padding) {
                var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
                for (var i = 0; i < paddingClasses.length; i++) {
                    classes.push(paddingClasses[i]);
                }
            }
            return '<input class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>';
        }
    },

    renderTextArea: function (component) {
        var classes = ['form-control'];
        var attributes = [];
        if (component.modifiers) {
            if (component.modifiers.required) attributes.push('required');
            if (component.modifiers.placeholder) attributes.push('placeholder="' + component.modifiers.placeholder + '"');
            if (component.modifiers.rows) attributes.push('rows="' + component.modifiers.rows + '"');
        }
        var value = component.modifiers && component.modifiers.value ? component.modifiers.value : '';
        
        var wrapperClasses = ['mb-3'];
        // Add padding classes to wrapper
        if (component.modifiers && component.modifiers.padding) {
            var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
            for (var i = 0; i < paddingClasses.length; i++) {
                wrapperClasses.push(paddingClasses[i]);
            }
        }
        
        if (component.label) {
            var required = component.modifiers && component.modifiers.required;
            return '<div class="' + wrapperClasses.join(' ') + '"><label class="form-label">' + component.label + (required ? ' <span class="text-danger">*</span>' : '') + '</label><textarea class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>' + value + '</textarea></div>';
        } else {
            // For standalone textarea, apply padding directly
            if (component.modifiers && component.modifiers.padding) {
                var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
                for (var i = 0; i < paddingClasses.length; i++) {
                    classes.push(paddingClasses[i]);
                }
            }
            return '<textarea class="' + classes.join(' ') + '" name="' + (component.binding || '') + '" ' + attributes.join(' ') + '>' + value + '</textarea>';
        }
    },

 renderRadioGroup: function (component) {
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
            radioItems.push('<div class="' + radioClass + '"><input class="form-check-input" type="radio" name="' + component.binding + '" id="' + component.binding + '_' + i + '" value="' + value + '" ' + checked + ' ' + disabled + '><label class="form-check-label" for="' + component.binding + '_' + i + '">' + label + '</label></div>');
        }
        if (component.label) {
            return '<div class="mb-3"><label class="form-label">' + component.label + '</label>' + radioItems.join('') + '</div>';
        } else {
            return radioItems.join('');
        }
    },

    renderSelect: function (component) {
        if (!component.options || component.options.length === 0) {
            return '<div class="text-muted">No options available</div>';
        }
        var classes = ['form-select'];
        if (component.modifiers && component.modifiers.size) {
            classes.push('form-select-' + component.modifiers.size);
        }
        var attributes = [];
        if (component.modifiers) {
            if (component.modifiers.required) attributes.push('required');
            if (component.modifiers.multiple) attributes.push('multiple');
            if (component.modifiers.disabled) attributes.push('disabled');
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
            return '<div class="mb-3"><label class="form-label">' + component.label + (required ? ' <span class="text-danger">*</span>' : '') + '</label>' + selectElement + '</div>';
        } else {
            return selectElement;
        }
    },

    renderCheckbox: function (component) {
        var checked = component.modifiers && component.modifiers.checked ? 'checked' : '';
        var disabled = component.modifiers && component.modifiers.disabled ? 'disabled' : '';
        var inline = component.modifiers && component.modifiers.inline;
        var checkboxClass = inline ? 'form-check form-check-inline' : 'form-check';
        return '<div class="' + checkboxClass + '"><input class="form-check-input" type="checkbox" name="' + (component.binding || '') + '" id="' + (component.binding || 'checkbox') + '" value="' + (component.value || 'true') + '" ' + checked + ' ' + disabled + '><label class="form-check-label" for="' + (component.binding || 'checkbox') + '">' + (component.label || '') + '</label></div>';
    },

    renderToggle: function (component) {
        var checked = component.modifiers && component.modifiers.checked ? 'checked' : '';
        var disabled = component.modifiers && component.modifiers.disabled ? 'disabled' : '';
        return '<div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" name="' + (component.binding || '') + '" id="' + (component.binding || 'toggle') + '" ' + checked + ' ' + disabled + '><label class="form-check-label" for="' + (component.binding || 'toggle') + '">' + (component.label || '') + '</label></div>';
    },

    // === ENHANCED BUTTON COMPONENT RENDERER ===
    renderButton: function (component) {
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
        
        // Add padding classes
        if (component.modifiers && component.modifiers.padding) {
            var paddingClasses = this.getPaddingClasses(component.modifiers.padding);
            for (var i = 0; i < paddingClasses.length; i++) {
                classes.push(paddingClasses[i]);
            }
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

    renderDropdownMenu: function (component) {
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
        return '<div class="dropdown"><button class="btn btn-' + buttonStyle + buttonSize + ' dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">' + (component.label || 'Menu') + '</button><ul class="dropdown-menu">' + menuItems.join('') + '</ul></div>';
    },
    
 // === CONTAINER COMPONENT RENDERERS ===
    renderCard: function (component) {
        // Only show header if it's a string, not a function
        var header = '';
        if (component.header && typeof component.header === 'string') {
            header = '<div class="card-header">' + component.header + '</div>';
        }

        // Only show footer if it's a string, not a function  
        var footer = '';
        if (component.footer && typeof component.footer === 'string') {
            footer = '<div class="card-footer">' + component.footer + '</div>';
        }

        var body = '';
        if (component.children) {
            var childrenHTML = '';
            for (var i = 0; i < component.children.length; i++) {
                childrenHTML += this.renderUIComponent(component.children[i]);
            }
            body = '<div class="card-body">' + childrenHTML + '</div>';
        } else if (component.content) {
            body = '<div class="card-body">' + component.content + '</div>';
        } else {
            // Default empty body if no content
            body = '<div class="card-body"></div>';
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

    renderAlert: function (component) {
        var style = component.modifiers && component.modifiers.style ? component.modifiers.style : 'info';
        var dismissible = component.modifiers && component.modifiers.dismissible;
        var alertClass = 'alert alert-' + style;
        if (dismissible) {
            alertClass += ' alert-dismissible fade show';
        }
        var closeButton = dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' : '';
        return '<div class="' + alertClass + '" role="alert">' + (component.content || '') + closeButton + '</div>';
    },

    renderModal: function (component) {
        var size = component.modifiers && component.modifiers.size ? ' modal-' + component.modifiers.size : '';
        var centered = component.modifiers && component.modifiers.centered ? ' modal-dialog-centered' : '';
        var scrollable = component.modifiers && component.modifiers.scrollable ? ' modal-dialog-scrollable' : '';
        var header = component.title ? '<div class="modal-header"><h1 class="modal-title fs-5">' + component.title + '</h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>' : '';
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
        return '<div class="modal fade" id="' + (component.id || 'modal') + '" tabindex="-1" aria-hidden="true"><div class="modal-dialog' + size + centered + scrollable + '"><div class="modal-content">' + header + body + footer + '</div></div></div>';
    },

    // === DATA COMPONENT RENDERERS ===
    renderList: function (component) {
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

    renderPagination: function (component) {
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
        return '<nav aria-label="Pagination"><ul class="pagination' + size + '">' + items.join('') + '</ul></nav>';
    },
    
// === ENHANCED UI COMPONENT CREATOR FUNCTIONS ===
    createVStack: function (children, options) {
        var component = {
            componentType: 'VStack',
            children: children,
            modifiers: {},
            spacing: options && options.spacing ? options.spacing : null
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createHStack: function (children, options) {
        var component = {
            componentType: 'HStack',
            children: children,
            modifiers: {},
            spacing: options && options.spacing ? options.spacing : null
        };
        
        component.justify = function (alignment) {
            this.modifiers.justify = alignment;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createSpacer: function () {
        return {
            componentType: 'Spacer',
            modifiers: {}
        };
    },

    createText: function (content) {
        var component = {
            componentType: 'Text',
            content: content,
            modifiers: {}
        };
        
        component.font = function (size) {
            this.modifiers.font = size;
            return this;
        };
        
        component.color = function (color) {
            this.modifiers.color = color;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createBadge: function (content) {
        var component = {
            componentType: 'Badge',
            content: content,
            modifiers: {}
        };
        
        component.style = function (style) {
            this.modifiers.style = style;
            return this;
        };
        
        component.pill = function (pill) {
            this.modifiers.pill = pill;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createTextField: function (label, binding) {
        var component = {
            componentType: 'TextField',
            label: label,
            binding: binding,
            modifiers: {}
        };

        component.required = function (required) {
            this.modifiers.required = required;
            return this;
        };

        component.placeholder = function (text) {
            this.modifiers.placeholder = text;
            return this;
        };

        component.type = function (type) {
            this.modifiers.type = type;
            return this;
        };

        component.value = function (value) {
            this.modifiers.value = value;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };

        return component;
    },

    createTextArea: function (label, binding) {
        var component = {
            componentType: 'TextArea',
            label: label,
            binding: binding,
            modifiers: {}
        };

        component.required = function (required) {
            this.modifiers.required = required;
            return this;
        };

        component.placeholder = function (text) {
            this.modifiers.placeholder = text;
            return this;
        };

        component.rows = function (rows) {
            this.modifiers.rows = rows;
            return this;
        };

        component.value = function (value) {
            this.modifiers.value = value;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };

        return component;
    },

    createRadioGroup: function (label, binding, options) {
        var component = {
            componentType: 'RadioGroup',
            label: label,
            binding: binding,
            options: options || [],
            modifiers: {}
        };
        
        component.inline = function (inline) {
            this.modifiers.inline = inline;
            return this;
        };
        
        component.value = function (value) {
            this.modifiers.value = value;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createSelect: function (label, binding, options) {
        var component = {
            componentType: 'Select',
            label: label,
            binding: binding,
            options: options || [],
            modifiers: {}
        };
        
        component.required = function (required) {
            this.modifiers.required = required;
            return this;
        };
        
        component.placeholder = function (text) {
            this.modifiers.placeholder = text;
            return this;
        };
        
        component.multiple = function (multiple) {
            this.modifiers.multiple = multiple;
            return this;
        };
        
        component.size = function (size) {
            this.modifiers.size = size;
            return this;
        };
        
        component.value = function (value) {
            this.modifiers.value = value;
            return this;
        };
        
        component.disabled = function (disabled) {
            this.modifiers.disabled = disabled;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createCheckbox: function (label, binding, value) {
        var component = {
            componentType: 'Checkbox',
            label: label,
            binding: binding,
            value: value,
            modifiers: {}
        };
        
        component.checked = function (checked) {
            this.modifiers.checked = checked;
            return this;
        };
        
        component.disabled = function (disabled) {
            this.modifiers.disabled = disabled;
            return this;
        };
        
        component.inline = function (inline) {
            this.modifiers.inline = inline;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createToggle: function (label, binding) {
        var component = {
            componentType: 'Toggle',
            label: label,
            binding: binding,
            modifiers: {}
        };
        
        component.checked = function (checked) {
            this.modifiers.checked = checked;
            return this;
        };
        
        component.disabled = function (disabled) {
            this.modifiers.disabled = disabled;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createButton: function (label, action) {
        var component = {
            componentType: 'Button',
            label: label,
            action: action,
            modifiers: {}
        };
        
        component.style = function (style) {
            this.modifiers.style = style;
            return this;
        };
        
        component.size = function (size) {
            this.modifiers.size = size;
            return this;
        };
        
        component.icon = function (icon) {
            this.modifiers.icon = icon;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createDropdownMenu: function (label, items) {
        var component = {
            componentType: 'DropdownMenu',
            label: label,
            items: items || [],
            modifiers: {}
        };
        
        component.style = function (style) {
            this.modifiers.style = style;
            return this;
        };
        
        component.size = function (size) {
            this.modifiers.size = size;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createCard: function (content) {
        var component = {
            componentType: 'Card',
            content: content,
            modifiers: {}
        };
        
        component.header = function (header) {
            this.header = header;
            return this;
        };
        
        component.footer = function (footer) {
            this.footer = footer;
            return this;
        };
        
        component.border = function (border) {
            this.modifiers.border = border;
            return this;
        };
        
        component.textAlign = function (align) {
            this.modifiers.textAlign = align;
            return this;
        };
        
        component.children = function (children) {
            this.children = children;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createAlert: function (content) {
        var component = {
            componentType: 'Alert',
            content: content,
            modifiers: {}
        };
        
        component.style = function (style) {
            this.modifiers.style = style;
            return this;
        };
        
        component.dismissible = function (dismissible) {
            this.modifiers.dismissible = dismissible;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createModal: function (id, title, content) {
        var component = {
            componentType: 'Modal',
            id: id,
            title: title,
            content: content,
            modifiers: {}
        };
        
        component.size = function (size) {
            this.modifiers.size = size;
            return this;
        };
        
        component.centered = function (centered) {
            this.modifiers.centered = centered;
            return this;
        };
        
        component.scrollable = function (scrollable) {
            this.modifiers.scrollable = scrollable;
            return this;
        };
        
        component.actions = function (actions) {
            this.actions = actions;
            return this;
        };
        
        component.children = function (children) {
            this.children = children;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createList: function (data, keyPath, itemBuilder) {
        var component = {
            componentType: 'List',
            data: data,
            keyPath: keyPath,
            itemBuilder: itemBuilder,
            modifiers: {}
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    },

    createPagination: function (currentPage, totalPages, onPageChange) {
        var component = {
            componentType: 'Pagination',
            currentPage: currentPage || 1,
            totalPages: totalPages || 1,
            onPageChange: onPageChange,
            modifiers: {}
        };
        
        component.size = function (size) {
            this.modifiers.size = size;
            return this;
        };
        
        component.maxVisible = function (max) {
            this.modifiers.maxVisible = max;
            return this;
        };
        
        component.showFirst = function (show) {
            this.modifiers.showFirst = show;
            return this;
        };
        
        component.showLast = function (show) {
            this.modifiers.showLast = show;
            return this;
        };
        
        component.padding = function (direction, value) {
            if (!this.modifiers.padding) this.modifiers.padding = {};
            this.modifiers.padding[direction] = value;
            return this;
        };
        
        return component;
    }
    
 }; // End of GunBasic object

// === GLOBAL API FUNCTIONS ===
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

// === ENHANCED GLOBAL UI COMPONENT CREATOR FUNCTIONS WITH SPACING ===
function VStack(children, options) {
    return GunBasic.createVStack(children, options);
}

function HStack(children, options) {
    return GunBasic.createHStack(children, options);
}

function Spacer() {
    return GunBasic.createSpacer();
}

function Text(content) {
    return GunBasic.createText(content);
}

function Badge(content) {
    return GunBasic.createBadge(content);
}

function TextField(label, binding) {
    return GunBasic.createTextField(label, binding);
}

function TextArea(label, binding) {
    return GunBasic.createTextArea(label, binding);
}

function RadioGroup(label, binding, options) {
    return GunBasic.createRadioGroup(label, binding, options);
}

function Select(label, binding, options) {
    return GunBasic.createSelect(label, binding, options);
}

function Checkbox(label, binding, value) {
    return GunBasic.createCheckbox(label, binding, value);
}

function Toggle(label, binding) {
    return GunBasic.createToggle(label, binding);
}

function Button(label, action) {
    return GunBasic.createButton(label, action);
}

function DropdownMenu(label, items) {
    return GunBasic.createDropdownMenu(label, items);
}

function Card(content) {
    return GunBasic.createCard(content);
}

function Alert(content) {
    return GunBasic.createAlert(content);
}

function Modal(id, title, content) {
    return GunBasic.createModal(id, title, content);
}

function List(data, keyPath, itemBuilder) {
    return GunBasic.createList(data, keyPath, itemBuilder);
}

function Pagination(currentPage, totalPages, onPageChange) {
    return GunBasic.createPagination(currentPage, totalPages, onPageChange);
}

// Ensure global functions are available on window object
window.VStack = VStack;
window.HStack = HStack;
window.Spacer = Spacer;
window.Text = Text;
window.Badge = Badge;
window.TextField = TextField;
window.TextArea = TextArea;
window.RadioGroup = RadioGroup;
window.Select = Select;
window.Checkbox = Checkbox;
window.Toggle = Toggle;
window.Button = Button;
window.DropdownMenu = DropdownMenu;
window.Card = Card;
window.Alert = Alert;
window.Modal = Modal;
window.List = List;
window.Pagination = Pagination;

/* ========================================
   USAGE EXAMPLES - SWIFTUI STYLE FEATURES
   ======================================== */

/*
// ✨ NEW FEATURES IN YOUR UPDATED FRAMEWORK:

// 🎯 Spacing between stack children:
VStack([
    Text("Item 1"),
    Text("Item 2"), 
    Text("Item 3")
], {spacing: 3})  // Adds gap-3 class

HStack([
    Button("Left", "test"),
    Button("Right", "test")
], {spacing: 2})  // Adds gap-2 class

// 🎯 Padding on individual components:
Button("Click Me", "test")
    .style("primary")
    .padding("bottom", 2)      // Adds pb-2
    .padding("horizontal", 3)  // Adds px-3

Text("Hello World")
    .font("title")
    .padding("all", 2)         // Adds p-2
    .padding("vertical", 1)    // Adds py-1

TextField("Name", "name")
    .placeholder("Enter name")
    .padding("bottom", 2)      // Adds pb-2 to wrapper

Badge("New")
    .style("success")
    .padding("horizontal", 2)  // Adds px-2

// 🎯 All padding directions supported:
.padding("all", 3)        // p-3
.padding("top", 2)        // pt-2
.padding("bottom", 2)     // pb-2
.padding("left", 2)       // ps-2 (Bootstrap 5)
.padding("right", 2)      // pe-2 (Bootstrap 5)
.padding("leading", 2)    // ps-2 (SwiftUI style)
.padding("trailing", 2)   // pe-2 (SwiftUI style)
.padding("horizontal", 2) // px-2
.padding("vertical", 2)   // py-2

// 🎯 Combined approaches for perfect layouts:
VStack([
    Text("User Form").font("title").padding("bottom", 2),
    TextField("Name", "name").placeholder("Enter name").padding("bottom", 2),
    TextField("Email", "email").type("email").padding("bottom", 2),
    HStack([
        Button("Cancel", "test").padding("right", 2),
        Button("Submit", "test").style("primary")
    ], {spacing: 2})
], {spacing: 3}).padding("all", 4)

// 🎯 Your button demo with proper spacing:
VStack([
    Button("Primary", "test").style("primary").padding("bottom", 2),
    Button("Secondary", "test").style("secondary").padding("bottom", 2), 
    Button("Success", "test").style("success")
], {spacing: 2})

// 🎯 Complex form with perfect spacing:
Card().children([
    VStack([
        Text("Contact Form").font("title"),
        TextField("Full Name", "name").required(true).padding("bottom", 1),
        TextField("Email", "email").type("email").required(true).padding("bottom", 1),
        TextArea("Message", "message").rows(4).padding("bottom", 2),
        HStack([
            Button("Cancel", "cancelForm").style("secondary"),
            Button("Send Message", "submitForm").style("primary")
        ], {spacing: 2})
    ], {spacing: 2})
]).padding("all", 3)

*/   
    
    

    



