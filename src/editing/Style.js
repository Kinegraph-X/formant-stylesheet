/**
* Stylesheets
*/

var TypeManager = require('src/core/TypeManager');
var GeneratorFor16bitsInt = require('src/core/UIDGenerator').GeneratorFor16bitsInt;
var CSSSelector = require('src/_LayoutEngine/CSSSelector');
var StyleAttributes = require('src/editing/StyleAttributes');
var AdvancedStyleAttributes = require('src/editing/SplittedAttributes');

var BinarySchemaFactory = require('src/core/BinarySchema');
var MemoryPartialBuffer = require('src/core/MemoryPartialBuffer');
var MemoryBufferStack = require('src/core/MemoryBufferStack');

/**
 * Construct. Style
 * 
 * @param type {string} : 'p' || 'span'
 * @param selector {string} : CSS selector
 * @param optimizedSelector {string} : optimized CSS selector (represented as a 4 bytes sequence and a UID)
 * @param attrIface {object} : passive partial PropertiesList-Like (no methods, only significative keys defined)
 */


var Style = function(type, selector, attributes) {
	this.selector = new CSSSelector(attributes.selector || selector);
	
	this.compactedViewOnSelector = new MemoryPartialBuffer(
		Style.prototype.optimizedSelectorBufferSchema
	);

	//     /!\     WARNING: are we allowed to match insensitive to case?     /!\
	
	// TAKE CARE OF PERF: we optimized the String.prototype.getNCharAsCharCodess method to get 3 chars most of the time. But that's pretty useless...
	var substrDef = this.selector.extractMostSpecificPartFromSelector().toLowerCase().getNcharsAsCharCodesArray(3, 4);
	this.populateCompactedViewOnSelector(this.compactedViewOnSelector, substrDef, this.selector.selectorProofingPartType);
	
	// TODO: get rid of this horrible "NaN"
	// 		=> we should never initialize a value to NaN
	this.index = NaN; 	// index in the CSSStyleSheet.CSSRules Array (shall not be set for a style constructor, but kept here as a reminder, as the stylesheetWrapper on addStyle() shall linearize the style and reference the actual index)
	this.type = type;
	this.attrIFace = new AdvancedStyleAttributes(this.type, attributes);
}
Style.prototype = {};

//Style.prototype.constants = {
//	rawSelectorIsProof : 0,
//	idIsProof : 1,
//	classIsProof : 2,
//	tagIsProof : 3
//}

Style.prototype.linearize = function() {
	return this.selector + ' { ' + '\n' + this.attrIFace.linearize() + '\n' + '}\n';
}

Style.prototype.addToStyleSheet = function(styleSheet) {
	this.index = styleSheet.insertRule(this.linearize())
}

Style.prototype.removeFromStyleSheet = function(styleSheet) {
	styleSheet.deleteRule(this.index);
}

Style.prototype.populateCompactedViewOnSelector = function(memoryPartialBuffer, substrDef, proofingPartType) {
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
	// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
	// Offset of the extracted string from the original string
	memoryPartialBuffer.set(
			[substrDef[0]],
			Style.prototype.optimizedSelectorBufferSchema.startingOffsetInString.start
		);
	// Length of the extracted string from the original string
	memoryPartialBuffer.set(
			[substrDef[1].length],
			Style.prototype.optimizedSelectorBufferSchema.stringLength.start
		);
	// Extract the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
	memoryPartialBuffer.set(
			substrDef[1],
			Style.prototype.optimizedSelectorBufferSchema.stringBinaryEncoded.start
		);
	memoryPartialBuffer.set(
			proofingPartType,
			Style.prototype.optimizedSelectorBufferSchema.selectorProofingPartType.start
		);
	memoryPartialBuffer.set(
			GeneratorFor16bitsInt.newUID(),
			Style.prototype.optimizedSelectorBufferSchema.bufferUID.start
		);
		
		
	// Populate the masterStyleRegistry from which we shall later retrieve
	// the -not- optimized part of the style object, i.e the current CSS rule
	TypeManager.masterStyleRegistry.setItem(
		memoryPartialBuffer.get(
			Style.prototype.optimizedSelectorBufferSchema.bufferUID.start,
			2
		),
		this
	)
}

// TODO: OPTIMIZE
Style.prototype.copyAndMergeWithStyle = function(styleObj) {
	var attrIFaceCopy = new AdvancedStyleAttributes('FIXME:noType', this.attrIFace.stdAttributesList);
	attrIFaceCopy.setApply(styleObj);
	return attrIFaceCopy;
}

Style.prototype.optimizedSelectorBufferSchema = BinarySchemaFactory(
	'compactedViewOnSelector',
	[	
		'startingOffsetInString',
		'stringLength',
		'stringBinaryEncoded',
		'selectorProofingPartType',
		'bufferUID'
	],
	[
		1,
		1,
		3,
		1,
		2
	]
);



module.exports = Style;
