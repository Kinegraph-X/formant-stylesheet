/**
 * Construct. Point
 * 
 * @param type String : 
 */
 
var StylePropertyEnhancer = require('src/editing/StylePropertyEnhancer');
var enhancer = new StylePropertyEnhancer();

var MemoryCSSPropertyBuffer = require('src/_LayoutEngine/MemoryCSSPropertyBuffer');
var BinarySlice = require('src/core/BinarySlice');


	/**
	 * Construct. AttributesList
	 * This abstract type shall be used as a base for the "splitted" styles:
	 * "Inheritable" and "local" attributes are grouped in 2 different objects
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
		// Find out how we once upon a time got an array...
		// 		=> fixed in AdvancedAttributesList
		if (typeof attributes === 'string' && arguments[1] && Array.isArray(arguments[1]))
			attributes = arguments[1];
		
		// TODO: explicitly type each CSS data-structure so they precisely reproduce
		// the CSS props we're currently supporting 
		if (typeof attributes === 'object' && Object.keys(attributes).length) {
			for(var prop in attributes) {
				if (attributes.hasOwnProperty(prop) && prop !== 'selector' && prop !== 'type')
					this[prop] = attributes[prop];
			};
		}
	}
	AttributesList.prototype = {};

	Object.defineProperty(AttributesList.prototype, 'linearize', {
											value : function() {
												var str = '', current = '', attrCount = Object.keys(this).length, c = 0;
												for(var prop in this) {
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
										}
	);
	
	Object.defineProperty(AttributesList.prototype, 'get', {
																	value : function(attributeName) {
																		
																	}
																}
	);
	
	Object.defineProperty(AttributesList.prototype, 'getAttributeAsCSSOM', {
																	value : function(attributeName) {
																		
																	}
																}
	);
	
	Object.defineProperty(AttributesList.prototype, 'getAttributeAsKeyValue', {
																	value : function(attributeName) {
																		
																	}
																}
	);
	
	Object.defineProperty(AttributesList.prototype, 'set', {
																	value : function(attributeName, attributeValue) {
																		
																	}
																}
	);
	
	Object.defineProperty(AttributesList.prototype, 'setAttributeFromCSSOM', {
																	value : function(attributeName, attributeValue) {
																		
																	}
																}
	);
	
	Object.defineProperty(AttributesList.prototype, 'setAttributeFromKeyValue', {
																	value : function(attributeName, attributeValue) {
																		
																	}
																}
	);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
//	/**
//	 * Construct. InheritedAttributesList
//	 * 
//	 * @param attributes Object : passive partial AttributesList-Like (no methods, only significative keys defined)
//	 */
//	var InheritedAttributesList = function(attributes) {
//		
//	}
//	InheritedAttributesList.prototype = Object.create(AttributesList.prototype);
//	
//	
//	/**
//	 * Construct. LocallyEffectiveAttributesList
//	 * 
//	 * @param attributes Object : passive partial AttributesList-Like (no methods, only significative keys defined)
//	 */
//	var LocallyEffectiveAttributesList = function(attributes) {
//		
//	}
//	LocallyEffectiveAttributesList.prototype = Object.create(AttributesList.prototype);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var AdvancedAttributesListFactory = function(attributes) {
		// backward compatibility with the attributes list we defined in PHP,
		// and ported as the basic implementation of AttributesList (StyleAttributes.js)
		// TODO: evaluate the oppportunity to break this API: how far are we from PHP ? We may obtain CSS defintions from the server, but shouldn't we treat them as "external data" ?
		
		if ((typeof attributes === 'string' || !attributes) && Object.prototype.toString.call(arguments[1]) === '[object Object]')
			attributes = arguments[1];
			
		this.stdAttributesList = new AttributesList(attributes);
		this.InheritedAttributesList = new AttributesList(this.splitAttributes('inherited', attributes));
		this.locallyEffectiveAttributesList = new AttributesList(this.splitAttributes('locallyEffective', attributes));
		this.boxModelPartAttributesList = new AttributesList(this.splitAttributes('boxModelPart', attributes));
		this.strictlyLocalAttributesList = new AttributesList(this.splitAttributes('strictlyLocal', attributes));
		
