/**
 * @constructor CSSPropertySetBuffer
 */

var TypeManager = require('src/core/TypeManager');
var MemoryMapBuffer = require('src/core/MemoryMapBuffer');
var SplittedAttributes = require('src/editing/SplittedAttributes');


var CSSPropertySetBuffer = function(initialContent) {
//	console.log(this);
	var itemSize = SplittedAttributes.prototype.CSSPropertyBufferSize;
	initialContent = initialContent || this.propertiesStaticMap;
	MemoryMapBuffer.call(this, itemSize, initialContent);
	this.objectType = 'CSSPropertySetBuffer';
	
//	console.log(this.propertiesAccessGroupsBoundaries);
}
CSSPropertySetBuffer.prototype = Object.create(MemoryMapBuffer.prototype);
CSSPropertySetBuffer.prototype.objectType = 'CSSPropertySetBuffer';

// TODO: is there a better way than obtaining those dictionaries and values through function calls ?
CSSPropertySetBuffer.prototype.propertiesStaticMap = SplittedAttributes.allKnownCSSPropertiesFactory();
CSSPropertySetBuffer.prototype.propertiesAccessGroupsBoundaries = SplittedAttributes.allKnownCSSPropertiesBoundaries();

CSSPropertySetBuffer.prototype.get = function() {
	
}

CSSPropertySetBuffer.prototype.set = function() {
	
}

CSSPropertySetBuffer.prototype.update = function() {
	
}

CSSPropertySetBuffer.prototype.accessPropertyGroup = function(callback) {
	
}

CSSPropertySetBuffer.prototype.updatePropertyGroup = function(givenPropertyGroup) {
	
}

//CSSPropertySetBuffer.prototype.specializedMethod = function() {
//	
//}














module.exports = CSSPropertySetBuffer;