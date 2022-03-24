/**
 * @constructor CSSPropertyDescriptors
 */

var TypeManager = require('src/core/TypeManager', false);
//var MemoryMapBuffer = require('src/core/MemoryMapBuffer', false);
//var SplittedAttributes = require('src/editing/SplittedAttributes', false);
var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer', false);

var CSSPropertyDescriptors = {};

var CSSPropertyDescriptorFactory = function(attrName, initialValue, isShorthand, expandedPropNames, mayBeAbbreviated) {
	
	if (CSSPropertyDescriptors[attrName])
		return CSSPropertyDescriptors[attrName];
	else {
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
}

CSSPropertyDescriptorFactory('writingMode', '', false, [], false);
CSSPropertyDescriptorFactory('captionSide', '', false, [], false);
CSSPropertyDescriptorFactory('listStyleType', '', false, [], false);
CSSPropertyDescriptorFactory('listStylePosition', '', false, [], false);
CSSPropertyDescriptorFactory('visibility', '', false, [], false);
CSSPropertyDescriptorFactory('fontFamily', '', false, [], false);
CSSPropertyDescriptorFactory('fontSize', '', false, [], false);
CSSPropertyDescriptorFactory('lineHeight', '', false, [], false);
CSSPropertyDescriptorFactory('color', '#000000', false, [], false); // the CSS spec says "depends on the user-agent" : https://www.w3.org/TR/2011/REC-CSS2-20110607/propidx.html#q24.0
CSSPropertyDescriptorFactory('textOrientation', '', false, [], false);
CSSPropertyDescriptorFactory('textAlign', '', false, [], false);
CSSPropertyDescriptorFactory('textTransform', '', false, [], false);
CSSPropertyDescriptorFactory('textDecoration', '', false, [], false);
CSSPropertyDescriptorFactory('cursor', '', false, [], false);
CSSPropertyDescriptorFactory('borderCollapse', '', false, [], false);
CSSPropertyDescriptorFactory('whiteSpace', '', false, [], false);
CSSPropertyDescriptorFactory('wordBreak', '', false, [], false);

CSSPropertyDescriptorFactory('display', 'inline', false, [], false);
CSSPropertyDescriptorFactory('overflowX', '', false, [], false);
CSSPropertyDescriptorFactory('overflowY', '', false, [], false);
CSSPropertyDescriptorFactory('verticalAlign', 'baseline', false, [], false);
CSSPropertyDescriptorFactory('clear', '', false, [], false);
CSSPropertyDescriptorFactory('float', '', false, [], false);
CSSPropertyDescriptorFactory('position', '', false, [], false);
			
CSSPropertyDescriptorFactory('flex', '0 1 auto', true, ['flexGrow', 'flexSchrink', 'flexBasis'], false);
CSSPropertyDescriptorFactory('flexFlow', 'row nowrap', true, ['flexDirection', 'flexWrap'], false);
CSSPropertyDescriptorFactory('flexDirection', 'row', false, [], false);
CSSPropertyDescriptorFactory('flexWrap', 'nowrap', false, [], false);
CSSPropertyDescriptorFactory('flexGrow', 0, false, [], false);
CSSPropertyDescriptorFactory('flexSchrink', 1, false, [], false);
CSSPropertyDescriptorFactory('flexBasis', 'auto', false, [], false);
CSSPropertyDescriptorFactory('justifyContent', 'flex-start', false, [], false); 
CSSPropertyDescriptorFactory('alignItems', 'stretch', false, [], false);
CSSPropertyDescriptorFactory('alignSelf', 'auto', false, [], false);
CSSPropertyDescriptorFactory('alignContent', 'stretch', false, [], false);

CSSPropertyDescriptorFactory('boxSizing', 'content-box', false, [], false);
CSSPropertyDescriptorFactory('width', 'auto', false, [], false);
CSSPropertyDescriptorFactory('height', 'auto', false, [], false);
CSSPropertyDescriptorFactory('top', 'auto', false, [], false);
CSSPropertyDescriptorFactory('left', 'auto', false, [], false);
CSSPropertyDescriptorFactory('right', 'auto', false, [], false);
CSSPropertyDescriptorFactory('bottom', 'auto', false, [], false);

CSSPropertyDescriptorFactory('padding', 0, true, ['paddingBlockStart', 'paddingInlineEnd', 'paddingBlockEnd', 'paddingInlineStart'], true);
CSSPropertyDescriptorFactory('margin', 0, true, ['marginBlockStart', 'marginInlineEnd', 'marginBlockEnd', 'marginInlineStart'], true);
CSSPropertyDescriptorFactory('border', 0, true, ['borderWidth', 'borderStyle', 'borderColor']);

CSSPropertyDescriptorFactory('paddingTop', 0, false, [], false);
CSSPropertyDescriptorFactory('paddingBottom', 0, false, [], false);
CSSPropertyDescriptorFactory('paddingLeft', 0, false, [], false);
CSSPropertyDescriptorFactory('paddingRight', 0, false, [], false);

CSSPropertyDescriptorFactory('paddingBlockStart', 0, false, [], false);
CSSPropertyDescriptorFactory('paddingBlockEnd', 0, false, [], false);
CSSPropertyDescriptorFactory('paddingInlineStart', 0, false, [], false);
CSSPropertyDescriptorFactory('paddingInlineEnd', 0, false, [], false);

CSSPropertyDescriptorFactory('marginTop', 0, false, [], false);
CSSPropertyDescriptorFactory('marginBottom', 0, false, [], false);
CSSPropertyDescriptorFactory('marginLeft', 0, false, [], false);
CSSPropertyDescriptorFactory('marginRight', 0, false, [], false);

CSSPropertyDescriptorFactory('marginBlockStart', 0, false, [], false);
CSSPropertyDescriptorFactory('marginBlockEnd', 0, false, [], false);
CSSPropertyDescriptorFactory('marginInlineStart', 0, false, [], false);
CSSPropertyDescriptorFactory('marginInlineEnd', 0, false, [], false);

CSSPropertyDescriptorFactory('borderBlockStart', '0 medium #000000', true, [], false);
CSSPropertyDescriptorFactory('borderBlockEnd', '0 medium #000000', true, [], false);
CSSPropertyDescriptorFactory('borderInlineStart', '0 medium #000000', true, [], false);
CSSPropertyDescriptorFactory('borderInlineEnd', '0 medium #000000', true, [], false);

CSSPropertyDescriptorFactory('borderWidth', 0, true, ['borderBlockStartWidth', 'borderInlineEndWidth', 'borderBlockEndWidth', 'borderInlineStartWidth'], false);
CSSPropertyDescriptorFactory('borderBlockStartWidth', 0, false, [], false);
CSSPropertyDescriptorFactory('borderBlockEndWidth', 0, false, [], false);
CSSPropertyDescriptorFactory('borderInlineStartWidth', 0, false, [], false);
CSSPropertyDescriptorFactory('borderInlineEndWidth', 0, false, [], false);

CSSPropertyDescriptorFactory('borderStyle', 'none', true, ['borderBlockStartStyle', 'borderInlineEndStyle', 'borderBlockEndStyle', 'borderInlineStartStyle'], false);
CSSPropertyDescriptorFactory('borderBlockStartStyle', 'none', false, [], false);
CSSPropertyDescriptorFactory('borderBlockEndStyle', 'none', false, [], false);
CSSPropertyDescriptorFactory('borderInlineStartStyle', 'none', false, [], false);
CSSPropertyDescriptorFactory('borderInlineEndStyle', 'none', false, [], false);

CSSPropertyDescriptorFactory('borderColor', '#000000', true, ['borderBlockStartColor', 'borderInlineEndColor', 'borderBlockEndColor', 'borderInlineStartColor'], false);
CSSPropertyDescriptorFactory('borderBlockStartColor', '#000000', false, [], false);
CSSPropertyDescriptorFactory('borderBlockEndColor', '#000000', false, [], false);
CSSPropertyDescriptorFactory('borderInlineStartColor', '#000000', false, [], false);
CSSPropertyDescriptorFactory('borderInlineEndColor', '#000000', false, [], false);

CSSPropertyDescriptorFactory('background', '', true, ['backgroundColor', 'backgroundImage', 'backgroundRepeat', 'backgroundAttachment', 'backgroundPosition'], false);
CSSPropertyDescriptorFactory('backgroundColor', 'transparent', false, [], false);
CSSPropertyDescriptorFactory('backgroundPosition', '0% 0%', false, [], false);
CSSPropertyDescriptorFactory('backgroundImage', 'none', false, [], false);
CSSPropertyDescriptorFactory('backgroundAttachment', '', false, [], false);
CSSPropertyDescriptorFactory('backgroundRepeat', 'repeat', false, [], false);

CSSPropertyDescriptorFactory('borderRadius', '', true, ['borderStartStartRadius', 'borderEndStartRadius', 'borderEndEndRadius', 'borderEndStartRadius'], false);
CSSPropertyDescriptorFactory('borderTopLeftRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderTopRightRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderBottomRightRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderBottomLeftRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderStartStartRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderStartEndRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderEndStartRadius', '', false, [], false);
CSSPropertyDescriptorFactory('borderEndEndRadius', '', false, [], false);








module.exports = CSSPropertyDescriptors;