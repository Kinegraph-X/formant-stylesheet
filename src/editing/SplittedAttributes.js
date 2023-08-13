/**
 * Constructor AttributesList
 * 
 */

//var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
//var enhancer = new StylePropertyEnhancer();

var MemoryMapBuffer = require('src/core/MemoryMapBuffer');
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var BinarySlice = require('src/core/BinarySlice');
var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');
var parser = require('src/parsers/css-parser_forked_normalized');


/**
 * Constructor AttributesList
 * This abstract type shall be used as a base for the "splitted" styles:
 * "Inheritable" and "local" attributes are grouped in 4 different objects
 * in the "style" type. This allows important optimizations when embracing
 * the concept of "component" as being decoupled from the DOM.
 * 	=> see AdvancedAttributesListFactory()
 * 
 * @param attributes Object : passive partial AttributesList-Like (no methods, only significative keys defined)
 */
var AttributesList = function(attributes) {
	if (typeof attributes === 'undefined')
		return this;
	// backward compatibility with the attributes list we defined in PHP,
	// and ported as the basic implementation of AttributesList (StyleAttributes.js)

	// TODO: WHY Array.isArray ? AttributesList should always be "object"...
	// Find out how we, once upon a time, got an array...
	// 		=> fixed in AdvancedAttributesList
	if (typeof attributes === 'string' && arguments[1] && Array.isArray(arguments[1]))
		attributes = arguments[1];

	// TODO: explicitly type each CSS data-structure so they precisely reproduce
	// the CSS props we're currently supporting 
	if (typeof attributes === 'object' && Object.keys(attributes).length) {
		for (var prop in attributes) {
			if (attributes.hasOwnProperty(prop) && prop !== 'selector' && prop !== 'type')
				this[prop] = attributes[prop];
		};
	}
}
AttributesList.prototype = {};

Object.defineProperty(AttributesList.prototype, 'linearize', {
	value: function() {
		var str = '', current = '', attrCount = Object.keys(this).length, c = 0;
		for (var prop in this) {
			c++;
			// may be a typed property
			if (typeof this[prop] === 'string')
				current = this[prop];

			str += prop.dromedarToHyphens() + ' : ' + current + ';';

			if (c !== attrCount)
				str += '\n';
		};
		return str;
	}
});

Object.defineProperty(AttributesList.prototype, 'get', {
	value: function(attributeName) {

	}
});

Object.defineProperty(AttributesList.prototype, 'getAttributeAsCSSOM', {
	value: function(attributeName) {

	}
});

Object.defineProperty(AttributesList.prototype, 'getAttributeAsKeyValue', {
	value: function(attributeName) {

	}
});

Object.defineProperty(AttributesList.prototype, 'set', {
	value: function(attributeName, attributeValue) {

	}
});

Object.defineProperty(AttributesList.prototype, 'setAttributeFromCSSOM', {
	value: function(attributeName, attributeValue) {

	}
});

Object.defineProperty(AttributesList.prototype, 'setAttributeFromKeyValue', {
	value: function(attributeName, attributeValue) {

	}
});





