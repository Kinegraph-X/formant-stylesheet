/**
 * @constructor CSSPropertyBuffer
 */


//var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');
var GeneratorFor16bitsInt = require('src/core/UIDGenerator').GeneratorFor16bitsInt;
//var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');
var parser = require('src/parsers/css-parser_forked');

var CSSPropertyBuffer = function(initialLoad, propName) {
	this.objectType = 'CSSPropertyBuffer';
	this._buffer = new Uint8Array(initialLoad || this.bufferSchema.size);
	
//	if (typeof initialLoad === 'undefined' || initialLoad === null
//			|| (
//				Object.getPrototypeOf(initialLoad) === Uint8Array.prototype
//					&& initialLoad[0] === 0
//			)
//		) {
//			var defaultValue = CSSPropertyDescriptors[propName].prototype.initialValue;
//			
//			if (typeof defaultValue !== 'undefined' && defaultValue !== null) {
//				this.setValue(this.parseValue(defaultValue));
//			}
//	}
}
CSSPropertyBuffer.prototype = {};
CSSPropertyBuffer.prototype.objectType = 'CSSPropertyBuffer';

CSSPropertyBuffer.prototype.setValue = function(parsedValue) {
	// For now, we haven't yet populated the initlaValue for each CSSPropertyDescriptor.
	// So this function is very frequently called with an empty array
	if (!parsedValue.length)
		return;
	
	var valueAsParsed, tokenType, concatVal;
	// if the property is a shorthand property, or if the property may be abbreviated,
	// we concatenate back
	// => shorthands are then handled (expanded) in CSSPropertySetBuffer.setPropFromShorthand()
	// => abbreviated props are also handled (in a branch) of CSSPropertySetBuffer.setPropFromShorthand()
	
	if (parsedValue.length === 1) {
		tokenType = Object.getPrototypeOf(parsedValue[0]).tokenType.capitalizeFirstChar() + 'Token';
//		console.log(tokenType);
		if (tokenType === 'FunctionToken')
			valueAsParsed = this.functionToCanonical(parsedValue[0]);
		else
			valueAsParsed = this.fixValueFromParser(parsedValue[0]);
//		console.log(valueAsParsed);
	}
	else if (parsedValue.length > 1){
		concatVal = this.concatenateBackFromParser(parsedValue);
		tokenType = 'NonparsedToken';
		
		// Concatenated values are typed as "Non Parsed",
		// and then, the valueAsParsed only has a repr property.
		valueAsParsed = new (
			LocalTokenFromParserFactory(null, 'NONPARSED')
			)(
				tokenType,
				null,
				null,
				'string',
				concatVal
			);
	}
	
	this.populate(tokenType, valueAsParsed);
}



CSSPropertyBuffer.prototype.functionToCanonical = function(valueAsParsed) {
	var value, tokenTypeFromParser;
	if (valueAsParsed.name === 'rgb' || valueAsParsed.name === 'rgba') {
		value = new (LocalTokenFromParserFactory(null, 'HASH'))();
		value.type = 'hash';
		value.repr = '#';
		valueAsParsed.value.forEach(function(val) {
			tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
			if (tokenTypeFromParser === "WHITESPACE" || tokenTypeFromParser === "COMMA")
				return;
			else 
				value.repr += parseInt(val.value).toString(16).padStart(2, '0');
		}, this);
		return value;
	}
	else {
		// As for now, "format" and "local" are seen as unsupported functions
		if ((valueAsParsed.name === 'format' || valueAsParsed.name === 'local')
			|| (valueAsParsed.name === 'animation' || valueAsParsed.name === 'animationName' || valueAsParsed.name === 'animationDuration' || valueAsParsed.name === 'animationIterationCount' || valueAsParsed.name === 'animationIterationFunction' || valueAsParsed.name === 'animationDelay'))
			return new (LocalTokenFromParserFactory(null, 'UNDEFINED'))();
		
		console.warn('CSSPropertyBuffer->functionToCanonical: unsupported function given (' + valueAsParsed.name + ').');
		return new (LocalTokenFromParserFactory(null, 'UNDEFINED'))();
	} 
}

