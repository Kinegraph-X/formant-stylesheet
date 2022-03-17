/**
 * @constructor CSSPropertySetBuffer
 */

var TypeManager = require('src/core/TypeManager');
var MemoryMapBuffer = require('src/core/MemoryMapBuffer');
var SplittedAttributes = require('src/editing/SplittedAttributes');
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');

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
CSSPropertySetBuffer.prototype.propertiesStaticArray = Object.keys(CSSPropertySetBuffer.prototype.propertiesStaticMap);
CSSPropertySetBuffer.prototype.propertiesAccessGroupsBoundaries = SplittedAttributes.allKnownCSSPropertiesBoundaries();

CSSPropertySetBuffer.prototype.getPosForProp = function(propName) {
	var propIdx = 0;

	if ((propIdx = this.propertiesStaticArray.indexOf(propName)) !== -1) {
		return propIdx;
	}
	return -1;
}

CSSPropertySetBuffer.prototype.getProp = function(propName) {
	var posForProp = this.getPosForProp(propName) * this.itemSize;
	var propAsBuffer = new CSSPropertyBuffer(
			this._buffer.slice(posForProp, posForProp + this.itemSize)
		);
	return propAsBuffer; 
}

CSSPropertySetBuffer.prototype.setProp = function(propName, propBuffer) {
	var posForProp = this.getPosForProp(propName) * this.itemSize;
	this._buffer.set(propBuffer._buffer, posForProp);
}

CSSPropertySetBuffer.prototype.update = function() {
	
}

CSSPropertySetBuffer.prototype.accessPropertyGroup = function(groupName) {
	var c = 0;
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];

	var ret = {};
	for (var i = boundaries.start, end = boundaries.start + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		ret[groupName + c] = this._buffer.slice(i, i + this.itemSize);
		c++;
	}
	return ret;
}

CSSPropertySetBuffer.prototype.updatePropertyGroup = function(givenPropertyGroup) {
	
}

CSSPropertySetBuffer.prototype.arrayBufferToString = function(buf) {
	return buf.bufferToString();
}

CSSPropertySetBuffer.prototype.typedArrayToString = function(tArray) {
	return this.arrayBufferToString(tArray);
}

CSSPropertySetBuffer.prototype.bufferedValueToString = function(propName, valueName) {
	var propBuffer = this.getProp(propName);
	var start = propBuffer.bufferSchema[valueName].start, end = start + propBuffer.bufferSchema[valueName].length

	return this.typedArrayToString(
			propBuffer._buffer.slice(start, end).buffer
		);
}













module.exports = CSSPropertySetBuffer;