// This is OBSOLETE.
// (re-defined (in another format, and without the "per-purpose" classification)
// in CSSPropertyDescriptors)
//var PerPurposeAttributesList = {
//	inheritedAttributes: [
//		'writingMode',					// horizontal-tb / vertical-lr / vertical-rl / sideways-rl / sideways-lr
//		'captionSide',					// top / bottom (title or legend of a table)
//		'listStyleType', 				// disc / circle / square / decimal / georgian, and anything you want... UNICODE codepoint ?
//		'listStylePosition',			// inside / outside (position of the ::marker : first inline box or before first inline box)
//		'visibility',					// visible / hidden
//		'fontFamily',					// list of IDENT values
//		'fontSize',						// DIMENSION
//		'lineHeight',					// DIMENSION
//		'color',						// HASH or FUNCTION
//		'textOrientation',				// mixed / upright / sideways / sideways-right / sideways-left / use-glyph-orientation
//		'textAlign',					// left / right / center / justify (start / end)
//		'textTransform',				// capitalize / uppercase / lowercase / none / full-width / full-size-kana (full-width aligns vertical and horizontal letters on a grid of text)
//		'textDecoration',				// underline / + dotted / + red / + wavy / + overline
//		'cursor',						// help / wait / crosshair / not-allowed / zoom-in / grab
//		'borderCollapse',				// collapse / separate
//		'whiteSpace',					// normal / nowrap / pre / pre-wrap / pre-line / break-spaces
//		'wordBreak'						// normal / break-all / keep-all / break-word
//
//	],
//	locallyEffectiveAttributes: [
//		'display',						// grid / flex / inline / inline-block / block / table / table-cell
//		'overflowX',					// hidden / visible / scroll
//		'overflowY',					// hidden / visible / scroll
//		'verticalAlign',				// baseline / top / middle / bottom / sub / text-top
//		'clear',						// left / right / both
//		'float',						// left / right (inline-start / inline-end)
//		'position',						// static / relative / absolute / fixed / sticky / top / bottom / right / left
//
//		'flex',							// SHORTHAND
//		'flexFlow',						// SHORTHAND
//		'flexDirection',				// row / column
//		'flexWrap',						// nowrap / wrap
//		'flexSchrink',					// INTEGER
//		'flexGrow',						// INTEGER
//		'flexBasis',					// INTEGER
//
//		'justifyContent',				// flex-start | flex-end | center | space-evenly | space-between | space-around 
//		'alignItems',					// flex-start | flex-end | center | baseline | stretch
//		'alignSelf',					// auto | flex-start | flex-end | center | baseline | stretch
//		'alignContent'					// flex-start | flex-end | center | space-between | space-around | stretch  	
//	],
//	boxModelAttributes: [
//		'boxSizing',					// border-box / content-box
//		'width',						// DIMENSION
//		'height',						// DIMENSION
//		'top',							// DIMENSION
//		'left',							// DIMENSION
//		'right',						// DIMENSION
//		'bottom',						// DIMENSION
//
//		'padding',						// SHORTHAND
//		'margin',						// SHORTHAND
//		'border',						// SHORTHAND
//
//		'paddingBlockStart',			// DIMENSION
//		'paddingInlineEnd',				// DIMENSION
//		'paddingBlockEnd',				// DIMENSION
//		'paddingInlineStart',			// DIMENSION
//
//		'marginBlockStart',				// DIMENSION
//		'marginBlockEnd',				// DIMENSION
//		'marginInlineStart',			// DIMENSION
//		'marginInlineEnd',				// DIMENSION
//
//		'borderBlockStart',				// width, style, color
//		'borderBlockEnd',				// width, style, color
//		'borderInlineStart',			// width, style, color
//		'borderInlineEnd',				// width, style, color
//
//		'borderWidth',					// DIMENSION
//		'borderBlockStartWidth',		// DIMENSION
//		'borderBlockEndWidth',			// DIMENSION
//		'borderInlineStartWidth',		// DIMENSION
//		'borderInlineEndWidth',			// DIMENSION
//
//		'borderStyle',					// none / dotted / inset / dashed / solid / double / groove
//		'borderBlockStartStyle',		// none / dotted / inset / dashed / solid / double / groove
//		'borderBlockEndStyle',			// none / dotted / inset / dashed / solid / double / groove
//		'borderInlineStartStyle',		// none / dotted / inset / dashed / solid / double / groove
//		'borderInlineEndStyle',			// none / dotted / inset / dashed / solid / double / groove
//
//		'borderColor',					// COLOR
//		'borderBlockStartColor',		// COLOR
//		'borderBlockEndColor',			// COLOR
//		'borderInlineStartColor',		// COLOR
//		'borderInlineEndColor',			// COLOR
//		
//		'borderRadius',					// DIMENSION[1-4] / DIMENSION[1-4]
//
//		'borderTopLeftRadius',			// DIMENSION / DIMENSION
//		'borderTopRightRadius',			// DIMENSION / DIMENSION
//		'borderBottomRightRadius',		// DIMENSION / DIMENSION
//		'borderBottomLeftRadius',		// DIMENSION / DIMENSION
//
//		'borderStartStartRadius',		// DIMENSION / DIMENSION
//		'borderStartEndRadius',			// DIMENSION / DIMENSION
//		'borderEndStartRadius',			// DIMENSION / DIMENSION
//		'borderEndEndRadius'			// DIMENSION / DIMENSION
//	],
//	strictlyLocalAttributes: [
//		'background',					// SHORTHAND
//		'backgroundColor',				//
//		'backgroundPosition',			// SHORTHAND
//		'backgroundPositionTop',		//
//		'backgroundPositionLeft',		//
//		'backgroundImage',				//
//		'backgroundRepeat'				//
//
//
//	]
//};








