/**
 * Construct. StyleSheetWrapper
 * 
 * @param styleSheet StyleSheet
 * @returns self
 */
 
var Logger = require('src/tools/Logger');
var factory = require('src/core/Factory');
var Style = require('src/editing/Style');

	var logger;
	
	StylesheetWrapper = function(stylesheet, rawDef) {
		this.objectType = 'StyleSheetWrapper';
		this.rules = {};
		
		if (typeof stylesheet !== 'undefined' && stylesheet !== null)
			this.stylesheet = stylesheet;
		else if (stylesheet === null) {
			if (typeof rawDef === 'undefined')
				logger.error(this.objectType, 'undefined styleDef on raw stylesheet init');
			else if (Array.isArray(rawDef)) {
				var sheet = document.createElement('style');
				document.head.appendChild(sheet);
				this.stylesheet = sheet.sheet;
				this.rawInitWithStyleDef(rawDef);
			}
			else {
				logger.error(this.objectType, 'styleDef should be of type Array');
			}
		}
	}
	
	StylesheetWrapper.prototype.rawInitWithStyleDef = function(rawDef) {
		var self = this;
		rawDef.forEach(function(def, key) {
			var type = def.type || 'span';
			var id = def.id;
			if (typeof def.id === 'undefined' || !def.id.length)
				return;
			delete def.id;
			delete def.type;
			var style = Style(context).create(type, id, def);
			self.addStyle(style);
		});
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
	
	
var classConstructor = function(stylesheet, rawDef) {
	var context = this.context;
	logger = Logger(context).getInstance();
	return new StylesheetWrapper(stylesheet, rawDef);
}

module.exports = factory.Maker.getClassFactory(classConstructor);
