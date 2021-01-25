/**
 * @constructor AbstractStylesheet
 * 
 * @param {object} styleRules
 * @returns self
 */

var appConstants = require('src/appLauncher/appLauncher');
var TypeManager = require('src/core/TypeManager');
var StyleRule = require('src/editing/StyleRule');
var Style = require('src/editing/Style');

	
var AbstractStylesheet = function(styleRules, name) {
	this.objectType = 'AbstractStylesheet';
	
	if (!Array.isArray(styleRules)) {
		console.warn(this.objectType, 'styleRules isn\'t an Array. Returning..., "', styleRules, '" has been received');
		return this;
	}
	
	this.length = 0;
	this.rules = {};
	this.currentAPI = new DOMStyleAPI(name);
	
	this.iterateOnRules(styleRules);
}

AbstractStylesheet.prototype.getName = function() {
	return this.currentAPI.getName();
}

AbstractStylesheet.prototype.getStyleNode = function() {
	return this.currentAPI.getStyleNode();
}

//AbstractStylesheet.prototype.export = function(defUID) {
//	var cachedUnderUID = TypeManager.sWrappersCache.getItem(defUID);
//	if (Object.prototype.toString.call(cachedUnderUID) === '[object Object]')
//		return cachedUnderUID.clone();
//	else {
//		TypeManager.sWrappersCache.setItem(defUID, this);
//		return this.clone()	
//	}
//}

AbstractStylesheet.prototype.getProp = function(selector, prop) {
	return this.rules[selector].attributes[prop];
}

AbstractStylesheet.prototype.setProp = function(selector, prop, value) {
	this.rules[selector].setAttr(prop, value);
	this.replaceRule(selector);
}

AbstractStylesheet.prototype.iterateOnRules = function(styleRules) {
	styleRules.forEach(function(rawRule) {
		this.addRule(rawRule);
	}, this);
}

AbstractStylesheet.prototype.newRule = function(rawRule) {
	return new StyleRule(this.length++, rawRule);
}

AbstractStylesheet.prototype.deleteRule = function(selector) {
	delete this[selector];
	return --this.length;
}

AbstractStylesheet.prototype.addRule = function(rule, selector) {
	var sRule;
	if (!(rule instanceof StyleRule))
		sRule = this.newRule(rule);
	else
	
		sRule = rule;
	selector = rule.selector || rule.attributes.selector || selector;
	this.rules[selector] = sRule;
}

AbstractStylesheet.prototype.addRules = function(rules) {
	if (!Array.isArray(rules)) {
		console.warn(this.objectType, 'addRules only accepts arrays. Returning...');
		return;
	}
	rules.forEach(function(rule) {
		this.addRule(rule);
	}, this);
}



AbstractStylesheet.prototype.updateRule = function(rawRule, selector) {
	selector = rawRule.selector || selector;
	this.rules[selector].setAttributes(rawRule);
	this.replaceRule(selector);
}

AbstractStylesheet.prototype.replaceRule = function(selector) {
	if (!this.rules[selector].strRule.length)
		return;
	var newStrRule = this.rules[selector].Iface.linearize();
	this.currentAPI.replaceRule(this.rules[selector].strRule, newStrRule);
	this.rules[selector].strRule = newStrRule;
}

AbstractStylesheet.prototype.removeRule = function(selector) {
	this.currentAPI.removeRule(this.rules[selector].strRule);
	this.deleteRule(selector);
}

AbstractStylesheet.prototype.overrideStyles = function(styleRules) {
	if (!Array.isArray(styleRules)) {
		console.warn(this.objectType, 'overrideStyles only accepts arrays. Returning...');
		return;
	}
	styleRules.forEach(function(rawRule) {
		if (rawRule.selector)
			this.safeMergeStyleRule(rawRule.selector, rawRule);
	}, this);
}

AbstractStylesheet.prototype.safeMergeStyleRule = function(selector, rawRule) {
	this.rules[selector].safeMergeAttributes(rawRule);
}

AbstractStylesheet.prototype.clone = function() {
	var styleRules = [];
	for (let selector in this.rules) {
		styleRules.push(
			Object.assign(
				this.rules[selector].cloneAttributes(),
				{selector : selector}
			)
		);
		// HACK
//		if (this.rules[selector].hasOverride) {
//			console.log(this.objectType, selector, 'hasOverride : ', styleRules[styleRules.length - 1]);
//			Object.assign(styleRules[styleRules.length - 1], this.rules[selector].additionalAttributes);
//		}
	}
	if (!Array.isArray(styleRules))
		console.error(styleRules);
	return new AbstractStylesheet(styleRules, this.currentAPI.getName());
}

AbstractStylesheet.prototype.shouldSerializeOne = function(selector) {
	if (this.rules[selector].strRule.length) {
		this.replaceRule(selector);
		return;
	}
	this.rules[selector].strRule = this.rules[selector].Iface.linearize();
	this.currentAPI.appendRule(this.rules[selector].strRule);
}

AbstractStylesheet.prototype.shouldSerializeAll = function() {
	var styleAsString = '';
	for (let selector in this.rules) {
		this.rules[selector].applyAdditionnalStyleAsOverride();
		styleAsString += this.rules[selector].strRule = this.rules[selector].Iface.linearize();
	}
	this.currentAPI.setContent(styleAsString);
}













var DOMStyleAPI = function(name) {
	this.styleElem;
	name = this.getStyleElem(name);
	this.styleElem.name = name;
	this.stylesheet = this.styleElem.sheet;
}

DOMStyleAPI.prototype.getStyleElem = function(name) {
	var cachedUnderUID = appConstants.isKnownUID(name);
	if (Object.prototype.toString.call(cachedUnderUID) === '[object Object]') {
		this.styleElem = cachedUnderUID.currentAPI.getStyleNode().cloneNode(true);
		return name;
	}
	else {
		this.styleElem = document.createElement('style');
		return cachedUnderUID;
	}
}

DOMStyleAPI.prototype.getName = function() {
	return this.styleElem.name;
}

DOMStyleAPI.prototype.getStyleNode = function() {
	return this.styleElem;
}

DOMStyleAPI.prototype.appendRule = function(strRule) {
	this.styleElem.innerHTML += strRule;
}

DOMStyleAPI.prototype.setContent = function(strContent) {
	this.styleElem.innerHTML = strContent;
}

DOMStyleAPI.prototype.removeRule = function(strRule) {
	this.styleElem.innerHTML = this.styleElem.innerHTML.replace(strRule, '');
}

DOMStyleAPI.prototype.replaceRule = function(strRule, newStrRule) {
	this.styleElem.innerHTML = this.styleElem.innerHTML.replace(strRule, newStrRule);
}
















module.exports = AbstractStylesheet;
