/**
 * Construct. StyleSheetWrapper
 * 
 * @param styleSheet StyleSheet
 * @returns self
 */
 
 
var factory = require('src/core/Factory');

var classConstructor = function(styleSheet) {
	
	StyleSheetWrapper = function(styleSheet) {
		this.styleSheet = styleSheet;
		this.rules = {};
	}

	StyleSheetWrapper.prototype.addStyles = function(styles) {
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

	StyleSheetWrapper.prototype.addStyle = function(style) {
		this.rules[style.id] = {index : this.styleSheet.cssRules.length, rule : style.linearize()};
		this.styleSheet.insertRule(style.linearize(), this.styleSheet.cssRules.length);
	}

	StyleSheetWrapper.prototype.removeStyles = function(styles) {
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

	StyleSheetWrapper.prototype.removeStyle = function(style) {
		var index = this.getStyle(style);
		self.styleSheet.deleteRule(this.rules[style.id].index);
		delete this.rules[style.id];
	}

	StyleSheetWrapper.prototype.getStyle = function(style) {
		return this.rules[style.id].index;
	}
	
	
	return new StyleSheetWrapper(styleSheet);
}


module.exports = factory.Maker.getClassFactory(classConstructor);