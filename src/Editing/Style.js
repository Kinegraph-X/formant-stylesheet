/**
* Stylesheets
*/


/**
 * Construct. Style
 * 
 * @param type String : 'p' || 'span'
 * @param id String : DOM "id" attribute
 * @param attributes Object : passive partial AttributeList-Like (no methods, only significative keys defined)
 */
 
var factory = require('src/core/Factory');
var StyleAttributes = require('src/editing/StyleAttributes');

	var Style = function(type, id, attributes) {
		this.id = attributes.id || id;
		this.index = NaN; 	// index in the CSSStyleSheet.CSSRules Array (shall not be set for a style constructor, but kept here as a reminder, as the stylesheetWrapper on addStyle() shall linearize the style and reference the actual index)
		this.type = type;
		this.attributes = StyleAttributes(this.context).create(this.type, attributes);
	}

	Style.prototype.linearize = function() {
		return '.' + this.id + ' { ' + '\n' + this.attributes.linearize() + '\n' + '}';
	}

	Style.prototype.addToStyleSheet = function(styleSheet) {
		this.index = styleSheet.insertRule(this.linearize())
	}

	Style.prototype.removeFromStyleSheet = function(styleSheet) {
		styleSheet.deleteRule(this.index);
	}

var classConstructor = function(type, id, attributes) {
	return new Style(type, id, attributes);
}

module.exports = factory.Maker.getClassFactory(classConstructor);
