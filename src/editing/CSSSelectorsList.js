/**
 * construct. CSSSelectorsList
 */

var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');



/**
 * @constructor CSSSelectorsList
 */
var CSSSelectorsList = function(selectorAsStr) {
	Object.defineProperty(this, 'objectType', {value : 'CSSSelectorsList'});
	var selectorsList;
	
	if (selectorAsStr.match(/,/))
		selectorsList = selectorAsStr.match(/.+?,\s?/g);
	else
		selectorsList = [selectorAsStr];
		
	if (selectorsList === null) {
		console.warn('CSSSelectorsList: no actual selector could be identified. selectorAsStr is "' + selectorAsStr + '"');
		return;
	}
	
	selectorsList.forEach(function(selector) {
		this.push(new CSSSelector(selector));
	}, this);
}
CSSSelectorsList.prototype = Object.create(Array.prototype);
CSSSelectorsList.prototype.objectType = 'CSSSelectorsList';

Object.defineProperty(CSSSelectorsList.prototype, 'optimizedSelectorBufferSchema', {
	value : BinarySchemaFactory(
		'compactedViewOnSelector',
		[	
			'startingOffsetInString',
			'stringLength',
			'stringBinaryEncoded',
			'selectorProofingPartType',
			'selectorHasPseudoClass',
			'selectorPseudoClassType',
			'reservedForFutureUse',
			'bufferUID',
		],
		[
			1,
			1,
			3,
			1,
			1,
			1,
			6,
			2
		]
	)
});







var CSSSelector = function(selectorAsStr) {
	//TODO: A CSS selector may be a list of selectors
	//		=> instanciate a list by default

	this.selectorStr = selectorAsStr;
	this.components = new CSSSelectorComponentList();	// Dummy object to avoid hidden-class transition
	this.selectorProofingPartType = 0;
	this.rightMost = this.extractMostSpecificPartFromSelector();
	this.rightMostHasPseudoClassFlag = this.components[this.components.length - 1].hasPseudoClassFlag;
	this.rightMostPseudoClassType = this.components[this.components.length - 1].pseudoClassType;
}
CSSSelector.prototype = {};
CSSSelector.prototype.objectType = 'CSSSelector';

CSSSelector.prototype.toString = function() {
	return this.selectorStr;
}

CSSSelector.prototype.extractMostSpecificPartFromSelector = function() {
	this.components = new CSSSelectorComponentList(this.selectorStr);
	return this.cascadeOnSpecificity(this.components[this.components.length - 1].value);
}

CSSSelector.prototype.cascadeOnSpecificity = function(rightMost) {
	var match;
	
//	(rightMost === ':host' && console.log(rightMost, match));
	match = rightMost.match(this.typeIsId);

	if (match) {
		this.selectorProofingPartType = this.constants.idIsProof;
		return match[1];
	}
	else {
		match = rightMost.match(this.typeIsClass);
//		(rightMost === ':host' && console.log(rightMost, match));
		if (match) {
			this.selectorProofingPartType = this.constants.classIsProof;
			return match[1] || match[2];
		}
		else {
			match = rightMost.match(this.typeIsHost);
//			(rightMost === ':host' && console.log(rightMost, match));
			if (match) {
				this.selectorProofingPartType = this.constants.hostIsProof;
				return match[0];
			}
			else {
			match = rightMost.match(this.typeIsTag);
//			(rightMost === ':host' && console.log(rightMost, match));
			if (match) {
				this.selectorProofingPartType = this.constants.tagIsProof;
				return match[0];
			}
		}
		}
	}
	
	return rightMost;
}

CSSSelector.prototype.constants = {
	rawSelectorIsProof : 0,
	idIsProof : 1,
	classIsProof : 2,
	tagIsProof : 3,
	hostIsProof : 4
}















var CSSSelectorComponentList = function(selectorAsStr) {
	if (!selectorAsStr)
		return;
	this.captureRelationship(selectorAsStr);
	if (!this.length)
		console.warn('CSSSelectorComponentList:', 'selectorAsStr => [' + selectorAsStr + ']', 'instanciation of the CSSSelectorComponentList failed.')
}
CSSSelectorComponentList.prototype = Object.create(Array.prototype);

Object.defineProperty(CSSSelectorComponentList.prototype, 'objectType', {
	value : 'CSSSelectorComponentList'
});

