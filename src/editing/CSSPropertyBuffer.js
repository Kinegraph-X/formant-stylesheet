/**
 * @constructor CSSPropertyBuffer
 */


var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');
var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');


var CSSPropertyBuffer = function(initialLoad, propName) {
	this.objectType = 'CSSPropertyBuffer';

	this._buffer = new Uint8Array(initialLoad || this.bufferSchema.size);
	
	var defaultValue;
	if (typeof initialLoad === 'undefined' || initialLoad === null
			|| (
				Object.getPrototypeOf(initialLoad) === Uint8Array.prototype
					&& initialLoad[0] === 0
			)
		) {
//			console.log(propName);
			defaultValue = CSSPropertyDescriptors[propName].prototype.initialValue;
//			if (typeof defaultValue === 'undefined')
//				console.log(propName, defaultValue);
			if (typeof defaultValue !== 'undefined' && defaultValue !== null) {
//				if (!Array.isArray(defaultValue))
					this.setValue(this.getValueAsIfParsed(defaultValue));
//				else {
//					var expandedPropertyName, expandedPropertyDefaultValue;
//					defaultValue.forEach(function(val, key) {
//						expandedPropertyName = CSSPropertyDescriptors[propName].expandedPropNames[key];
//						console.log(propName, expandedPropertyName);
//						expandedPropertyDefaultValue = CSSPropertyDescriptors[expandedPropertyName].prototype.initialValue;
//						this.setValue(this.getValueAsIfParsed(defaultValue));
//					}, this);
//				}
			}
	}
}
CSSPropertyBuffer.prototype = Object.create(Uint8Array.prototype);
CSSPropertyBuffer.prototype.objectType = 'CSSPropertyBuffer';

CSSPropertyBuffer.prototype.getValueAsString = function(valueName) {
	return this.bufferedValueToString();
}

CSSPropertyBuffer.prototype.getValueAsNumber = function() {
	return this.bufferedValueToNumber();
}

CSSPropertyBuffer.prototype.setValue = function(parsedValue) {
	var valueAsParsed, tokenType;
	// if the property is a shorthand property, or if the property may be abbreviated,
	// 		we concatenate back
	// => shorthands are then handled (expanded) in CSSPropertySetBuffer.setPropFromShorthand()
	// => abbreviated props are also handled in a branch of CSSPropertySetBuffer.setPropFromShorthand()
	var concatVal = ''; 
	
	if (parsedValue.length > 1) {
//		console.log(parsedValue);
		var tokenTypeFromParser;
		parsedValue.forEach(function(val) {
			tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
			if (tokenTypeFromParser === "WHITESPACE")
				concatVal += ' ';
			else if (tokenTypeFromParser === "COMA")
				concatVal += val.value + ',';
			else if (tokenTypeFromParser === "HASH")
				concatVal += '#' + val.value;
			else if (tokenTypeFromParser === "PERCENTAGE")
				concatVal += val.repr + '%';
			else
				concatVal += typeof val.repr !== 'undefined' ? val.repr + val.unit : val.value;
		}, this);
		
		valueAsParsed = DummyTokenFromParserFactory('NON_PARSED');
		valueAsParsed.value = concatVal;
		tokenType = 'NonParsedToken';
		valueAsParsed.type ='string';
		
//		console.log(concatVal, valueAsParsed);
	}
	else {
//		console.log(parsedValue);
		tokenType = Object.getPrototypeOf(parsedValue[0]).tokenType.capitalizeFirstChar() + 'Token';
		if (tokenType === 'FunctionToken')
			valueAsParsed = this.functionToCanonical(parsedValue[0]);
		else
			valueAsParsed = parsedValue[0];
//		console.log(valueAsParsed);
		valueAsParsed.type = this.handleTypesFromCSSSpec(valueAsParsed, tokenType)
	}
	
	this.populate(tokenType, valueAsParsed);
}

CSSPropertyBuffer.prototype.handleTypesFromCSSSpec = function(val, tokenType) {
	return val.type === 'unrestricted' || (tokenType === 'FunctionToken' && val.name === 'rgb')
		? 'color'
		: (tokenType === 'PercentageToken'
			? 'percentage'
			: (typeof val.type === 'undefined'
				? 'string'
				: val.type)
			);
}

CSSPropertyBuffer.prototype.functionToCanonical = function(valueAsParsed) {
	var value, tokenTypeFromParser;
//	console.log(valueAsParsed);
	if (valueAsParsed.name === 'rgb') {
		value = DummyTokenFromParserFactory('HASH');
		value.value = '';
		valueAsParsed.value.forEach(function(val) {
			tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
//			console.log(tokenTypeFromParser, val);
			if (tokenTypeFromParser === "WHITESPACE" || tokenTypeFromParser === "COMMA")
				return;
			else //{
//				console.log('NOT COMMA', val);
				value.value += val.value.toString(16).padStart(2, '0');
//			}
		}, this);
		value.repr = value.value;
	}
//	console.log(value);
	return value;
}

CSSPropertyBuffer.prototype.populate = function(tokenType, value) {
	// the buffer size : 64 bytes buffers shall align well on a 2048KB L2 CPU cache
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
	// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
	
	// FIXME: avoid the magic number 19 (set it on the prototype) and extend the buffer size to 64
	
	// TODO: OPTIMIZE, OPTIMIZE : => do the heavy work only once
	// => Unifiy value.value and value.repr => depending on the fact it is a percentage or not :
	// 		=> value.repr is value.value + "%"
	// 		=> value.repr is value.value + value.unit
	// => get a buffer on the unified string
	// => get the length of the string

	// TokenType from the parser as a numeric constant
//	console.log(value.value, this.TokenTypes[tokenType]);
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
			// FIXME: this should use the GeneratorFor16bitsInt
			[valueTypeAsConst < 3 ? value.value : 0],
			this.bufferSchema.propertyValue.start
		);
	// representation
