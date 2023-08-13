/**
 * construct. FontSizeBuffer
 */

//var TypeManager = require('src/core/TypeManager');

var TextSizeGetter = require('src/core/TextSizeGetter');

/**
 * @constructor FontSizeBuffer
 */
var FontSizeBuffer = function(fontSize, fontFamily) {
	this._buffer = new Float64Array(new ArrayBuffer(256 * 8));
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
//	var c = 32;
	for (var i = 32, l = 256; i < l; i++) {
//		console.log(c, String.fromCharCode(c), this.textSizeGetter.getTextWidth(String.fromCharCode(c)), i)
		this._buffer.set([this.textSizeGetter.getTextWidth(String.fromCharCode(i))], i);
//		c++;
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