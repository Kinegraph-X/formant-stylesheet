/**
 * Construct. StyleSheetWrapper
 * 
 * @param styleSheet StyleSheet
 * @returns self
 */
 
//var Logger = require('src/Error&Log/Logger');
//var factory = require('src/core/Factory');
var Style = require('src/editing/Style');

//	var context;
	
	var StylesheetWrapper = function(rawDef, stylesheet, appendElem, name) {
		this.objectType = 'StyleSheetWrapper';
		this.rules = {};
		this.isInDOM = false;
//		console.log(rawDef, stylesheet, appendElem, name);
		if (typeof stylesheet !== 'undefined' && stylesheet !== null)
			this.stylesheet = stylesheet;
		else {
			if (typeof rawDef === 'undefined')
				console.error(this.objectType, 'undefined styleDef on raw stylesheet init');
			else if (Array.isArray(rawDef)) {
				this.styleElem = document.createElement('style');
				if (appendElem === true)
					document.head.appendChild(this.styleElem);
				this.stylesheet = this.styleElem.sheet;
				this.rawInitWithStyleDef(rawDef, name);
//				if (appendElem !== true)
//					this.styleElem.remove();
			}
			else {
				console.error(this.objectType, 'styleDef should be of type Array');
			}
		}
	}
	
	StylesheetWrapper.prototype.rawInitWithStyleDef = function(rawDef, name) {
		var self = this;

		rawDef.forEach(function(def, key) {
			if (!self.styleElem.hasAttribute('name'))
				self.styleElem.setAttribute('name', name);
//			console.log(def);
			var type = def.type || '';
			var selector = def.selector;
			if (typeof def.selector === 'undefined' || !def.selector.length)
				return;
//			delete def.selector;
//			delete def.type;
			var style = new Style(type, selector, def);
			self.addStyle(style);
		});
		this.linearizeAndAppendCurrentRules();
	}
	
	// sOverrideWrapper is in fact the component's sWrapper: let's override the override to keep the cache clean
	StylesheetWrapper.prototype.handleStylesheetOverride = function(sOverrideWrapper) {
		var selector, def, selfDef, type, style;
		for (let ruleSelector in sOverrideWrapper.rules) {
			selector = sOverrideWrapper.rules[ruleSelector].rule.selector;
//			console.log(selector, this.rules[selector]);
			if (!selector)
				continue;
				
			def = sOverrideWrapper.rules[ruleSelector].rule.attributes;
			type = '';
			if (this.rules[selector]) 
				this.mergeSelfStyleUponReceived(this.rules[selector].rule, def);
			else {
				this.addStyle(new Style(type, selector, def));
			}
		}
		return this;
	}

	StylesheetWrapper.prototype.addStyles = function(styles) {
		var self = this;
		
		if (typeof styles === 'object') {
			$.each(styles, function(key, style) {
				self.addStyle(style);
			});
		}
		// inconsistent with the called method
//		else if (typeof styles === 'string') {
//			self.addStyle(styles);
//		}
	}

	StylesheetWrapper.prototype.addStyle = function(style) {
		// prevent erroneous injection (raw attributeList, null, undefined, etc.)
//		console.log(style, style.linearize());
		if (!style || typeof style.selector === 'undefined')
			return;
		this.rules[style.selector] = {index : Object.keys(this.rules).length, rule : style, strRule : style.linearize()};
		if (this.stylesheet)
			this.stylesheet.insertRule(style.linearize(), this.stylesheet.cssRules.length);
	}
	
	StylesheetWrapper.prototype.linearizeAndAppendLastRule = function() {
		var rulesKeys = Object.keys(this.rules);
		var lastRule = this.rules[rulesKeys.pop()];
		this.styleElem.innerHTML += lastRule.strRule;
//		console.log(this.styleElem.innerHTML);
	}
	
	StylesheetWrapper.prototype.linearizeAndAppendCurrentRules = function() {
		var styleAsString = '';
		for (let rule in this.rules) {
			styleAsString += this.rules[rule].rule.linearize();
		}
//		console.log(this.styleElem);
		this.styleElem.innerHTML = styleAsString;
	}
	
	StylesheetWrapper.prototype.replaceStyle = function(styleRule, attributesList) {
		var type = styleRule.type || '';
		var selector = styleRule.selector;
		
		// Replace a rule with itself after having mutated it (NOT USED)
		if (!attributesList) {
			this.styleElem.innerHTML = this.styleElem.innerHTML.replace(this.rules[styleRule.selector].strRule, '');
			attributesList = styleRule.rule.attributes
		}
		else
			this.removeStyle(styleRule);
		
		// still would need to implement the stylesheet case (but is of no use with the custom elem logic: working wih styleElems is sort of a requirement)
		if (!this.stylesheet) {
			if (typeof selector === 'undefined' || !selector.length)
				return;
			var style = new Style(type, selector, attributesList);
			this.addStyle(style);
			this.linearizeAndAppendLastRule();
		}
	}

	StylesheetWrapper.prototype.removeStyles = function(styles) {
		var self = this;
		if (typeof styles === 'object') {
			$.each(styles, function(key, style) {
				self.removeStyle(style);
			});
		}
		// inconsistent with the called method
//		else if (typeof styles === 'string') {
//			this.removeStyle(styles);
//		}
	}

	StylesheetWrapper.prototype.removeStyle = function(style) {
		if (this.stylesheet) {
			var index = this.getStyle(style);
			this.stylesheet.deleteRule(this.rules[style.selector].index);
		}
		else if (this.styleElem.innerHTML) {
//			console.log(this.rules[style.selector].strRule);
//			console.log(this.styleElem.innerHTML);
//			console.log(this.styleElem.innerHTML.replace(this.rules[style.selector].strRule, ''));
			this.styleElem.innerHTML = this.styleElem.innerHTML.replace(this.rules[style.selector].strRule, '');
		}
		delete this.rules[style.selector];
	}
	
	StylesheetWrapper.prototype.mergeSelfStyleUponReceived = function(selfStyleRule, attributesList) {
		var type = selfStyleRule.type || '';
		var selector = selfStyleRule.selector;
//		var mergedAttributes = {};//Object.assign(selfStyleRule.attributes, attributesList);
		for (let prop in attributesList) {
			if (attributesList.hasOwnProperty(prop) && !selfStyleRule.attributes[prop])
				selfStyleRule.attributes[prop] = attributesList[prop];
		}
		this.removeStyle(selfStyleRule);
		
		// still would need to implement the stylesheet case (but is of no use with the custom elem logic: working wih styleElems is sort of a requirement)
		if (!this.stylesheet) {
			if (typeof selector === 'undefined' || !selector.length)
				return;
			var style = new Style(type, selector, selfStyleRule.attributes);
			this.addStyle(style);
			this.linearizeAndAppendLastRule();
		}
	}

	StylesheetWrapper.prototype.getStyleIdx = function(style) {
		return this.rules[style.selector].index;
	}
	
	StylesheetWrapper.prototype.getRuleDefinition = function(selector, prop) {
		if (prop)
			return this.rules[selector] ? this.rules[selector].rule.attributes[prop] : false;
		else
			return this.rules[selector] ? this.rules[selector].rule.attributes : false;
	}
	
	StylesheetWrapper.prototype.getRuleAsObject = function(selector) {
		var rule;
		for (let rule in this.rules) {
			if (rule.toLowerCase() === selector.toLowerCase())
				return this.rules[selector];
		}
	}
	
	StylesheetWrapper.prototype.getRulesAsDef = function() {
		var styleAsArray = [];
		for (let rule in this.rules) {
			styleAsArray.push(Object.assign({selector : rule}, this.rules[rule].rule.attributes));
		}
		return styleAsArray;
	}
	
	
	
//var classConstructor = function(rawDef, stylesheet, appendElem) {
//	context = this.context;
////	logger = Logger(context).getInstance();
//	return new StylesheetWrapper(rawDef, stylesheet, appendElem);
//}

//module.exports = factory.Maker.getClassFactory(classConstructor);
module.exports = StylesheetWrapper;
