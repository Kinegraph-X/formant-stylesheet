/**
 * Construct. StyleSheetWrapper
 * 
 * @param styleSheet StyleSheet
 * @returns self
 */
 
var Logger = require('src/Error&Log/Logger');
var factory = require('src/core/Factory');
var Style = require('src/editing/Style');

	var context, logger;
	
	StylesheetWrapper = function(rawDef, stylesheet, appendElem) {
		this.objectType = 'StyleSheetWrapper';
		this.rules = {};
		
		if (typeof stylesheet !== 'undefined' && stylesheet !== null)
			this.stylesheet = stylesheet;
		else {
			if (typeof rawDef === 'undefined')
				logger.error(this.objectType, 'undefined styleDef on raw stylesheet init');
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
				logger.error(this.objectType, 'styleDef should be of type Array');
			}
		}
	}
	
	StylesheetWrapper.prototype.rawInitWithStyleDef = function(rawDef) {
		var self = this, styleAsString = '';

		rawDef.forEach(function(def, key) {
			if (!self.styleElem.hasAttribute('name'))
				self.styleElem.setAttribute('name', def.id);
			
			var type = def.type || '';
			var id = def.id;
			if (typeof def.id === 'undefined' || !def.id.length)
				return;
			delete def.id;
			delete def.type;
			var style = Style(context).create(type, id, def);
//			self.addStyle(style);
			styleAsString += style.linearize();
		});
		self.styleElem.innerHTML = styleAsString;
	}

	StylesheetWrapper.prototype.addStyles = function(styles) {
		var self = this;
		
		if (typeof styles === 'object') {
			$.each(styles, function(key, style) {
				self.addStyle(style);
			});
		}
		else if (typeof styles === 'string') {
			self.addStyle(styles);
		}
	}

	StylesheetWrapper.prototype.addStyle = function(style) {
		// prevent erroneous injection (raw attributeList, null, undefined, etc.)
		if (!style || typeof style.id === 'undefined')
			return;
		this.rules[style.id] = {index : this.stylesheet.cssRules.length, rule : style.linearize()};
		this.stylesheet.insertRule(style.linearize(), this.stylesheet.cssRules.length);
	}

	StylesheetWrapper.prototype.removeStyles = function(styles) {
		var self = this;
		if (typeof styles === 'object') {
			$.each(styles, function(key, style) {
				self.removeStyle(style);
			});
		}
		else if (typeof styles === 'string') {
			this.removeStyle(styles);
		}
	}

	StylesheetWrapper.prototype.removeStyle = function(style) {
		var index = this.getStyle(style);
		self.stylesheet.deleteRule(this.rules[style.id].index);
		delete this.rules[style.id];
	}

	StylesheetWrapper.prototype.getStyle = function(style) {
		return this.rules[style.id].index;
	}
	
	
var classConstructor = function(rawDef, stylesheet, appendElem) {
	context = this.context;
	logger = Logger(context).getInstance();
	return new StylesheetWrapper(rawDef, stylesheet, appendElem);
}

module.exports = factory.Maker.getClassFactory(classConstructor);
