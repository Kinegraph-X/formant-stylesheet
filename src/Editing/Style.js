/**
* Stylesheets
*/


/**
 * Construct. Style
 * 
 * @param type {string} : 'p' || 'span'
 * @param selector {string} : CSS selector
 * @param attributes {object} : passive partial AttributeList-Like (no methods, only significative keys defined)
 */
 
//var factory = require('src/core/Factory');
var StyleAttributes = require('src/editing/StyleAttributes');

	var Style = function(type, selector, attributes) {
		this.selector = attributes.selector || selector;
		this.index = NaN; 	// index in the CSSStyleSheet.CSSRules Array (shall not be set for a style constructor, but kept here as a reminder, as the stylesheetWrapper on addStyle() shall linearize the style and reference the actual index)
		this.type = type;
		this.attributes = new StyleAttributes(this.type, attributes);
	}
	
	Style.prototype = {};
	Style.prototype.linearize = function() {
		return this.selector + ' { ' + '\n' + this.attributes.linearize() + '\n' + '}\n';
	}

	Style.prototype.addToStyleSheet = function(styleSheet) {
		this.index = styleSheet.insertRule(this.linearize())
	}

	Style.prototype.removeFromStyleSheet = function(styleSheet) {
		styleSheet.deleteRule(this.index);
	}


module.exports = Style;
