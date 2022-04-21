/**
 * construct. CSSPropertySetBuffer
 */

//var TypeManager = require('src/core/TypeManager');
var MemoryMapBuffer = require('src/core/MemoryMapBuffer');

var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
var stylePropertyConverter = new StylePropertyEnhancer();

var parser = require('src/parsers/css-parser_forked_normalized');

/**
 * @constructor CSSPropertySetBuffer
 */
var CSSPropertySetBuffer = function(initialContent) {
	var itemSize = CSSPropertyBuffer.prototype.bufferSchema.size;
	MemoryMapBuffer.call(this, itemSize, initialContent);
	this.objectType = 'CSSPropertySetBuffer';
	
	if (!initialContent)
		this.populateInitialValues();
}
CSSPropertySetBuffer.prototype = Object.create(MemoryMapBuffer.prototype);
CSSPropertySetBuffer.prototype.objectType = 'CSSPropertySetBuffer';

CSSPropertySetBuffer.prototype.propertiesStaticArray = Object.keys(CSSPropertyDescriptors.all);
CSSPropertySetBuffer.prototype.propertiesAccessGroupsBoundaries = CSSPropertyDescriptors.boundaries;

CSSPropertySetBuffer.prototype.populateInitialValues = function() {
	var start = 0, end = 0;
	// we assume the propertiesAccessGroupsBoundaries object isn't ordered, although JS objects are ordered now
	for (var attrGroup in this.propertiesAccessGroupsBoundaries) {
		if (this.propertiesAccessGroupsBoundaries[attrGroup].start > start) {
			start = this.propertiesAccessGroupsBoundaries[attrGroup].start;
			end = start + this.propertiesAccessGroupsBoundaries[attrGroup].length;
		}
	}
	this._buffer.set(
		CachedCSSPropertySetBuffer._buffer.slice(
			0,
			end * this.itemSize
		)
	);
}

CSSPropertySetBuffer.prototype.getPosForProp = function(propName) {
	var propIdx = 0;

	if ((propIdx = this.propertiesStaticArray.indexOf(propName)) !== -1) {
		return propIdx;
	}
	return -1;
}

CSSPropertySetBuffer.prototype.getPropForPos = function(pos) {
	return this.propertiesStaticArray[pos];
}

CSSPropertySetBuffer.prototype.getProp = function(propName) {
	var posForProp = this.getPosForProp(propName) * this.itemSize;
//	if (propName === 'display')
//		console.log(posForProp);
	var propAsBuffer = new CSSPropertyBuffer(
			this._buffer.slice(posForProp, posForProp + this.itemSize),
			propName
		);
	return propAsBuffer; 
}

CSSPropertySetBuffer.prototype.setPropFromBuffer = function(propName, propBuffer) {
	var resolvedPropName = propName, posForProp;
	
	if (CSSPropertyDescriptors.all[resolvedPropName].prototype.isShorthand) {
		this.setPropFromShorthand(resolvedPropName, propBuffer.getValueAsString());
	}
	else {
		if (CSSPropertyDescriptors.all[resolvedPropName].prototype.isAlias)
			resolvedPropName = CSSPropertyDescriptors.all[resolvedPropName].prototype.expandedPropNames[0];
		if ((posForProp = this.getPosForProp(resolvedPropName) * this.itemSize) < 0)
			return;
		this._buffer.set(propBuffer._buffer, posForProp);
	}
}

