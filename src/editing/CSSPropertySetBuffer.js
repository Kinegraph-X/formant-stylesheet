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
	
}
CSSPropertySetBuffer.prototype = Object.create(MemoryMapBuffer.prototype);
CSSPropertySetBuffer.prototype.objectType = 'CSSPropertySetBuffer';

// FIXME: why is that obtained through a function call ?
CSSPropertySetBuffer.prototype.propertiesStaticMap = SplittedAttributes.allKnownCSSPropertiesFactory();
CSSPropertySetBuffer.prototype.propertiesAccessGroupsBoudaries = SplittedAttributes.allKnownCSSPropertiesBoudaries();

//CSSPropertySetBuffer.prototype.specializedMethod = function() {
//	
//}














module.exports = CSSPropertySetBuffer;