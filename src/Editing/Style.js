/**
* Stylesheets
*/


/**
 * Construct. Style
 * 
 * @param type {string} : 'p' || 'span'
 * @param selector {string} : CSS selector
 * @param optimizedSelector {string} : optimized CSS selector (represented as a 4 bytes sequence and a UID)
 * @param attrIface {object} : passive partial PropertiesList-Like (no methods, only significative keys defined)
 */
 
var GeneratorFor16bitsInt = require('src/core/UIDGenerator').GeneratorFor16bitsInt;
var StyleAttributes = require('src/editing/StyleAttributes');
var AdvancedStyleAttributes = require('src/editing/SplittedAttributes');

var Style = function(type, selector, attributes) {
	this.selector = attributes.selector || selector;
	
	this.optimizedSelector = new Uint8Array(8);
	var substr = this.extractMostSpecificPartFromSelector(this.selector);
	// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian') ²
	// let's stick to Big Endian, but it has no importance at all (uniqueness is the only criteria for UID)
	this.optimizedSelector.set([0, Math.max(Math.min(substr.length - 4, 4), 0)], 0);
	// TODO: extract the most specific selector (!important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
	this.optimizedSelector.set(substr.getNcharsAsByteArray(4, 4), 2);
	this.optimizedSelector.set(GeneratorFor16bitsInt.newUID(), 6);
	
//	console.log(substr.length ? substr : this.selector);
	console.log(substr.getNcharsAsByteArray(4, 4).join(','));
	
//	throw new Error();
	// TODO: get rid of this horrible "NaN"
	// 		=> we should never initialize a value to NaN
	this.index = NaN; 	// index in the CSSStyleSheet.CSSRules Array (shall not be set for a style constructor, but kept here as a reminder, as the stylesheetWrapper on addStyle() shall linearize the style and reference the actual index)
	this.type = type;
	this.attrIFace = new AdvancedStyleAttributes(this.type, attributes);
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
	if (match)
		return match[0];
	else {
		match = rightMost.match(/\.\w+|:\w+/);
		if (match)
			return match[0];
		
		else {
			match = rightMost.match(/[^\.#:]\w+/);
			if (match)
				return match[0];
		}
	}
	
	return rightMost;
}


module.exports = Style;
