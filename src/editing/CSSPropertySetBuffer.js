/**
 * @constructor CSSPropertySetBuffer
 */

var TypeManager = require('src/core/TypeManager');
var MemoryMapBuffer = require('src/core/MemoryMapBuffer');
var SplittedAttributes = require('src/editing/SplittedAttributes');
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
var stylePropertyConverter = new StylePropertyEnhancer();

var parser = require('src/parsers/css-parser_forked');


var CSSPropertySetBuffer = function(initialContent) {
	var itemSize = SplittedAttributes.prototype.CSSPropertyBufferSize;
	initialContent = initialContent || this.propertiesStaticMap;
	MemoryMapBuffer.call(this, itemSize, initialContent);
	this.objectType = 'CSSPropertySetBuffer';
}
CSSPropertySetBuffer.prototype = Object.create(MemoryMapBuffer.prototype);
CSSPropertySetBuffer.prototype.objectType = 'CSSPropertySetBuffer';

// TODO: is there a better way than obtaining those dictionaries and values through function calls ?
CSSPropertySetBuffer.prototype.propertiesStaticMap = SplittedAttributes.allKnownCSSPropertiesFactory();
CSSPropertySetBuffer.prototype.propertiesStaticArray = Object.keys(CSSPropertySetBuffer.prototype.propertiesStaticMap);
CSSPropertySetBuffer.prototype.propertiesAccessGroupsBoundaries = SplittedAttributes.allKnownCSSPropertiesBoundaries();

CSSPropertySetBuffer.prototype.getPosForProp = function(propName) {
	var propIdx = 0;
//	console.log(propName, this.propertiesStaticArray.indexOf(propName));
	if ((propIdx = this.propertiesStaticArray.indexOf(propName)) !== -1) {
		return propIdx;
	}
	return -1;
}

CSSPropertySetBuffer.prototype.getProp = function(propName) {
	var posForProp = this.getPosForProp(propName) * this.itemSize;
//	console.log(posForProp, this._buffer.slice(posForProp, posForProp + this.itemSize));
	var propAsBuffer = new CSSPropertyBuffer(
			this._buffer.slice(posForProp, posForProp + this.itemSize),
			propName
		);
	return propAsBuffer; 
}

CSSPropertySetBuffer.prototype.setPropFromBuffer = function(propName, propBuffer) {
	var posForProp;
//	console.log('isShorthand', propName, CSSPropertyDescriptors[propName].prototype.isShorthand, propBuffer);
	
	if (CSSPropertyDescriptors[propName].prototype.isShorthand) {
		this.setPropFromShorthand(propName, propBuffer.getValueAsString());
	}
	else {
		if ((posForProp = this.getPosForProp(propName) * this.itemSize) < 0)
			return;
//		console.log(posForProp);
		this._buffer.set(propBuffer._buffer, posForProp);
	}
}

CSSPropertySetBuffer.prototype.setPropFromShorthand = function(propName, value) {
	if (CSSPropertyDescriptors[propName].prototype.mayBeAbbreviated) {
		this.handleAbbreviatedValues(propName, value);
		return;
	}
	
	// FIXME: we may use here the css-parser instead of a regex
	var tmpBuffer, valueList = value.match(/[a-zA-Z0-9#\/:.,%-]+/g), expandedPropertyName;
//	console.log(propName, value, valueList)
	// TODO: optimization : this may be passed a real result from the parser => benchmark
	valueList.forEach(function(val, key) {
		// FIXME: the CSS pec allows passing expandedPropNames in any order.
		//			Then, the actual type of a given property-token defines which property it is.
		// 			As for now, we rely on the order of CSSPropertyDescriptors[propName].prototype.expandedPropNames
		//			the following code won't work for all use-cases
		expandedPropertyName = CSSPropertyDescriptors[propName].prototype.expandedPropNames[key];
//		console.log(expandedPropertyName, val);
		tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
		tmpBuffer.setValue(tmpBuffer.getValueAsIfParsed(val));
		this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
	}, this);
}

CSSPropertySetBuffer.prototype.handleAbbreviatedValues = function(propName, value) {
	var offset = 0, tmpBuffer, valueList = parser.parseAListOfComponentValues(value.trim()), expandedPropertyName;
	if (valueList.length === 1) {
		CSSPropertyDescriptors[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
//			console.log(expandedPropertyName, valueList[0].value);
			tmpBuffer.setValue([valueList[0]]);
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	else if (valueList.length === 3) {			// the property shall include 1 whitespace
		CSSPropertyDescriptors[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			if (key === 0 || key === 2)
				tmpBuffer.setValue([valueList[0]]);
			else
				tmpBuffer.setValue([valueList[2]]);
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	else if (valueList.length === 5) {			// the property shall include 2 whitespace
		CSSPropertyDescriptors[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			if (key !== 3)
				tmpBuffer.setValue([valueList[key + offset]]);
			else
				tmpBuffer.setValue([valueList[2]]);
			offset++;
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	else if (valueList.length === 7) {			// the property shall include 3 whitespace
		CSSPropertyDescriptors[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			tmpBuffer.setValue(valueList[key + offset]);
			offset++;
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
}

CSSPropertySetBuffer.prototype.getPropertyGroupAsObject = function(groupName) {
	var propName;
	var c = 0;
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	
	var ret = {};
	for (var i = boundaries.start * this.itemSize, end = boundaries.start + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		propName = this.propertiesStaticArray[boundaries.start + c];
//		console.log(propName);
		ret[propName] = (new CSSPropertyBuffer(		// groupName + String(c).padStart(2, '0')
			this._buffer.slice(i, i + this.itemSize),
			propName
			))//.bufferedValueToString();
//		console.log(propName, ret[propName]._buffer);
		c++;
	}
	return ret;
}

CSSPropertySetBuffer.prototype.getPropertyGroupAsBuffer = function(groupName) {
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	return this._buffer.slice(boundaries.start * this.itemSize, boundaries.start + boundaries.length * this.itemSize);
}

CSSPropertySetBuffer.prototype.setPropertyGroupFromBuffer = function(groupName, givenPropertyGroupAsBuffer) {
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	this._buffer.set(givenPropertyGroupAsBuffer, boundaries.start * this.itemSize);
}

CSSPropertySetBuffer.prototype.bufferedValueToString = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.bufferedValueToString(propName);
}

CSSPropertySetBuffer.prototype.bufferedValueToNumber = function(propName) {
	var propBuffer = this.getProp(propName);
//	console.log(propBuffer);
	return propBuffer.bufferedValueToNumber(propName);
}













module.exports = CSSPropertySetBuffer;