/**
 * Construct. BaseClass SplittedAttributesListBaseClass
 * 
 * @param attributes Object : partial AttributesList-Like (only significative keys defined)
 */
var SplittedAttributesListBaseClass = function(attributes) {
	Object.defineProperty(this, 'CSSPropertySetBuffer', {value: new CSSPropertySetBuffer()});
	this.disambiguateAttributes(attributes);
}
SplittedAttributesListBaseClass.prototype = {};	//Object.create(AttributesList.prototype);
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'objectType', {value: 'SplittedAttributesListBaseClass'});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'purpose', {value: 'VirtualAttributes' });	// virtual
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'VirtualAttributes', {value: [] });		// virtual
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'InheritedAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.inheritedAttributes)});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'LocallyEffectiveAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.locallyEffectiveAttributes)});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'BoxModelAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.boxModelAttributes)});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'StrictlyLocalAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.strictlyLocalAttributes)});

/**
 * This function ignores attributes depending on the fact they pertain to a certain category of CSS props  :
 * 
 * InheritedAttributes,
 * BoxModelAttributes,
 * LocallyEffectiveAttributes,
 * StrictlyLocalAttributes
 * 
 * and assign the filtered ones to the embedded CSSPropertySetBuffer
 * 
 * It also logs a warning if we encounter a non-supported CSS prop
 * (for now, we're not aimed at supporting the entire spec)
 */
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'disambiguateAttributes', {
	value: function(attributes) {
		var self = this, definedAttributes = Object.keys(attributes), packedCSSProperty;
		
		for (var i = 0, l = definedAttributes.length; i < l; i++) {
			(function(attrIdx, attrName) {
				if (!CSSPropertyDescriptors.all[attrName]) {
					console.warn('Unsupported CSS Property:', attrName);
					return;
				}
				else if (self[self.purpose].indexOf(attrName) < 0)
					return;
					
				packedCSSProperty = new CSSPropertyBuffer(null, attrName);
				packedCSSProperty.setValue(
					attributes[attrName]
				);

				// Set the isInitialValue flag to false
				packedCSSProperty._buffer.set([0], CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start);
				
				self.CSSPropertySetBuffer.setPropFromBuffer(attrName, packedCSSProperty);
			})(i, definedAttributes[i]);
		}
//		this[this.purpose].forEach(function(attrName) {
//			packedCSSProperty = new CSSPropertyBuffer(null, attrName);
//			if (attributes[attrName]) {
//				packedCSSProperty.setValue(
//					parser.parseAListOfComponentValues(attributes[attrName])
//				);
//			}
//			else {
//				packedCSSProperty.setValue(
//					parser.parseAListOfComponentValues(
//						CSSPropertyDescriptors.all[attrName].prototype.initialValue
//					)
//				);
//			}
//			this.CSSPropertySetBuffer.setPropFromBuffer(attrName, packedCSSProperty);
//		}, this);
	}
});

//Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'populateInitialValues', {
//	value: function() {
//		// CAUTION: Categories in CSSPropertyDescriptors don't correspond
//		// to the "purposes" used here :
//		// => purposes are camel-case although categories are dromedar-case
//		var itemSize = this.CSSPropertySetBuffer.itemSize,
//			purpose = this.purpose.lowerCaseFirstChar();
//		var boundaries = CSSPropertyDescriptors.boundaries[purpose];
//		this.CSSPropertySetBuffer._buffer.set(
//			this.CachedCSSPropertySetBuffer._buffer.slice(
//				boundaries.start * itemSize,
//				(boundaries.start + boundaries.length) * itemSize
//			),
//			boundaries.start * itemSize
//		);
//	}
//});
//
//Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'CachedCSSPropertySetBuffer', {
//	value: (function() {
//		var packedCSSProperty, propertySetBuffer = new CSSPropertySetBuffer();
//		for (var attrGroup in CSSPropertyDescriptors.splitted) {
//			Object.keys(CSSPropertyDescriptors.splitted[attrGroup]).forEach(function(attrName) {
//				packedCSSProperty = new CSSPropertyBuffer(null, attrName);
//				packedCSSProperty.setValue(
//					parser.parseAListOfComponentValues(
//						CSSPropertyDescriptors.all[attrName].prototype.initialValue
//					)
//				);
//				propertySetBuffer.setPropFromBuffer(attrName, packedCSSProperty);
//			}, this);
//			propertySetBuffer.setGroupIsInitialValue(attrGroup, true);
//		}
//		return propertySetBuffer;
//	})()
//});











/**
 * @constructor InheritedAttributesList
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like (only significative keys defined)
 */
var InheritedAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
InheritedAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(InheritedAttributesList.prototype, 'objectType', { value: 'InheritedAttributesList' });
Object.defineProperty(InheritedAttributesList.prototype, 'purpose', { value: 'InheritedAttributes' });


/**
 * @constructor LocallyEffectiveAttributesList
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like
 */
var LocallyEffectiveAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
LocallyEffectiveAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(LocallyEffectiveAttributesList.prototype, 'objectType', { value: 'LocallyEffectiveAttributesList' });
Object.defineProperty(LocallyEffectiveAttributesList.prototype, 'purpose', { value: 'LocallyEffectiveAttributes' });


/**
 * @constructor boxModelAttributes
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like 
 */
var BoxModelAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
BoxModelAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(BoxModelAttributesList.prototype, 'objectType', { value: 'BoxModelAttributesList' });
Object.defineProperty(BoxModelAttributesList.prototype, 'purpose', { value: 'BoxModelAttributes' });


/**
 * @constructor StrictlyLocalAttributes
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like
 */
var StrictlyLocalAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
StrictlyLocalAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(StrictlyLocalAttributesList.prototype, 'objectType', { value: 'StrictlyLocalAttributesList' });
Object.defineProperty(StrictlyLocalAttributesList.prototype, 'purpose', { value: 'StrictlyLocalAttributes' });






















var AdvancedAttributesListFactory = function(attributes) {
	if ((typeof attributes === 'string' || !attributes) && Object.prototype.toString.call(arguments[1]) === '[object Object]')
		attributes = arguments[1];

	this.inheritedAttributes = new InheritedAttributesList(attributes);
	this.locallyEffectiveAttributes = new LocallyEffectiveAttributesList(attributes);
	this.boxModelAttributes = new BoxModelAttributesList(attributes);
	this.strictlyLocalAttributes = new StrictlyLocalAttributesList(attributes);

//	this.stdAttributes = new AttributesList(attributes);
}
AdvancedAttributesListFactory.prototype = {}

Object.defineProperty(AdvancedAttributesListFactory.prototype, 'get', {
	value: function(attr) {
		var propBuffer;
		for (var propGroup in CSSPropertyDescriptors.splitted) {
			if (CSSPropertyDescriptors.splitted[propGroup][attr]) {
				return this[propGroup].CSSPropertySetBuffer.bufferedValueToString(attr);
			}
		}
	}
});
Object.defineProperty(AdvancedAttributesListFactory.prototype, 'set', {
	value: function(attr, value) {
		if (attr === 'borderLeft')
			console.log('setAttribute', value);
		
		var propBuffer;
		for (var propGroup in CSSPropertyDescriptors.splitted) {
			if (CSSPropertyDescriptors.splitted[propGroup][attr]) {
				propBuffer = new CSSPropertyBuffer();
				propBuffer.setValue(value);
				this[propGroup].CSSPropertySetBuffer.setPropFromBuffer(attr, propBuffer);
			}
		}
	}
});
// FIXME: should update all partial lists down the object
Object.defineProperty(AdvancedAttributesListFactory.prototype, 'setApply', {
	value: function(attrList) {
//		Object.entries(attrList).forEach(function(pair) {
//			this.stdAttributes.set(pair[0], pair[1]);
//		}, this);
	}
});
Object.defineProperty(AdvancedAttributesListFactory.prototype, 'getAllAttributes', {
	value: function() {
		var allAttributes = {};
		for (var attrGroup in this) {
			Object.assign(allAttributes, this[attrGroup].CSSPropertySetBuffer.getPropertyGroupAsAttributesList(attrGroup));
		}
		return allAttributes;
	}
});

