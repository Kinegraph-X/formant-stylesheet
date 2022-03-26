/**
 * @constructor StylePropertyEnhancer
 * 
 * 
 */

var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var parser = require('src/parsers/css-parser_forked');


var StylePropertyEnhancer = function() {
	this.objectType = 'StylePropertyEnhancer';
	
}

StylePropertyEnhancer.prototype.toCSSPropertyBuffer = function(attrName, attrValue) {
	var packedCSSProperty = new CSSPropertyBuffer(null, attrName);
//	console.log(attrName, attrValue);
//	console.log(packedCSSProperty);
//	console.log(parser.parseAListOfComponentValues(attrValue));
	
	packedCSSProperty.setValue(parser.parseAListOfComponentValues(attrValue));
	
	return packedCSSProperty;
}

StylePropertyEnhancer.prototype.fromCSSPropertyBuffer = function(propBuffer) {
	
}

StylePropertyEnhancer.prototype.toCSSOM = function(propBuffer) {
	
}

StylePropertyEnhancer.prototype.fromCSSOM = function(propBuffer) {
	
}

















module.exports = StylePropertyEnhancer;