CSSPropertySetBuffer.prototype.setPropFromShorthand = function(propName, value) {
	if (CSSPropertyDescriptors.all[propName].prototype.mayBeAbbreviated) {
		this.handleAbbreviatedValues(propName, value);
		return;
	}
	
	// We rely on the order of CSSPropertyDescriptors.all[propName].prototype.expandedPropNames
	// the following code won't work for all use-cases
	var tmpBuffer, expandedPropertyName;
	var valueList = this.sortValuesFromShorthand(propName, value, value);
	
//	if (!valueList)
//		return;
	
	// TODO: optimization : this may be passed a real result from the parser => benchmark
//	console.log('setPropFromShorthand', valueList);
	valueList.forEach(function(val, key) {
		if (val === null)
			return;
		expandedPropertyName = CSSPropertyDescriptors.all[propName].prototype.expandedPropNames[key];
		tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
		
		tmpBuffer.setValue(val);
//		console.log(tmpBuffer.bufferedValueToString());
		this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
	}, this);
}

CSSPropertySetBuffer.prototype.sortValuesFromShorthand = function(propName, value) {
	
	if (CSSPropertyDescriptors.splitted.boxModelAttributes[propName]) {
		var tokenTypeFromParser;
		var parsedValue = parser.parseAListOfComponentValues(value);
		var sortedProp = {dimension : null, ident : null, hash : null}

		parsedValue.forEach(function(val) {
			tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
			switch (tokenTypeFromParser) {
				case 'WHITESPACE' :
				case 'COMMA' :
						break;
				case 'NUMBER' :
					sortedProp.dimension = val.value;
					break;
				case 'DIMENSION' :
						sortedProp.dimension = val.repr;
						break;
				case 'PERCENTAGE' :
						sortedProp.dimension = val.repr;
						break;
				case 'HASH' :
						sortedProp.hash = val.repr;
						break;
				case 'IDENT' :
						sortedProp.ident = val.repr;
						break;
				case 'FUNCTION' : 
						sortedProp.hash = this.functionToCanonical(val).repr;
				default : break;
			}
		}, this);
		return Object.values(sortedProp);
	}
//	else if (propName === 'background') {
//		
//	} etc.
	else {
		return value.match(/[a-zA-Z0-9#\/:.,%-]+/g) || [];
	}
}

CSSPropertySetBuffer.prototype.handleAbbreviatedValues = function(propName, value) {
	var offset = 0, tmpBuffer, valueList = value.split(' '), expandedPropertyName;
	// valueList = parser.parseAListOfComponentValues(value.trim())
	if (valueList.length === 1) {
		CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			tmpBuffer.setValue(valueList[0]);
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	else if (valueList.length === 2) {			// the property shall include 1 whitespace
		CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			if (key === 0 || key === 2)
				tmpBuffer.setValue(valueList[0]);
			else
				tmpBuffer.setValue(valueList[1]);
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	else if (valueList.length === 3) {			// the property shall include 2 whitespace
		CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			if (key !== 3)
				tmpBuffer.setValue(valueList[key]);
			else
				tmpBuffer.setValue(valueList[1]);
//			offset++;
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	else if (valueList.length === 4) {			// the property shall include 3 whitespace
		CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function(expandedPropertyName, key) {
			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			tmpBuffer.setValue(valueList[key]);
//			offset++;
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
}

CSSPropertySetBuffer.prototype.getDefinedPropertiesAsAttributesList = function() {
	var propName;
	var c = 0;
	
	var ret = {};
	
	for (var i = 0, end = i + this.propertiesStaticArray.length * this.itemSize; i < end; i += this.itemSize) {
		propName = this.propertiesStaticArray[c];
		if (this._buffer[i + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] === 0) {
			ret[propName] = this.getProp(propName).getValueAsString();
		}
		c++;
	}
	
	return ret;
}

CSSPropertySetBuffer.prototype.getPropertyGroupAsBufferMap = function(groupName) {
	var propName;
	var c = 0;
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	
	var ret = {};
	for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		propName = this.propertiesStaticArray[boundaries.start + c];
		ret[propName] = (new CSSPropertyBuffer(
			this._buffer.slice(i, i + this.itemSize),
			propName
			))
		c++;
	}
	return ret;
}

CSSPropertySetBuffer.prototype.getPropertyGroupAsAttributesList = function(groupName) {
	var propName;
	var c = 0;
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	
	var ret = {};
	for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		propName = this.propertiesStaticArray[boundaries.start + c];
		ret[propName] = this.getProp(propName).getValueAsString();
		c++;
	}
	return ret;
}

CSSPropertySetBuffer.prototype.getDefinedPropertiesFromGroupAsAttributesList = function(groupName) {
	var propName, propValue;
	var c = 0;
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	
	var ret = {};
	for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		propName = this.propertiesStaticArray[boundaries.start + c];
		if (this._buffer[i + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] === 0)
			ret[propName] = this.getProp(propName).getValueAsString();
		c++;
	}
	return ret;
}

CSSPropertySetBuffer.prototype.getPropertyGroupAsBuffer = function(groupName) {
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	var start = boundaries.start * this.itemSize, end = start + boundaries.length * this.itemSize;
	return this._buffer.slice(start, end);
}

CSSPropertySetBuffer.prototype.setPropertyGroupFromGroupBuffer = function(groupName, groupBuffer) {
	var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	var start = boundaries.start * this.itemSize;
	this._buffer.set(groupBuffer, start);
}

CSSPropertySetBuffer.prototype.overridePropertyGroupFromGroupBuffer = function(groupName, groupBuffer) {
	var c = 0, boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		// groupBuffer[c + offset] represents the flag "isInitialValue"
		if (groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] === 0)
			this._buffer.set(groupBuffer.slice(c, c + this.itemSize), i);
		c += this.itemSize;
	}
}

CSSPropertySetBuffer.prototype.setGroupIsInitialValue = function(groupName, bool) {
	var c = 0, boundaries = this.propertiesAccessGroupsBoundaries[groupName];
	for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		this._buffer.set([+(bool || 0)], i + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start);
	}
}

CSSPropertySetBuffer.prototype.getIsInitialValue = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.getIsInitialValue();
}

