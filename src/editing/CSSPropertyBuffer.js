/**
 * @constructor CSSPropertyBuffer
 */


var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');


var CSSPropertyBuffer = function(initialLoad) {
	this.objectType = 'CSSPropertyBuffer';

	//	this._occupancy = new Uint8Array(bufferSize);

	this._buffer = new Uint8Array(initialLoad || this.bufferSchema.size);


}
CSSPropertyBuffer.prototype = Object.create(Uint8Array.prototype);
CSSPropertyBuffer.prototype.objectType = 'CSSPropertyBuffer';

CSSPropertyBuffer.prototype.setValue = function(propName, parsedValue) {
	var tokenType;
	
	// arrays are temporarily not supported
	var seen = false;
	
//	console.log(parsedValue);
	
	parsedValue.forEach(function(val) {
		if (tokenType === 'WHITESPACE' && !seen)
			return;
		
		tokenType = Object.getPrototypeOf(val).tokenType;
		val.type = this.handleTypesFromCSSSpec(val, tokenType);
		this.populate(propName, tokenType, val.type, val.value);
		seen = true;
		
//		console.log([propName, tokenType, val.type, val.value]);	
	}, this);
}

CSSPropertyBuffer.prototype.handleTypesFromCSSSpec = function(val, tokenType) {
	return val.type === 'unrestricted'
		? 'color'
		: (tokenType === 'PERCENTAGE'
			? 'percentage'
			: (typeof val.type === 'undefined'
				? 'string'
				: val.type)
			);
}

CSSPropertyBuffer.prototype.populate = function(propName, tokenType, type, value) {
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
	// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
	
//	console.log([propName, tokenType, type, value]);
	
	// TokenType from the parser as a numeric constant
	this._buffer.set(
			[this.TokenTypes[tokenType]],
			this.bufferSchema.tokenType.start
		);
	// value type
	var valueTypeAsConst = this.ValueTypes[type];
	this._buffer.set(
			[valueTypeAsConst],
			this.bufferSchema.propertyType.start
		);
	// value
	this._buffer.set(
			[valueTypeAsConst < 3 ? value : 0],
			this.bufferSchema.propertyValue.start
		);
	// representation
	this._buffer.set(
			valueTypeAsConst < 3 ? String(value).getNcharsAsCharCodesArray(20, 0)[1] : value.getNcharsAsCharCodesArray(20, 0)[1],
			this.bufferSchema.repr.start
		);
	// unit
	this._buffer.set(
			[value.unit ? this.Units[value.unit].idx : 0],
			this.bufferSchema.unit.start
		);
	
//	console.log(this._buffer);
}

Object.defineProperty(CSSPropertyBuffer.prototype, 'TokenTypes', {
	value : {
			BadStringToken : 0,
			BadURLToken : 1,
			WhitespaceToken : 2,
			CDOToken : 3,
			CDCToken : 4,
			ColonToken : 5,
			SemicolonToken : 6,
			CommaToken : 7,
			OpenCurlyToken : 8,
			CloseCurlyToken : 9,
			OpenSquareToken : 10,
			CloseSquareToken : 11,
			OpenParenToken : 12,
			CloseParenToken : 13,
			IncludeMatchToken : 14,
			DashMatchToken : 15,
			PrefixMatchToken : 16,
			SuffixMatchToken : 17,
			SubstringMatchToken : 18,
			ColumnToken : 19,
			EOFToken : 20,
			DelimToken : 21,
			IdentToken : 22,
			FunctionToken : 23,
			AtKeywordToken : 24,
			HashToken : 25,
			StringToken : 26,
			URLToken : 27,
			NumberToken : 28,
			PercentageToken : 29,
			DimensionToken : 30
			}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'ValueTypes', {
	value : {
		integer : 0,
		percentage : 1,
		float : 2,
		string : 3,
		numericalArray : 4
	}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'Units', {
	value : {
		none : {
			idx : 0,
			unit : 'NA',
			fullName : 'non-applicable',
			equivStr : 'some values have no unit'
		},
		cm : {
			idx : 1,
			unit : 'cm',
			fullName : 'centimeters',
			equivStr : '1cm : 96px/2.54'
		} ,
		mm : {
			idx : 2,
			unit : 'mm',
			fullName : 'millimeters',
			equivStr : '1mm : 1/10th of 1cm'
		} ,
		Q : {
			idx : 3,
			unit : 'Q',
			fullName : 'quarter',
			equivStr : '1Q : 1/40th of 1cm'
		},
		in : {
			idx : 4,
			unit : 'in',
			fullName : 'inches',
			equivStr : '1in : 2.54cm : 96px'
		},
		pc : {
			idx : 5,
			unit : 'pc',
			fullName : 'picas',
			equivStr : '1pc : 1/6th of 1in'
		},
		pt : {
			idx : 6,
			unit : 'pt',
			fullName : 'points',
			equivStr : '1pt : 1/72th of 1in'
		},
		px : {
			idx : 7,
			unit : 'px',
			fullName : 'pixels',
			equivStr : '1px : 1/96th of 1in '
		}
	}
});


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
		20,		// defining a tight limit to the size of the representation of a string is obviously a strong opinion: lets keep some neurons on it)
		1
	]
);

	






module.exports = CSSPropertyBuffer;