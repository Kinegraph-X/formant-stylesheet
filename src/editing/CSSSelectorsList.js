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

// UTILITY FUNCTIONS: to be used when matching the selectors
CSSSelectorsList.prototype.DHLstr = function(DHL) {
	var ret = '';
	for (var i = 0, l = DHL; i < l; i++) {
		ret += '	';
	}
	return ret;
}

CSSSelectorsList.prototype.localDebugLog = function() {
	console.log.apply(null, Array.prototype.slice.call(arguments));
}







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
				if (!rawComponent.match(CSSSelectorComponent.prototype.typeIsCombinator))
					this.push(new CSSSelectorComponent(rawComponent, leftSibbling));
				leftSibbling = rawComponent;
			}, this);
	}
});














var CSSSelectorComponent = function(componentAsStr, leftSibbling) {
	var match;
	this.objectType = 'CSSSelectorComponent';
	
	this.value = componentAsStr;
	this.type = this.getType(componentAsStr);
	this.relation = this.getRelation(leftSibbling);
	
	this.compoundValues = this.getCompoundValues(componentAsStr);
//	console.log('this.compoundValues.valuesCount', componentAsStr, this.compoundValues.valuesCount)
	this.isCompound = this.compoundValues.valuesCount > 1;
	
	this.hasPseudoClassFlag = this.getHasPseudoClass(componentAsStr) || 0;
	this.pseudoClassType = (this.hasPseudoClassFlag && this.getPseudoClassConstant(componentAsStr)) || 0;
	
	return (this.type && this.relation) || undefined;
}
CSSSelectorComponent.prototype = {};
CSSSelectorComponent.prototype.objectType = 'CSSSelectorComponent';