//	console.error(tokenType, value.value, value.unit, value);
	this._buffer.set(
			valueTypeAsConst < 3
				? (tokenType === 'PercentageToken'
					? value.repr + '%'
					: (String(value.value) + this.Units[value.unit].unit).getNcharsAsCharCodesArray(19, 0)[1])
				: value.value.getNcharsAsCharCodesArray(19, 0)[1],
			this.bufferSchema.repr.start
		);
	// representation string length
//	console.log(tokenType, this.bufferSchema.reprLength.start, value.value, String(value.value).length);
	var strLength;
	this._buffer.set(
		[valueTypeAsConst < 3
				? (tokenType === 'PercentageToken'
					? value.repr.length + 1
					: (strLength = String(value.value).length) > 19 ? 19 : strLength + 2)
				: (strLength = value.value.length) > 19 ? 19 : strLength],
		this.bufferSchema.reprLength.start
	);
//	console.log((strLength = String(value.value).length) > 19 ? 19 : strLength + 2);
	// unit
	this._buffer.set(
			[value.unit ? this.Units[value.unit].idx : 0],
			this.bufferSchema.unit.start
		);
	
//	console.log(this._buffer);
//	console.log(tokenType, value.value);
}

// FIXME: this doesn't represent all the possible values returned by the parser
CSSPropertyBuffer.prototype.getValueAsIfParsed = function(defaultValue) {
	var sample;
	
	if (Object.getPrototypeOf(defaultValue) === String.prototype) {
		if (defaultValue[defaultValue.length - 1] === '%') {
			sample = DummyTokenFromParserFactory('PERCENTAGE');
			sample.type = 'percentage';
			sample.value = 0;
		}
		else {
			sample = DummyTokenFromParserFactory('IDENT');
			sample.type = 'string';
			sample.value = defaultValue;
		}
	}
	else if (Object.getPrototypeOf(defaultValue) === Number.prototype) {
		// FIXME: there's an ambiguity here between NUMBER and DIMENSION
		// 		we need something like if (['px', 'pt', 'in', etc].indexOf(defaultValue.slice(-2)) != -1) then 'DIMENSION'
		sample = DummyTokenFromParserFactory('NUMBER');
		sample.type = 'integer'
		sample.value = 0;
		sample.repr = String(defaultValue);
	}
	
	return [sample];
}

CSSPropertyBuffer.prototype.typedArrayToString = function(tArray, strLength) {
//	console.log(strLength);
	return tArray.bufferToString(strLength);
}

CSSPropertyBuffer.prototype.bufferedValueToString = function() {
	var start = this.bufferSchema['repr'].start, end = start + this.bufferSchema['repr'].length,
		strLengthIdx = this.bufferSchema['reprLength'].start;
		
//	console.log(this._buffer);

	return this.typedArrayToString(
			this._buffer.slice(start, end).buffer,
			this._buffer[strLengthIdx]
		);
}

CSSPropertyBuffer.prototype.bufferedValueToNumber = function() {
//	console.log(propBuffer);
	var start = this.bufferSchema['propertyValue'].start, end = start + this.bufferSchema['propertyValue'].length
//	console.log(start, end);
//	var buf = this._buffer.slice(start, end);
//	console.log([buf[0], buf[1]]);
	return this.byteTuppleTo16bits(this._buffer.slice(start, end));
}

CSSPropertyBuffer.prototype.byteTuppleTo16bits = function(bytesInt8Array) {
	var res = bytesInt8Array[1] << 8;
	return (res || bytesInt8Array[0]);
}










var DummyTokenFromParserFactory = function(tokenType) {
	
	if (DummyTokenFromParserCache[tokenType])
		return new DummyTokenFromParserCache[tokenType]();
	else {
		var DummyTokenFromParser = function() {
			this.value = 0;
			this.type = '';
			this.repr = '';
			this.unit = '';
		}
		DummyTokenFromParser.prototype = {
			tokenType : tokenType
		}
		DummyTokenFromParserCache[tokenType] = DummyTokenFromParser;
		
		return new DummyTokenFromParser()
	}
}

var DummyTokenFromParserCache = {
	
}












Object.defineProperty(CSSPropertyBuffer.prototype, 'TokenTypes', {
	value : {
			BadstringToken : 0,
			BadurlToken : 1,
			WhitespaceToken : 2,
			CdoToken : 3,
			CdcToken : 4,
			ColonToken : 5,
			SemicolonToken : 6,
			CommaToken : 7,
			OpencurlyToken : 8,
			ClosecurlyToken : 9,
			OpensquareToken : 10,
			ClosesquareToken : 11,
			OpenparenToken : 12,
			CloseparenToken : 13,
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
			AtkeywordToken : 24,
			HashToken : 25,
			StringToken : 26,
			UrlToken : 27,
			NumberToken : 28,
			PercentageToken : 29,
			DimensionToken : 30,
			NonParsedToken : 31
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
		'' : {
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
		'reprLength',
		'unit'
	],
	[
		1,
		2,
		1,
		19,		// defining a tight limit to the size of the representation of a string is obviously a strong opinion: lets keep some neurons on it)
		1,
		1
	]
);

	






module.exports = CSSPropertyBuffer;