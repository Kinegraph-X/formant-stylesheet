/**
 * @constructor CSSOM types
 *
 */



/*
StylePropertyMap
	is a List constructed from comma-separated-values
	all List-members are strings
	all properties are resolved as List's, only being -1elementList- for single-valued properties

ComputedStyleMapCache
	is a prop that is resolved for an Element, it holds a complete style map
	is a read-only property, initially set to null
	is maintained up-to-date at discretion of the implementor (must be up-to-date when get() is called)
	is the result of calling the computedStyleMap() method

CSSNumericValue
To create a type from a string unit, follow the appropriate branch of the following:
	unit is "number"
	    Return «[ ]» (empty map)
	unit is "percent"
	    Return «[ "percent" → 1 ]»
	unit is a <length> unit
	    Return «[ "length" → 1 ]»
	unit is an <angle> unit
	    Return «[ "angle" → 1 ]»
	unit is a <time> unit
	    Return «[ "time" → 1 ]»
	unit is a <frequency> unit
	    Return «[ "frequency" → 1 ]»
	unit is a <resolution> unit
	    Return «[ "resolution" → 1 ]»
	unit is a <flex> unit
	    Return «[ "flex" → 1 ]»
	anything else
	    Return failure.

	If a <percent> shall resolve to a base type, replace the type but not the value,
	and set the "percent hint" prop


CSSUnitValue
	value (unitless 0 is "px")
	unit [number, percentage, dimension]
		<length> (is dimension),
		<angle> (is dimension),
		<duration> (is dimension),
		<frequency> (is dimension),
		<resolution> (is dimension),
		
		or not quantities:
		<color>,
		<image>,
		<position> ([ left | center | right ] || [ top | center | bottom ])
		
		isComputed
			toCanonicalValue (isAbsoluteUnit ? autoCanonical : relativeCanonical)
			absolute units: (in, cm, mm, pt, pc, Q)
			exampe: the factor between px and in is 96:1
	
	Absolute langths: All of the absolute length units are compatible, and px is their canonical unit.
	unit 	name 			equivalence
	cm 		centimeters 	1cm = 96px/2.54
	mm 		millimeters 	1mm = 1/10th of 1cm
	Q 		quarter-millimeters 	1Q = 1/40th of 1cm
	in 		inches 			1in = 2.54cm = 96px
	pc 		picas 			1pc = 1/6th of 1in
	pt 		points 			1pt = 1/72th of 1in
	px	 	pixels 			1px = 1/96th of 1in 
	
	Percentage values are always relative to another quantity,
	for example a length (see relation in CSS2 spec)
	This quantity can be a value of another property for the same element,
	the value of a property for an ancestor element,
	a measurement of the formatting context (e.g., the width of a containing block),
	or something else
	
	Nota on calc(): The second and third arguments of the hsl() function
	can only be expressed as <percentage>s. Although calc() productions are allowed in their place,
	they can only combine percentages with themselves, as in calc(10% + 20%).
	
MathExpression (min(), max(), calc())

CSSTransformValue (is a list of CSSTransformComponent's)

CSSTransformComponent
	CSSMatrixComponent
	CSSTranslate
	CSSScale
	CSSRotate
	CSSSkew
	CSSSkewX
	CSSSkewY
	CSSPerspective
	
CSSResssourceValue (url's, etc.)
	state (loading, unloaded, etc.)
	url
	

*/

























module.exports = CSSOM;