CSSPropertyBuffer.prototype.populate = function(tokenType, value) {
	
	// the buffer size : 64 bytes buffers shall align well on a 2048KB L2 CPU cache
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
	// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
	
	var normalizedValue = this.fixValueFromParser(value);
	
	var strVal = normalizedValue.repr,
		strLength = strVal.length,
		strBuf = strVal.getNcharsAsCharCodesArray(this.stdStrLength, 0)[1],
		valueBuf = GeneratorFor16bitsInt.intFromNumber(normalizedValue.value);
		
//	console.log('POPULATE', strVal, strBuf, value);

	// this.TokenTypes[tokenType] is the TokenType from the parser
	// represented as a numeric constant
	this._buffer.set(
			[this.TokenTypes[tokenType]],
			this.bufferSchema.tokenType.start
		);
	// value type
	var valueTypeAsConst = this.ValueTypes[value.type];
	this._buffer.set(
			[valueTypeAsConst],
			this.bufferSchema.propertyType.start
		);
	// value
	this._buffer.set(
			valueBuf,
			this.bufferSchema.propertyValue.start
		);
	// representation
	this._buffer.set(
			strBuf,
			this.bufferSchema.repr.start
		);
	// representation string length
	var strLength;
	this._buffer.set(
		[strLength],
		this.bufferSchema.reprLength.start
	);
	// unit
//	if (!this.Units[value.unit])
//		console.log(value.unit);
	this._buffer.set(
			[value.unit ? this.Units[value.unit].idx : 0],
			this.bufferSchema.unit.start
		);
}

CSSPropertyBuffer.prototype.parseAndSetValue = function(singleValueAsString) {
	var parsedValue;
	if ((parsedValue = this.parseValue(singleValueAsString)).length)
		this.setValue(parsedValue);
}

CSSPropertyBuffer.prototype.parseValue = function(singleValueAsString) {
	return parser.parseAListOfComponentValues(singleValueAsString);
}

CSSPropertyBuffer.prototype.fixValueFromParser = function(parsedValue) {
	return (new (LocalTokenFromParserFactory(parsedValue, Object.getPrototypeOf(parsedValue).tokenType))(
		null,
		parsedValue.value,
		parsedValue.name,
		parsedValue.type,
		parsedValue.repr,
		parsedValue.unit
		)
	);
}

CSSPropertyBuffer.prototype.concatenateBackFromParser = function(parsedValue) {
	var tokenTypeFromParser;
	var concatVal = ''; 
	parsedValue.forEach(function(val) {
		tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
		switch (tokenTypeFromParser) {
			case 'WHITESPACE' :
					concatVal += ' ';
					break;
			case 'PERCENTAGE' :
					concatVal += val.repr + '%';
					break;
			case 'HASH' :
					concatVal += val.value ? '#' + val.value : val.repr;
					break;
			case 'COMMA' :
					concatVal += ',';
					break;
			case 'FUNCTION' : 
					concatVal += this.functionToCanonical(val).repr;
			case 'OPENPAREN' :
					concatVal += '(';
					break;
			case 'CLOSEPAREN' :
					concatVal += ')';
					break;
			default : concatVal += typeof val.repr !== 'undefined' ? val.repr + this.Units[val.unit || ''].unit : val.value.toString() + this.Units[val.Units || ''].unit;
		}
	}, this);
	return concatVal;
}

// getValueAsString() is an alias for bufferedValueToString()
// TODO: unify
CSSPropertyBuffer.prototype.getValueAsString = function() {
	return this.bufferedValueToString();
}

// getValueAsNumber() is an alias for bufferedValueToNumber()
// TODO: unify
CSSPropertyBuffer.prototype.getValueAsNumber = function() {
	return this.bufferedValueToNumber();
}

CSSPropertyBuffer.prototype.typedArrayToString = function(tArray, strLength) {
	return tArray.bufferToString(strLength);
}

CSSPropertyBuffer.prototype.setIsInitialValue = function(bool) {
	this._buffer.set([1], this.bufferSchema.isInitialValue.start);
}

// bufferedValueToString() is an alias for getValueAsString()
// TODO: unify
CSSPropertyBuffer.prototype.bufferedValueToString = function() {
	var start = this.bufferSchema['repr'].start, end = start + this.bufferSchema['repr'].length,
		strLengthIdx = this.bufferSchema['reprLength'].start;
	return this.typedArrayToString(
			this._buffer.slice(start, end).buffer,
			this._buffer[strLengthIdx]
		);
}

// bufferedValueToNumber() is an alias for getValueAsNumber()
// TODO: unify
CSSPropertyBuffer.prototype.bufferedValueToNumber = function() {
	var start = this.bufferSchema['propertyValue'].start, end = start + this.bufferSchema['propertyValue'].length
	return this.byteTuppleTo16bits(this._buffer.slice(start, end));
}

CSSPropertyBuffer.prototype.byteTuppleTo16bits = function(bytesInt8Array) {
	var res = bytesInt8Array[1] << 8;
	return (res || bytesInt8Array[0]);
}






//var countTokenTypes = {
//	IDENT : 0,
//	NUMBER : 0,
//	PERCENTAGE : 0,
//	COLORorFUNCTION : 0,
//	un_defined : 0
//}
//console.log(countTokenTypes);