Object.defineProperty(AdvancedAttributesListFactory.prototype, 'getAllDefinedAttributes', {
	value: function() {
		var allAttributes = {};
		for (var attrGroup in this) {
//			console.log(this[attrGroup].CSSPropertySetBuffer.getPropertyGroupAsAttributesList(attrGroup));
			Object.assign(allAttributes, this[attrGroup].CSSPropertySetBuffer.getDefinedPropertiesFromGroupAsAttributesList(attrGroup));
		}
//		console.log(allAttributes);
		return allAttributes;
	}
});

Object.defineProperty(AdvancedAttributesListFactory.prototype, 'linearize', {
	value: function() {
		return new AttributesList(this.getAllDefinedAttributes()).linearize();
	}
});

Object.defineProperty(AdvancedAttributesListFactory, 'fromAST', {
	value: function(ast) {
		var name, attrList = {};
		// ast is an array of declarations
		ast.forEach(function(declaration) {
			// YET CSSOM ? it seems...
			
			name = declaration.name.hyphensToDromedar();
			if (CSSPropertyDescriptors.all.hasOwnProperty(name)) {
				attrList[name] = declaration.value.reduce(AdvancedAttributesListFactory.flattenDeclarationValues, '');
			}
		});
//		console.log(attrList);
		return new AdvancedAttributesListFactory(attrList);
	}
});

// A callback for the Reducer we use as a hacky serializer for the objects we get from the CSS ast
Object.defineProperty(AdvancedAttributesListFactory, 'flattenDeclarationValues', {
	value: function(acc, item, key) {
		//			console.log(acc, key);
		acc += item.tokenType !== 'WHITESPACE'
			? (item.tokenType === 'COMMA'
				? ','
				: (item.tokenType === 'DIMENSION' || item.tokenType === 'NUMBER'
					? item.repr + (item.unit || '')
					: (item.tokenType === 'PERCENTAGE'
						? item.repr + '%'
						: (item.type === 'FUNCTION'		// NOT a DECLARATION (item.type): it's a high-level type
							? item.name + '(' + item.value.reduce(AdvancedAttributesListFactory.flattenDeclarationValues, '') + ')'
							: item.value)
					)
				)
			)
			: (acc.length ? ' ' : '');		// no leading space in resulting string CSS values
		//			console.log(acc);
		return acc;
	}
});