Object.defineProperty(CSSSelectorComponentList.prototype, 'captureRelationship', {
	value : function(selectorAsStr) {
		// FIXME: if we encounter a coma, that's a list of identical rules
		// CURRENTLY NOT SUPPORTED
		var leftSibbling;
		var splitted = selectorAsStr.trim().split(CSSSelectorComponent.prototype.splitter);
		
//		if (!Array.isArray(splitted))
//			this.push(new CSSSelectorComponent(selectorAsStr));
//		else
			splitted.forEach(function(rawComponent) {
//				console.log(rawComponent);
				this.push(new CSSSelectorComponent(rawComponent, leftSibbling));
				leftSibbling = rawComponent;
			}, this);
	}
});














var CSSSelectorComponent = function(componentAsStr, leftSibbling) {
	var match;
	this.objectType = 'CSSSelectorComponent';
	
	this.value = ((match = componentAsStr.match(this.isolateValue)) && match[0]) || '';
	this.type = this.getType(componentAsStr);
	this.relation = this.getRelation(leftSibbling);
	
	this.compoundValue = this.getCompoundValues(componentAsStr);
	this.isCompound = this.compoundValue.valuesCount > 1;
	
	this.hasPseudoClassFlag = this.getHasPseudoClass(componentAsStr) || 0;
	this.pseudoClassType = (this.hasPseudoClassFlag && this.getPseudoClassConstant(componentAsStr)) || 0;
	
	return (this.type && this.relation) || undefined;
}
CSSSelectorComponent.prototype = {};
CSSSelectorComponent.prototype.objectType = 'CSSSelectorComponent';