// /\w/ matches on alphaNum AND underscore
CSSSelectorComponent.prototype.typeIsCombinator = /[>~+]/;
CSSSelectorComponent.prototype.typeIsUniversal = /^\*$/;
CSSSelectorComponent.prototype.typeIsId = /^#(\w+)/;
CSSSelectorComponent.prototype.typeIsClass = /^\.([\w-]+)|\[class.?="([\w-]+)"\]/;
CSSSelectorComponent.prototype.typeIsHost = /^:host/;
CSSSelectorComponent.prototype.typeIsTag = /^[^\.#\:][\w-]+/;		// was [^\.#\:][-s\w_]+/

CSSSelectorComponent.prototype.hasPseudoClass = /:[\w-]+/;
CSSSelectorComponent.prototype.pseudoClassType = /(.+?):([\w-]+?)\(([\w+]+?)\)(.+)?/;

CSSSelectorComponent.prototype.getType = function(componentAsStr) {
	// TODO: this MUST return a value qualifying ONLY the first part of the selector (poorly tested till then)
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
		if ((match = componentAsStr.match(this.pseudoClassType)) && match.length >= 4) {
			this.isCompound = true;
			var newComponentAsStr = match[1] + (match[4] || '');
//			console.log(newComponentAsStr);
			this.compoundValues = this.getCompoundValues(newComponentAsStr);
//			console.log(match);
			return this.pseudoClassConstants[match[2].hyphensToDromedar() + match[3].capitalizeFirstChar()];
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

CSSSelectorComponent.prototype.getCompoundValues = function(selectorAsStr) {
	var classPart1, classPart2;
	var splittedOnId = selectorAsStr.split('#');
	var tagPart = (classPart1 = splittedOnId[0].split('.')) && classPart1.shift();
	var idPart = (splittedOnId.length > 1 && (classPart2 = splittedOnId[1].split('.')).shift());
	var classPart = classPart2 ? classPart1.concat(classPart2) : classPart1;

	return (new CSSSelectorComponentValues(selectorAsStr, tagPart, idPart, classPart));
}

//CSSSelectorComponent.prototype.getSpecificity = function(compoundSelector) {
//	
//}

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
	firstChild : 1,
	lastChild : 2,
	nthChildOdd : 3,
	nthChildEven : 4,
	nthChildANpB : 5,
}

CSSSelectorComponent.prototype.splitter = /\s/;
CSSSelectorComponent.prototype.hostPseudoFunction = /^(:host)\((.+?)\)/;
CSSSelectorComponent.prototype.attributesComponent = /^(\w+?)\[(\w+?)([=~^]+?)(.+?)\]/;

CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword = ':host';









var CSSSelectorComponentValuesCounter = 0;

var CSSSelectorComponentValues = function(completeSelector, tagPart, idPart, classPart) {
	// FIXME: this.isolateAttributesSelectors won't support the case where we must match on 'startwith', 'includes', 'endWith'
	// ALSO: we haven't yet really implemented all the cases
	
	this.objectType = '';
	this.idPart = ''; this.classPart = []; this.tagPart = ''; this.namePart = '';
	this.idPart = this.isolateAttributesSelectors(idPart || '');			// String
	this.classPart = this.isolateAttributesSelectors(classPart || []);		// Array
	this.tagPart = this.isolateHostPseudoFunction(
			this.isolateAttributesSelectors(completeSelector || ''),
			tagPart
		);																	// String
//	console.error(++CSSSelectorComponentValuesCounter, 'CSSSelectorComponentValues', this.tagPart, this.idPart, this.classPart);
	
	this.valuesCount = +(tagPart.length > 0) + (+(idPart.length > 0)) + (+(classPart.length > 0 && classPart.length));
	this.specificity = this.getSpecificity();
}
CSSSelectorComponentValues.prototype = {};
CSSSelectorComponentValues.prototype.objectType = 'CSSSelectorComponentValues';

CSSSelectorComponentValues.prototype.isolateHostPseudoFunction = function(completeSelector, tagPart) {
	var pseudoFunction, tmpCapture;
	if ((pseudoFunction = completeSelector.match(CSSSelectorComponent.prototype.hostPseudoFunction))) {
		// WARNING: There's a risky recursion here, but this code seems to handle that correctly
		tmpCapture = CSSSelectorComponent.prototype.getCompoundValues(pseudoFunction[2]);
		this.classPart = tmpCapture.classPart;
		this.idPart = tmpCapture.idPart;
		return pseudoFunction[1];
	}
	return tagPart;
}

CSSSelectorComponentValues.prototype.isolateAttributesSelectors = function(componentPart) {
	// We assume it's worth coding an optimization on the "attributes" selector:
	// 	=> if the attribute targets a class or an id with the "stricly equals" operator, we convert that "attribute" component
	var attribute, tmpCapture;
	// Case of the class part
	if (Array.isArray(componentPart) && componentPart.length > 0) {
		var indexesToRemove = [];
		// Due to the simplicity of our splitter, there may be an attribute part
		// on each classPart element:
		// 		=> try to match each time and store immediatly the modified classPart element
		// 		=> then, remove these classPart elements before merging the two arrays
		componentPart.forEach(function(classFragment, key) {
			if ((attribute = classFragment.match(CSSSelectorComponent.prototype.attributesComponent))) {
				// FIXME: matcher is not used => see constructor
				var type = attribute[2], matcher = attribute[3], target = attribute[4];
				
				// TODO: implement the other attributes
				if (type === 'class') {
					this.classPart.push(target);
					indexesToRemove.push(key);
				}
				else if (type === 'id')
					this.idPart = target;
				else if (name === 'name')
					this.namePart = target;
				
				this.classPart.push(attribute[1])	
			}
		}, this);
		for (var i = componentPart.length - 1; i >= 0; i--) {
			if (indexesToRemove.indexOf(i) !== -1)
				componentPart.splice(i, 1);
		}
		return this.classPart.concat(componentPart);
	}
	// other cases
	else if (componentPart.length) {
		if ((attribute = componentPart.match(CSSSelectorComponent.prototype.attributesComponent))) {
			// FIXME: matcher is not used => see constructor
			var type = attribute[2], matcher = attribute[3], target = attribute[4];
			
			// TODO: implement the other attributes
			if (type === 'class')
				this.classPart.push(target);
			else if (type === 'id')
				this.idPart = target;
			else if (name === 'name')
				this.namePart = target;
				
			return attribute[1];
		}
		return componentPart;
	}
	return componentPart;
}

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