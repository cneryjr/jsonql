var Array, RegExp, Number, JsonQL, JSON, console;

//..............................................................................
if ( !Array.prototype.shrink ) {
    Array.prototype.shrink = function shrink(/* [scope], func */){
        var accumulator, scope = null, curr, i = null;
        var len = arguments.length;
      
        if (typeof arguments[0] !== "function" && len >= 2) {
            scope = arguments[0];
            accumulator = arguments[1];
        } else 
            accumulator = arguments[0];
     
        if(typeof arguments[len-1] == "function") {
            curr = this[0]; // Increase i to start searching the secondly defined element in the array
            i = 1; // start accumulating at the second element
        } else
            curr = arguments[len-1];
     
        len = this.length;
        for(i = i || 0 ; i < len ; ++i) {
            if(i in this)
                curr = accumulator.call(scope, curr, this[i], i, this);
        }
              
        return curr;
    };

    //[2,3,4].shrink(function(old,current,idx,arr){return old+current;},1);
}

//..............................................................................
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
}

//..............................................................................
//Production steps of ECMA-262, Edition 5, 15.4.4.18
//Reference: http://es5.github.com/#x15.4.4.18

if ( !Array.prototype.forEach ) {
	Array.prototype.forEach = function( callback, thisArg ) {
		 var T, k;
		
		 if ( this == null ) {
			 throw new TypeError( "this is null or not defined" );
		 }
		
		 // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		 var O = Object(this);
		
		 // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		 // 3. Let len be ToUint32(lenValue).
		 var len = O.length >>> 0; // Hack to convert O.length to a UInt32
		
		 // 4. If IsCallable(callback) is false, throw a TypeError exception.
		 // See: http://es5.github.com/#x9.11
		 if ( {}.toString.call(callback) != "[object Function]" ) {
			 throw new TypeError( callback + " is not a function" );
		 }
		
		 // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		 if ( thisArg ) {
			 T = thisArg;
		 }
		 // 6. Let k be 0
		 k = 0;
		
		 // 7. Repeat, while k < len
		 while( k < len ) {
			 var kValue;
			 // a. Let Pk be ToString(k).
			 //   This is implicit for LHS operands of the in operator
			 // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			 //   This step can be combined with c
			 // c. If kPresent is true, then
			 if ( k in O ) {
				 // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				 kValue = O[ k ];
				 // ii. Call the Call internal method of callback with T as the this value and
				 // argument list containing kValue, k, and O.
				 callback.call( T, kValue, k, O );
			}
			// d. Increase k by 1.
			k++;
		 }
		 // 8. return undefined
	};
}

//..............................................................................
/*if (!Object.prototype.clone) {
	Object.prototype.clone = function() {
		var newObj = (this instanceof Array) ? [] : {};
		for (i in this) {
			if (i == 'clone')
				continue;
			if (this[i] && typeof this[i] == "object") {
				newObj[i] = this[i].clone();
			} else
				newObj[i] = this[i];
		}
		return newObj;
	};
}*/

// ..............................................................................
function JsonQL(collection, ignoreCase) {
    /** @param {Array} data - original collection */
    this.data = collection.slice(0);
    /** array de objetos do tipo {op: "=", val: "Junior"} */
    this.seqOperation = [];
    this.ignoreCase = ((ignoreCase) ? ignoreCase : true) ? 'gi' : 'g';
    this.groupByFuncs = [];
};