CSSPropertySetBuffer.prototype.getIsInitialValueAsBool = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.getIsInitialValueAsBool();
}

CSSPropertySetBuffer.prototype.getTokenTypeForPropAsString = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.tokenTypeToString();
}

CSSPropertySetBuffer.prototype.getTokenTypeForPropAsConstant = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.tokenTypeToNumber();
}

// getPropAsString() is an alias for bufferedValueToString()
// TODO: unify
CSSPropertySetBuffer.prototype.getPropAsString = function(propName) {
	return this.bufferedValueToString(propName);
}

// getPropAsNumber() is an alias for bufferedValueToNumber(propName)
// TODO: unify
CSSPropertySetBuffer.prototype.getPropAsNumber = function(propName) {
	return this.bufferedValueToNumber(propName);
}

CSSPropertySetBuffer.prototype.bufferedValueToString = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.bufferedValueToString();
}

CSSPropertySetBuffer.prototype.bufferedValueToNumber = function(propName) {
	var propBuffer = this.getProp(propName);
//	console.log(propBuffer);
	return propBuffer.bufferedValueToNumber();
}












var CachedCSSPropertySetBuffer = (function() {
	var packedCSSProperty, propertySetBuffer = new CSSPropertySetBuffer(new Uint8Array());
	for (var attrGroup in CSSPropertyDescriptors.splitted) {
		Object.keys(CSSPropertyDescriptors.splitted[attrGroup]).forEach(function(attrName) {
//			console.log(attrName, CSSPropertyDescriptors.all[attrName].prototype.initialValue);
			packedCSSProperty = new CSSPropertyBuffer(null, attrName);
			packedCSSProperty.setValue(
//				parser.parseAListOfComponentValues(
					CSSPropertyDescriptors.all[attrName].prototype.initialValue
//				)
			);
			propertySetBuffer.setPropFromBuffer(attrName, packedCSSProperty);
		});
		propertySetBuffer.setGroupIsInitialValue(attrGroup, true);
	}
	return propertySetBuffer;
})()













module.exports = CSSPropertySetBuffer;