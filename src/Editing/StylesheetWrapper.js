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
	
	StylesheetWrapper = function(rawDef, stylesheet, appendElem) {
		this.objectType = 'StyleSheetWrapper';
		this.rules = {};
		
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
				this.rawInitWithStyleDef(rawDef);
//				if (appendElem !== true)
//					this.styleElem.remove();
			}
			else {
				console.error(this.objectType, 'styleDef should be of type Array');
			}
		}
	}
	
	StylesheetWrapper.prototype.rawInitWithStyleDef = function(rawDef) {
		var self = this;

		rawDef.forEach(function(def, key) {
			if (!self.styleElem.hasAttribute('name'))
				self.styleElem.setAttribute('name', def.id);
			
			var type = def.type || '';
			var id = def.id;
			if (typeof def.id === 'undefined' || !def.id.length)
				return;
			delete def.id;
			delete def.type;
			var style = new Style(type, id, def);
			self.addStyle(style);
		});
		this.linearizeAndAppendCurrentRules();
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
//		console.log(style.id, style.linearize());
		if (!style || typeof style.id === 'undefined')
			return;
		this.rules[style.id] = {index : Object.keys(this.rules).length, rule : style, strRule : style.linearize()};
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
		this.styleElem.innerHTML = styleAsString;
	}
	
	StylesheetWrapper.prototype.replaceStyle = function(styleRule, attributesList) {
		var type = styleRule.type || '';
		var id = styleRule.id;
		this.removeStyle(styleRule);
		
		// still would need to implement the stylesheet case (but is of no use with the custom elem logic: working wih styleElems is sort of a requirement)
		if (!this.stylesheet) {
			if (typeof id === 'undefined' || !id.length)
				return;
			var style = new Style(type, id, attributesList);
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
			this.stylesheet.deleteRule(this.rules[style.id].index);
		}
		else if (this.styleElem.innerHTML) {
//			console.log(this.rules[style.id].strRule);
//			console.log(this.styleElem.innerHTML);
//			console.log(this.styleElem.innerHTML.replace(this.rules[style.id].strRule, ''));
			this.styleElem.innerHTML = this.styleElem.innerHTML.replace(this.rules[style.id].strRule, '');
		}
		delete this.rules[style.id];
	}

	StylesheetWrapper.prototype.getStyleIdx = function(style) {
		return this.rules[style.id].index;
	}
	
	StylesheetWrapper.prototype.getRuleDefinition = function(id, prop) {
		if (prop)
			return this.rules[id] ? this.rules[id].rule.attributes[prop] : false;
		else
			return this.rules[id] ? this.rules[id].rule.attributes : false;
	}
	
	StylesheetWrapper.prototype.getRuleAsObject = function(id) {
//		console.log(this.rules);
		return this.rules[id] ? this.rules[id] : false;
	}
	
	
	
//var classConstructor = function(rawDef, stylesheet, appendElem) {
//	context = this.context;
////	logger = Logger(context).getInstance();
//	return new StylesheetWrapper(rawDef, stylesheet, appendElem);
//}

//module.exports = factory.Maker.getClassFactory(classConstructor);
module.exports = StylesheetWrapper;