//		console.log(this.stdAttributesList);
	}
	AdvancedAttributesListFactory.prototype = {}
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'get', {
		value : function(attr) {
			return this.stdAttributesList.get(attr);
		}
	});
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'set', {
		value : function(attr, value) {
			this.stdAttributesList.set(attr, value);
		}
	});
	// FIXME: should update all partial lists down the object
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'setApply', {
		value : function(attrList) {
			Object.entries(attrList).forEach(function(pair) {
				this.stdAttributesList.set(pair[0], pair[1]);
			}, this);
		}
	});
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'getAllAttributes', {
		value : function() {
			return this.stdAttributesList;
		}
	});
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'splitAttributes', {
		value : function(purpose, attributes) {
			var res = {};
			if (!purpose)
				return attributes;
			else if (purpose === 'inherited') {
				for (var attr in attributes) {
					if (this.dictInheritedAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			else if (purpose === 'locallyEffective') {
				for (var attr in attributes) {
					if (this.dictLocallyEffectiveAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			else if (purpose === 'boxModelPart') {
				for (var attr in attributes) {
					if (this.dictBoxModelAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			else if (purpose === 'strictlyLocal') {
				for (var attr in attributes) {
					if (this.dictStrictlyLocalAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			return res;
		} 
	});
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'disambiguateInherited', {
		value : function(attribute) {
			// yep... let's see if this could a much better approach...
			// (for now, we explicitely branch in the above function,
			// depending on an explicit and hard coded flag...)
		}
	});
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'linearize', {
		value : function() {
//			console.log(this.stdAttributesList.linearize());
			return this.stdAttributesList.linearize();
		}
	});
	
	Object.defineProperty(AdvancedAttributesListFactory, 'fromAST', {
		value : function(ast) {
			var name, value, attrList = {}, packedCSSProperty;
			// ast is an array of declarations
			ast.forEach(function(declaration) {
				// NOT YET CSSOM...
				
				// We have to figure out the way we want to make use of it...
				
				// => We have for now a draft for a packed CSS property desciptor
				// 	=> This seems the appropriate time to design this packed CSS property buffer,
				//		and its associated reader object.
				// 		=> with accessors
				//		=> dictionary indexed emums (eg. tokenType, etc.)
				//		=> a few helper function, like isDimension, isCanonical, etc. 
				//		=> etc.
				
//				console.log(declaration.value);
//				console.log(declaration.value.reduce(flattenDeclarationValues, ''));


				if (declaration.value && typeof declaration.value !== 'number') {	// Array.isArray(declaration.value)
					name = declaration.name.hyphensToDromedar();
					
					attrList[name] = declaration.value.reduce(this.flattenDeclarationValues, '');
					this.packedCSSProperties[name] = this.populateCSSPropertyBuffer(
						name,
						declaration.value.filter(function(val) {
							return token === 'DIMENSION';
						})[0]
					);
				}
			});
			
			return new AdvancedAttributesListFactory(attrList);
		}
	});
	
	Object.defineProperty(AdvancedAttributesListFactory, 'populateCSSPropertyBuffer', {
		value : function(parsedPropName, parsedPropValue) {
			var CSSPropertyBuffer = new MemoryCSSPropertyBuffer(
				MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema
			);
			// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
			// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
			// Offset of the extracted string from the original string
			CSSPropertyBuffer.set(
					[TokenTypes[parsedProp.token]],
					MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema.tokenType.start
				);
			// Length of the extracted string from the original string
			CSSPropertyBuffer.set(
					[parsedProp.value],
					MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema.value.start
				);
			// Extract the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
			CSSPropertyBuffer.set(
					[0],		// parsedProp.type = "integer"
					MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema.propertyType.start
				);
			CSSPropertyBuffer.set(
					[String.prototype.charCodeAt.apply(parsedProp.repr, 0, 1, 2)],
					MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema.repr.start
				);
			CSSPropertyBuffer.set(
					[Units[parsedProp.unit].idx],
					MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema.unit.start
				);
				
				
			// Populate ?
//			TypeManager.masterStyleRegistry.setItem(
//				parsedPropName,
//				CSSPropertyBuffer
//			);

			return CSSPropertyBuffer;
		}
	})
	
	// A callback for the Reducer we use as a hacky serializer for the objects we get from the CSS ast
	Object.defineProperty(AdvancedAttributesListFactory, 'flattenDeclarationValues', {
		value : function(acc, item, key) {
//			console.log(acc, key);
			acc += item.tokenType !== 'WHITESPACE'
				? (item.tokenType === ','
					? ','
					: (item.tokenType === 'DIMENSION' || item.tokenType === 'NUMBER'
						? item.repr + (item.unit || '')
						: (item.type === 'FUNCTION'		// NOT a DECLARATION (item.type): it's a high-level type
							? item.name + '(' + item.value.reduce(flattenDeclarationValues, '') + ')'
							: item.value)
					)
				)
				: (acc.length ? ' ' : '');		// no leading space in resulting string CSS values
			return acc;
		}
	});
	
	
	
	
	
	
	
	

	
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'dictInheritedAttributes', {
		value : [
			'writingMode',					// horizontal-tb / vertical-lr / vertical-rl / sideways-rl / sideways-lr
			'captionSide',					// top / bottom (title or legend of a table)
			'listStyleType', 				// disc / circle / square / decimal / georgian, and anything you want... UNICODE codepoint ?
			'listStylePosition',			// inside / outside (position of the ::marker : first inline box or before first inline box)
			'visibility',					// visible / hidden
			'textOrientation',				// mixed / upright / sideways / sideways-right / sideways-left / use-glyph-orientation
			'textAlign',					// left / right / center / justify (start / end)
			'textTransform',				// capitalize / uppercase / lowercase / none / full-width / full-size-kana (full-width aligns vertical and horizontal letters on a grid of text)
			'textDecoration',				// underline / + dotted / + red / + wavy / + overline
			'cursor',						// help / wait / crosshair / not-allowed / zoom-in / grab
			'borderCollapse',				// collapse / separate
			'whiteSpace',					// normal / nowrap / pre / pre-wrap / pre-line / break-spaces
			'wordBreak'						// normal / break-all / keep-all / break-word
			
		]
	});
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'dictLocallyEffectiveAttributes', {
		value : [
			'display',						// grid / flex / inline / inline-block / block / table / table-cell
			'overflowX',					// hidden / visible / scroll
			'overflowY',					// hidden / visible / scroll
			'verticalAlign',				// baseline / top / middle / bottom / sub / text-top
			'clear',						// left / right / both
			'float',						// left / right (inline-start / inline-end)
			'position'						// static / relative / absolute / fixed / sticky / top / bottom / right / left
		]
	});
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'dictBoxModelAttributes', {
		value : [
			'boxSizing',					// border-box / content-box
			'width',						// DIMENSION
			'height',						// DIMENSION
			'top',							// DIMENSION
			'left',							// DIMENSION
			'right',						// DIMENSION
			'bottom',						// DIMENSION
			
			'padding',						// DIMENSION
			'margin',						// DIMENSION
			
			'paddingTop',					// DIMENSION
			'paddingBottom',				// DIMENSION
			'paddingLeft',					// DIMENSION
			'paddingRight',					// DIMENSION
			
			'paddingBlockStart',			// DIMENSION
			'paddingBlockEnd',				// DIMENSION
			'paddingInlineStart',			// DIMENSION
			'paddingInlineEnd',				// DIMENSION
					
			'marginTop',					// DIMENSION
			'marginBottom',					// DIMENSION
			'marginLeft',					// DIMENSION
			'marginRight',					// DIMENSION
			
			'marginBlockStart',				// DIMENSION
			'marginBlockEnd',				// DIMENSION
			'marginInlineStart',			// DIMENSION
			'marginInlineEnd',				// DIMENSION
			
			'borderBlockStart',				// width, style, color
			'borderBlockEnd',				// width, style, color
			'borderInlineStart',			// width, style, color
			'borderInlineEnd',				// width, style, color
			
			'borderWidth',					// DIMENSION
			'borderBlockStartWidth',		// DIMENSION
			'borderBlockEndWidth',			// DIMENSION
			'borderInlineStartWidth',		// DIMENSION
			'borderInlineEndWidth',			// DIMENSION
			
			'borderStyle',					// none / dotted / inset / dashed / solid / double / groove
			'borderBlockStartStyle',		// none / dotted / inset / dashed / solid / double / groove
			'borderBlockEndStyle',			// none / dotted / inset / dashed / solid / double / groove
			'borderInlineStartStyle',		// none / dotted / inset / dashed / solid / double / groove
			'borderInlineEndStyle',			// none / dotted / inset / dashed / solid / double / groove
			
			'borderColor',					// COLOR
			'borderBlockStartColor',		// COLOR
			'borderBlockEndColor',			// COLOR
			'borderInlineStartColor',		// COLOR
			'borderInlineEndColor'			// COLOR
	]
	});
	
	Object.defineProperty(AdvancedAttributesListFactory.prototype, 'dictStrictlyLocalAttributes', {
		value : [
			'borderRadius',					// DIMENSION[1-4] / DIMENSION[1-4]
	
		    'borderTopLeftRadius',			// DIMENSION / DIMENSION
		    'borderTopRightRadius',			// DIMENSION / DIMENSION
		    'borderBottomRightRadius',		// DIMENSION / DIMENSION
		    'borderBottomLeftRadius',		// DIMENSION / DIMENSION
	
			'borderStartStartRadius',		// DIMENSION / DIMENSION
			'borderStartEndRadius',			// DIMENSION / DIMENSION
			'borderEndStartRadius',			// DIMENSION / DIMENSION
			'borderEndEndRadius',			// DIMENSION / DIMENSION
	]
	});
	
	//\w+\.prototype\.tokenType\s?=\s?"[^"]+";

	var TokenTypes = {};
	TokenTypes.BadStringToken = 0;
	TokenTypes.BadURLToken = 1;
	TokenTypes.WhitespaceToken = 2;
	TokenTypes.CDOToken = 3;
	TokenTypes.CDCToken = 4;
	TokenTypes.ColonToken = 5;
	TokenTypes.SemicolonToken = 6;
	TokenTypes.CommaToken = 7;
	TokenTypes.OpenCurlyToken = 8;
	TokenTypes.CloseCurlyToken = 9;
	TokenTypes.OpenSquareToken = 10;
	TokenTypes.CloseSquareToken = 11;
	TokenTypes.OpenParenToken = 12;
	TokenTypes.CloseParenToken = 13;
	TokenTypes.IncludeMatchToken = 14;
	TokenTypes.DashMatchToken = 15;
	TokenTypes.PrefixMatchToken = 16;
	TokenTypes.SuffixMatchToken = 17;
	TokenTypes.SubstringMatchToken = 18;
	TokenTypes.ColumnToken = 19;
	TokenTypes.EOFToken = 20;
	TokenTypes.DelimToken = 21;
	TokenTypes.IdentToken = 22;
	TokenTypes.FunctionToken = 23;
	TokenTypes.AtKeywordToken = 24;
	TokenTypes.HashToken = 25;
	TokenTypes.StringToken = 26;
	TokenTypes.URLToken = 27;
	TokenTypes.NumberToken = 28;
	TokenTypes.PercentageToken = 29;
	TokenTypes.DimensionToken = 30;
	
	// ^\t(\w{1,2})\s?\t\s?\t(\w+)
	// Units.\1 = {\Runit : '\1',\R\tfullName : '\2'\R}
	
	var Units = {};
	Units.cm = {
		idx : 0,
		unit : 'cm',
		fullName : 'centimeters',
		equivStr : '1cm = 96px/2.54'
	} 	
	Units.mm = {
		idx : 1,
		unit : 'mm',
		fullName : 'millimeters',
		equivStr : '1mm = 1/10th of 1cm'
	} 	
	Units.Q = {
		idx : 2,
		unit : 'Q',
		fullName : 'quarter',
		equivStr : '1Q = 1/40th of 1cm'
	}
	Units.in = {
		idx : 3,
		unit : 'in',
		fullName : 'inches',
		equivStr : '1in = 2.54cm = 96px'
	}
	Units.pc = {
		idx : 4,
		unit : 'pc',
		fullName : 'picas',
		equivStr : '1pc = 1/6th of 1in'
	}
	Units.pt = {
		idx : 5,
		unit : 'pt',
		fullName : 'points',
		equivStr : '1pt = 1/72th of 1in'
	}
	Units.px = {
		idx : 6,
		unit : 'px',
		fullName : 'pixels',
		equivStr : '1px = 1/96th of 1in '
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var allKnownPropertiesList = function() {
		this.baseList.forEach(function(propertyName) {
			this[propertyName] = 0;
		}, this);
	}
	allKnownPropertiesList.prototype = {};
	allKnownPropertiesList.prototype.objectType = '';
	allKnownPropertiesList.prototype.baseList = (function() {
		var knownAttributesList = [], knownAttributesDummyList;
		for (let propertiesGroup in (knownAttributesDummyList = new AdvancedAttributesListFactory())) {
			Object.keys(knownAttributesDummyList[propertiesGroup]).forEach(function(propertyName) {
				knownAttributesList.push(propertyName);
			});
		}
		return knownAttributesList;
	})();
	allKnownPropertiesList.prototype.baseSlices = (function() {
		var knownAttributesDummyList, baseSlices = {}, start = 0;
		for (let propertiesGroup in (knownAttributesDummyList = new AdvancedAttributesListFactory())) {
			baseSlices[propertiesGroup] = new BinarySlice(
				start,
				knownAttributesDummyList[propertiesGroup].length
			);
			start += knownAttributesDummyList[propertiesGroup].length;
		}
		return baseSlices;
	})();
	
	
	
	
	
	
	
	
	
	Object.defineProperty(AdvancedAttributesListFactory, 'allKnownCSSPropertiesFactory', {
		value : function() {
			return new allKnownPropertiesList();
		}
	});
	
	Object.defineProperty(AdvancedAttributesListFactory, 'allKnownCSSPropertiesStaticMap', {
		value : function() {
			return allKnownPropertiesList.prototype.baseList;
		}
	});
	
	Object.defineProperty(AdvancedAttributesListFactory, 'allKnownCSSPropertiesBoudaries', {
		value : function() {
			return allKnownPropertiesList.prototype.baseSlices;
		}
	});
	
	
	


//module.exports = factory.Maker.getClassFactory(classConstructor);
module.exports = AdvancedAttributesListFactory;