JsonQL.prototype.methods = {
    starts: function(val1, val2) {
        if (val1 && val1.constructor == Array) {
            if (val1.length >= val2.length) {
                for (var i=0; i < val2.length; i++)
                    if (val1[i] != val2[i])
                        return false;
                return true;
            } else
                return false;
        } else {
            var r = val1.toString().match(new RegExp("^" + val2.toString(), this.ignoreCase));
            return r && r.length > 0;
        }
    },
    ends: function(val1, val2) {
        if (val1 && val1.constructor == Array) {

            if (val1.length >= val2.length) {
                var len1 = val1.length-1;
                var len2 = val2.length-1;
                for(; (len2 >= 0 && len1 >= 0); len2--, len1--)
                    if (val1[len1] != val2[len2])
                        return false;
                return true;
            } else
                return false;
        } else {
            var r = val1.toString().match(new RegExp(val2.toString() + "$", this.ignoreCase));
            return r && r.length > 0;
        }
    },
    contains: function(val1 /* record value */, val2 /* filter value */) {
        if (val1 && val1.constructor == Array && val2.constructor == Array) {
            if (val1.length >= val2.length) {
                for (var i2=0; val2[i2]; i2++) {
                    var v2 = val2[i2];
                    var found = false;
                    for (var i1=0; val1[i1]; i1++) {
                        if (v2 == val1[i1]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        return false;
                }
                return true;
            } else
                return false;
        } else if (val1 && val1.constructor == Array) {
            for (var ii=0; ii < val1.length; ii++)



                if (val1[ii] == val2)
                    return true;
            return false;
        } else {
            var r = val1.toString().match(new RegExp(val2.toString(), this.ignoreCase));
            return r && r.length > 0;
        }
    },
    equals: function(val1, val2) {
        var isEqual = false;
        if (val1 && val1.constructor == Array) {
            if (val1.length == val2.length) {
                for (var i=0; i < val1.length; i++) {
                    if (val1[i] != val2[i])
                        return false;
                }
                isEqual = true;
            }
        } else if (val1.constructor == Number) {
            return (val1 == val2);
        } else {
            var v1, v2, r = (v1=val1.toString()).match(new RegExp("^" + (v2=val2.toString()) + "", this.ignoreCase));
            isEqual = r && (r.length > 0) && (v1.length == v2.length);
        }
        return isEqual;
    },
    greaterEquals: function(val1 /* record value */, val2 /* filter value */) {
        if (val1 && val1.constructor == Array) {
            return (val1.length >= val2.length);
            /*if (val1.length >= val2.length) {
                for (var i=0; i < val1.length; i++)
                    if (val1[i] != val2[i])
                        return false;
            } else {
                return false;
            }
            return true;*/
        } else if (val1.constructor == Number) {
            return (val1 >= val2);
        } else {
            var r = val1.toString().match(new RegExp("^" + val2.toString() + "", this.ignoreCase));
            return r && r.length > 0;
        }
    },
    lessEquals: function(val1 /* record value */, val2 /* filter value */) {
        if (val1 && val1.constructor == Array) {
            return (val1.length <= val2.length);
            /*if (val1.length >= val2.length) {
                for (var i=0; i < val1.length; i++)
                    if (val1[i] != val2[i])
                        return false;
            } else {
                return false;
            }
            return true;*/
        } else if (val1.constructor == Number) {
            return (val1 <= val2);
        } else {
            var r = val2.toString().match(new RegExp("^" + val1.toString() + "", this.ignoreCase));
            return r && r.length > 0;
        }
    },
    greater: function(val1 /* record value */, val2 /* filter value */) {
        if (val1 && val1.constructor == Array) {
            return (val1.length > val2.length);
        } else if (val1.constructor == Number) {
            return (val1 > val2);
        } else {
            var r = val1.toString().match(new RegExp("^" + val2.toString() + "", this.ignoreCase));
            return r && r.length > 0;
            /*if (this.ignoreCase == 'gi') {
               return val1.toString().toLowerCase() > val2.toString().toLowerCase();
            } else
               return val1.toString() > val2.toString();*/
        }
    },
    less: function(val1 /* record value */, val2 /* filter value */) {
        if (val1 && val1.constructor == Array) {
            return (val1.length < val2.length);
        } else if (val1.constructor == Number) {
            return (val1 < val2);
        } else {
            var r = val2.toString().match(new RegExp("^" + val1.toString() + "", this.ignoreCase));
            return r && r.length > 0;
            /*if (this.ignoreCase == 'gi') {
               return val1.toString().toLowerCase() > val2.toString().toLowerCase();
            } else
               return val1.toString() > val2.toString();*/
        }
    },
    groupby: function(rsArr, attArr /* atributos de agregacao */) {
    	var ignoreCase = (this.ignoreCase == "gi")? true : false;
    	
        function validate(key) { 
            return (key)? key : ''; 
        }
        function buildKey(row, arrAttr) {
            var key = '';
            arrAttr.forEach(function(each) {key += validate(row[each]) + '\u00FF';});
            key = (ignoreCase)? key.toLowerCase() : key;
            return key;
        }
        var gps = {}; /* {key: {sum_prices: 10, average_prices: 2}} */
        rsArr.forEach(function(row) {
            var key = buildKey(row, attArr);
            gps[key] = gps[key] || {};
            gps[key].rows = gps[key].rows || [];
            gps[key].rows.push(row);
        });
        
        var rs = [];
        for (var key in gps) {
            var rsRow = {};
            var rows = gps[key].rows;
            var result;
            for (var f=0; f < this.groupByFuncs.length; f++) {
                var groupFunc = this.groupByFuncs[f];
                var funcName = groupFunc.op;
                var func = this.methods[funcName];
                if (groupFunc.initialValue)
                    result = rows.shrink(groupFunc, func, groupFunc.initialValue); 
                else
                    result = rows.shrink(groupFunc, func); 
                //gps[key][funcName + "_" + groupFunc.att] = result;
                rsRow[funcName + "_" + groupFunc.att] = result[groupFunc.att];
            }
            attArr.forEach(function(each) {
                // Fail when exist initial value
                // rsRow[each] = result[each]; 
                rsRow[each] = rows[0][each];
            });
            rs.push(rsRow);
        }
        //console.log('ROWS *: ' + JSON.stringify(gps));
        //console.log('RESULT: ' + JSON.stringify(rs));
        return rs;
    },
    sum: function(previousValue, currentValue, index, array){  
        var value = JSON.parse(JSON.stringify(previousValue));
        value[this.att] += currentValue[this.att];
        /*var pval = value[this.att];
        pval = (typeof(pval) == 'string')? parseFloat(pval) : pval;
        var cval = currentValue[this.att];
        cval = (typeof(cval) == 'string')? parseFloat(cval) : cval;
        pval += cval;*/
        return value;
    },
    average: function(previousValue, currentValue, index, array){  
        var value = JSON.parse(JSON.stringify(previousValue));
        value[this.att] += currentValue[this.att]/array.length;
        return value;  
    },
    max: function(previousValue, currentValue, index, array){  
        var value = JSON.parse(JSON.stringify(previousValue));
        //value[this.att] = Math.max(value[this.att], currentValue[this.att]);
        value = (value[this.att] < currentValue[this.att])? currentValue : value;
        return value;  
    },
    count: function(rows, filter /* {op: "count", att: attribute, strcount: strcount} */) {
        var count = 0;
        if (filter.strcount == "count") {
            rows.shrink(filter, function(previousValue, currentValue, index, array){
                count++;
            }, 0);
        } else {
            rows.shrink(filter, function(previousValue, currentValue, index, array){
                count += (currentValue[this.att]) ? 1 : 0;
            }, 0);
        }
        var fv = {};v[filter.strcount] = count;
        return [fv];  
    },
    join: function(data, dataJoin, attrs) {
    	var nrs = [];
    	data.forEach(function(el, idx, arr){
    		dataJoin.forEach(function(elj, idxj, arrj){
    			var match = true;
    			for (var i=0; i < attrs.length; i++)
            		match &= (el[attrs[i][0]] == elj[attrs[i][1]]);
    			if (match) {
    				for (var attrname in elj) 
    					el[attrname] = elj[attrname];
    				nrs.push(el);
    			}
        	});
    	});
    	return nrs;
    }
};

JsonQL.prototype.starts = function(attribute, value) {
    this.seqOperation.push({op: "starts", att: attribute, val: value});
    return this;
};
JsonQL.prototype.ends = function(attribute, value) {
    this.seqOperation.push({op: "ends", att: attribute, val: value});
    return this;
};
JsonQL.prototype.contains = function(attribute, value) {
    this.seqOperation.push({op: "contains", att: attribute, val: value});
    return this;
};
JsonQL.prototype.equals = function(attribute, value) {
    this.seqOperation.push({op: "equals", att: attribute, val: value});
    return this;
};
JsonQL.prototype.greater = function(attribute, value) {
    this.seqOperation.push({op: "greater", att: attribute, val: value});
    return this;
};
JsonQL.prototype.greaterEquals = function(attribute, value) {
    this.seqOperation.push({op: "greaterEquals", att: attribute, val: value});
    return this;
};
JsonQL.prototype.less = function(attribute, value) {
    this.seqOperation.push({op: "less", att: attribute, val: value});
    return this;
};
JsonQL.prototype.lessEquals = function(attribute, value) {
    this.seqOperation.push({op: "lessEquals", att: attribute, val: value});
    return this;
};
//group by
JsonQL.prototype.groupby = function(/* arguments - campos a serem usados na agregação */) {
    //print('arguments: ' + JSON.stringify( arguments ));
    this.seqOperation.push({op: "groupby", att: Array.apply(null, arguments)});
    return this;
};
JsonQL.prototype.sum = function (field) {
    this.groupByFuncs.push({op: "sum", att: field});  
    return this;
};
JsonQL.prototype.average = function (field) {
    var iv = {}; iv[field] = 0;
    this.groupByFuncs.push({op: "average", att: field, initialValue: iv});  
    return this;
};
JsonQL.prototype.max = function (field) {
    var iv = {}; iv[field] = "-Infinity";
    this.seqOperation.push({op: "max", att: field, initialValue: iv});
    return this;
};
JsonQL.prototype.join = function(collection /* Array */, attributes /* Array of Arrays[2] of strings */) {
    this.seqOperation.push({op: "join", atts: attributes, collection: collection});
    return this;
};
JsonQL.prototype.orderby = function(attribute /* string */, func /* Function or string */, dir /* "asc" or "desc" */) {
	var filter = {op: "orderby", att: attribute, func: null, asc: false};
	var vdir = ["asc", "desc"];
	var vbool = [false, true];
	if (dir) {
		filter.asc = vbool[vdir.indexOf(dir)];
		filter.func = func;
	} else {
		var i = vdir.indexOf(func);
		if (i < 0)
			filter.func = func;
		else
			filter.asc = vbool[vdir.indexOf(func)];
	}
    this.seqOperation.push(filter);
    return this;
};

JsonQL.prototype.count = function (attribute) {
    var strcount = 'count' + ((attribute) ? '_'+attribute : '');
    //var iv = {}; iv[strcount] = 0;
    print('strcount: ' + strcount);
    this.seqOperation.push({op: "count", att: attribute, strcount: strcount});
    return this;
};

JsonQL.prototype.select = function(arrFields) {
	function filterField(tuple, arrFields) {
		var obj = new Object();
		for (i=0; i < arrFields.length; i++)
			obj[arrFields[i]] = tuple[arrFields[i]];
		return obj;
	}
	
    var rs, drs = this.data; //.slice(0);
    for (var i=0; i < this.seqOperation.length; i++) {
        rs = [];
        var filter = this.seqOperation[i];
        if (filter.op == "groupby") {
            rs = this.methods[filter.op].apply(this, [drs, filter.att]);
        } else if (filter.op == "join") {
            rs = this.methods[filter.op].call(this, drs, filter.collection, filter.atts);
        } else if (filter.op == "max") {
        	rs = drs.shrink(filter, this.methods[filter.op], filter.initialValue);
        } else if (this.methods[filter.op]) {
            for (var r=0; r < drs.length; r++) {
                var field = filter.att;
                var fk = field.split(".");
                if (fk.length == 2) {
                    if (this.methods[filter.op].call(this, drs[r][fk[0]][fk[1]], filter.val))
                        rs.push(drs[r]);
                    	//rs.push((arrFields)? filterField(drs[r], arrFields) : drs[r]);
                } else {
                    //return jlinq.util.equals(this.value[field], value, this.ignoreCase);
                    if (this.methods[filter.op].call(this, drs[r][field], filter.val))
                        rs.push(drs[r]);
                }
            }
        } else if (filter.op == "orderby") {
        	rs = drs.sort( JsonQL.sortFnc(filter.att, filter.func, filter.asc) );
        	//{op: "orderBy", att: attribute, func: func, asc: ascendente}
        	//rs = drs.shrink(filter, this.methods[filter.op], filter.initialValue);
        }
        drs = rs;
    }
    
    if (arrFields && arrFields.constructor.toString().indexOf("Array") > 0) {
    	rs = [];
    	for (var t=0; t < drs.length; t++) {
    	    rs.push(filterField(drs[t], arrFields));
    	}
    	drs = rs;
    } else if (typeof(arrFields) == "function") {
    	var retFunc = arrFields;
    	rs = [];
    	for (var t=0; t < drs.length; t++) {
    	    rs.push(retFunc(drs[t], t));
    	}
    	drs = rs;
    }
    
    this.seqOperation = [];
    this.groupByFuncs = [];
    return drs;
};


/**
 * 
 */
JsonQL.sortFnc = function(field, userFnc, flagReverse){

	flagReverse = flagReverse || false;
	
	function formmat(elem) {
		return userFnc 
					? ((typeof(userFnc) == 'string') 
							? elem[field][userFnc]()
							: userFnc(elem[field])) 
					: elem[field];
	};

	return function (a,b) {
	    var elm = formmat(a);
	    var eln = formmat(b);
	    
	    if (elm.constructor == Number) {
	    	return ((elm < eln) ? -1 :
            	(elm > eln) ? +1 : 0) * [-1,1][+!flagReverse];
	    } else {
	    	//return ((elm < eln) - (elm > eln)) * [-1,1][+!!flagReverse];
	    	var vcmp = [+(elm < eln), +(elm > eln)];
	    	return (vcmp[1] - vcmp[0]) * [-1,1][+!flagReverse];
	    }
	};
};

JsonQL.sortFunction = function(field, flagReverse, userFnc){

	function formmat(elem) {
		return userFnc ? userFnc(elem[field]) : elem[field];
	};

	return function (a,b) {
	    var elm = formmat(a);
	    var eln = formmat(b);
	    return ((elm < eln) ? -1 :
	            (elm > eln) ? +1 : 0) * [-1,1][+!!flagReverse];                  
	};
};
var persons = [{
	"id": "5",
	"name": "Pedro",
	"occupation": "student",
	"age": 8,
	"favorites": {"movies": false, "nba": false}
}, {
	"id": "1",
	"name": "David",
	"occupation": "student",
	"age": 5,
	"favorites": {"movies": true, "nba": false}
}, {
	"id": "3",
	"name": "Cassia",
	"occupation": "manager",
	"age": 39,
	"favorites": {"movies": false, "nba": false}
}, {
	"id": "4",
	"name": "Nery",
	"occupation": "director",
	"age": 43,
	"favorites": {"movies": true, "nba": true}
}, {
	"id": "2",
	"name": "Daniel",
	"occupation": "director",
	"age": 30,
	"favorites": {"movies": true, "nba": true}
}];


//Sort by name using the user function to make sorting sensitive
//persons.sort(JsonQL.sort('name', false, function(elem){return elem.toUpperCase()}));

//Sort by age old to young
//persons.sort(JsonQL.sort('id', true, parseInt));

/*
	new JsonQL(persons)
	.greater("age", 8)
	.orderBy("id", parseInt, "asc")
	.select()
	//.sort( JsonQL.sortFnc("id", parseInt, true) )
	
	var jsonql = new JsonQL(persons);
	jsonql.join([{sal: 100, occupation: "student"}],["occupation","occupation"]).groupby("occupation").sum("sal").select();
	
 */

/* export("JsonQL"); */