// This is OBSOLETE.
// (already defined sooner in this file, and all the way rightly defined in CSSPropertyDescriptors)
//Object.defineProperty(AdvancedAttributesListFactory.prototype, 'inheritedAttributes', {
//	value: [
//		'writingMode',					// horizontal-tb / vertical-lr / vertical-rl / sideways-rl / sideways-lr
//		'captionSide',					// top / bottom (title or legend of a table)
//		'listStyleType', 				// disc / circle / square / decimal / georgian, and anything you want... UNICODE codepoint ?
//		'listStylePosition',			// inside / outside (position of the ::marker : first inline box or before first inline box)
//		'visibility',					// visible / hidden
//		'fontFamily',					// list of IDENT values
//		'fontSize',						// DIMENSION
//		'lineHeight',					// DIMENSION
//		'color',						// HASH or FUNCTION
//		'textOrientation',				// mixed / upright / sideways / sideways-right / sideways-left / use-glyph-orientation
//		'textAlign',					// left / right / center / justify (start / end)
//		'textTransform',				// capitalize / uppercase / lowercase / none / full-width / full-size-kana (full-width aligns vertical and horizontal letters on a grid of text)
//		'textDecoration',				// underline / + dotted / + red / + wavy / + overline
//		'cursor',						// help / wait / crosshair / not-allowed / zoom-in / grab
//		'borderCollapse',				// collapse / separate
//		'whiteSpace',					// normal / nowrap / pre / pre-wrap / pre-line / break-spaces
//		'wordBreak'						// normal / break-all / keep-all / break-word
//
//	]
//});
//
//Object.defineProperty(AdvancedAttributesListFactory.prototype, 'locallyEffectiveAttributes', {
//	value: [
//		'display',						// grid / flex / inline / inline-block / block / table / table-cell
//		'overflowX',					// hidden / visible / scroll
//		'overflowY',					// hidden / visible / scroll
//		'verticalAlign',				// baseline / top / middle / bottom / sub / text-top
//		'clear',						// left / right / both
//		'float',						// left / right (inline-start / inline-end)
//		'position',						// static / relative / absolute / fixed / sticky / top / bottom / right / left
//
//		'flex',							// SHORTHAND
//		'flexFlow',						// SHORTHAND
//		'flexDirection',				// row / column
//		'flexWrap',						// nowrap / wrap
//		'flexSchrink',					// INTEGER
//		'flexGrow',						// INTEGER
//		'flexBasis',						// INTEGER
//
//		'justifyContent',				// flex-start | flex-end | center | space-evenly | space-between | space-around 
//		'alignItems',					// flex-start | flex-end | center | baseline | stretch
//		'alignSelf',					// auto | flex-start | flex-end | center | baseline | stretch
//		'alignContent'					// flex-start | flex-end | center | space-between | space-around | stretch  	
//	]
//});
//
//Object.defineProperty(AdvancedAttributesListFactory.prototype, 'boxModelAttributes', {
//	value: [
//		'boxSizing',					// border-box / content-box
//		'width',						// DIMENSION
//		'height',						// DIMENSION
//		'top',							// DIMENSION
//		'left',							// DIMENSION
//		'right',						// DIMENSION
//		'bottom',						// DIMENSION
//
//		'padding',						// SHORTHAND
//		'margin',						// SHORTHAND
//		'border',						// SHORTHAND
//
//		//			'paddingTop',					// DIMENSION
//		//			'paddingBottom',				// DIMENSION
//		//			'paddingLeft',					// DIMENSION
//		//			'paddingRight',					// DIMENSION
//
//		'paddingBlockStart',			// DIMENSION
//		'paddingInlineEnd',				// DIMENSION
//		'paddingBlockEnd',				// DIMENSION
//		'paddingInlineStart',			// DIMENSION
//
//		//			'marginTop',					// DIMENSION
//		//			'marginBottom',					// DIMENSION
//		//			'marginLeft',					// DIMENSION
//		//			'marginRight',					// DIMENSION
//
//		'marginBlockStart',				// DIMENSION
//		'marginBlockEnd',				// DIMENSION
//		'marginInlineStart',			// DIMENSION
//		'marginInlineEnd',				// DIMENSION
//
//		'borderBlockStart',				// width, style, color
//		'borderBlockEnd',				// width, style, color
//		'borderInlineStart',			// width, style, color
//		'borderInlineEnd',				// width, style, color
//
//		'borderWidth',					// DIMENSION
//		'borderBlockStartWidth',		// DIMENSION
//		'borderBlockEndWidth',			// DIMENSION
//		'borderInlineStartWidth',		// DIMENSION
//		'borderInlineEndWidth',			// DIMENSION
//
//		'borderStyle',					// none / dotted / inset / dashed / solid / double / groove
//		'borderBlockStartStyle',		// none / dotted / inset / dashed / solid / double / groove
//		'borderBlockEndStyle',			// none / dotted / inset / dashed / solid / double / groove
//		'borderInlineStartStyle',		// none / dotted / inset / dashed / solid / double / groove
//		'borderInlineEndStyle',			// none / dotted / inset / dashed / solid / double / groove
//
//		'borderColor',					// COLOR
//		'borderBlockStartColor',		// COLOR
//		'borderBlockEndColor',			// COLOR
//		'borderInlineStartColor',		// COLOR
//		'borderInlineEndColor'			// COLOR
//	]
//});
//
//Object.defineProperty(AdvancedAttributesListFactory.prototype, 'strictlyLocalAttributes', {
//	value: [
//		'background',					// SHORTHAND
//		'backgroundColor',				//
//		'backgroundPosition',			// SHORTHAND
//		'backgroundPositionTop',		//
//		'backgroundPositionLeft',		//
//		'backgroundImage',				//
//		'backgroundRepeat',				//
//
//		'borderRadius',					// DIMENSION[1-4] / DIMENSION[1-4]
//
//		'borderTopLeftRadius',			// DIMENSION / DIMENSION
//		'borderTopRightRadius',			// DIMENSION / DIMENSION
//		'borderBottomRightRadius',		// DIMENSION / DIMENSION
//		'borderBottomLeftRadius',		// DIMENSION / DIMENSION
//
//		'borderStartStartRadius',		// DIMENSION / DIMENSION
//		'borderStartEndRadius',			// DIMENSION / DIMENSION
//		'borderEndStartRadius',			// DIMENSION / DIMENSION
//		'borderEndEndRadius',			// DIMENSION / DIMENSION
//	]
//});




