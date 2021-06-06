/**
 * @constructor StyleRule
 
 * @param {ruleIdx} number 
 * @param {styleObj} Style
 * @returns self
 */

var Style = require('src/editing/Style');
var AdvancedAttributesList = require('src/editing/SplittedAttributes');

	
var StyleRule = function(ruleIdx, rawRule) {
	this.objectType = 'StyleRule';
	
	if (Object.prototype.toString.call(rawRule) !== '[object Object]') {
		console.warn(this.objectType, 'rawRule isn\'t an Object or no ruleIdx given : ' + rawRule + '. Returning...');
		return;
	}
	
	this.ruleIdx = ruleIdx || 0;
	this.selector = rawRule.selector;
	this.hasOverride = false;
	this.styleIFace = new Style(null, this.selector, this.getAttributes(rawRule));
	this.attrIFace  = this.styleIFace.attrIFace;
	this.additionalAttributes = {};
	this.strRule = '';
}

StyleRule.prototype.getAttributes = function(rawRule) {
	var attr = {};
	for (let prop in rawRule) {
		if (prop !== 'selector')
			attr[prop] = rawRule[prop];
	}
	return attr;
}

StyleRule.prototype.setAttributes = function(rawRule) {
	for (let prop in rawRule) {
		if (prop !== 'selector')
			this.attrIFace.set(prop, rawRule[prop]);
	}
}

StyleRule.prototype.cloneAttributes = function() {
	return (new AdvancedAttributesList(this.attrIFace.getAllAttributes())).getAllAttributes();
}

StyleRule.prototype.populateStrRule = function() {
	this.strRule = this.styleIFace.linearize();
}

StyleRule.prototype.getAttr = function(attr) {
	return this.attrIFace.get(attr);
}

StyleRule.prototype.setAttr = function(attr, value) {
	this.attrIFace.set(attr, value);
}

StyleRule.prototype.safeMergeAttributes = function(rawRule) {
	for (let prop in rawRule) {
		this.additionalAttributes[prop] = rawRule[prop];
	}
	this.hasOverride = true;
}

StyleRule.prototype.applyAdditionnalStyleAsOverride = function() {
	if (this.hasOverride) {
		for (let attr in this.additionalAttributes) {
			this.attrIFace.set(attr, this.additionalAttributes[attr]);
		}
	}
}












module.exports = StyleRule;