// /\w/ matches on alphaNum AND underscore
CSSSelectorComponent.prototype.typeIsUniversal = /^\*$/;
CSSSelectorComponent.prototype.typeIsId = /^#(\w+)/;
CSSSelectorComponent.prototype.typeIsClass = /^\.([\w-]+)|\[class.?="([\w-]+)"\]/;
CSSSelectorComponent.prototype.typeIsHost = /^:host/;
CSSSelectorComponent.prototype.typeIsTag = /^[^\.#\:][\w-]+/;		// was [^\.#\:][-s\w_]+/

CSSSelectorComponent.prototype.hasPseudoClass = /:[\w-]+/;
CSSSelectorComponent.prototype.pseudoClassType = /:([\w-]+?)\(([\w+]+?)\)/;

CSSSelectorComponent.prototype.getType = function(componentAsStr) {
	// TODO: we have very few means to identify the case of an "attribute" qualifying a component
	// TODO: Nor have we a good solution to bind an isolate "attribute" to a universal component
	if (this.typeIsId.test(componentAsStr))
		return this.typeConstants.idType;
	else if (this.typeIsClass.test(componentAsStr))
		return this.typeConstants.classType;
	else if (this.typeIsTag.test(componentAsStr))
		return this.typeConstants.tagType;
	else if (this.typeIsHost.test(componentAsStr))
		return this.typeConstants.hostType;
	else if (this.typeIsUniversal.test(componentAsStr))
		return this.typeConstants.universalType;
	else {
//		console.warn('CSSSelectorComponent:', 'unknown type case should not be reachable.');
		return this.relationConstants.unknownType;
	}
}

CSSSelectorComponent.prototype.getHasPseudoClass = function(componentAsStr) {
	return +(this.hasPseudoClass.test(componentAsStr) && !this.typeIsHost.test(componentAsStr));
}

CSSSelectorComponent.prototype.getPseudoClassConstant = function(componentAsStr) {
	var match;
	if ((match = componentAsStr.match(this.hasPseudoClass))) {
		if ((match = componentAsStr.match(this.pseudoClassType)) && match.length === 3) {
			return this.pseudoClassConstants[match[1].hyphensToDromedar() + match[2].capitalizeFirstChar()];
		}
		else
			return this.pseudoClassConstants['unknown'];
	}
		
	else
		return this.pseudoClassConstants['unknown'];
}

CSSSelectorComponent.prototype.getRelation = function(leftSibbling) {
	if (!leftSibbling)
		return this.relationConstants.none;
	else if (this.isValidComponent(leftSibbling))
		return this.relationConstants.descendant;
	else if (leftSibbling === this.interestingTokens.immediateDescendantToken)
		return this.relationConstants.immediateDescendant;
	else if (leftSibbling === this.interestingTokens.immediateNextSibblingToken)
		return this.relationConstants.immediateNextSibbling;
	else if (leftSibbling === this.interestingTokens.anyForwardSibblingToken)
		return this.relationConstants.anyForwardSibbling;
	else {
		console.warn('CSSSelectorComponent:', 'leftSibbling => [' + leftSibbling + ']', 'unknown relation case should not be reachable.');
		return this.relationConstants.unknown;
	}
}

//CSSSelectorComponent.prototype.isCompoundComponent = function(selectorAsStr) {
//	var idPart, classPart = '', tagPart, classesParts, tmpPart;
//	
//	idPart = (idPart = selectorAsStr.split('#')).length > 1 && (((idPart[1].split('.')).length > 1 && idPart[1].split('.')[0]) || (idPart[1] || ''));
//	
//	classesParts = selectorAsStr.split('.');
//	classesParts.forEach(function(classFrag, key) {
//		if (key === 0)
//			return;
//		classPart += '.' + (((classFrag.split('#')).length > 1 && classFrag.split('#')[0]) || classFrag);
//	}, this);
//	
//	tagPart = ((tmpPart = selectorAsStr.split('#')).length > 1 && ((tmpPart = tmpPart[0].split('.')).length > 1 && tmpPart[0]) || selectorAsStr.split('#')[0]) || selectorAsStr.split('.')[0];
//}

CSSSelectorComponent.prototype.getCompoundValues = function(selectorAsStr) {
	var classPart1, classPart2;
	var splittedOnId = selectorAsStr.split('#');
	var tagPart = ((classPart1 = splittedOnId[0].split('.')).length > 1 && classPart1.shift()) || splittedOnId[0];
	var idPart = splittedOnId.length > 1 && (classPart2 = splittedOnId[1].split('.')).shift();
	var classPart = classPart1.concat(classPart2);
	
	return (new CSSSelectorComponentValues(tagPart, idPart, classPart));
}

CSSSelectorComponent.prototype.getSpecificity = function(selectorAsStr) {
	
}

CSSSelectorComponent.prototype.isValidComponent = function(leftSibbling) {
	// HACK: could we really rely on the fact that a component
	// is valid if it can be resolved to a known type ? 
	return this.getType(leftSibbling);
}

CSSSelectorComponent.prototype.interestingTokens = {
	immediateDescendantToken : '>',
	immediateNextSibblingToken : '+',
	anyForwardSibblingToken : '~'
}

CSSSelectorComponent.prototype.typeConstants = {
	unknownType : 0,
	universalType : 1,
	idType : 2,
	classType : 3,
	tagType : 4,
	hostType : 5
}

CSSSelectorComponent.prototype.relationConstants = {
	unknown : 0,
	none : 1,
	descendant : 2,
	immediateDescendant : 3,
	immediateNextSibbling : 4,
	anyForwardSibbling : 5
}

CSSSelectorComponent.prototype.pseudoClassConstants = {
	unknown : 0,
	odd : 1,
	even : 2,
	firstChild : 3,
	lastChild : 4,
	nthChildOdd : 5,
	nthChildEven : 6,
	nthChildANpB : 7,
}

CSSSelectorComponent.prototype.splitter = /,|\s/;

CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword = ':host';











var CSSSelectorComponentValues = function(tagPart, idPart, classPart) {
	this.objectType = '';
	this.tagPart = tagPart;						// String
	this.idPart = idPart;						// String
	this.classPart = classPart;					// Array
	this.valuesCount = +(tagPart.length > 0) + +(idPart.length > 0) + +(classPart.length > 0 && classPart.length);
	this.specificity = this.getSpecificity();
}
CSSSelectorComponentValues.prototype = {};
CSSSelectorComponentValues.prototype.objectType = 'CSSSelectorComponentValues';

CSSSelectorComponentValues.prototype.getSpecificity = function() {
	
}
















CSSSelector.prototype.typeIsUniversal = CSSSelectorComponent.prototype.typeIsUniversal;
CSSSelector.prototype.typeIsId = CSSSelectorComponent.prototype.typeIsId;
CSSSelector.prototype.typeIsClass = CSSSelectorComponent.prototype.typeIsClass;
CSSSelector.prototype.typeIsTag = CSSSelectorComponent.prototype.typeIsTag;
CSSSelector.prototype.typeIsHost = CSSSelectorComponent.prototype.typeIsHost;

CSSSelectorsList.prototype.constants = CSSSelector.prototype.constants;
CSSSelectorsList.prototype.interestingTokens = CSSSelectorComponent.prototype.interestingTokens;
CSSSelectorsList.prototype.typeConstants = CSSSelectorComponent.prototype.typeConstants;
CSSSelectorsList.prototype.relationConstants = CSSSelectorComponent.prototype.relationConstants;
CSSSelectorsList.prototype.pseudoClassConstants = CSSSelectorComponent.prototype.pseudoClassConstants;

CSSSelectorsList.prototype.shadowDOMHostSpecialKeyword = CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword;

module.exports = CSSSelectorsList;