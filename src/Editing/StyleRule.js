/**
 * @constructor StyleRule
 
 * @param {ruleIdx} number 
 * @param {styleObj} Style
 * @returns self
 */

var Style = require('src/editing/Style');

	
var StyleRule = function(ruleIdx, rawRule) {
	this.objectType = 'StyleRule';
	
	if (Object.prototype.toString.call(rawRule) !== '[object Object]') {
		console.warn(this.objectType, 'rawRule isn\'t an Object or no ruleIdx given : ' + rawRule + '. Returning...');
		return;
	}
	
	this.ruleIdx = ruleIdx || 0;
	this.selector = rawRule.selector;
	this.hasOverride = false;
	this.Iface = new Style(null, this.selector, this.getAttributes(rawRule));
	this.attributes  = this.Iface.attributes;
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
			this.attributes[prop] = rawRule[prop];
	}
}

StyleRule.prototype.cloneAttributes = function() {
	return Object.assign({}, this.attributes);
}

StyleRule.prototype.populateStrRule = function() {
	this.strRule = this.Iface.linearize();
}

StyleRule.prototype.getAttr = function(attr) {
	return this.attributes[attr];
}

StyleRule.prototype.setAttr = function(attr, value) {
	this.attributes[attr] = value;
}

StyleRule.prototype.safeMergeAttributes = function(rawRule) {
	for (let prop in rawRule) {
		this.additionalAttributes[prop] = rawRule[prop];
	}
	this.hasOverride = true;
}

StyleRule.prototype.applyAdditionnalStyleAsOverride = function() {
	if (this.hasOverride)
		Object.assign(this.attributes, this.additionalAttributes);
}












module.exports = StyleRule;