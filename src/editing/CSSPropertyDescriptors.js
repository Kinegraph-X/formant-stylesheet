/**
 * @constructor CSSPropertyDescriptors
 */

var TypeManager = require('src/core/TypeManager', false);
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer', false);

var CSSPropertyDescriptors = {};
var SplittedCSSPropertyDescriptors = {};

var CSSPropertyDescriptorFactory = function(attrName, initialValue, isShorthand, expandedPropNames, mayBeAbbreviated) {
	
	var CSSPropertyDescriptor = function(value) {
		
	};
	CSSPropertyDescriptor.prototype = {
		propName : attrName,
		isShorthand : isShorthand,
		mayBeAbbreviated : mayBeAbbreviated,
		initialValue : initialValue,
		expandedPropNames : expandedPropNames
	};
	CSSPropertyDescriptors[attrName] = CSSPropertyDescriptor;
	
	return CSSPropertyDescriptor;
}

SplittedCSSPropertyDescriptors.inheritedAttributes = {
	writingMode : CSSPropertyDescriptorFactory('writingMode', '', false, [], false),
	textDirection : CSSPropertyDescriptorFactory('textDirection', '', false, [], false),
	direction : CSSPropertyDescriptorFactory('direction', '', false, [], false),
	captionSide : CSSPropertyDescriptorFactory('captionSide', '', false, [], false),
	listStyleType : CSSPropertyDescriptorFactory('listStyleType', '', false, [], false),
	listStylePosition : CSSPropertyDescriptorFactory('listStylePosition', '', false, [], false),
	visibility : CSSPropertyDescriptorFactory('visibility', '', false, [], false),
	font : CSSPropertyDescriptorFactory('font', '', true, ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle'], false),
	fontFamily : CSSPropertyDescriptorFactory('fontFamily', '', false, [], false),
	fontSize : CSSPropertyDescriptorFactory('fontSize', '', false, [], false),
	fontWeight  : CSSPropertyDescriptorFactory('fontWeight', '', false, [], false),
	fontStyle : CSSPropertyDescriptorFactory('fontStyle', '', false, [], false),
	fontVariant : CSSPropertyDescriptorFactory('fontVariant', '', false, [], false),
	fontFeatureSettings : CSSPropertyDescriptorFactory('fontFeatureSettings', '', false, [], false),
	src : CSSPropertyDescriptorFactory('src', '', false, [], false),	// only present in a @font-face rule
	lineHeight : CSSPropertyDescriptorFactory('lineHeight', '', false, [], false),
	color : CSSPropertyDescriptorFactory('color', '#000000', false, [], false), // the CSS spec says "depends on the user-agent" : https://www.w3.org/TR/2011/REC-CSS2-20110607/propidx.html#q24.0
	textOrientation : CSSPropertyDescriptorFactory('textOrientation', '', false, [], false),
	textAlign : CSSPropertyDescriptorFactory('textAlign', '', true, ['textAlignAll', 'textAlignLast'], false),
	textAlignAll : CSSPropertyDescriptorFactory('textAlignAll', '', false, [], false),
	textAlignLast : CSSPropertyDescriptorFactory('textAlignLast', '', false, [], false),
	textTransform : CSSPropertyDescriptorFactory('textTransform', '', false, [], false),
	textDecoration : CSSPropertyDescriptorFactory('textDecoration', '', false, [], false),
	cursor : CSSPropertyDescriptorFactory('cursor', '', false, [], false),
	borderCollapse : CSSPropertyDescriptorFactory('borderCollapse', '', false, [], false),
	whiteSpace : CSSPropertyDescriptorFactory('whiteSpace', '', false, [], false),
	speak : CSSPropertyDescriptorFactory('speak', 'auto', false, [], false),									// auto | always | never
	wordBreak : CSSPropertyDescriptorFactory('wordBreak', 'normal', false, [], false),
	lineBreak : CSSPropertyDescriptorFactory('lineBreak', 'auto', false, [], false),
	hyphens : CSSPropertyDescriptorFactory('hyphens', 'manual', false, [], false),
	overflowWrap : CSSPropertyDescriptorFactory('overflowWrap', 'auto', false, [], false),						// The wordWrap property is an alias for overflowWrap
	wordWrap : CSSPropertyDescriptorFactory('wordWrap', 'auto', false, [], false),								// The overflowWrap property is an alias for wordWrap
	letterSpacing : CSSPropertyDescriptorFactory('letterSpacing', 'normal', false, [], false),					// normal | <length>
	// dash-prefixed properties (specific to a UA) are rendered with an Uppercase first letter by our translation function
	WebkitFontSmoothing : CSSPropertyDescriptorFactory('WebkitFontSmoothing', '', false, [], false),
	WebkitFontFeatureSettings : CSSPropertyDescriptorFactory('WebkitFontFeatureSettings', '', false, [], false)
}

SplittedCSSPropertyDescriptors.locallyEffectiveAttributes = {
	display : CSSPropertyDescriptorFactory('display', 'inline', false, [], false),
	overflow : CSSPropertyDescriptorFactory('overflow', 'visible', false, [], false),
	overflowX : CSSPropertyDescriptorFactory('overflowX', '', false, [], false),
	overflowY : CSSPropertyDescriptorFactory('overflowY', '', false, [], false),
	verticalAlign : CSSPropertyDescriptorFactory('verticalAlign', 'baseline', false, [], false),
	clear : CSSPropertyDescriptorFactory('clear', '', false, [], false),
	float : CSSPropertyDescriptorFactory('float', '', false, [], false),
	position : CSSPropertyDescriptorFactory('position', '', false, [], false),
			
	flex : CSSPropertyDescriptorFactory('flex', '0 1 auto', true, ['flexGrow', 'flexShrink', 'flexBasis'], false),
	flexFlow : CSSPropertyDescriptorFactory('flexFlow', 'row nowrap', true, ['flexDirection', 'flexWrap'], false),
	flexDirection : CSSPropertyDescriptorFactory('flexDirection', 'row', false, [], false),
	flexWrap : CSSPropertyDescriptorFactory('flexWrap', 'nowrap', false, [], false),
	flexGrow : CSSPropertyDescriptorFactory('flexGrow', 0, false, [], false),
	flexShrink : CSSPropertyDescriptorFactory('flexShrink', 1, false, [], false),
	flexBasis : CSSPropertyDescriptorFactory('flexBasis', 'auto', false, [], false),
	justifyContent : CSSPropertyDescriptorFactory('justifyContent', 'flex-start', false, [], false), 
	alignItems : CSSPropertyDescriptorFactory('alignItems', 'stretch', false, [], false),
	alignSelf : CSSPropertyDescriptorFactory('alignSelf', 'auto', false, [], false),
	alignContent : CSSPropertyDescriptorFactory('alignContent', 'stretch', false, [], false),
	
	opacity : CSSPropertyDescriptorFactory('opacity', '1', false, [], false),
	zIndex : CSSPropertyDescriptorFactory('zIndex', '1', false, [], false)
}

SplittedCSSPropertyDescriptors.boxModelAttributes = {
	boxSizing : CSSPropertyDescriptorFactory('boxSizing', 'content-box', false, [], false),
	width : CSSPropertyDescriptorFactory('width', 'auto', false, [], false),
	height : CSSPropertyDescriptorFactory('height', 'auto', false, [], false),
	top : CSSPropertyDescriptorFactory('top', 'auto', false, [], false),
	left : CSSPropertyDescriptorFactory('left', 'auto', false, [], false),
	right : CSSPropertyDescriptorFactory('right', 'auto', false, [], false),
	bottom : CSSPropertyDescriptorFactory('bottom', 'auto', false, [], false),

	padding : CSSPropertyDescriptorFactory('padding', 0, true, ['paddingBlockStart', 'paddingInlineEnd', 'paddingBlockEnd', 'paddingInlineStart'], true),
	margin : CSSPropertyDescriptorFactory('margin', 0, true, ['marginBlockStart', 'marginInlineEnd', 'marginBlockEnd', 'marginInlineStart'], true),
	border : CSSPropertyDescriptorFactory('border', 0, true, ['borderWidth', 'borderStyle', 'borderColor'], false),
	
	// TODO: Should be accounted by an alias mechanism: theses props exist but are not the ones we request
	paddingTop : CSSPropertyDescriptorFactory('paddingTop', 0, false, [], false),
	paddingRight : CSSPropertyDescriptorFactory('paddingRight', 0, false, [], false),
	paddingBottom : CSSPropertyDescriptorFactory('paddingBottom', 0, false, [], false),
	paddingLeft : CSSPropertyDescriptorFactory('paddingLeft', 0, false, [], false),
	
	paddingBlockStart : CSSPropertyDescriptorFactory('paddingBlockStart', 0, false, [], false),
	paddingInlineEnd : CSSPropertyDescriptorFactory('paddingInlineEnd', 0, false, [], false),
	paddingBlockEnd : CSSPropertyDescriptorFactory('paddingBlockEnd', 0, false, [], false),
	paddingInlineStart : CSSPropertyDescriptorFactory('paddingInlineStart', 0, false, [], false),
	
	// TODO: Should be accounted by an alias mechanism: theses props exist but are not the ones we request
	marginTop : CSSPropertyDescriptorFactory('marginTop', 0, false, [], false),
	marginRight : CSSPropertyDescriptorFactory('marginRight', 0, false, [], false),
	marginBottom : CSSPropertyDescriptorFactory('marginBottom', 0, false, [], false),
	marginLeft : CSSPropertyDescriptorFactory('marginLeft', 0, false, [], false),
	
	marginBlockStart : CSSPropertyDescriptorFactory('marginBlockStart', 0, false, [], false),
	marginBlockEnd : CSSPropertyDescriptorFactory('marginBlockEnd', 0, false, [], false),
	marginInlineStart : CSSPropertyDescriptorFactory('marginInlineStart', 0, false, [], false),
	marginInlineEnd : CSSPropertyDescriptorFactory('marginInlineEnd', 0, false, [], false),
	
	// TODO: Should be accounted by an alias mechanism: theses props exist but are not the ones we request
	borderTop : CSSPropertyDescriptorFactory('borderTop', '0 medium #000000', false, [], false),
	borderRight : CSSPropertyDescriptorFactory('borderRight', '0 medium #000000', false, [], false),
	borderBottom : CSSPropertyDescriptorFactory('borderBottom', '0 medium #000000', false, [], false),
	borderLeft : CSSPropertyDescriptorFactory('borderLeft', '0 medium #000000', false, [], false),

	borderBlockStart : CSSPropertyDescriptorFactory('borderBlockStart', '0 medium #000000', true, ['borderBlockStartWidth', 'borderBlockStartStyle', 'borderBlockStartColor'], false),
	borderBlockEnd : CSSPropertyDescriptorFactory('borderBlockEnd', '0 medium #000000', true, ['borderBlockEndWidth', 'borderBlockEndStyle', 'borderBlockEndColor'], false),
	borderInlineStart : CSSPropertyDescriptorFactory('borderInlineStart', '0 medium #000000', true, ['borderInlineStartWidth', 'borderInlineStartStyle', 'borderInlineStartColor'], false),
	borderInlineEnd : CSSPropertyDescriptorFactory('borderInlineEnd', '0 medium #000000', true, ['borderInlineEndWidth', 'borderInlineEndStyle', 'borderInlineEndColor'], false),

	borderWidth : CSSPropertyDescriptorFactory('borderWidth', 0, true, ['borderBlockStartWidth', 'borderInlineEndWidth', 'borderBlockEndWidth', 'borderInlineStartWidth'], true),
	borderBlockStartWidth : CSSPropertyDescriptorFactory('borderBlockStartWidth', 0, false, [], false),
	borderBlockEndWidth : CSSPropertyDescriptorFactory('borderBlockEndWidth', 0, false, [], false),
	borderInlineStartWidth : CSSPropertyDescriptorFactory('borderInlineStartWidth', 0, false, [], false),
	borderInlineEndWidth : CSSPropertyDescriptorFactory('borderInlineEndWidth', 0, false, [], false),

	borderStyle : CSSPropertyDescriptorFactory('borderStyle', 'none', true, ['borderBlockStartStyle', 'borderInlineEndStyle', 'borderBlockEndStyle', 'borderInlineStartStyle'], true),
	borderBlockStartStyle : CSSPropertyDescriptorFactory('borderBlockStartStyle', 'none', false, [], false),
	borderBlockEndStyle : CSSPropertyDescriptorFactory('borderBlockEndStyle', 'none', false, [], false),
	borderInlineStartStyle : CSSPropertyDescriptorFactory('borderInlineStartStyle', 'none', false, [], false),
	borderInlineEndStyle : CSSPropertyDescriptorFactory('borderInlineEndStyle', 'none', false, [], false),

	borderColor : CSSPropertyDescriptorFactory('borderColor', '#000000', true, ['borderBlockStartColor', 'borderInlineEndColor', 'borderBlockEndColor', 'borderInlineStartColor'], true),
	borderBlockStartColor : CSSPropertyDescriptorFactory('borderBlockStartColor', '#000000', false, [], false),
	borderBlockEndColor : CSSPropertyDescriptorFactory('borderBlockEndColor', '#000000', false, [], false),
	borderInlineStartColor : CSSPropertyDescriptorFactory('borderInlineStartColor', '#000000', false, [], false),
	borderInlineEndColor : CSSPropertyDescriptorFactory('borderInlineEndColor', '#000000', false, [], false),

	borderRadius : CSSPropertyDescriptorFactory('borderRadius', '', true, ['borderStartStartRadius', 'borderEndStartRadius', 'borderEndEndRadius', 'borderEndStartRadius'], false),
	borderTopLeftRadius : CSSPropertyDescriptorFactory('borderTopLeftRadius', '', false, [], false),
	borderTopRightRadius : CSSPropertyDescriptorFactory('borderTopRightRadius', '', false, [], false),
	borderBottomRightRadius : CSSPropertyDescriptorFactory('borderBottomRightRadius', '', false, [], false),
	borderBottomLeftRadius : CSSPropertyDescriptorFactory('borderBottomLeftRadius', '', false, [], false),
	borderStartStartRadius : CSSPropertyDescriptorFactory('borderStartStartRadius', '', false, [], false),
	borderStartEndRadius : CSSPropertyDescriptorFactory('borderStartEndRadius', '', false, [], false),
	borderEndStartRadius : CSSPropertyDescriptorFactory('borderEndStartRadius', '', false, [], false),
	borderEndEndRadius : CSSPropertyDescriptorFactory('borderEndEndRadius', '', false, [], false)
}

SplittedCSSPropertyDescriptors.strictlyLocalAttributes = {
	background : CSSPropertyDescriptorFactory('background', '', true, ['backgroundColor', 'backgroundImage', 'backgroundRepeat', 'backgroundAttachment', 'backgroundPositionTop', 'backgroundPositionLeft'], false),
	backgroundColor : CSSPropertyDescriptorFactory('backgroundColor', 'transparent', false, [], false),
	backgroundPosition : CSSPropertyDescriptorFactory('backgroundPosition', '0% 0%', true, ['backgroundPositionTop', 'backgroundPositionLeft'], false),
	backgroundPositionTop : CSSPropertyDescriptorFactory('backgroundPositionTop', '0%', false, [], false),
	backgroundPositionLeft : CSSPropertyDescriptorFactory('backgroundPositionLeft', '0%', false, [], false),
	backgroundImage : CSSPropertyDescriptorFactory('backgroundImage', 'none', false, [], false),
	backgroundAttachment : CSSPropertyDescriptorFactory('backgroundAttachment', '', false, [], false),
	backgroundRepeat : CSSPropertyDescriptorFactory('backgroundRepeat', 'repeat', false, [], false),
	boxShadow : CSSPropertyDescriptorFactory('boxShadow', 'none', false, [], false),
	outline : CSSPropertyDescriptorFactory('outline', '', true, ['outlineColor', 'outlineStyle', 'outlineWidth', ], false),
	outlineColor : CSSPropertyDescriptorFactory('outlineColor', 'none', true, ['outlineColorBlockStart', 'outlineColorInlineEnd', 'outlineColorBlockEnd', 'outlineColorInlineStart'], true),
	outlineStyle : CSSPropertyDescriptorFactory('outlineStyle', 'none', true, ['outlineStyleBlockStart', 'outlineStyleInlineEnd', 'outlineStyleBlockEnd', 'outlineStyleInlineStart'], true),
	outlineWidth : CSSPropertyDescriptorFactory('outlineWidth', 'none', true, ['outlineWidthBlockStart', 'outlineWidthInlineEnd', 'outlineWidthBlockEnd', 'outlineWidthInlineStart'], true),
	
	outlineColorBlockStart : CSSPropertyDescriptorFactory('outlineColorBlockStart', 0, false, [], false),
	outlineColorInlineEnd : CSSPropertyDescriptorFactory('outlineColorInlineEnd', 0, false, [], false),
	outlineColorBlockEnd : CSSPropertyDescriptorFactory('outlineColorBlockEnd', 0, false, [], false),
	outlineColorInlineStart : CSSPropertyDescriptorFactory('outlineColorInlineStart', 0, false, [], false),
	
	outlineStyleBlockStart : CSSPropertyDescriptorFactory('outlineStyleBlockStart', 0, false, [], false),
	outlineStyleInlineEnd : CSSPropertyDescriptorFactory('outlineStyleInlineEnd', 0, false, [], false),
	outlineStyleBlockEnd : CSSPropertyDescriptorFactory('outlineStyleBlockEnd', 0, false, [], false),
	outlineStyleInlineStart : CSSPropertyDescriptorFactory('outlineStyleInlineStart', 0, false, [], false),
	
	outlineWidthBlockStart : CSSPropertyDescriptorFactory('outlineWidthBlockStart', 0, false, [], false),
	outlineWidthInlineEnd : CSSPropertyDescriptorFactory('outlineWidthInlineEnd', 0, false, [], false),
	outlineWidthBlockEnd : CSSPropertyDescriptorFactory('outlineWidthBlockEnd', 0, false, [], false),
	outlineWidthInlineStart : CSSPropertyDescriptorFactory('outlineWidthInlineStart', 0, false, [], false),
	
	content : CSSPropertyDescriptorFactory('content', 'normal', false, [], false),									// normal | none | [ <content-replacement> | <content-list> ] [/ [ <string> | <counter> ]+ ]?
	
	animation : CSSPropertyDescriptorFactory('animation', 'normal', false, [], false),
	animationName : CSSPropertyDescriptorFactory('animationName', 'none', false, [], false),
	animationDuration : CSSPropertyDescriptorFactory('animationDuration', '1', false, [], false),
	animationIterationCount : CSSPropertyDescriptorFactory('animationIterationCount', '1', false, [], false),
	animationIterationFunction : CSSPropertyDescriptorFactory('animationIterationFunction', '', false, [], false),
	animationTimingFunction : CSSPropertyDescriptorFactory('animationTimingFunction', '', false, [], false),
	animationDelay : CSSPropertyDescriptorFactory('animationDelay', '0', false, [], false),
}





var boundaries = {}, c = 0, l = 0;
for (var groupName in SplittedCSSPropertyDescriptors) {
	l = Object.keys(SplittedCSSPropertyDescriptors[groupName]).length;
	boundaries[groupName] = {
		start : c,
		length : l
	};
	c += l;
}
// DEBUG: stdAttributes is the complete list of attributes for a given CSS rule (to be deleted)
boundaries.stdAttributes = {
	start : 0,
	length : c
}



module.exports = {
	all : CSSPropertyDescriptors,
	splitted : SplittedCSSPropertyDescriptors,
	boundaries : boundaries
};