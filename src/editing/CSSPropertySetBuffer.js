/**
 * construct. CSSPropertySetBuffer
 */

var TypeManager = require('src/core/TypeManager');
var MemoryMapBuffer = require('src/core/MemoryMapBuffer');

var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');
var FontSizeBuffer = require('src/editing/FontSizeBuffer');
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
var stylePropertyConverter = new StylePropertyEnhancer();

var parser = require('src/parsers/css-parser_forked_normalized');

var TextSizeGetter = require('src/core/TextSizeGetter');
var textSizeGetter = new TextSizeGetter();

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
//	else if (propBuffer.getTokenTypeAsString() === 'DimensionToken') {
//		this.setPropAfterResolvingCanonicalUnits(resolvedPropName, propBuffer)
//	}
	else {
		if (CSSPropertyDescriptors.all[resolvedPropName].prototype.isAlias)
			resolvedPropName = CSSPropertyDescriptors.all[resolvedPropName].prototype.expandedPropNames[0];
		if ((posForProp = this.getPosForProp(resolvedPropName) * this.itemSize) < 0)
			return;
		this._buffer.set(propBuffer._buffer, posForProp);
	}
}

CSSPropertySetBuffer.prototype.setPropFromShorthand = function(propName, value) {
	
//	console.log('	', propName, value);
	if (CSSPropertyDescriptors.all[propName].prototype.mayBeAbbreviated) {
//		console.log('setPropFromShorthand', propName, value);
		this.handleAbbreviatedValues(propName, value);
		return;
	}
	
//	console.log('	setPropFromShorthand', propName, value);
	
	// FIXME: (IMPROVEME)
	// We rely on the order of CSSPropertyDescriptors.all[propName].prototype.expandedPropNames
	// The sorting function won't work for all use-cases,
	// as it relies on the fact that shorthands contains uniquely typed values in the sequence of tokens
	var tmpBuffer, expandedPropertyName;
	var valueList = this.sortValuesFromShorthand(propName, value);
	
//	if (!valueList)
//		return;
	
	// TODO: optimization : this may be passed a real result from the parser => benchmark
//	console.log('		setPropFromShorthand', propName, valueList);
	valueList.forEach(function(val, key) {
		if (val === null)
			return;
			
		expandedPropertyName = CSSPropertyDescriptors.all[propName].prototype.expandedPropNames[key];
		if (CSSPropertyDescriptors.all[expandedPropertyName].prototype.mayBeAbbreviated) {
			this.handleAbbreviatedValues(expandedPropertyName, val);
			return;
		}
		
		tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
//		console.log('	', expandedPropertyName, val);
		tmpBuffer.setValue(val);
//		console.log('		', tmpBuffer.bufferedValueToString());
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
//			console.log('	', tokenTypeFromParser);
			switch (tokenTypeFromParser) {
				case 'WHITESPACE' :
				case 'COMMA' :
						break;
				case 'NUMBER' :
					// There's an ambiguity in the CSS spec:
					// The parser is designed to assume that every integer/float
					// non-followed by an alphabetic char is a number (css-parser.js - line 254 && https://www.w3.org/TR/css-syntax-3/#consume-a-numeric-token).
					// But border-width may only be of type <length>,
					// and then is a dimension => it has to be an ident-like, then it is of type string
					if (propName === 'border')
						sortedProp.dimension = val.repr;
					else
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
						sortedProp.hash = CSSPropertyBuffer.prototype.functionToCanonical.call(null, val).repr;
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

CSSPropertySetBuffer.prototype.setPropAfterResolvingCanonicalUnits = function(overridePropBuffer) {
	var propName = 'fontSize',
		fontFamily = this.getPropAsString('fontFamily'),
		fontStyle = this.getPropAsNumber(propName) + this.getUnitAsString(propName) + ' ' + fontFamily,
		sizeOfM = 0;
	
	switch(overridePropBuffer.getUnitAsString()) {
		case 'em' :
			sizeOfM = this.getTextDimensions('M', fontStyle);
//			console.log('NEW SIZE', overridePropBuffer.getValueAsNumber(), sizeOfM, fontStyle);
			overridePropBuffer.setValue(
				String(
					Math.floor(overridePropBuffer.getValueAsNumber() * sizeOfM)
				) + 'px'
			);
			break;
		default :
			break;
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
//	console.log('called');
	var inheritedAttributesStr = 'inheritedAttributes',
		fontSizeStr = 'fontSize',
		fontFamilyStr = 'fontFamily'; 
	var c = 0,
		boundaries = this.propertiesAccessGroupsBoundaries[groupName],
		tmpPropertyBuffer,
		fontFamily = '',
		fontSize = 0;
	
	for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
		// groupBuffer[c + offset] represents the flag "isInitialValue"
//		console.log('TokenType', groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.tokenType.start])
//		console.log(i / this.itemSize, this.propertiesStaticArray[i / this.itemSize], fontFamilyStr);
		// Not optimized way to handle 'em' CSS units (they depend on the size of the letter "M" in the current font-style)
		// TODO: is there a way to optimize this ?
		if (groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.tokenType.start] === CSSPropertyBuffer.prototype.TokenTypes.DimensionToken) {
			// && groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] !== 1
			tmpPropertyBuffer = new CSSPropertyBuffer(null, '');
			tmpPropertyBuffer._buffer.set(groupBuffer.slice(c, c + this.itemSize), 0);
			
			this.setPropAfterResolvingCanonicalUnits(tmpPropertyBuffer);
			this._buffer.set(tmpPropertyBuffer._buffer, i);
			
			c += this.itemSize;
			continue;
		}
		// Handling of the font-sizes caches : we must have the size AND the family to compute a cache
		// So we trigger cache-building only when we apply styles on a layout node
		else if (groupName === 	inheritedAttributesStr								// hard-coded for optimization
			&& this.propertiesStaticArray[i / this.itemSize] === fontFamilyStr
			&& groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] === 0) {
//			console.error(groupName);
			
			fontFamily = groupBuffer.bufferToPartialString(c + CSSPropertyBuffer.prototype.bufferSchema.repr.start);
			
			
			tmpPropertyBuffer = new CSSPropertyBuffer(null, fontFamilyStr);
			// Get the fontSize from the next Buffer in the loop, as we don't know yet is the local size is the actual size
			// In the PropertyDescriptors, we chose to have the family before the size
			tmpPropertyBuffer._buffer.set(groupBuffer.slice(c + this.itemSize, c + this.itemSize * 2), 0);
			fontSize = tmpPropertyBuffer.getValueAsNumber().toString() + tmpPropertyBuffer.getUnitAsString();
			
			// TODO: find in which cases the fonctSize is 0 : seems we apply populateStyles before inheritedStyles
			if (fontSize === '0')
				fontSize = this.getPropAsNumber(fontSizeStr) + this.getUnitAsString(fontSizeStr);
			
			if (fontSize !== '0') {
				if (!this.isFontSizeBufferInCache(fontSize, fontFamily))
					this.addFontSizeBufferToCache(fontSize, fontFamily)
			}
		}
		
		if (groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] !== 1)
			this._buffer.set(groupBuffer.slice(c, c + this.itemSize), i);
		c += this.itemSize;
	}
}

CSSPropertySetBuffer.prototype.isFontSizeBufferInCache = function(fontSize, fontFamily) {
	return TypeManager.fontSizeBuffersCache.cache.hasOwnProperty(fontSize +' ' + fontFamily);
}

CSSPropertySetBuffer.prototype.addFontSizeBufferToCache = function(fontSize, fontFamily) {
//	console.log(fontSize, fontFamily);
	TypeManager.fontSizeBuffersCache.cache[fontSize +' ' + fontFamily] = new FontSizeBuffer(fontSize, fontFamily);
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

CSSPropertySetBuffer.prototype.getUnitAsString = function(propName) {
	var propBuffer = this.getProp(propName);
	return propBuffer.getUnitAsString();
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

CSSPropertySetBuffer.prototype.fastBufferedValueToString = function(propName) {
	var propIndex = this.getPosForProp(propName) * this.itemSize,
		propLength = this._buffer[propIndex + CSSPropertyBuffer.prototype.bufferSchema.reprLength.start],
		propOffset = CSSPropertyBuffer.prototype.bufferSchema.repr.start,
		propStartIndex = propIndex + propOffset,
		propEndIndex = propStartIndex + propLength;
	return this._buffer.slice(propStartIndex, propEndIndex).bufferToString(propLength);
}

CSSPropertySetBuffer.prototype.fastBufferedValueToNumber = function(propName) {
	var propIndex = this.getPosForProp(propName) * this.itemSize,
		propOffset = CSSPropertyBuffer.prototype.bufferSchema.propertyValue.start,
		propStartIndex = propIndex + propOffset,
		propEndIndex = propStartIndex + CSSPropertyBuffer.prototype.bufferSchema.propertyValue.length;
	return CSSPropertyBuffer.prototype.byteTuppleTo16bits(this._buffer.slice(propStartIndex, propEndIndex));
}




/**
 * @method getTextDimensions
 * @param {String} textContent
 */
CSSPropertySetBuffer.prototype.getTextDimensions = function(textContent, fontStyle) {
//	console.log(this.getAugmentedFontStyle());
	if (!textContent.length)
		return 0;
	var textSize = textSizeGetter.getTextSizeDependingOnStyle(
			textContent,
			fontStyle
		);
	return textSize[0] - textSize[0] / 21;
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