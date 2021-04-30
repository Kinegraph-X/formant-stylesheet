/**
 * Construct. Point
 * 
 * @param type String : 
 */
 
var StylePropertyEnhancer = require('src/Editing/StylePropertyEnhancer');
var enhancer = new StylePropertyEnhancer();

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
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/**
	 * Construct. InheritedAttributesList
	 * 
	 * @param attributes Object : passive partial AttributesList-Like (no methods, only significative keys defined)
	 */
	var InheritedAttributesList = function(attributes) {
		
	}
	InheritedAttributesList.prototype = Object.create(AttributesList.prototype);
	
	
	/**
	 * Construct. LocallyEffectiveAttributesList
	 * 
	 * @param attributes Object : passive partial AttributesList-Like (no methods, only significative keys defined)
	 */
	var LocallyEffectiveAttributesList = function(attributes) {
		
	}
	LocallyEffectiveAttributesList.prototype = Object.create(AttributesList.prototype);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
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
					if (dictInheritedAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			else if (purpose === 'locallyEffective') {
				for (var attr in attributes) {
					if (dictLocallyEffectiveAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			else if (purpose === 'boxModelPart') {
				for (var attr in attributes) {
					if (dictBoxModelAttributes.indexOf(attr) !== -1)
					res[attr] = attributes[attr];
				}
			}
			else if (purpose === 'strictlyLocal') {
				for (var attr in attributes) {
					if (dictStrictlyLocalAttributes.indexOf(attr) !== -1)
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
			var value, attrList = {};
			// ast is an array of declarations
			ast.forEach(function(declaration) {
				// NOT YET CSSOM...
				// We have to figure out the way we want to make use of it...
//				console.log(declaration.value);
//				console.log(declaration.value.reduce(flattenDeclarationValues, ''));


				if (declaration.value && typeof declaration.value !== 'number')		// Array.isArray(declaration.value)
					attrList[declaration.name.hyphensToDromedar()] = declaration.value.reduce(flattenDeclarationValues, '');
			});
			
			return new AdvancedAttributesListFactory(attrList);
		}
	});
	
	// A Reducer we use as a hacky serializer for the objects we get from the CSS ast
	var flattenDeclarationValues = function(acc, item, key) {
//		console.log(acc, key);
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
			: (acc.length ? ' ' : '');		// avoid leading space in string CSS values
		return acc;
	}
	
	
	
	
	
	
	
	

	
	
	var dictInheritedAttributes = [
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
		
	];
	
	var dictLocallyEffectiveAttributes = [
		'display',						// grid / flex / inline / inline-block / block / table / table-cell
		'overflowX',					// hidden / visible / scroll
		'overflowY',					// hidden / visible / scroll
		'verticalAlign',				// baseline / top / middle / bottom / sub / text-top
		'clear',						// left / right / both
		'float',						// left / right (inline-start / inline-end)
		'position'						// static / relative / absolute / fixed / sticky / top / bottom / right / left
	];
	
	var dictBoxModelAttributes = [
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
	];
	
	var dictStrictlyLocalAttributes = [
		'borderRadius',					// DIMENSION[1-4] / DIMENSION[1-4]

	    'borderTopLeftRadius',			// DIMENSION / DIMENSION
	    'borderTopRightRadius',			// DIMENSION / DIMENSION
	    'borderBottomRightRadius',		// DIMENSION / DIMENSION
	    'borderBottomLeftRadius',		// DIMENSION / DIMENSION

		'borderStartStartRadius',		// DIMENSION / DIMENSION
		'borderStartEndRadius',			// DIMENSION / DIMENSION
		'borderEndStartRadius',			// DIMENSION / DIMENSION
		'borderEndEndRadius',			// DIMENSION / DIMENSION
	];
	
	
	


//module.exports = factory.Maker.getClassFactory(classConstructor);
module.exports = AdvancedAttributesListFactory;