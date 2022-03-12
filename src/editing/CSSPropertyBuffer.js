/**
 * @constructor CSSPropertyBuffer
 */


var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');


var CSSPropertyBuffer = function(initialLoad) {
	this.objectType = 'CSSPropertyBuffer';

	//	this._occupancy = new Uint8Array(bufferSize);

	this._buffer = new Uint8Array(propsCount);


}
CSSPropertyBuffer.prototype = Object.create(Uint8Array.prototype);
CSSPropertyBuffer.prototype.objectType = 'CSSPropertyBuffer';






//var sample = {
//	token: "DIMENSION",
//	value: 1,
//	type: "integer",
//	repr: "1",
//	unit: "px"
//}

CSSPropertyBuffer.prototype.bufferSchema = BinarySchemaFactory(
	'compactedViewOnProperty',
	[
		'tokenType',
		'propertyValue',
		'propertyType',
		'repr',
		'unit'
	],
	[
		1,
		2,
		1,
		3,
		1
	]
);









module.exports = CSSPropertyBuffer;