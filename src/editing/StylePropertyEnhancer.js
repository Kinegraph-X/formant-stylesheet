/**
 * @constructor StylePropertyEnhancer
 * 
 * 
 */

var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
// require CSS-parser...
var parser = require('src/parsers/css-parser');


var StylePropertyEnhancer = function() {
	this.objectType = 'StylePropertyEnhancer';
	
}

StylePropertyEnhancer.prototype.toCSSPropertyBuffer = function(attrName, attrValue) {
	var packedCSSProperty = new CSSPropertyBuffer();
	
	packedCSSProperty.setValue(
		attrName,
		parser.parseAListOfComponentValues(attrValue)
		);
	
	return packedCSSProperty;
}

StylePropertyEnhancer.prototype.fromCSSPropertyBuffer = function(propBuffer) {
	
}

StylePropertyEnhancer.prototype.toCSSOM = function(propBuffer) {
	
}

StylePropertyEnhancer.prototype.fromCSSOM = function(propBuffer) {
	
}

















module.exports = StylePropertyEnhancer;