/*
 * The following values are declared and used in the CSSPropertyBuffer class
 */


//\w+\.prototype\.tokenType\s?=\s?"[^"]+";

//	var TokenTypes = {};
//	TokenTypes.BadStringToken = 0;
//	TokenTypes.BadURLToken = 1;
//	TokenTypes.WhitespaceToken = 2;
//	TokenTypes.CDOToken = 3;
//	TokenTypes.CDCToken = 4;
//	TokenTypes.ColonToken = 5;
//	TokenTypes.SemicolonToken = 6;
//	TokenTypes.CommaToken = 7;
//	TokenTypes.OpenCurlyToken = 8;
//	TokenTypes.CloseCurlyToken = 9;
//	TokenTypes.OpenSquareToken = 10;
//	TokenTypes.CloseSquareToken = 11;
//	TokenTypes.OpenParenToken = 12;
//	TokenTypes.CloseParenToken = 13;
//	TokenTypes.IncludeMatchToken = 14;
//	TokenTypes.DashMatchToken = 15;
//	TokenTypes.PrefixMatchToken = 16;
//	TokenTypes.SuffixMatchToken = 17;
//	TokenTypes.SubstringMatchToken = 18;
//	TokenTypes.ColumnToken = 19;
//	TokenTypes.EOFToken = 20;
//	TokenTypes.DelimToken = 21;
//	TokenTypes.IdentToken = 22;
//	TokenTypes.FunctionToken = 23;
//	TokenTypes.AtKeywordToken = 24;
//	TokenTypes.HashToken = 25;
//	TokenTypes.StringToken = 26;
//	TokenTypes.URLToken = 27;
//	TokenTypes.NumberToken = 28;
//	TokenTypes.PercentageToken = 29;
//	TokenTypes.DimensionToken = 30;

// ^\t(\w{1,2})\s?\t\s?\t(\w+)
// Units.\1 = {\Runit : '\1',\R\tfullName : '\2'\R}

//	var Units = {};
//	Units.cm = {
//		idx : 0,
//		unit : 'cm',
//		fullName : 'centimeters',
//		equivStr : '1cm = 96px/2.54'
//	} 	
//	Units.mm = {
//		idx : 1,
//		unit : 'mm',
//		fullName : 'millimeters',
//		equivStr : '1mm = 1/10th of 1cm'
//	} 	
//	Units.Q = {
//		idx : 2,
//		unit : 'Q',
//		fullName : 'quarter',
//		equivStr : '1Q = 1/40th of 1cm'
//	}
//	Units.in = {
//		idx : 3,
//		unit : 'in',
//		fullName : 'inches',
//		equivStr : '1in = 2.54cm = 96px'
//	}
//	Units.pc = {
//		idx : 4,
//		unit : 'pc',
//		fullName : 'picas',
//		equivStr : '1pc = 1/6th of 1in'
//	}
//	Units.pt = {
//		idx : 5,
//		unit : 'pt',
//		fullName : 'points',
//		equivStr : '1pt = 1/72th of 1in'
//	}
//	Units.px = {
//		idx : 6,
//		unit : 'px',
//		fullName : 'pixels',
//		equivStr : '1px = 1/96th of 1in '
//	}






module.exports = AdvancedAttributesListFactory;