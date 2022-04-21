/**
* Stylesheets
*/

var TypeManager = require('src/core/TypeManager');
var GeneratorFor16bitsInt = require('src/core/UIDGenerator').GeneratorFor16bitsInt;
var CSSSelectorsList = require('src/editing/CSSSelectorsList');
var CSSSelectorSetBuffer = require('src/editing/CSSSelectorSetBuffer');
//var StyleAttributes = require('src/editing/StyleAttributes');
var AdvancedAttributesList = require('src/editing/SplittedAttributes');

//var MemorySingleBuffer = require('src/core/MemorySingleBuffer');
//var MemoryBufferStack = require('src/core/MemoryBufferStack');

/**
 * @constructor Style
 * 
 * @param type {string} : 'p' || 'span'
 * @param selector {string} : CSS selector
 * @param optimizedSelector {string} : optimized CSS selector (represented as a 4 bytes sequence and a UID)
 * @param attrIface {object} : passive partial PropertiesList-Like (no methods, only significative keys defined)
 */


var Style = function(type, selector, attributes) {
	this.selectorsList = new CSSSelectorsList(attributes.selector || selector);
	this.compactedViewOnSelectorsList = new CSSSelectorSetBuffer(null, this.selectorsList);
	this.type = type;
	this.attrIFace = new AdvancedAttributesList(this.type, attributes);
	
	// Populate the masterStyleRegistry, from which we shall later retrieve
	// the optimized part of the style object, i.e the current CSS rule
	this.selectorsList.forEach(function(currentSelector) {
//		console.log(this.compactedViewOnSelectorsList.getEntry(
//				currentSelector.selectorStr
//				// we unpack 16 and 32 bits integers in the CSSCompactedSelector type (in fact it's a MemorySingleBuffer)
//				).get(
//					CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start,
//					2
//				));
		TypeManager.masterStyleRegistry.setItem(
			this.compactedViewOnSelectorsList.getEntry(
				currentSelector.selectorStr
				// we unpack 16 and 32 bits integers in the CSSCompactedSelector type (in fact it's a MemorySingleBuffer)
				).get(
					CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start,
					2
				),
			this
		);
	}, this);
	
}
Style.prototype = {};

Style.prototype.linearize = function() {
	var linearizedSelector = '';
	this.selectorsList.forEach(function(selector, key) {
		linearizedSelector += selector.selectorStr;
		if (key !== this.selectorsList.length - 1)
			linearizedSelector += ', ';
	}, this);
	linearizedSelector += ' { ' + '\n' + this.attrIFace.linearize() + '\n' + '}\n';
	// FIXME: this should loop on the selectors and interpolate with commas
	return linearizedSelector;
}

Style.prototype.addToStyleSheet = function(styleSheet) {
	this.index = styleSheet.insertRule(this.linearize())
}

Style.prototype.removeFromStyleSheet = function(styleSheet) {
	styleSheet.deleteRule(this.index);
}

//Style.prototype.populateCompactedViewOnSelector = function(substrDef, proofingPartType) {
//	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
//	// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
//	// Offset of the extracted string from the original string
//	this.compactedViewOnSelector.set(
//			[substrDef[0]],
//			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.startingOffsetInString.start
//		);
//	// Length of the extracted string from the original string
//	this.compactedViewOnSelector.set(
//			[substrDef[1].length],
//			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.stringLength.start
//		);
//	// Extract the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
//	this.compactedViewOnSelector.set(
//			substrDef[1],
//			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.stringBinaryEncoded.start
//		);
//	this.compactedViewOnSelector.set(
//			proofingPartType,
//			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.selectorProofingPartType.start
//		);
//	this.compactedViewOnSelector.set(
//			GeneratorFor16bitsInt.newUID(),
//			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start
//		);
//		
//		
//	// Populate the masterStyleRegistry from which we shall later retrieve
//	// the optimized part of the style object, i.e the current CSS rule
//	TypeManager.masterStyleRegistry.setItem(
//		GeneratorFor16bitsInt.numberFromInt(this.compactedViewOnSelector.get(
//			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start,
//			2
//		)),
//		this.attrIFace
//	)
//}

// TODO: OPTIMIZE
Style.prototype.copyAndMergeWithStyle = function(styleObj) {
	var attrIFaceCopy = new AdvancedAttributesList('FIXME:noType', this.attrIFace.getAllDefinedAttributes());
	attrIFaceCopy.setApply(styleObj);
	return attrIFaceCopy;
}





module.exports = Style;
