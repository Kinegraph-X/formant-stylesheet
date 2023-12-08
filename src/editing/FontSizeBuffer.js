/**
 * construct. FontSizeBuffer
 */

//var TypeManager = require('src/core/TypeManager');

var TextSizeGetter = require('src/core/TextSizeGetter');

/**
 * @constructor FontSizeBuffer
 */
var FontSizeBuffer = function(fontSize, fontFamily) {
	this._buffer = new Float64Array(new ArrayBuffer(341 * 8));
	this.objectType = 'FontSizeBuffer';
	
	// For now, we assume we won't have to fall back on the second typeface of the family
	this.fontStyle = fontSize + ' ' + fontFamily.split(',')[0];
	this.textSizeGetter = new TextSizeGetter(this.fontStyle);
	
	if (this.fontStyle)
		this.populateInitialValues();
}
FontSizeBuffer.prototype = {};
FontSizeBuffer.prototype.objectType = 'FontSizeBuffer';

FontSizeBuffer.prototype.populateInitialValues = function() {
	// We need to cache values until 340 tio catch "oe"
	for (var i = 32, l = 340; i < l; i++) {
//		console.log(i, String.fromCharCode(i), this.textSizeGetter.getTextWidth(String.fromCharCode(i)))
		this._buffer.set([this.textSizeGetter.getTextWidth(String.fromCharCode(i))], i);
	}
}

FontSizeBuffer.prototype.getWidthOfSpace = function() {
	return this._buffer.at(32);
}

FontSizeBuffer.prototype.getWidthOfWord = function(str) {
	var width = 0;
	for (var i = 0, l = str.length; i < l; i++) {
//		console.log(i, str.charCodeAt(i), this._buffer.at(str.charCodeAt(i)))
		width += this._buffer.at(str.charCodeAt(i));
	}
	return width;
}

module.exports = FontSizeBuffer;