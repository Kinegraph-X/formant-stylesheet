/**
* Stylesheets
*/
 
var GeneratorFor16bitsInt = require('src/core/UIDGenerator').GeneratorFor16bitsInt;
var StyleAttributes = require('src/editing/StyleAttributes');
var AdvancedStyleAttributes = require('src/editing/SplittedAttributes');

var BinarySchema = require('src/core/BinarySchema');
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
	this.selector = attributes.selector || selector;
	
	this.selectorProofingPartType = 0;
	
	this.compactedViewOnSelector = new MemoryPartialBuffer(
		new BinarySchema(
			'compactedViewOnSelector',
			[
				'stringLength',
				'stringBinaryEncoding',
				'selectorProofingPartType',
				'bufferUID'
			],
			[
				1,
				4,
				1,
				2
			]
		)
	)
	
	this.compactedViewOnSelector = new Uint8Array(8);
	var substr = this.extractMostSpecificPartFromSelector(this.selector).getNcharsAsCharCodesArray(4, 4);
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
	// let's stick to Big Endian, but it has no importance at all (uniqueness is the only criteria for UID)
	this.compactedViewOnSelector.set(substr.length, 0);
	// Extract the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
	this.compactedViewOnSelector.set(substr, 1);
	this.compactedViewOnSelector.set(this.selectorProofingPartType, 5);
	this.compactedViewOnSelector.set(GeneratorFor16bitsInt.newUID(), 6);
	
//	console.log(substr.length ? substr : this.selector);
	console.log(substr.join(','));
	
//	throw new Error();
	// TODO: get rid of this horrible "NaN"
	// 		=> we should never initialize a value to NaN
	this.index = NaN; 	// index in the CSSStyleSheet.CSSRules Array (shall not be set for a style constructor, but kept here as a reminder, as the stylesheetWrapper on addStyle() shall linearize the style and reference the actual index)
	this.type = type;
	this.attrIFace = new AdvancedStyleAttributes(this.type, attributes);
}

Style.constants = {
	rawSelectorIsProof : 0,
	idIsProof : 1,
	classIsProof : 2,
	tagIsProof : 3
}

Style.prototype = {};
Style.prototype.linearize = function() {
	return this.selector + ' { ' + '\n' + this.attrIFace.linearize() + '\n' + '}\n';
}

Style.prototype.addToStyleSheet = function(styleSheet) {
	this.index = styleSheet.insertRule(this.linearize())
}

Style.prototype.removeFromStyleSheet = function(styleSheet) {
	styleSheet.deleteRule(this.index);
}

Style.prototype.extractMostSpecificPartFromSelector = function() {
	var splitted = this.selector.split(/\,|\s/g);
	if (!splitted)
		splitted = this.selector;
	
//	console.log(this.selector.match(/\,|\s/g), splitted);
		
	return this.cascadeOnSpecificity(splitted[splitted.length - 1]);
}

Style.prototype.cascadeOnSpecificity = function(rightMost) {
	var match;
	
	match = rightMost.match(/#\w+/);
	if (match) {
		this.selectorProofingPartType = Style.constants.idIsProof;
		return match[0];
	}
	else {
		match = rightMost.match(/\.\w+/);
		if (match) {
			this.selectorProofingPartType = Style.constants.classIsProof;
			return match[0];
		}
		else {
			match = rightMost.match(/[^\.#:]\w+/);
			if (match) {
				this.selectorProofingPartType = Style.constants.tagIsProof;
				return match[0];
			}
		}
	}
	
	return rightMost;
}


module.exports = Style;
