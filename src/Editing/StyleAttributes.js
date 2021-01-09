/**
 * Construct. Point
 * 
 * @param type String : 
 */
 
//var factory = require('src/core/Factory');
 
	
	var Point  = function(type, x, y) {

		this.type = type;
		this.x = x || 1;
		this.y = y || 1;
	}

	Point.prototype.linearize = function() {
		return this.type + '(' + this.x + ', ' + this.y + ')';
	}

	/**
	 * Construct. AttributeList
	 * 
	 * @param type String : 'p' || 'span'
	 * @param attributes Object : passive partial AttributeList-Like (no methods, only significative keys defined)
	 */
	var AttributeList = function(type, attributes) {
		if (type === 'span') {
			// Don't change order of the attributes (mandatory for N19 generator)
			this.color = '';				// "#" rrggbb | "#" rrggbbaa | "rgb (int r, int g, int b)" | "rgba (int r, int g, int b, int a)" | "namedColor"
			this.textDecoration = ''; 	// blink | "none" | "underline"
			this.transform = new Point('scale');
			this.backgroundColor = '';	// "#" rrggbb | "#" rrggbbaa | "rgb (int r, int g, int b)" | "rgba (int r, int g, int b, int a)" | "namedColor"

			this.direction = '';		// "ltr" | "rtl"
			this.fontFamily = '';		// "string", "string", "string", etc.
			this.fontSize = '';		// <number><unit = "px" | "c"> with "c" abbr. of "cell" (default : 1c)
			this.lineHeight = '';		// ("normal" | <ebuttdt:lengthType>)
			this.textAlign = '';		// "left" | "center" | "right" | "start" | "end"
			this.fontStyle = '';		// "normal" | "italic"
			this.fontWeight = '';		// "normal" | "bold"
			this.unicodeBidi = '';	// "normal" | "embed" | "bidiOverride"
			this.wrapOption = '';		// "wrap" | "noWrap"
			this.padding = '';		// <number><unit = "px" | "c"> for <all-edges> | <beforeAndAfter> <whiteSpace> <startAndEnd> | <before> <whiteSpace> <startAndEnd> <whiteSpace> <after> | <before> <whiteSpace> <end> <whiteSpace> <after> <whiteSpace> <start>
			this.overflow = '';		// visible | hidden (hidden by default)
			//this.showBackground = '' // always (by default)
			this.ebutts_linePadding = ''; // 0c (by default)
			this.dummyDromeDar = '';
		}
		else if (type === 'p') {
			this.textAlign = '';		// "left" | "center" | "right" | "start" | "end"
			this.backgroundColor = '';	// "#" rrggbb | "#" rrggbbaa | "rgb (int r, int g, int b)" | "rgba (int r, int g, int b, int a)" | "namedColor"
		}
		
		if (typeof attributes === 'object' && Object.keys(attributes).length) {
			for(var prop in attributes) {
				if (attributes.hasOwnProperty(prop) && prop !== 'selector' && prop !== 'type')
					this[prop] = attributes[prop];
			};
		}
	}
	AttributeList.prototype = {};

	Object.defineProperty(AttributeList.prototype, 'linearize', {
																	value : function() {
																		var str = '', current = '', attrCount = Object.keys(this).length, c = 0;
																		for(var prop in this) {
																			c++;
																			if (typeof this[prop] === 'string' || this[prop] instanceof Point) {
																				if (typeof this[prop].length !== 'undefined')	// string
																					current = this[prop];
																				else
																					current = this[prop].linearize();			// "Point" obj
																				str += '\t' + prop.dromedarToHyphens() + ' : ' + current + ';';
																			}
																			if (c !== attrCount)
																				str += '\n';
																		};
																		return str;
																	}
																}
	);
	

var classConstructor = function(type, attributes) {
	return new AttributeList(type, attributes);
}

//module.exports = factory.Maker.getClassFactory(classConstructor);
module.exports = AttributeList;