var LocalTokenFromParserFactory = function(parsedValue, tokenTypeFromParser) {
	
	if (tokenTypeFromParser && LocalTokenFromParserCache[tokenTypeFromParser])
		return LocalTokenFromParserCache[tokenTypeFromParser];
	else {
		tokenTypeFromParser = parsedValue ? Object.getPrototypeOf(parsedValue).tokenType : tokenTypeFromParser;
		
		var LocalTokenFromParser = function(tokenType, value, name, type, repr, unit) {
			var localValue = 0, localType = 'string', localRepr = '';
			if (tokenTypeFromParser === 'IDENT' || tokenTypeFromParser === 'NONPARSED') {
				localRepr  = repr || (value ? value.toString() : '');
				localType = 'string';
//				countTokenTypes['IDENT']++;
			}
			else if (tokenTypeFromParser === 'NUMBER' || tokenTypeFromParser === 'DIMENSION') {	// typeof value !== 'undefined' && Object.getPrototypeOf(value) === Number.prototype
				localRepr = (value || localValue).toString() + (unit || '');
				localValue = value || localValue;
				localType = 'number';
//				countTokenTypes['NUMBER']++;
			}
			else if (type === 'hash' || type === 'id' || type === 'unrestricted' || (tokenTypeFromParser === 'FUNCTION' && name === 'rgb')) {
				localRepr  = repr || '#' + (value || localValue).toString();
				localType = 'hash';
//				countTokenTypes['COLORorFUNCTION']++;
			}
			else if (tokenTypeFromParser === 'PERCENTAGE') {
				localValue = value || localValue;
				localRepr  = (repr ? (repr.slice(-1) === '%' ? repr : repr + '%') : (value ? value.toString() : '0')  + '%');
				localType = 'percentage';
//				countTokenTypes['PERCENTAGE']++;
			}
			else if (typeof type === 'undefined') {
				localRepr  = value ? value.toString() : '';
//				countTokenTypes['un_defined']++;
			}
			
			this.localTokenType = tokenType ? tokenType : tokenTypeFromParser.capitalizeFirstChar() + 'Token';
			this.value = localValue;
			this.type = localType;
			this.repr = localRepr;
			this.reprLength = this.repr.length;
			this.unit = unit || '';
		}
		LocalTokenFromParser.prototype = {
			tokenType : tokenTypeFromParser || 'NONE'
		}
		LocalTokenFromParserCache[LocalTokenFromParser] = LocalTokenFromParser;
		
		return LocalTokenFromParser
	}
}

var LocalTokenFromParserCache = {
	
}












Object.defineProperty(CSSPropertyBuffer.prototype, 'TokenTypes', {
	value : {
			UndefinedToken : 0, 
			BadstringToken : 1,
			BadurlToken : 2,
			WhitespaceToken : 3,
			CdoToken : 4,
			CdcToken : 5,
			ColonToken : 6,
			SemicolonToken : 7,
			CommaToken : 8,
			OpencurlyToken : 9,
			ClosecurlyToken : 10,
			OpensquareToken : 11,
			ClosesquareToken : 12,
			OpenparenToken : 13,
			CloseparenToken : 14,
			IncludeMatchToken : 15,
			DashmatchToken : 16,
			PrefixmatchToken : 17,
			SuffixmatchToken : 18,
			SubstringmatchToken : 19,
			ColumnToken : 20,
			EOFToken : 21,
			DelimToken : 22,
			IdentToken : 23,
			FunctionToken : 24,
			AtkeywordToken : 25,
			HashToken : 26,
			StringToken : 27,
			UrlToken : 28,
			NumberToken : 29,
			PercentageToken : 30,
			DimensionToken : 31,
			NonparsedToken : 32
			}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'stdStrLength', {
	value : 58
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'ValueTypes', {
	value : {
		integer : 0,
		percentage : 1,
		float : 2,
		string : 3,
		hash : 4,
		numericalArray : 5,
		'' : 6
	}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'Units', {
	value : {
		'' : {
			idx : 0,
			unit : '',
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
		},
		em : {
			idx : 8,
			unit : 'size of the uppercase M',
			fullName : 'root em',
			equivStr : '1em is equivalent to the inherited font-size'
		},
		rem : {
			idx : 9,
			unit : 'rem',
			fullName : 'root em',
			equivStr : '1rem is equivalent to the root element\'s font-size'
		},
		s : {
			idx : 10,
			unit : 's',
			fullName : 'seconds',
			equivStr : 'seconds are used when defining the duration of an animation'
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

Object.defineProperty(CSSPropertyBuffer.prototype, 'bufferSchema', {
	value : BinarySchemaFactory(
		'compactedViewOnProperty',
		[
			'tokenType',
			'propertyValue',
			'propertyType',
			'repr',
			'reprLength',
			'unit',
			'isInitialValue'
		],
		[
			1,
			2,
			1,
			CSSPropertyBuffer.prototype.stdStrLength,		// defining a tight limit to the size of the representation of a string is obviously a strong opinion: lets keep some neurons on it)
			1,
			1,
			1
		]
)
});

//console.log(CSSPropertyBuffer.prototype.bufferSchema);






module.exports = CSSPropertyBuffer;