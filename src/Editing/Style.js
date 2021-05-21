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
	 
//	this.compactedViewOnSelector = new Uint8Array(8);

	//     /!\     WARNING: are we allowed to match insensitive to case?     /!\
	
	// TAKE CARE OF PERF: we optimized the String.prototype.getNCharAsCharCodess method to get 4  chars most of the time. But that's  pretty useless...
	
	var substrDef = this.extractMostSpecificPartFromSelector(this.selector).toLowerCase().getNcharsAsCharCodesArray(4, 3);
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
	// let's stick to Big Endian, but it has no importance at all (uniqueness is the only criteria for UID)
	// Offset of the extracted string from the original string
//	console.log(!substrDef[1].length ? typeof substrDef[0] + ' ' + this.selector + ' : ' + substrDef : 'alright');
	this.compactedViewOnSelector.set([substrDef[0]], 0);
	// Length of the extracted string from the original string
	this.compactedViewOnSelector.set([substrDef[1].length], 1);
	// Extract the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
	this.compactedViewOnSelector.set(substrDef[1], 2);
	this.compactedViewOnSelector.set(this.selectorProofingPartType, 5);
	this.compactedViewOnSelector.set(GeneratorFor16bitsInt.newUID(), 6);
		
//	console.log(substrDef.length ? substrDef[1].length.toString() + ' : ' + this.extractMostSpecificPartFromSelector(this.selector) : this.selector);
//	console.log(this.selector, substrDef[1].join(','), this.compactedViewOnSelector._buffer[0], this.compactedViewOnSelector._buffer[1]);
	
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
//	else if (!Array.isArray(splitted))
//		splitted = new Array(splitted);
	
//	console.log(this.selector.match(/\,|\s/g), splitted);
		
	return this.cascadeOnSpecificity(splitted[splitted.length - 1]);
}

Style.prototype.cascadeOnSpecificity = function(rightMost) {
	var match;
	
	match = rightMost.match(/#(\w+)/);
	if (match) {
		this.selectorProofingPartType = Style.constants.idIsProof;
		return match[1];
	}
	else {
		match = rightMost.match(/\.([\w_-]+)|\[class.?="([\w_-]+)"\]/);
		if (match) {
			this.selectorProofingPartType = Style.constants.classIsProof;
			return match[1] || match[2];
		}
		else {
			//   ':host'.match(/[^\.#:](\w+)/) 	=> 		Array [ "host", "ost"]
			match = rightMost.match(/[^\.#:][\w_-]+/);
			if (match) {
				this.selectorProofingPartType = Style.constants.tagIsProof;
				return match[0];
			}
		}
	}
	
	return rightMost;
}


module.exports = Style;
