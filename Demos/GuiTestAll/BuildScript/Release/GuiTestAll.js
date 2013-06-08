// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func, sig) {
    //assert(sig); // TODO: support asm
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE; // TODO: support asm
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((ptr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]); break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_NONE = 3; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    HEAPU8.set(new Uint8Array(slab), ret);
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max
var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math.imul) Math.imul = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, TOTAL_STACK);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);
STATICTOP += 34748;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
__ATINIT__ = __ATINIT__.concat([
  { func: function() { __GLOBAL__I_a87() } }
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv119__pointer_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTIt;
var __ZTIs;
var __ZTIm;
var __ZTIl;
var __ZTIj;
var __ZTIi;
var __ZTIh;
var __ZTIf;
var __ZTId;
var __ZTIc;
var __ZTIa;
var __ZTISt9exception;
var _stderr = _stderr=allocate([0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,248,126,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv119__pointer_type_infoE=allocate([0,0,0,0,4,127,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,28,127,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIt=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIs=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIm=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIl=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIj=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIi=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIh=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIf=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTId=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIc=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIa=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,37,80,0,44,26,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,101,116,67,111,108,87,101,105,103,104,116,32,99,97,108,108,101,100,32,98,101,102,111,114,101,32,99,101,108,108,32,99,114,101,97,116,101,100,0,83,111,108,105,100,80,97,105,110,116,47,37,103,44,37,103,44,37,103,44,37,103,0,0,109,103,75,101,121,85,112,0,226,128,157,0,82,101,99,116,70,114,97,109,101,47,37,100,44,37,100,44,37,103,44,37,103,44,37,103,44,37,103,44,37,100,44,37,100,44,37,100,44,37,100,58,37,115,0,0,102,105,108,108,0,0,0,0,83,105,109,112,108,101,70,114,97,109,101,47,37,100,44,37,100,44,37,100,44,37,100,58,37,115,0,0,98,108,111,99,107,113,117,111,116,101,0,0,103,114,101,101,110,0,0,0,66,0,0,0,98,121,32,60,118,97,114,32,110,97,109,101,61,34,100,101,112,116,104,34,47,62,44,32,60,118,97,114,32,110,97,109,101,61,34,102,114,101,113,34,47,62,32,104,122,44,32,102,108,97,103,115,61,60,118,97,114,32,110,97,109,101,61,34,102,108,97,103,115,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,100,111,99,115,47,102,111,110,116,115,0,0,71,76,95,77,65,88,95,67,85,66,69,95,77,65,80,95,84,69,88,84,85,82,69,95,83,73,90,69,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,73,110,100,101,120,82,101,115,101,116,34,62,109,103,71,76,73,110,100,101,120,66,117,102,102,101,114,58,32,82,101,115,101,116,32,111,102,32,115,116,97,116,105,99,32,98,117,102,102,101,114,46,60,47,101,114,114,111,114,77,115,103,62,0,108,111,110,103,0,0,0,0,37,100,0,0,60,33,91,67,68,37,99,0,109,117,115,116,32,104,97,118,101,32,112,111,105,110,116,32,34,120,32,121,32,122,34,32,118,97,108,117,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,37,115,44,37,115,44,37,115,0,0,0,0,105,100,0,0,109,105,110,0,109,103,69,121,101,80,116,0,115,108,105,100,101,114,85,112,70,114,97,109,101,0,0,0,105,116,101,109,68,111,119,110,67,111,108,111,114,0,0,0,32,0,0,0,42,66,85,84,84,79,78,42,0,0,0,0,99,104,105,108,100,70,114,97,109,101,0,0,84,104,105,115,32,105,115,32,108,105,110,101,32,37,100,32,119,105,116,104,32,118,101,114,121,32,108,111,110,103,32,116,101,120,116,32,119,104,105,99,104,32,100,111,101,115,110,39,116,32,109,101,97,110,32,97,110,121,116,104,105,110,103,32,114,101,97,108,108,121,44,32,98,117,116,32,119,105,108,108,32,114,101,102,111,114,109,97,116,32,110,105,99,101,108,121,46,0,0,0,109,103,75,101,121,68,111,119,110,0,0,0,115,105,122,101,0,0,0,0,112,114,101,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,68,105,115,112,108,97,121,77,111,100,101,34,62,67,97,110,110,111,116,32,102,105,110,100,32,99,117,114,114,101,110,116,32,100,105,115,112,108,97,121,32,109,111,100,101,58,32,60,118,97,114,32,110,97,109,101,61,34,119,105,100,116,104,34,47,62,32,98,121,32,60,118,97,114,32,110,97,109,101,61,34,104,101,105,103,104,116,34,47,62,32,0,0,0,0,102,111,110,116,68,105,114,0,71,76,95,77,65,88,95,67,79,77,66,73,78,69,68,95,84,69,88,84,85,82,69,95,73,77,65,71,69,95,85,78,73,84,83,0,83,68,76,95,83,101,116,86,105,100,101,111,77,111,100,101,32,102,97,105,108,101,100,46,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,87,114,111,110,103,84,104,114,101,97,100,34,62,109,103,71,76,58,32,79,112,101,110,71,76,32,99,97,108,108,32,102,114,111,109,32,110,111,110,45,109,97,105,110,32,116,104,114,101,97,100,46,60,47,101,114,114,111,114,77,115,103,62,0,117,110,115,105,103,110,101,100,32,105,110,116,0,0,0,0,97,116,116,114,44,118,97,108,117,101,0,0,60,33,91,67,37,99,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,111,112,116,105,111,110,66,97,100,80,111,105,110,116,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,0,0,0,102,105,108,101,110,97,109,101,44,97,116,116,114,44,118,97,108,117,101,0,118,97,114,0,79,0,0,0,109,103,78,111,114,109,97,108,77,97,116,114,105,120,0,0,112,97,103,101,68,111,119,110,70,114,97,109,101,0,0,0,105,116,101,109,72,111,118,101,114,67,111,108,111,114,0,0,100,105,115,67,111,108,111,114,0,0,0,0,105,110,112,117,116,0,0,0,117,110,110,97,109,101,100,0,109,103,77,111,117,115,101,69,120,105,116,0,102,97,99,101,0,0,0,0,97,108,105,103,110,0,0,0,98,114,0,0,100,97,114,107,71,114,101,121,0,0,0,0,115,112,101,99,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,87,114,111,110,103,76,105,98,114,97,114,121,34,62,76,105,98,114,97,114,121,32,34,60,118,97,114,32,110,97,109,101,61,34,108,105,98,114,97,114,121,34,47,62,34,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,32,32,84,114,121,32,111,110,101,32,111,102,32,60,118,97,114,32,110,97,109,101,61,34,108,105,98,114,97,114,105,101,115,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,116,97,98,108,101,0,0,0,58,37,115,58,32,37,100,0,100,111,99,115,47,117,105,0,109,103,73,100,108,101,0,0,87,101,98,71,76,0,0,0,102,111,110,116,76,105,115,116,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,83,104,97,100,101,114,34,62,109,103,71,76,58,32,83,104,97,100,101,114,32,34,60,118,97,114,32,110,97,109,101,61,34,115,104,97,100,101,114,78,97,109,101,34,47,62,34,32,110,111,116,32,102,111,117,110,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,116,114,0,0,105,110,116,0,120,109,108,66,97,100,66,111,111,108,101,97,110,0,0,0,60,33,91,37,99,0,0,0,109,117,115,116,32,104,97,118,101,32,102,108,111,97,116,105,110,103,32,112,111,105,110,116,32,118,97,108,117,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,45,45,45,45,45,45,45,45,45,45,45,0,111,112,116,105,111,110,66,97,100,66,111,111,108,101,97,110,0,0,0,0,101,114,114,111,114,77,115,103,0,0,0,0,109,97,120,0,109,103,77,111,100,101,108,77,97,116,114,105,120,0,0,0,112,97,103,101,72,111,118,101,114,70,114,97,109,101,0,0,105,116,101,109,85,112,67,111,108,111,114,0,100,111,119,110,67,111,108,111,114,0,0,0,67,111,117,114,105,101,114,0,108,105,115,116,32,105,116,101,109,32,116,97,103,32,119,105,116,104,111,117,116,32,101,110,99,108,111,100,105,110,103,32,108,105,115,116,0,0,0,0,109,103,77,111,117,115,101,69,110,116,101,114,0,0,0,0,99,111,108,111,114,0,0,0,112,0,0,0,104,49,0,0,100,97,114,107,71,114,97,121,0,0,0,0,50,100,66,97,100,70,111,110,116,83,112,101,99,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,66,97,100,76,105,98,114,97,114,121,34,62,85,110,97,98,108,101,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,98,114,97,114,121,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,58,79,112,101,110,71,76,32,115,104,97,100,101,114,32,118,101,114,115,105,111,110,58,32,37,115,0,0,117,105,68,105,114,0,0,0,79,112,101,110,71,76,50,46,49,0,0,0,102,111,110,116,32,37,115,32,110,111,116,32,102,111,117,110,100,46,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,66,97,100,83,104,97,100,101,114,76,105,110,107,34,62,109,103,71,76,77,105,115,99,58,32,76,105,110,107,101,114,32,101,114,114,111,114,32,111,110,32,115,104,97,100,101,114,115,32,0,0,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,0,102,97,108,115,101,0,0,0,45,45,0,0,60,110,111,110,101,62,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,111,112,116,105,111,110,66,97,100,68,111,117,98,108,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,0,0,102,111,114,109,0,0,0,0,101,114,114,111,114,84,97,98,108,101,0,0,88,0,0,0,112,97,103,101,85,112,70,114,97,109,101,0,109,103,77,86,77,97,116,114,105,120,0,0,105,116,101,109,68,105,115,70,114,97,109,101,0,0,0,0,104,111,118,101,114,67,111,108,111,114,0,0,65,114,105,97,108,0,0,0,116,104,101,67,111,110,115,111,108,101,0,0,226,128,156,0,109,103,77,111,117,115,101,85,112,0,0,0,60,47,101,114,114,111,114,84,97,98,108,101,62,0,0,0,104,54,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,87,114,105,116,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,69,110,99,111,100,101,32,101,114,114,111,114,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,115,104,97,100,101,114,32,108,105,110,107,32,102,97,105,108,101,100,46,0,103,114,101,121,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,82,101,97,100,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,68,101,99,111,100,101,32,101,114,114,111,114,46,60,47,101,114,114,111,114,77,115,103,62,0,37,115,32,115,104,97,100,101,114,32,99,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,46,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,78,111,76,105,98,114,97,114,121,34,62,85,110,97,98,108,101,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,97,110,121,32,111,102,32,60,118,97,114,32,110,97,109,101,61,34,108,105,98,114,97,114,105,101,115,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,66,97,100,79,112,101,110,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,67,97,110,110,111,116,32,111,112,101,110,32,102,105,108,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,58,79,112,101,110,71,76,32,118,101,114,115,105,111,110,58,32,37,115,0,37,115,32,115,104,97,100,101,114,32,108,111,103,58,10,37,115,0,0,0,100,111,99,115,47,115,104,97,100,101,114,115,0,0,0,0,79,112,101,110,71,76,51,46,51,0,0,0,37,115,32,115,104,97,100,101,114,32,99,111,109,112,105,108,101,100,46,0,99,104,97,114,32,116,101,120,116,117,114,101,32,114,101,115,105,122,101,100,32,116,111,32,37,100,32,98,121,32,37,100,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,66,97,100,84,121,112,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,70,105,108,101,32,84,121,112,101,32,60,118,97,114,32,110,97,109,101,61,34,116,121,112,101,34,47,62,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,37,115,37,115,0,0,0,0,60,118,97,114,32,110,97,109,101,61,34,118,115,78,97,109,101,34,47,62,44,32,60,118,97,114,32,110,97,109,101,61,34,102,115,78,97,109,101,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,0,102,114,97,103,109,101,110,116,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,78,111,84,121,112,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,78,111,32,102,105,108,101,116,121,112,101,32,40,101,120,58,32,34,46,106,112,103,34,41,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,115,104,111,114,116,0,0,0,116,114,117,101,0,0,0,0,60,33,45,37,99,0,0,0,109,117,115,116,32,104,97,118,101,32,105,110,116,101,103,101,114,32,118,97,108,117,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,42,0,0,0,118,101,114,116,101,120,0,0,99,108,111,115,101,0,0,0,108,105,110,101,68,111,119,110,70,114,97,109,101,0,0,0,109,103,77,86,80,77,97,116,114,105,120,0,105,116,101,109,68,111,119,110,70,114,97,109,101,0,0,0,117,112,67,111,108,111,114,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,66,97,100,83,105,122,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,66,97,100,32,105,109,97,103,101,32,115,105,122,101,32,60,118,97,114,32,110,97,109,101,61,34,119,100,34,47,62,32,98,121,32,60,118,97,114,32,110,97,109,101,61,34,104,116,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,103,114,97,121,0,0,0,0,109,103,79,114,105,103,105,110,0,0,0,0,82,71,66,32,105,109,97,103,101,32,60,118,97,114,32,110,97,109,101,61,34,114,103,98,119,100,34,47,62,32,98,121,32,60,118,97,114,32,110,97,109,101,61,34,114,103,98,104,116,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,109,103,79,118,101,114,108,97,121,84,101,120,116,77,50,0,109,103,83,105,122,101,0,0,102,111,110,116,45,37,115,45,37,100,37,115,37,115,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,65,108,112,104,97,83,105,122,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,65,108,112,104,97,32,105,109,97,103,101,32,60,118,97,114,32,110,97,109,101,61,34,97,108,112,104,97,119,100,34,47,62,32,98,121,32,60,118,97,114,32,110,97,109,101,61,34,97,108,112,104,97,104,116,34,47,62,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,0,0,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,101,99,52,40,48,46,48,44,32,48,46,48,44,32,48,46,48,44,32,116,101,120,116,67,111,108,111,114,46,97,32,42,32,112,105,120,101,108,46,97,41,59,10,0,0,0,109,103,84,101,120,116,117,114,101,85,110,105,116,48,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,66,77,80,82,101,97,100,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,67,111,117,108,100,32,110,111,116,32,114,101,97,100,32,60,118,97,114,32,110,97,109,101,61,34,115,105,122,101,34,47,62,32,98,121,116,101,115,32,111,102,32,105,109,97,103,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,109,103,79,118,101,114,108,97,121,84,101,120,116,77,49,0,113,0,0,0,109,103,77,111,117,115,101,68,111,119,110,0,98,111,116,73,110,115,101,116,0,0,0,0,99,111,109,112,105,108,101,32,111,118,101,114,108,97,121,32,115,104,97,100,101,114,32,102,97,105,108,101,100,46,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,66,77,80,83,105,122,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,67,97,108,99,117,108,97,116,101,100,32,105,109,97,103,101,32,115,105,122,101,32,40,60,118,97,114,32,110,97,109,101,61,34,99,97,108,99,83,105,122,101,34,47,62,41,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,100,101,99,108,97,114,101,100,32,115,105,122,101,32,40,60,118,97,114,32,110,97,109,101,61,34,100,101,99,108,83,105,122,101,34,47,62,41,46,60,47,101,114,114,111,114,77,115,103,62,0,0,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,101,99,52,40,116,101,120,116,67,111,108,111,114,46,114,44,32,116,101,120,116,67,111,108,111,114,46,103,44,32,116,101,120,116,67,111,108,111,114,46,98,44,32,112,105,120,101,108,46,97,41,59,10,0,104,53,0,0,118,101,114,116,84,101,120,67,111,111,114,100,48,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,66,77,80,68,101,112,116,104,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,79,110,108,121,32,50,52,32,97,110,100,32,51,50,32,98,105,116,32,117,110,99,111,109,112,114,101,115,115,101,100,32,87,105,110,100,111,119,115,32,98,105,116,109,97,112,115,32,115,117,112,112,111,114,116,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,109,103,79,118,101,114,108,97,121,84,101,120,116,0,0,0,118,101,114,116,80,111,105,110,116,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,78,111,116,66,77,80,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,70,105,108,101,32,110,111,116,32,105,110,32,87,105,110,100,111,119,115,32,66,77,80,32,102,111,114,109,97,116,46,60,47,101,114,114,111,114,77,115,103,62,0,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,101,99,52,40,116,101,120,116,67,111,108,111,114,46,114,44,32,116,101,120,116,67,111,108,111,114,46,103,44,32,116,101,120,116,67,111,108,111,114,46,98,44,32,116,101,120,116,67,111,108,111,114,46,97,32,42,32,112,105,120,101,108,46,97,41,59,10,0,0,0,45,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,66,97,100,68,67,34,62,87,105,110,100,111,119,115,58,32,85,110,97,98,108,101,32,116,111,32,99,114,101,97,116,101,32,100,101,118,105,99,101,32,99,111,110,116,101,120,116,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,99,111,109,112,105,108,101,32,111,118,101,114,108,97,121,32,115,104,97,100,101,114,58,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,105,109,103,74,112,103,76,105,98,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,69,114,114,111,114,32,100,117,114,105,110,103,32,74,112,101,103,32,105,109,97,103,101,32,101,110,99,111,100,101,32,111,114,32,100,101,99,111,100,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,32,32,32,32,100,105,115,99,97,114,100,59,10,0,0,0,58,79,112,101,110,71,76,32,100,101,118,105,99,101,32,114,101,110,100,101,114,101,114,58,32,37,115,0,115,104,97,100,101,114,68,105,114,0,0,0,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,116,101,120,116,117,114,101,50,68,40,109,103,84,101,120,116,117,114,101,85,110,105,116,48,44,32,118,84,101,120,41,59,10,0,0,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,109,117,115,116,32,104,97,118,101,32,102,108,111,97,116,105,110,103,32,112,111,105,110,116,32,118,97,108,117,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,32,32,105,102,32,40,112,105,120,101,108,46,97,32,61,61,32,48,46,48,41,10,0,0,109,103,86,101,114,116,101,120,70,117,108,108,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,66,97,100,83,104,97,100,101,114,34,62,109,103,71,76,77,105,115,99,58,32,67,97,110,110,111,116,32,99,111,109,112,105,108,101,32,97,110,121,32,118,101,114,115,105,111,110,32,111,102,32,115,104,97,100,101,114,32,0,0,109,103,73,110,100,101,120,70,117,108,108,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,68,111,117,98,108,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,0,32,32,118,101,99,52,32,112,105,120,101,108,32,61,32,116,101,120,116,117,114,101,50,68,40,109,103,84,101,120,116,117,114,101,85,110,105,116,48,44,32,118,84,101,120,41,59,10,0,0,0,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,0,0,100,111,99,115,47,105,109,97,103,101,115,47,102,108,111,111,114,46,106,112,103,0,0,0,116,97,103,78,97,109,101,44,99,104,105,108,100,78,97,109,101,0,0,0,60,33,37,99,0,0,0,0,116,97,103,78,97,109,101,44,116,111,112,84,97,103,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,111,112,116,105,111,110,66,97,100,73,110,116,101,103,101,114,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,0,34,0,0,0,111,102,102,67,111,108,111,114,0,0,0,0,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,109,103,84,101,120,116,117,114,101,85,110,105,116,48,59,10,0,0,108,105,110,101,72,111,118,101,114,70,114,97,109,101,0,0,37,115,46,102,115,0,0,0,105,116,101,109,72,111,118,101,114,70,114,97,109,101,0,0,42,67,79,78,83,79,76,69,42,0,0,0,82,101,97,100,121,33,0,0,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,109,117,115,116,32,104,97,118,101,32,105,110,116,101,103,101,114,32,118,97,108,117,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,117,110,105,102,111,114,109,32,118,101,99,52,32,116,101,120,116,67,111,108,111,114,59,10,0,0,0,0,104,111,116,89,0,0,0,0,102,108,111,111,114,0,0,0,45,45,45,45,45,45,32,116,114,121,32,116,111,32,99,114,101,97,116,101,32,87,101,98,71,76,32,99,111,110,116,101,120,116,44,32,102,117,108,108,115,99,114,101,101,110,61,37,115,44,32,109,117,108,116,105,83,97,109,112,108,101,61,37,115,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,73,110,116,101,103,101,114,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,109,103,79,118,101,114,108,97,121,73,109,97,103,101,0,0,102,97,99,101,45,122,109,97,120,46,106,112,103,0,0,0,32,32,103,108,95,80,111,115,105,116,105,111,110,46,119,32,61,32,49,46,48,59,10,0,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,109,117,115,116,32,98,101,32,116,114,117,101,32,111,114,32,102,97,108,115,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,122,109,97,120,102,97,99,101,0,0,0,0,32,32,103,108,95,80,111,115,105,116,105,111,110,46,122,32,61,32,48,46,53,59,10,0,118,97,108,117,101,32,34,37,115,34,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,66,111,111,108,101,97,110,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,102,97,99,101,45,122,109,105,110,46,106,112,103,0,0,0,99,111,117,114,105,101,114,0,114,105,103,104,116,0,0,0,109,103,77,111,117,115,101,77,111,118,101,82,101,108,0,0,116,111,112,73,110,115,101,116,0,0,0,0,32,32,103,108,95,80,111,115,105,116,105,111,110,46,121,32,61,32,40,45,50,46,48,32,42,32,40,118,101,114,116,80,111,105,110,116,46,121,43,109,103,79,114,105,103,105,110,46,121,41,41,32,47,32,109,103,83,105,122,101,46,121,32,43,32,49,46,48,59,10,0,0,97,116,116,114,32,37,115,61,0,0,0,0,84,97,103,32,34,60,118,97,114,32,110,97,109,101,61,34,116,97,103,78,97,109,101,34,47,62,34,32,99,97,110,110,111,116,32,99,111,110,116,97,105,110,32,34,60,118,97,114,32,110,97,109,101,61,34,99,104,105,108,100,78,97,109,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,122,109,105,110,102,97,99,101,0,0,0,0,226,128,162,0,104,52,0,0,32,32,103,108,95,80,111,115,105,116,105,111,110,46,120,32,61,32,40,50,46,48,32,42,32,40,118,101,114,116,80,111,105,110,116,46,120,43,109,103,79,114,105,103,105,110,46,120,41,41,32,47,32,109,103,83,105,122,101,46,120,32,45,32,49,46,48,59,10,0,0,0,60,47,39,37,115,39,62,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,67,104,105,108,100,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,65,114,105,97,108,45,49,50,45,66,0,0,102,97,99,101,45,121,109,97,120,46,106,112,103,0,0,0,121,109,97,120,102,97,99,101,0,0,0,0,108,105,103,104,116,71,114,101,121,0,0,0,32,32,118,84,101,120,32,61,32,118,101,114,116,84,101,120,67,111,111,114,100,48,59,10,0,0,0,0,47,62,0,0,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,32,99,97,110,110,111,116,32,98,101,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,98,108,117,101,0,0,0,0,71,117,105,84,101,115,116,65,108,108,0,0,45,73,0,0,102,97,99,101,45,121,109,105,110,46,106,112,103,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,66,97,100,67,114,101,97,116,101,34,62,87,105,110,100,111,119,115,58,32,85,110,97,98,108,101,32,116,111,32,99,114,101,97,116,101,32,119,105,110,100,111,119,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,123,32,10,0,68,101,98,117,103,32,70,114,97,109,101,119,111,114,107,0,60,39,37,115,39,32,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,65,116,116,114,86,97,108,117,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,58,32,97,116,116,114,105,98,117,116,101,32,0,0,109,103,79,118,101,114,108,97,121,83,111,108,105,100,0,0,58,79,112,101,110,71,76,32,100,101,118,105,99,101,32,118,101,110,100,111,114,58,32,37,115,0,0,0,102,105,101,108,100,32,37,115,32,99,104,97,110,103,101,100,32,116,111,32,39,37,115,39,0,0,0,0,111,112,116,105,111,110,115,46,120,109,108,0,121,109,105,110,102,97,99,101,0,0,0,0,46,116,116,102,0,0,0,0,118,111,105,100,32,109,97,105,110,40,118,111,105,100,41,32,10,0,0,0,39,37,115,39,32,0,0,0,85,110,107,110,111,119,110,32,97,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,116,97,103,78,97,109,101,34,47,62,46,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,118,67,111,108,111,114,59,10,0,0,0,102,111,110,116,32,107,101,121,32,37,115,32,110,111,116,32,102,111,117,110,100,44,32,117,115,101,32,100,101,102,97,117,108,116,46,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,78,117,108,108,86,101,114,116,101,120,34,62,109,103,71,76,86,101,114,116,101,120,66,117,102,102,101,114,58,32,108,111,97,100,68,105,115,112,108,97,121,32,119,105,116,104,32,78,85,76,76,32,109,101,109,111,114,121,46,60,47,101,114,114,111,114,77,115,103,62,0,0,102,97,99,101,45,120,109,97,120,46,106,112,103,0,0,0,118,97,114,121,105,110,103,32,118,101,99,50,32,118,84,101,120,59,10,0,69,120,99,101,112,116,105,111,110,58,32,37,115,0,0,0,67,68,65,84,65,58,32,39,37,115,39,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,65,116,116,114,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,67,97,110,110,111,116,32,114,101,116,117,114,110,32,116,101,120,116,117,114,101,32,105,109,97,103,101,32,102,111,114,32,111,118,101,114,108,97,121,32,115,117,114,102,97,99,101,46,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,115,105,103,110,101,100,32,99,104,97,114,0,111,102,102,0,120,109,108,66,97,100,67,104,105,108,100,0,115,116,114,105,110,103,0,0,120,109,108,78,111,79,112,101,110,84,97,103,0,0,0,0,109,117,115,116,32,98,101,32,116,114,117,101,32,111,114,32,102,97,108,115,101,44,32,110,111,116,32,34,60,118,97,114,32,110,97,109,101,61,34,118,97,108,117,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,101,110,100,32,111,102,32,111,112,116,105,111,110,115,46,0,120,109,97,120,102,97,99,101,0,0,0,0,61,34,0,0,111,102,102,70,114,97,109,101,0,0,0,0,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,118,101,114,116,84,101,120,67,111,111,114,100,48,59,10,0,0,42,83,80,76,73,84,42,0,108,105,110,101,85,112,70,114,97,109,101,0,105,116,101,109,85,112,70,114,97,109,101,0,37,115,46,118,115,0,0,0,69,120,99,101,112,116,105,111,110,32,34,46,46,46,34,0,42,76,65,66,69,76,42,0,100,111,119,110,70,114,97,109,101,0,0,0,37,115,102,111,110,116,115,46,120,109,108,0,119,104,105,116,101,0,0,0,105,99,111,110,0,0,0,0,67,108,111,115,105,110,103,32,116,97,103,32,34,60,118,97,114,32,110,97,109,101,61,34,116,97,103,78,97,109,101,34,47,62,34,44,32,111,112,101,110,32,116,97,103,32,105,115,32,34,60,118,97,114,32,110,97,109,101,61,34,116,111,112,84,97,103,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,104,111,116,88,0,0,0,0,98,108,97,99,107,0,0,0,111,110,0,0,102,97,99,101,45,120,109,105,110,46,106,112,103,0,0,0,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,118,101,114,116,80,111,105,110,116,59,10,0,0,58,83,101,115,115,105,111,110,32,101,120,105,116,58,32,99,108,101,97,110,0,0,0,0,62,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,78,111,79,112,101,110,84,97,103,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,0,99,104,101,99,107,98,111,120,32,37,115,32,105,115,32,37,115,0,0,0,110,111,110,101,0,0,0,0,115,101,116,67,111,108,82,105,103,104,116,73,110,115,101,116,32,99,97,108,108,101,100,32,98,101,102,111,114,101,32,99,101,108,108,32,99,114,101,97,116,101,100,0,120,109,105,110,102,97,99,101,0,0,0,0,117,110,105,102,111,114,109,32,118,101,99,50,32,109,103,79,114,105,103,105,110,59,10,0,45,45,45,45,45,45,32,115,104,117,116,100,111,119,110,0,103,116,0,0,85,110,107,110,111,119,110,32,116,97,103,32,34,60,118,97,114,32,110,97,109,101,61,34,116,97,103,78,97,109,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,32,32,103,108,95,80,111,115,105,116,105,111,110,46,121,32,61,32,40,50,46,48,32,42,32,40,118,101,114,116,80,111,105,110,116,46,121,43,109,103,79,114,105,103,105,110,46,121,41,41,32,47,32,109,103,83,105,122,101,46,121,32,45,32,49,46,48,59,10,0,0,0,118,101,114,116,78,111,114,109,97,108,0,0,98,117,116,116,111,110,32,37,115,32,112,114,101,115,115,101,100,0,0,0,99,111,110,115,111,108,101,0,67,111,117,108,100,32,110,111,116,32,111,112,101,110,32,99,117,114,115,111,114,32,102,105,108,101,32,39,37,115,39,0,117,110,105,102,111,114,109,32,118,101,99,50,32,109,103,83,105,122,101,59,10,0,0,0,101,114,114,111,114,58,32,37,115,10,0,0,60,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,84,97,103,85,110,107,110,111,119,110,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,37,49,48,46,50,102,0,0,116,116,0,0,99,101,110,116,101,114,0,0,109,111,118,101,99,117,114,115,111,114,0,0,109,103,77,111,117,115,101,77,111,118,101,65,98,115,0,0,119,101,105,103,104,116,0,0,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,10,0,0,0,58,83,101,115,115,105,111,110,32,101,120,105,116,58,32,37,115,0,0,0,108,116,0,0,66,97,100,32,99,108,111,115,101,32,116,97,103,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,32,32,118,67,111,108,111,114,32,61,32,118,101,114,116,67,111,108,111,114,59,10,0,0,37,100,46,0,109,97,120,108,97,98,101,108,0,0,0,0,102,105,101,108,100,0,0,0,104,51,0,0,100,101,115,107,99,117,114,115,111,114,0,0,65,112,112,32,114,101,113,117,101,115,116,101,100,32,79,112,101,110,71,108,32,37,100,46,37,100,44,32,115,104,97,100,101,114,32,37,100,46,37,100,10,83,121,115,116,101,109,32,104,97,115,32,79,112,101,110,71,76,32,37,100,46,37,100,44,32,115,104,97,100,101,114,32,37,100,46,37,100,0,0,58,83,101,115,115,105,111,110,32,101,120,105,116,58,32,34,46,46,46,34,32,101,120,99,101,112,116,105,111,110,0,0,102,114,97,103,109,101,110,116,32,115,104,97,100,101,114,32,37,115,32,99,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,46,0,0,103,108,86,101,114,116,101,120,82,101,115,101,116,0,0,0,38,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,67,108,111,115,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,102,108,100,0,108,105,103,104,116,71,114,97,121,0,0,0,99,104,101,99,107,98,111,120,0,0,0,0,99,97,110,110,111,116,32,114,101,97,100,32,79,112,101,110,71,76,32,83,104,97,100,101,114,32,76,97,110,103,117,97,103,101,32,118,101,114,115,105,111,110,0,0,58,83,101,115,115,105,111,110,32,116,105,109,101,58,32,37,46,50,102,32,115,101,99,111,110,100,115,0,102,114,97,103,109,101,110,116,32,115,104,97,100,101,114,32,37,115,32,108,111,103,58,10,37,115,0,0,97,109,112,0,69,120,112,101,99,116,101,100,32,59,32,105,110,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,85,110,114,101,103,105,115,116,101,114,34,62,87,105,110,100,111,119,115,58,32,70,97,105,108,101,100,32,116,111,32,117,110,114,101,103,105,115,116,101,114,32,119,105,110,100,111,119,32,99,108,97,115,115,46,60,47,101,114,114,111,114,77,115,103,62,0,98,117,116,116,111,110,0,0,112,108,97,116,102,111,114,109,0,0,0,0,99,97,110,110,111,116,32,112,97,114,115,101,32,79,112,101,110,71,76,32,118,101,114,115,105,111,110,32,37,115,0,0,103,108,73,110,100,101,120,82,101,115,101,116,0,0,0,0,83,68,76,95,73,110,105,116,32,102,97,105,108,101,100,0,102,114,97,103,109,101,110,116,32,115,104,97,100,101,114,32,37,115,32,99,111,109,112,105,108,101,100,0,37,115,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,77,105,115,115,105,110,103,83,101,109,105,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,118,97,114,121,105,110,103,32,118,101,99,52,32,118,67,111,108,111,114,59,10,0,0,0,99,104,107,0,116,104,0,0,80,97,114,116,32,56,51,0,103,114,97,112,104,105,99,115,84,105,109,105,110,103,0,0,37,115,47,37,115,0,0,0,37,100,46,37,100,0,0,0,103,108,78,117,108,108,86,101,114,116,101,120,0,0,0,0,58,79,83,58,32,74,97,118,97,115,99,114,105,112,116,0,118,101,114,116,101,120,32,115,104,97,100,101,114,32,37,115,32,99,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,46,0,0,0,0,102,105,108,101,110,97,109,101,0,0,0,0,69,120,112,101,99,116,101,100,32,113,117,111,116,101,100,32,118,97,108,117,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,97,116,116,114,105,98,117,116,101,32,118,101,99,52,32,118,101,114,116,67,111,108,111,114,59,10,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,78,117,108,108,73,110,100,101,120,34,62,109,103,71,76,73,110,100,101,120,66,117,102,102,101,114,58,32,108,111,97,100,68,105,115,112,108,97,121,32,119,105,116,104,32,78,85,76,76,32,109,101,109,111,114,121,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,116,100,0,0,109,117,108,116,105,83,97,109,112,108,101,0,99,97,110,110,111,116,32,114,101,97,100,32,79,112,101,110,71,76,32,118,101,114,115,105,111,110,0,0,58,80,114,111,103,114,97,109,32,86,101,114,115,105,111,110,58,32,37,115,0,0,0,0,118,101,114,116,101,120,32,115,104,97,100,101,114,32,37,115,32,108,111,103,58,10,37,115,0,0,0,0,120,109,108,70,105,108,101,78,111,116,70,111,117,110,100,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,77,105,115,115,105,110,103,81,117,111,116,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,37,115,10,0,99,104,97,114,0,0,0,0,116,104,101,66,117,116,116,111,110,0,0,0,37,115,44,37,115,0,0,0,120,109,108,66,97,100,83,116,114,105,110,103,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,111,112,116,105,111,110,66,97,100,66,111,111,108,101,97,110,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,58,32,65,116,116,114,105,98,117,116,101,32,34,60,118,97,114,32,110,97,109,101,61,34,97,116,116,114,34,47,62,34,32,0,32,32,37,115,58,32,37,115,0,0,0,0,119,105,110,100,111,119,72,101,105,103,104,116,0,0,0,0,44,32,0,0,97,43,116,0,111,110,67,111,108,111,114,0,100,105,118,105,100,101,114,0,100,105,115,70,114,97,109,101,0,0,0,0,100,105,115,84].concat([101,120,116,67,111,108,111,114,0,0,0,0,118,105,101,119,32,115,105,122,101,32,105,115,32,37,100,32,98,121,32,37,100,0,0,0,117,110,107,110,111,119,110,0,104,111,118,101,114,70,114,97,109,101,0,0,42,65,76,76,42,0,0,0,118,101,114,116,101,120,32,115,104,97,100,101,114,32,37,115,32,99,111,109,112,105,108,101,100,0,0,0,104,105,115,116,111,114,121,0,108,97,98,101,108,0,0,0,114,98,0,0,69,120,112,101,99,116,101,100,32,39,61,39,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,116,101,120,116,117,114,101,0,121,118,97,108,117,101,0,0,119,105,110,100,111,119,87,105,100,116,104,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,77,97,107,101,67,117,114,114,101,110,116,34,62,109,103,71,76,73,110,105,116,58,32,119,103,108,77,97,107,101,67,117,114,114,101,110,116,32,102,97,105,108,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,71,76,32,111,117,116,32,111,102,32,109,101,109,111,114,121,46,32,32,0,58,80,114,111,103,114,97,109,58,32,37,115,0,0,0,0,37,115,44,37,100,44,37,100,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,77,105,115,115,105,110,103,69,113,117,97,108,115,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,0,118,111,105,100,0,0,0,0,121,58,32,0,116,104,101,83,116,97,99,107,0,0,0,0,115,101,116,67,111,108,76,101,102,116,73,110,115,101,116,32,99,97,108,108,101,100,32,98,101,102,111,114,101,32,99,101,108,108,32,99,114,101,97,116,101,100,0,0,120,109,108,66,97,100,65,116,116,114,0,0,108,105,0,0,119,105,110,100,111,119,89,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,67,114,101,97,116,101,67,111,110,116,101,120,116,34,62,109,103,71,76,73,110,105,116,58,32,119,103,108,67,114,101,97,116,101,67,111,110,116,101,120,116,32,102,97,105,108,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,71,76,32,105,110,118,97,108,105,100,32,102,114,97,109,101,98,117,102,102,101,114,32,111,112,101,114,97,116,105,111,110,46,32,32,0,58,83,101,115,115,105,111,110,32,102,112,115,58,32,37,100,32,102,112,115,44,32,37,46,50,102,32,109,115,47,102,114,97,109,101,44,32,111,118,101,114,32,37,100,32,102,114,97,109,101,115,44,32,37,46,50,102,32,115,101,99,111,110,100,115,0,0,0,103,108,66,97,100,83,104,97,100,101,114,76,105,110,107,0,102,105,108,101,110,97,109,101,44,108,105,110,101,44,99,111,108,44,0,0,85,110,101,120,112,101,99,116,101,100,32,115,116,114,105,110,103,32,34,60,118,97,114,32,110,97,109,101,61,34,115,116,114,105,110,103,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,120,109,108,69,110,100,115,0,121,108,98,108,0,0,0,0,103,108,78,117,108,108,73,110,100,101,120,0,120,109,108,84,97,103,85,110,107,110,111,119,110,0,0,0,119,105,110,100,111,119,88,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,83,101,116,80,105,120,101,108,70,111,114,109,97,116,34,62,109,103,71,76,73,110,105,116,58,32,99,97,110,110,111,116,32,83,101,116,80,105,120,101,108,70,111,114,109,97,116,46,60,47,101,114,114,111,114,77,115,103,62,0,71,76,32,105,110,118,97,108,105,100,32,111,112,101,114,97,116,105,111,110,46,32,32,0,45,45,45,45,45,45,32,100,105,115,112,108,97,121,32,105,110,105,116,105,97,108,105,122,101,100,46,32,32,82,101,116,117,114,110,32,116,111,32,97,112,112,58,32,37,115,0,0,115,104,97,100,101,114,32,108,105,110,107,58,32,37,115,0,37,115,32,40,37,100,44,32,37,100,41,58,32,37,115,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,66,97,100,83,116,114,105,110,103,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,0,102,105,108,101,78,97,109,101,44,119,100,44,104,116,44,97,114,114,97,121,119,100,44,97,114,114,97,121,104,116,0,0,60,101,114,114,111,114,84,97,98,108,101,62,0,0,0,0,57,57,57,57,57,57,57,57,0,0,0,0,108,101,102,116,0,0,0,0,117,108,0,0,102,117,108,108,115,99,114,101,101,110,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,67,104,111,111,115,101,80,105,120,101,108,70,111,114,109,97,116,34,62,109,103,71,76,73,110,105,116,58,32,99,97,110,110,111,116,32,67,104,111,111,115,101,80,105,120,101,108,70,111,114,109,97,116,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,60,116,114,62,32,119,105,116,104,111,117,116,32,101,110,99,108,111,115,105,110,103,32,60,116,97,98,108,101,62,0,0,71,76,32,105,110,118,97,108,105,100,32,118,97,108,117,101,46,32,32,0,60,116,100,62,32,119,105,116,104,111,117,116,32,101,110,99,108,111,115,105,110,103,32,60,116,114,62,0,120,109,108,77,105,115,115,105,110,103,83,101,109,105,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,70,105,108,101,78,111,116,70,111,117,110,100,34,62,67,111,117,108,100,32,110,111,116,32,111,112,101,110,32,102,105,108,101,32,34,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,116,97,103,65,116,116,114,86,97,108,117,101,0,0,0,0,103,108,84,101,120,116,117,114,101,65,114,114,97,121,0,0,120,118,97,108,117,101,0,0,111,108,0,0,111,112,116,105,111,110,115,0,104,50,0,0,104,101,108,112,46,120,109,108,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,108,105,110,117,120,78,111,68,105,115,112,108,97,121,34,62,68,105,115,112,108,97,121,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,32,98,121,32,97,112,112,108,105,99,97,116,105,111,110,44,32,111,114,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,102,97,105,108,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,71,76,32,105,110,118,97,108,105,100,32,101,110,117,109,46,32,32,0,0,108,105,98,114,97,114,121,44,108,105,98,114,97,114,105,101,115,0,0,0,118,115,78,97,109,101,44,102,115,78,97,109,101,0,0,0,0,0,0,0,120,109,108,77,105,115,115,105,110,103,81,117,111,116,101,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,120,109,108,69,110,100,115,34,62,85,110,101,120,112,101,99,116,101,100,32,101,110,100,32,111,102,32,105,110,112,117,116,46,60,47,101,114,114,111,114,77,115,103,62,0,0,100,97,116,101,0,0,0,0,109,103,84,101,120,116,117,114,101,83,105,122,101,0,0,0,120,58,32,0,104,101,108,112,70,105,108,101,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,108,105,110,117,120,66,97,100,68,105,115,112,108,97,121,34,62,85,110,97,98,108,101,32,116,111,32,99,111,110,110,101,99,116,32,116,111,32,100,105,115,112,108,97,121,46,60,47,101,114,114,111,114,77,115,103,62,0,71,76,32,110,111,32,101,114,114,111,114,46,32,32,0,0,119,105,110,87,114,111,110,103,76,105,98,114,97,114,121,0,103,108,66,97,100,83,104,97,100,101,114,0,120,109,108,77,105,115,115,105,110,103,69,113,117,97,108,115,0,0,0,0,73,110,118,97,108,105,100,32,117,110,105,99,111,100,101,32,98,121,116,101,32,60,118,97,114,32,110,97,109,101,61,34,99,104,97,114,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,111,112,116,105,111,110,66,97,100,80,111,105,110,116,0,0,109,103,65,116,108,97,115,83,105,122,101,0,44,0,0,0,120,108,98,108,0,0,0,0,45,66,0,0,101,114,114,111,114,115,46,116,120,116,0,0,114,105,103,104,116,105,110,115,101,116,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,66,97,100,82,101,103,105,115,116,101,114,34,62,87,105,110,100,111,119,115,58,32,70,97,105,108,101,100,32,116,111,32,114,101,103,105,115,116,101,114,32,119,105,110,100,111,119,32,99,108,97,115,115,46,60,47,101,114,114,111,114,77,115,103,62,0,0,37,120,0,0,108,105,116,84,101,120,116,117,114,101,65,114,114,97,121,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,108,105,110,117,120,66,97,100,67,114,101,97,116,101,34,62,85,110,97,98,108,101,32,116,111,32,99,114,101,97,116,101,32,119,105,110,100,111,119,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,102,111,110,116,0,0,0,0,71,76,95,77,65,88,95,86,69,82,84,69,88,95,84,69,88,84,85,82,69,95,73,77,65,71,69,95,85,78,73,84,83,0,0,0,108,105,98,114,97,114,121,0,37,115,87,101,98,71,76,47,0,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,120,109,108,66,97,100,67,108,111,115,101,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,117,116,102,73,110,118,97,108,105,100,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,37,108,103,32,37,108,103,32,37,108,103,0,105,110,116,101,103,101,114,0,109,103,84,101,120,116,117,114,101,85,110,105,116,37,100,0,67,111,117,114,105,101,114,45,49,48,0,0,80,111,115,105,116,105,111,110,0,0,0,0,108,101,102,116,105,110,115,101,116,0,0,0,67,104,101,99,107,70,114,97,109,101,98,117,102,102,101,114,83,116,97,116,117,115,32,102,97,105,108,101,100,46,0,0,109,97,103,101,110,116,97,0,105,99,111,110,45,37,115,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,108,105,110,117,120,78,117,108,108,67,111,110,102,105,103,34,62,103,108,88,71,101,116,86,105,115,117,97,108,70,114,111,109,70,66,67,111,110,102,105,103,32,114,101,116,117,114,110,101,100,32,110,117,108,108,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,108,105,116,84,101,120,116,117,114,101,0,0,71,76,95,77,65,88,95,86,69,82,84,69,88,95,65,84,84,82,73,66,83,0,0,0,119,105,110,66,97,100,76,105,98,114,97,114,121,0,0,0,59,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,50,100,66,97,100,70,111,110,116,83,112,101,99,34,62,73,110,118,97,108,105,100,32,102,111,110,116,32,115,112,101,99,105,102,105,99,97,116,105,111,110,32,60,118,97,114,32,110,97,109,101,61,34,115,112,101,99,34,47,62,46,60,47,101,114,114,111,114,77,115,103,62,0,0,115,104,97,100,101,114,32,37,115,32,99,111,109,112,105,108,97,116,105,111,110,32,102,97,105,108,101,100,46,0,0,0,115,116,100,58,58,115,116,114,105,110,103,0,93,93,0,0,67,97,110,110,111,116,32,104,97,110,100,108,101,32,85,110,105,99,111,100,101,32,99,104,97,114,32,111,118,101,114,32,50,32,98,121,116,101,115,32,34,60,118,97,114,32,110,97,109,101,61,34,99,104,97,114,34,47,62,34,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,111,112,116,105,111,110,66,97,100,68,111,117,98,108,101,0,98,111,111,108,101,97,110,0,109,103,77,97,116,67,111,108,111,114,0,0,116,105,116,108,101,0,0,0,98,111,116,116,111,109,0,0,99,121,97,110,0,0,0,0,112,101,110,45,37,46,52,102,44,37,46,52,102,44,37,46,52,102,44,37,46,52,102,44,37,46,52,102,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,108,105,110,117,120,78,111,67,111,110,102,105,103,34,62,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,97,32,102,114,97,109,101,98,117,102,102,101,114,32,99,111,110,102,105,103,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,37,115,44,32,37,115,0,0,71,76,95,77,65,88,95,82,69,78,68,69,82,66,85,70,70,69,82,95,83,73,90,69,0,0,0,0,37,115,46,37,115,0,0,0,110,97,109,101,115,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,86,101,114,116,101,120,70,117,108,108,34,62,109,103,71,76,86,101,114,116,101,120,66,117,102,102,101,114,58,32,79,117,116,32,111,102,32,115,112,97,99,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,115,104,97,100,101,114,32,37,115,32,108,111,103,58,10,37,115,0,0,0,100,111,117,98,108,101,0,0,120,109,108,66,97,100,68,111,117,98,108,101,0,0,0,0,60,33,91,67,68,65,84,65,37,99,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,117,116,102,82,97,110,103,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,0,0,0,109,103,76,105,103,104,116,65,109,98,105,101,110,116,0,0,42,87,73,78,68,79,87,42,0,0,0,0,42,83,67,82,79,76,76,66,65,82,42,0,42,76,73,83,84,42,0,0,47,0,0,0,67,104,101,99,107,98,111,120,0,0,0,0,98,111,111,108,0,0,0,0,116,97,103,78,97,109,101,44,97,116,116,114,0,0,0,0,66,117,116,116,111,110,0,0,116,97,103,78,97,109,101,0,109,103,83,104,117,116,100,111,119,110,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,110,111,84,105,109,101,114,34,62,78,111,32,104,105,103,104,32,114,101,115,111,108,117,116,105,111,110,32,116,105,109,101,114,32,97,118,97,105,108,97,98,108,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,116,111,112,0,99,111,108,115,112,97,110,0,100,101,102,97,117,108,116,0,79,112,116,105,111,110,115,58,0,0,0,0,121,101,108,108,111,119,0,0,85,110,107,110,111,119,110,32,101,114,114,111,114,40,37,115,41,0,0,0,98,114,117,115,104,45,37,46,52,102,44,37,46,52,102,44,37,46,52,102,44,37,46,52,102,0,0,0,119,116,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,78,111,68,105,115,112,108,97,121,34,62,68,105,115,112,108,97,121,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,32,98,121,32,97,112,112,108,105,99,97,116,105,111,110,44,32,111,114,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,102,97,105,108,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,92,0,0,0,70,79,86,0,111,110,70,114,97,109,101,0,71,76,95,77,65,88,95,84,69,88,84,85,82,69,95,83,73,90,69,0,117,112,70,114,97,109,101,0,42,83,67,82,79,76,76,80,65,78,69,42,0,0,0,0,116,101,120,116,67,111,108,111,114,0,0,0,108,105,98,114,97,114,105,101,115,0,0,0,102,114,97,109,101,0,0,0,105,116,97,108,105,99,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,73,110,100,101,120,70,117,108,108,34,62,109,103,71,76,73,110,100,101,120,66,117,102,102,101,114,58,32,79,117,116,32,111,102,32,115,112,97,99,101,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,114,101,100,0,108,101,110,103,116,104,0,0,100,105,115,112,108,97,121,76,105,110,101,115,0,0,0,0,115,104,97,100,101,114,32,37,115,32,99,111,109,112,105,108,101,100,0,0,102,108,111,97,116,0,0,0,37,108,103,0,60,33,91,67,68,65,84,37,99,0,0,0,73,110,118,97,108,105,100,32,85,84,70,45,56,32,99,111,100,101,32,60,118,97,114,32,110,97,109,101,61,34,99,104,97,114,34,47,62,32,45,45,32,116,111,111,32,109,97,110,121,32,99,111,110,116,105,110,117,97,116,105,111,110,32,98,121,116,101,115,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,0,111,112,116,105,111,110,66,97,100,73,110,116,101,103,101,114,0,0,0,0,116,121,112,101,0,0,0,0,109,103,76,105,103,104,116,67,111,108,111,114,0,0,0,0,110,0,0,0,115,108,105,100,101,114,68,111,119,110,70,114,97,109,101,0,110,110,110,110,110,110,110,110,0,0,0,0,42,70,73,69,76,68,42,0,42,67,72,69,67,75,66,79,88,42,0,0,65,114,105,97,108,45,49,48,0,0,0,0,71,101,111,114,103,105,97,0,109,103,75,101,121,67,104,97,114,0,0,0,118,97,108,105,103,110,0,0,114,111,119,115,112,97,110,0,99,117,114,115,111,114,68,101,102,110,0,0,104,114,0,0,73,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,119,105,110,70,117,108,108,115,99,114,101,101,110,34,62,70,117,108,108,115,99,114,101,101,110,32,109,111,100,101,32,102,97,105,108,101,100,46,60,47,101,114,114,111,114,77,115,103,62,0,100,112,105,0,71,76,95,77,65,88,95,84,69,88,84,85,82,69,95,73,77,65,71,69,95,85,78,73,84,83,0,0,119,105,110,78,111,76,105,98,114,97,114,121,0,0,0,0,118,101,114,116,67,111,108,111,114,0,0,0,98,111,108,100,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,103,108,86,101,114,116,101,120,82,101,115,101,116,34,62,109,103,71,76,86,101,114,116,101,120,66,117,102,102,101,114,58,32,82,101,115,101,116,32,111,102,32,115,116,97,116,105,99,32,98,117,102,102,101,114,46,60,47,101,114,114,111,114,77,115,103,62,0,0,0,115,104,97,100,101,114,32,37,115,32,110,111,116,32,102,111,117,110,100,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,0,0,120,109,108,66,97,100,73,110,116,101,103,101,114,0,0,0,60,33,91,67,68,65,37,99,0,0,0,0,60,101,114,114,111,114,77,115,103,32,105,100,61,34,117,116,102,67,111,110,116,105,110,117,101,34,62,60,118,97,114,32,110,97,109,101,61,34,102,105,108,101,110,97,109,101,34,47,62,44,32,108,105,110,101,32,60,118,97,114,32,110,97,109,101,61,34,108,105,110,101,34,47,62,44,32,99,111,108,32,60,118,97,114,32,110,97,109,101,61,34,99,111,108,34,47,62,58,32,0,110,97,109,101,0,0,0,0,95,0,0,0,109,103,76,105,103,104,116,68,105,114,0,0,115,108,105,100,101,114,72,111,118,101,114,70,114,97,109,101,0,0,0,0,105,116,101,109,68,105,115,67,111,108,111,114,0,0,0,0,42,84,65,66,66,69,68,42,0,0,0,0,109,103,86,105,101,119,82,101,115,105,122,101,100,0,0,0,104,101,108,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,16,80,0,68,16,80,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,140,126,80,0,232,0,0,0,234,0,0,0,246,7,0,0,0,0,0,0,0,0,0,0,224,126,80,0,36,10,0,0,32,3,0,0,54,2,0,0,152,5,0,0,104,6,0,0,0,0,0,0,0,0,0,0,236,126,80,0,36,10,0,0,156,7,0,0,54,2,0,0,152,5,0,0,32,0,0,0,170,1,0,0,52,10,0,0,212,3,0,0,0,0,0,0,0,0,0,0,60,127,80,0,108,0,0,0,206,1,0,0,52,3,0,0,4,1,0,0,210,9,0,0,192,0,0,0,218,3,0,0,40,8,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,80,127,80,0,100,5,0,0,20,6,0,0,52,4,0,0,86,8,0,0,210,9,0,0,236,5,0,0,250,3,0,0,22,5,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,92,127,80,0,108,2,0,0,196,6,0,0,142,2,0,0,68,6,0,0,210,9,0,0,240,4,0,0,212,9,0,0,56,4,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,104,127,80,0,176,1,0,0,206,0,0,0,130,8,0,0,30,4,0,0,210,9,0,0,206,8,0,0,238,6,0,0,80,7,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,116,127,80,0,230,0,0,0,10,7,0,0,0,0,0,0,0,0,0,0,128,127,80,0,184,8,0,0,244,2,0,0,232,7,0,0,84,9,0,0,220,5,0,0,72,0,0,0,208,2,0,0,30,1,0,0,96,0,0,0,158,3,0,0,88,6,0,0,94,10,0,0,0,0,0,0,0,0,0,0,140,127,80,0,214,3,0,0,238,0,0,0,24,5,0,0,76,8,0,0,210,9,0,0,180,1,0,0,32,7,0,0,46,9,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,152,127,80,0,40,3,0,0,150,7,0,0,110,7,0,0,176,3,0,0,210,9,0,0,44,1,0,0,76,10,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,164,127,80,0,40,4,0,0,192,8,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,232,4,0,0,210,1,0,0,122,8,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,0,0,0,0,0,0,0,0,180,127,80,0,126,6,0,0,2,2,0,0,110,7,0,0,76,8,0,0,210,9,0,0,44,1,0,0,76,10,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,188,127,80,0,78,1,0,0,200,7,0,0,0,0,0,0,0,0,0,0,196,127,80,0,22,10,0,0,218,1,0,0,0,0,0,0,0,0,0,0,204,127,80,0,64,3,0,0,98,8,0,0,152,1,0,0,76,8,0,0,210,9,0,0,82,1,0,0,222,0,0,0,142,4,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,216,127,80,0,214,2,0,0,162,2,0,0,152,8,0,0,66,0,0,0,76,1,0,0,38,1,0,0,250,5,0,0,54,3,0,0,60,8,0,0,148,7,0,0,166,5,0,0,168,6,0,0,208,5,0,0,140,0,0,0,80,0,0,0,252,255,255,255,216,127,80,0,44,4,0,0,248,255,255,255,216,127,80,0,208,4,0,0,0,0,0,0,0,0,0,0,0,128,80,0,196,4,0,0,20,9,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,32,5,0,0,178,6,0,0,160,6,0,0,50,7,0,0,100,2,0,0,122,2,0,0,112,3,0,0,124,0,0,0,162,5,0,0,106,2,0,0,180,3,0,0,232,9,0,0,252,1,0,0,200,6,0,0,240,0,0,0,112,6,0,0,156,4,0,0,106,3,0,0,6,10,0,0,118,2,0,0,0,0,0,0,0,0,0,0,20,128,80,0,206,3,0,0,228,0,0,0,0,0,0,0,0,0,0,0,28,128,80,0,86,5,0,0,214,8,0,0,100,9,0,0,240,3,0,0,198,3,0,0,168,2,0,0,136,9,0,0,0,0,0,0,0,0,0,0,40,128,80,0,232,6,0,0,28,9,0,0,0,0,0,0,0,0,0,0,52,128,80,0,34,3,0,0,128,2,0,0,0,0,0,0,0,0,0,0,64,128,80,0,42,8,0,0,196,0,0,0,232,7,0,0,84,9,0,0,220,5,0,0,72,0,0,0,208,2,0,0,30,1,0,0,96,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,76,128,80,0,128,4,0,0,92,1,0,0,0,0,0,0,0,0,0,0,88,128,80,0,4,3,0,0,0,3,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,212,1,0,0,184,7,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,28,1,0,0,220,7,0,0,82,3,0,0,248,2,0,0,60,10,0,0,0,0,0,0,0,0,0,0,100,128,80,0,220,9,0,0,92,2,0,0,86,0,0,0,56,10,0,0,214,4,0,0,0,0,0,0,0,0,0,0,112,128,80,0,224,1,0,0,116,4,0,0,134,9,0,0,162,9,0,0,136,0,0,0,0,0,0,0,0,0,0,0,124,128,80,0,186,7,0,0,194,1,0,0,86,7,0,0,182,6,0,0,0,0,0,0,0,0,0,0,148,128,80,0,232,5,0,0,104,0,0,0,62,4,0,0,14,1,0,0,160,2,0,0,64,0,0,0,82,5,0,0,202,7,0,0,90,10,0,0,0,0,0,0,0,0,0,0,156,128,80,0,46,4,0,0,168,4,0,0,34,8,0,0,140,2,0,0,74,1,0,0,20,1,0,0,188,6,0,0,142,6,0,0,64,10,0,0,0,0,0,0,0,0,0,0,164,128,80,0,76,4,0,0,54,0,0,0,228,7,0,0,54,1,0,0,0,0,0,0,0,0,0,0,176,128,80,0,112,5,0,0,128,1,0,0,70,10,0,0,18,3,0,0,2,10,0,0,0,0,0,0,0,0,0,0,188,128,80,0,142,9,0,0,6,5,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,58,8,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,232,4,0,0,238,2,0,0,142,1,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,100,3,0,0,64,7,0,0,84,1,0,0,248,4,0,0,248,0,0,0,44,2,0,0,56,6,0,0,172,6,0,0,6,2,0,0,116,255,255,255,188,128,80,0,240,2,0,0,82,9,0,0,8,1,0,0,18,1,0,0,68,0,0,0,0,0,0,0,0,0,0,0,4,129,80,0,88,4,0,0,54,8,0,0,10,10,0,0,78,4,0,0,220,1,0,0,136,6,0,0,52,1,0,0,90,6,0,0,176,0,0,0,0,0,0,0,0,0,0,0,12,129,80,0,226,3,0,0,2,1,0,0,112,0,0,0,70,7,0,0,82,0,0,0,222,6,0,0,236,4,0,0,0,0,0,0,0,0,0,0,24,129,80,0,102,1,0,0,224,7,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,34,6,0,0,86,10,0,0,186,9,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,134,7,0,0,110,10,0,0,204,7,0,0,28,4,0,0,114,0,0,0,202,6,0,0,196,3,0,0,188,7,0,0,12,10,0,0,174,6,0,0,148,4,0,0,46,6,0,0,190,6,0,0,200,0,0,0,92,4,0,0,244,7,0,0,116,255,255,255,24,129,80,0,148,9,0,0,26,0,0,0,226,2,0,0,212,5,0,0,56,3,0,0,166,4,0,0,30,5,0,0,112,255,255,255,24,129,80,0,46,3,0,0,224,9,0,0,10,5,0,0,124,10,0,0,74,3,0,0,102,0,0,0,96,4,0,0,108,255,255,255,24,129,80,0,242,0,0,0,0,0,0,0,0,0,0,0,64,129,80,0,230,2,0,0,228,6,0,0,26,5,0,0,110,0,0,0,110,0,0,0,4,4,0,0,160,3,0,0,76,6,0,0,242,3,0,0,8,4,0,0,110,0,0,0,12,4,0,0,130,4,0,0,230,3,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,214,9,0,0,224,3,0,0,68,4,0,0,140,8,0,0,94,8,0,0,144,1,0,0,144,9,0,0,92,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,16,1,0,0,172,8,0,0,148,3,0,0,110,0,0,0,76,5,0,0,110,0,0,0,0,0,0,0,0,0,0,0,92,129,80,0,76,3,0,0,128,6,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,212,1,0,0,184,7,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,28,1,0,0,220,7,0,0,82,3,0,0,248,2,0,0,60,10,0,0,0,0,0,0,0,0,0,0,112,129,80,0,70,0,0,0,138,1,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,66,9,0,0,34,5,0,0,172,4,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,244,0,0,0,28,2,0,0,42,4,0,0,254,5,0,0,58,0,0,0,24,2,0,0,102,6,0,0,204,2,0,0,234,2,0,0,32,1,0,0,120,1,0,0,204,8,0,0,180,4,0,0,116,255,255,255,112,129,80,0,202,1,0,0,36,8,0,0,104,4,0,0,112,2,0,0,38,3,0,0,100,1,0,0,98,5,0,0,0,0,0,0,0,0,0,0,160,129,80,0,94,2,0,0,8,7,0,0,170,7,0,0,124,6,0,0,26,7,0,0,20,4,0,0,146,5,0,0,28,6,0,0,172,2,0,0,62,0,0,0,38,6,0,0,128,0,0,0,52,5,0,0,130,0,0,0,180,5,0,0,68,2,0,0,48,4,0,0,40,5,0,0,156,6,0,0,204,0,0,0,72,4,0,0,22,3,0,0,178,2,0,0,42,9,0,0,8,0,0,0,130,1,0,0,166,3,0,0,84,0,0,0,250,1,0,0,90,8,0,0,10,6,0,0,230,9,0,0,62,6,0,0,200,3,0,0,128,5,0,0,96,3,0,0,106,7,0,0,24,6,0,0,222,4,0,0,182,8,0,0,184,0,0,0,4,6,0,0,102,5,0,0,60,1,0,0,94,9,0,0,0,9,0,0,0,0,0,0,0,0,0,0,172,129,80,0,184,2,0,0,92,9,0,0,52,9,0,0,240,1,0,0,22,7,0,0,190,7,0,0,78,9,0,0,44,9,0,0,26,8,0,0,0,0,0,0,0,0,0,0,240,129,80,0,48,10,0,0,228,5,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,88,10,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,104,3,0,0,30,8,0,0,140,4,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,88,9,0,0,84,8,0,0,220,3,0,0,210,7,0,0,138,2,0,0,220,6,0,0,8,3,0,0,144,0,0,0,60,0,0,0,178,9,0,0,182,4,0,0,160,7,0,0,90,3,0,0,28,0,0,0,254,3,0,0,124,2,0,0,38,2,0,0,182,2,0,0,104,2,0,0,216,7,0,0,190,5,0,0,150,1,0,0,154,3,0,0,194,2,0,0,220,0,0,0,44,0,0,0,232,8,0,0,174,0,0,0,116,255,255,255,240,129,80,0,250,0,0,0,212,2,0,0,72,10,0,0,106,10,0,0,90,4,0,0,162,1,0,0,198,2,0,0,112,255,255,255,240,129,80,0,48,5,0,0,0,0,0,0,0,0,0,0,24,130,80,0,134,5,0,0,20,8,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,128,7,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,112,4,0,0,36,6,0,0,166,6,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,160,8,0,0,58,1,0,0,54,9,0,0,172,3,0,0,110,6,0,0,144,2,0,0,106,1,0,0,24,10,0,0,48,2,0,0,190,9,0,0,168,5,0,0,116,255,255,255,24,130,80,0,92,5,0,0,78,2,0,0,68,10,0,0,74,8,0,0,34,0,0,0])
.concat([0,0,0,0,0,0,0,0,64,130,80,0,228,1,0,0,200,8,0,0,20,5,0,0,58,5,0,0,130,2,0,0,124,4,0,0,106,0,0,0,158,4,0,0,60,3,0,0,0,0,0,0,0,0,0,0,72,130,80,0,254,6,0,0,230,7,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,88,130,80,0,232,2,0,0,0,1,0,0,110,7,0,0,76,8,0,0,210,9,0,0,44,1,0,0,86,6,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,100,130,80,0,48,0,0,0,70,4,0,0,110,7,0,0,30,2,0,0,210,9,0,0,44,1,0,0,76,10,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,124,130,80,0,254,9,0,0,248,5,0,0,90,0,0,0,90,5,0,0,156,0,0,0,252,3,0,0,12,2,0,0,24,4,0,0,104,9,0,0,210,4,0,0,78,5,0,0,132,1,0,0,30,10,0,0,0,0,0,0,0,0,0,0,136,130,80,0,230,2,0,0,228,6,0,0,26,5,0,0,182,0,0,0,94,6,0,0,4,4,0,0,160,3,0,0,76,6,0,0,242,3,0,0,8,4,0,0,116,9,0,0,12,4,0,0,130,4,0,0,230,3,0,0,190,4,0,0,226,9,0,0,222,9,0,0,204,6,0,0,42,2,0,0,52,0,0,0,88,2,0,0,168,7,0,0,150,3,0,0,144,5,0,0,214,1,0,0,10,4,0,0,18,9,0,0,22,0,0,0,216,3,0,0,222,3,0,0,116,2,0,0,178,0,0,0,206,5,0,0,216,2,0,0,56,7,0,0,164,8,0,0,178,1,0,0,228,2,0,0,126,5,0,0,0,5,0,0,138,4,0,0,162,4,0,0,74,7,0,0,22,8,0,0,134,4,0,0,194,3,0,0,208,0,0,0,180,2,0,0,30,6,0,0,4,9,0,0,152,6,0,0,214,7,0,0,144,3,0,0,26,6,0,0,214,9,0,0,224,3,0,0,68,4,0,0,140,8,0,0,94,8,0,0,144,1,0,0,144,9,0,0,92,0,0,0,92,6,0,0,166,8,0,0,142,7,0,0,164,3,0,0,244,9,0,0,114,7,0,0,148,8,0,0,222,2,0,0,172,7,0,0,210,2,0,0,176,4,0,0,176,7,0,0,244,5,0,0,16,1,0,0,68,1,0,0,138,8,0,0,102,3,0,0,76,5,0,0,74,0,0,0,72,9,0,0,6,6,0,0,0,0,0,0,0,0,0,0,148,130,80,0,30,0,0,0,174,5,0,0,122,4,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,164,130,80,0,82,6,0,0,236,9,0,0,110,0,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,172,130,80,0,200,1,0,0,136,8,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,204,130,80,0,6,4,0,0,194,7,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,134,10,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,248,3,0,0,98,0,0,0,174,8,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,46,0,0,0,208,1,0,0,120,7,0,0,50,0,0,0,112,8,0,0,176,9,0,0,204,4,0,0,228,9,0,0,118,3,0,0,254,0,0,0,70,3,0,0,100,10,0,0,62,7,0,0,208,9,0,0,126,3,0,0,36,7,0,0,116,255,255,255,204,130,80,0,156,8,0,0,112,255,255,255,204,130,80,0,190,0,0,0,16,7,0,0,108,5,0,0,108,9,0,0,228,8,0,0,140,6,0,0,138,9,0,0,0,0,0,0,0,0,0,0,244,130,80,0,126,1,0,0,248,7,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,44,5,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,26,9,0,0,216,9,0,0,124,9,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,244,3,0,0,244,1,0,0,64,5,0,0,10,3,0,0,26,3,0,0,116,6,0,0,186,2,0,0,108,4,0,0,252,9,0,0,230,8,0,0,174,1,0,0,116,255,255,255,244,130,80,0,26,4,0,0,0,8,0,0,150,0,0,0,54,10,0,0,240,6,0,0,202,8,0,0,120,6,0,0,0,0,0,0,0,0,0,0,20,131,80,0,162,7,0,0,48,1,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,12,5,0,0,174,9,0,0,80,10,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,148,6,0,0,208,8,0,0,36,1,0,0,2,8,0,0,14,2,0,0,136,1,0,0,98,2,0,0,58,6,0,0,138,0,0,0,70,2,0,0,44,3,0,0,170,6,0,0,74,5,0,0,82,7,0,0,116,255,255,255,20,131,80,0,170,9,0,0,52,2,0,0,172,5,0,0,76,2,0,0,102,8,0,0,76,7,0,0,206,7,0,0,112,255,255,255,20,131,80,0,84,7,0,0,226,4,0,0,0,0,0,0,0,0,0,0,72,131,80,0,56,8,0,0,192,9,0,0,198,6,0,0,156,9,0,0,118,1,0,0,66,7,0,0,80,6,0,0,28,3,0,0,240,5,0,0,16,6,0,0,112,10,0,0,238,5,0,0,124,5,0,0,54,7,0,0,34,1,0,0,78,7,0,0,188,2,0,0,218,9,0,0,164,7,0,0,168,8,0,0,132,3,0,0,26,2,0,0,18,10,0,0,116,0,0,0,134,8,0,0,228,3,0,0,66,8,0,0,250,6,0,0,100,0,0,0,132,7,0,0,120,5,0,0,76,9,0,0,186,6,0,0,58,7,0,0,154,8,0,0,188,4,0,0,16,5,0,0,74,6,0,0,86,1,0,0,220,2,0,0,2,6,0,0,146,2,0,0,132,5,0,0,16,4,0,0,106,9,0,0,98,6,0,0,66,5,0,0,142,0,0,0,0,0,0,0,0,0,0,0,96,131,80,0,142,8,0,0,42,3,0,0,54,5,0,0,108,1,0,0,134,2,0,0,200,2,0,0,244,8,0,0,38,10,0,0,30,3,0,0,58,9,0,0,0,0,0,0,0,0,0,0,108,131,80,0,150,8,0,0,116,5,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,212,1,0,0,184,7,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,28,1,0,0,220,7,0,0,82,3,0,0,248,2,0,0,60,10,0,0,0,0,0,0,0,0,0,0,120,131,80,0,214,6,0,0,120,2,0,0,0,0,0,0,0,0,0,0,132,131,80,0,2,4,0,0,110,9,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,140,131,80,0,58,2,0,0,134,6,0,0,242,2,0,0,194,6,0,0,34,9,0,0,66,1,0,0,122,6,0,0,62,10,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,152,131,80,0,142,3,0,0,98,4,0,0,24,1,0,0,14,7,0,0,246,4,0,0,126,9,0,0,174,7,0,0,52,8,0,0,50,4,0,0,44,7,0,0,10,0,0,0,222,8,0,0,64,9,0,0,0,2,0,0,146,3,0,0,82,8,0,0,222,5,0,0,194,5,0,0,180,7,0,0,50,5,0,0,32,8,0,0,32,2,0,0,14,4,0,0,110,1,0,0,216,6,0,0,188,8,0,0,186,0,0,0,152,4,0,0,36,0,0,0,130,3,0,0,132,4,0,0,66,6,0,0,160,4,0,0,212,0,0,0,0,0,0,0,0,0,0,0,164,131,80,0,110,4,0,0,242,4,0,0,26,1,0,0,106,6,0,0,38,0,0,0,18,6,0,0,242,9,0,0,186,8,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,176,131,80,0,250,7,0,0,142,5,0,0,244,6,0,0,136,5,0,0,82,2,0,0,68,8,0,0,246,2,0,0,80,2,0,0,224,6,0,0,240,8,0,0,66,10,0,0,232,3,0,0,112,7,0,0,96,7,0,0,208,7,0,0,0,0,0,0,0,0,0,0,184,131,80,0,60,6,0,0,116,10,0,0,192,2,0,0,62,5,0,0,146,7,0,0,134,1,0,0,118,7,0,0,194,8,0,0,46,7,0,0,232,1,0,0,6,7,0,0,158,9,0,0,158,6,0,0,32,5,0,0,178,6,0,0,160,6,0,0,50,7,0,0,100,2,0,0,122,2,0,0,112,3,0,0,124,0,0,0,162,5,0,0,106,2,0,0,180,3,0,0,232,9,0,0,252,1,0,0,200,6,0,0,240,0,0,0,112,6,0,0,156,4,0,0,106,3,0,0,6,10,0,0,118,2,0,0,0,0,0,0,0,0,0,0,196,131,80,0,226,0,0,0,44,10,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,28,7,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,232,4,0,0,0,6,0,0,198,8,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,250,8,0,0,136,3,0,0,98,7,0,0,234,1,0,0,100,7,0,0,0,0,0,0,0,0,0,0,208,131,80,0,110,5,0,0,60,4,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,90,2,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,94,4,0,0,158,2,0,0,144,4,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,6,9,0,0,32,6,0,0,114,10,0,0,176,8,0,0,196,5,0,0,16,2,0,0,236,6,0,0,140,9,0,0,192,6,0,0,180,0,0,0,94,1,0,0,116,255,255,255,208,131,80,0,94,0,0,0,12,7,0,0,60,9,0,0,48,9,0,0,156,2,0,0,216,0,0,0,226,1,0,0,0,0,0,0,0,0,0,0,240,131,80,0,154,5,0,0,248,6,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,154,1,0,0,200,4,0,0,154,0,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,154,9,0,0,56,0,0,0,0,0,0,0,0,0,0,0,252,131,80,0,234,5,0,0,164,6,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,70,9,0,0,192,5,0,0,8,8,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,44,6,0,0,116,3,0,0,226,6,0,0,134,0,0,0,110,8,0,0,158,7,0,0,234,4,0,0,208,3,0,0,114,9,0,0,28,10,0,0,90,7,0,0,208,6,0,0,102,7,0,0,246,9,0,0,92,8,0,0,246,6,0,0,94,5,0,0,150,5,0,0,84,2,0,0,62,1,0,0,116,7,0,0,218,2,0,0,242,1,0,0,116,255,255,255,252,131,80,0,236,1,0,0,6,1,0,0,38,5,0,0,112,255,255,255,252,131,80,0,194,9,0,0,94,7,0,0,120,9,0,0,16,9,0,0,122,7,0,0,88,7,0,0,182,9,0,0,108,255,255,255,252,131,80,0,38,9,0,0,42,7,0,0,0,0,0,0,0,0,0,0,44,132,80,0,12,8,0,0,238,3,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,158,1,0,0,166,2,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,68,3,0,0,132,0,0,0,156,5,0,0,106,8,0,0,238,8,0,0,18,7,0,0,0,0,0,0,0,0,0,0,56,132,80,0,166,7,0,0,252,6,0,0,164,0,0,0,76,8,0,0,210,9,0,0,116,1,0,0,34,2,0,0,224,2,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,88,132,80,0,246,1,0,0,198,0,0,0,82,10,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,108,132,80,0,62,9,0,0,168,3,0,0,110,7,0,0,76,8,0,0,210,9,0,0,44,1,0,0,86,2,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,120,132,80,0,158,8,0,0,178,8,0,0,6,3,0,0,248,8,0,0,210,9,0,0,44,1,0,0,76,10,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,132,132,80,0,110,3,0,0,192,7,0,0,110,7,0,0,128,3,0,0,210,9,0,0,190,1,0,0,200,9,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,144,132,80,0,220,4,0,0,182,7,0,0,138,3,0,0,32,4,0,0,120,8,0,0,44,1,0,0,76,10,0,0,120,0,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,164,132,80,0,212,8,0,0,42,0,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,122,5,0,0,182,3,0,0,106,4,0,0,168,1,0,0,66,4,0,0,140,5,0,0,170,3,0,0,40,7,0,0,136,10,0,0,0,0,0,0,0,0,0,0,172,132,80,0,130,9,0,0,36,9,0,0,132,2,0,0,108,3,0,0,146,6,0,0,52,7,0,0,18,2,0,0,46,5,0,0,24,7,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,216,5,0,0,50,1,0,0,104,8,0,0,20,3,0,0,122,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,232,4,0,0,210,1,0,0,122,8,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,184,1,0,0,50,8,0,0,202,3,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,254,7,0,0,38,8,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,130,10,0,0,78,10,0,0,68,7,0,0,84,3,0,0,42,5,0,0,178,5,0,0,148,0,0,0,60,5,0,0,138,7,0,0,118,10,0,0,214,5,0,0,236,8,0,0,236,7,0,0,172,1,0,0,202,4,0,0,250,9,0,0,246,8,0,0,202,5,0,0,86,4,0,0,68,9,0,0,170,4,0,0,2,7,0,0,96,1,0,0,116,255,255,255,172,132,80,0,238,4,0,0,166,1,0,0,4,0,0,0,124,1,0,0,210,6,0,0,50,3,0,0,252,0,0,0,236,0,0,0,184,6,0,0,0,0,0,0,0,0,0,0,204,132,80,0,132,6,0,0,114,1,0,0,14,5,0,0,252,7,0,0,18,5,0,0,180,8,0,0,120,3,0,0,122,3,0,0,58,10,0,0,100,4,0,0,146,8,0,0,62,3,0,0,198,7,0,0,96,2,0,0,36,4,0,0,12,1,0,0,180,6,0,0,0,0,0,0,0,0,0,0,216,132,80,0,146,4,0,0,30,9,0,0,0,0,0,0,0,0,0,0,224,132,80,0,2,0,0,0,130,6,0,0,192,3,0,0,0,0,0,0,0,0,0,0,236,132,80,0,216,8,0,0,182,5,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,56,1,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,98,1,0,0,200,5,0,0,126,7,0,0,178,4,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,38,4,0,0,236,3,0,0,186,3,0,0,184,9,0,0,48,3,0,0,96,10,0,0,112,9,0,0,174,4,0,0,202,9,0,0,126,4,0,0,170,2,0,0,42,10,0,0,192,1,0,0,74,9,0,0,166,0,0,0,84,10,0,0,4,7,0,0,42,1,0,0,38,7,0,0,226,5,0,0,146,1,0,0,204,3,0,0,164,5,0,0,204,5,0,0,0,4,0,0,116,255,255,255,236,132,80,0,72,2,0,0,224,8,0,0,4,2,0,0,138,6,0,0,178,3,0,0,222,7,0,0,120,4,0,0,112,255,255,255,236,132,80,0,218,5,0,0,50,10,0,0,108,255,255,255,236,132,80,0,198,1,0,0,158,0,0,0,98,10,0,0,116,8,0,0,114,4,0,0,0,0,0,0,0,0,0,0,28,133,80,0,210,5,0,0,28,5,0,0,110,7,0,0,250,2,0,0,210,9,0,0,44,1,0,0,76,10,0,0,242,6,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,40,133,80,0,12,3,0,0,70,6,0,0,82,4,0,0,140,3,0,0,210,9,0,0,40,9,0,0,146,0,0,0,144,8,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,52,133,80,0,56,8,0,0,192,9,0,0,198,6,0,0,156,9,0,0,118,1,0,0,66,7,0,0,80,6,0,0,28,3,0,0,240,5,0,0,16,6,0,0,112,10,0,0,238,5,0,0,124,5,0,0,54,7,0,0,34,1,0,0,78,7,0,0,188,2,0,0,218,9,0,0,164,7,0,0,190,2,0,0,186,5,0,0,26,2,0,0,164,2,0,0,104,1,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,2,6,0,0,0,0,0,0,0,0,0,0,64,133,80,0,130,7,0,0,40,6,0,0,170,5,0,0,102,10,0,0,72,8,0,0,104,5,0,0,20,0,0,0,188,0,0,0,64,4,0,0,192,4,0,0,190,3,0,0,242,8,0,0,184,3,0,0,152,9,0,0,216,1,0,0,20,7,0,0,224,0,0,0,168,9,0,0,16,8,0,0,122,1,0,0,176,2,0,0,92,7,0,0,144,7,0,0,48,6,0,0,62,2,0,0,186,1,0,0,98,3,0,0,102,9,0,0,0,0,0,0,0,0,0,0,76,133,80,0,230,4,0,0,184,5,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,28,8,0,0,126,2,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,240,7,0,0,146,9,0,0,238,9,0,0,134,3,0,0,148,2,0,0,250,4,0,0,96,9,0,0,108,10,0,0,4,8,0,0,234,9,0,0,246,5,0,0,0,0,0,0,0,0,0,0,88,133,80,0,24,9,0,0,212,4,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,212,1,0,0,184,7,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,28,1,0,0,220,7,0,0,82,3,0,0,248,2,0,0,60,10,0,0,0,0,0,0,0,0,0,0,100,133,80,0,254,1,0,0,252,5,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,218,8,0,0,166,9,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,0,0,0,0,0,0,0,0,112,133,80,0,178,7,0,0,136,4,0,0,164,1,0,0,110,2,0,0,16,0,0,0,44,1,0,0,76,10,0,0,204,9,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,124,133,80,0,96,8,0,0,94,3,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,218,0,0,0,236,2,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,0,0,0,0,0,0,0,0,136,133,80,0,78,6,0,0,90,1,0,0,16,10,0,0,18,8,0,0,118,4,0,0,168,2,0,0,170,0,0,0,0,0,0,0,0,0,0,0,156,133,80,0,238,1,0,0,190,8,0,0,0,0,0,0,0,0,0,0,164,133,80,0,130,5,0,0,50,6,0,0,254,8,0,0,24,3,0,0,88,8,0,0,44,1,0,0,76,10,0,0,252,4,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,176,133,80,0,234,6,0,0,162,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,110,0,0,0,0,0,0,0,0,0,0,0,192,133,80,0,86,3,0,0,132,8,0,0,14,5,0,0,252,7,0,0,18,5,0,0,180,8,0,0,120,3,0,0,122,3,0,0,58,10,0,0,100,4,0,0,146,8,0,0,62,3,0,0,198,7,0,0,96,2,0,0,36,4,0,0,12,1,0,0,144,6,0,0,0,0,0,0,0,0,0,0,204,133,80,0,12,9,0,0,114,8,0,0,102,2,0,0,62,8,0,0,162,6,0,0,20,10,0,0,96,5,0,0,46,2,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,216,133,80,0,14,8,0,0,132,9,0,0,0,0,0,0,0,0,0,0,232,133,80,0,106,5,0,0,194,4,0,0,0,0,0,0,0,0,0,0,240,133,80,0,124,8,0,0,140,7,0,0,72,7,0,0,218,7,0,0,70,1,0,0,196,9,0,0,252,2,0,0,152,3,0,0,0,0,0,0,0,0,0,0,248,133,80,0,72,6,0,0,248,1,0,0,104,7,0,0,70,8,0,0,206,9,0,0,44,1,0,0,76,10,0,0,188,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,4,134,80,0,108,8,0,0,182,1,0,0,0,0,0,0,0,0,0,0,16,134,80,0,172,9,0,0,230,1,0,0,0,0,0,0,0,0,0,0,24,134,80,0,0,7,0,0,254,2,0,0,132,2,0,0,108,3,0,0,146,6,0,0,136,2,0,0,18,2,0,0,46,5,0,0,22,2,0,0,50,9,0,0,230,5,0,0,246,0,0,0,176,6,0,0,242,7,0,0,108,7,0,0,86,9,0,0,80,4,0,0,24,0,0,0,228,4,0,0,74,4,0,0,156,1,0,0,40,10,0,0,66,3,0,0,234,7,0,0,78,3,0,0,64,8,0,0,4,5,0,0,162,8,0,0,124,3,0,0,8,9,0,0,234,3,0,0,60,2,0,0,50,1,0,0,104,8,0,0,18,0,0,0,128,9,0,0,172,0,0,0,8,2,0,0,40,1,0,0,102,4,0,0,226,8,0,0,224,5,0,0,210,0,0,0,88,0,0,0,138,5,0,0,36,3,0,0,16,3,0,0,78,8,0,0,124,7,0,0,42,6,0,0,34,4,0,0,14,3,0,0,92,3,0,0,152,2,0,0,234,8,0,0,202,2,0,0,20,2,0,0,246,3,0,0,46,1,0,0,80,5,0,0,36,5,0,0,140,1,0,0,212,7,0,0,88,1,0,0,242,5,0,0,10,9,0,0,196,2,0,0,50,2,0,0,10,1,0,0,18,4,0,0,206,4,0,0,118,0,0,0,14,0,0,0,188,9,0,0,174,2,0,0,212,6,0,0,122,0,0,0,80,8,0,0,32,9,0,0,78,0,0,0,72,5,0,0,54,6,0,0,216,4,0,0,40,0,0,0,14,10,0,0,196,1,0,0,56,2,0,0,12,6,0,0,96,6,0,0,2,9,0,0,206,6,0,0,24,8,0,0,118,6,0,0,170,8,0,0,84,4,0,0,162,3,0,0,60,7,0,0,2,3,0,0,88,3,0,0,80,3,0,0,8,6,0,0,114,6,0,0,80,9,0,0,152,0,0,0,154,7,0,0,8,5,0,0,230,6,0,0,26,10,0,0,150,6,0,0,46,8,0,0,132,10,0,0,6,0,0,0,22,6,0,0,116,255,255,255,24,134,80,0,118,8,0,0,196,8,0,0,160,0,0,0,40,2,0,0,58,3,0,0,150,9,0,0,114,2,0,0,160,1,0,0,198,9,0,0,164,9,0,0,64,1,0,0,14,9,0,0,0,0,0,0,0,0,0,0,56,134,80,0,176,5,0,0,154,2,0,0,152,7,0,0,150,2,0,0,126,8,0,0,126,0,0,0,150,4,0,0,48,8,0,0,84,6,0,0,168,0,0,0,220,8,0,0,198,5,0,0,32,10,0,0,164,4,0,0,252,8,0,0,58,4,0,0,2,5,0,0,4,10,0,0,136,10,0,0,202,0,0,0,100,8,0,0,210,3,0,0,84,5,0,0,206,2,0,0,222,1,0,0,100,6,0,0,0,0,0,0,0,0,0,0,68,134,80,0,44,8,0,0,160,9,0,0,80,1,0,0,118,5,0,0,74,2,0,0,44,1,0,0,76,10,0,0,244,4,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,80,134,80,0,30,7,0,0,188,5,0,0,0,0,0,0,0,0,0,0,88,134,80,0,12,0,0,0,0,10,0,0,22,9,0,0,76,8,0,0,210,9,0,0,196,7,0,0,226,7,0,0,204,1,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,100,134,80,0,22,1,0,0,120,10,0,0,160,5,0,0,76,8,0,0,210,9,0,0,180,9,0,0,158,5,0,0,238,7,0,0,36,2,0,0,254,4,0,0,54,4,0,0,154,6,0,0,0,0,0,0,0,0,0,0,112,134,80,0,10,2,0,0,214,0,0,0,72,3,0,0,68,5,0,0,92,10,0,0,14,6,0,0,90,9,0,0,126,10,0,0,56,5,0,0,148,5,0,0,156,3,0,0,98,9,0,0,218,6,0,0,76,0,0,0,88,5,0,0,52,6,0,0,112,1,0,0,198,4,0,0,148,1,0,0,240,9,0,0,66,2,0,0,74,10,0,0,104,10,0,0,154,4,0,0,118,9,0,0,8,10,0,0,46,10,0,0,56,9,0,0,184,4,0,0,0,0,0,0,120,0,0,0,118,0,0,0,116,0,0,0,115,0,0,0,109,0,0,0,108,0,0,0,106,0,0,0,105,0,0,0,104,0,0,0,102,0,0,0,100,0,0,0,99,0,0,0,98,0,0,0,97,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,80,49,49,109,103,69,120,99,101,112,116,105,111,110,0,0,80,49,48,109,103,69,114,114,111,114,77,115,103,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,68,110,0,0,57,109,103,84,101,120,116,84,97,103,0,0,57,109,103,83,117,114,102,97,99,101,0,0,57,109,103,82,117,108,101,84,97,103,0,0,57,109,103,80,97,114,97,84,97,103,0,0,57,109,103,76,105,115,116,84,97,103,0,0,57,109,103,71,101,110,73,99,111,110,0,0,57,109,103,71,101,110,70,111,110,116,0,0,57,109,103,70,111,114,109,84,97,103,0,0,57,109,103,70,111,110,116,84,97,103,0,0,57,109,103,67,111,110,116,114,111,108,0,0,57,109,103,67,111,110,116,101,120,116,0,0,56,109,103,88,77,76,84,97,103,0,0,0,56,109,103,83,116,114,105,110,103,0,0,0,56,109,103,83,104,97,100,101,114,0,0,0,56,109,103,80,114,101,84,97,103,0,0,0,56,83,97,109,112,108,101,85,73,0,0,0,55,109,103,83,116,121,108,101,0,0,0,0,55,109,103,80,97,105,110,116,0,0,0,0,55,109,103,73,109,97,103,101,0,0,0,0,55,109,103,70,114,97,109,101,0,0,0,0,55,109,103,66,114,117,115,104,0,0,0,0,54,109,103,73,99,111,110,0,54,109,103,70,111,110,116,0,53,109,103,80,101,110,0,0,50,48,109,103,80,108,97,116,102,111,114,109,69,114,114,111,114,84,97,98,108,101,0,0,49,57,109,103,87,101,98,71,76,86,101,114,116,101,120,66,117,102,102,101,114,0,0,0,49,57,109,103,87,101,98,71,76,84,101,120,116,117,114,101,73,109,97,103,101,0,0,0,49,57,109,103,87,101,98,71,76,84,101,120,116,117,114,101,65,114,114,97,121,0,0,0,49,57,109,103,83,99,114,111,108,108,80,97,110,101,67,111,110,116,114,111,108,0,0,0,49,57,109,103,77,97,112,83,116,114,105,110,103,84,111,83,116,114,105,110,103,0,0,0,49,57,109,103,77,97,112,83,116,114,105,110,103,84,111,68,111,117,98,108,101,0,0,0,49,56,109,103,87,101,98,71,76,84,101,120,116,117,114,101,67,117,98,101,0,0,0,0,49,56,109,103,87,101,98,71,76,73,110,100,101,120,66,117,102,102,101,114,0,0,0,0,49,56,109,103,83,105,109,112,108,101,83,99,114,111,108,108,80,97,110,101,0,0,0,0,49,56,109,103,83,99,114,111,108,108,98,97,114,67,111,110,116,114,111,108,0,0,0,0,49,56,109,103,80,108,97,116,102,111,114,109,83,101,114,118,105,99,101,115,0,0,0,0,49,56,109,103,77,97,112,83,116,114,105,110,103,84,111,68,87,111,114,100,0,0,0,0,49,56,109,103,71,76,84,101,120,116,117,114,101,83,117,114,102,97,99,101,0,0,0,0,49,55,109,103,83,105,109,112,108,101,83,99,114,111,108,108,98,97,114,0,49,55,109,103,68,105,115,112,108,97,121,83,101,114,118,105,99,101,115,0,49,55,109,103,67,111,110,116,114,111,108,76,105,115,116,101,110,101,114,0,49,55,109,103,67,104,101,99,107,98,111,120,67,111,110,116,114,111,108,0,49,54,109,103,85,116,105,108,69,114,114,111,114,84,97,98,108,101,0,0,49,54,109,103,84,101,120,116,117,114,101,83,117,114,102,97,99,101,0,0,49,54,109,103,83,105,109,112,108,101,67,104])
.concat([101,99,107,98,111,120,0,0,49,54,109,103,83,101,108,101,99,116,76,105,115,116,101,110,101,114,0,0,49,54,109,103,83,99,114,111,108,108,76,105,115,116,101,110,101,114,0,0,49,54,109,103,83,99,114,105,112,116,80,108,97,116,102,111,114,109,0,0,49,54,109,103,77,97,112,83,116,114,105,110,103,84,111,80,116,114,0,0,49,54,109,103,68,105,115,112,108,97,121,83,117,112,112,111,114,116,0,0,49,54,109,103,68,101,115,107,116,111,112,67,111,110,116,114,111,108,0,0,49,54,109,103,67,111,110,115,111,108,101,67,111,110,116,114,111,108,0,0,49,54,109,103,67,104,97,110,103,101,76,105,115,116,101,110,101,114,0,0,49,54,109,103,65,99,116,105,111,110,76,105,115,116,101,110,101,114,0,0,49,53,109,103,84,97,98,98,101,100,67,111,110,116,114,111,108,0,0,0,49,53,109,103,83,105,109,112,108,101,68,101,115,107,116,111,112,0,0,0,49,53,109,103,83,105,109,112,108,101,67,111,110,115,111,108,101,0,0,0,49,53,109,103,77,111,117,115,101,76,105,115,116,101,110,101,114,0,0,0,49,53,109,103,77,97,112,68,87,111,114,100,84,111,80,116,114,0,0,0,49,53,109,103,76,97,121,111,117,116,77,97,110,97,103,101,114,0,0,0,49,53,109,103,70,111,99,117,115,76,105,115,116,101,110,101,114,0,0,0,49,53,109,103,69,114,114,111,114,84,97,98,108,101,84,97,103,0,0,0,49,53,109,103,67,117,114,115,111,114,68,101,102,110,84,97,103,0,0,0,49,53,109,103,66,117,116,116,111,110,67,111,110,116,114,111,108,0,0,0,49,52,109,103,87,101,98,71,76,83,117,112,112,111,114,116,0,0,0,0,49,52,109,103,87,101,98,71,76,68,105,115,112,108,97,121,0,0,0,0,49,52,109,103,86,101,114,116,101,120,66,117,102,102,101,114,0,0,0,0,49,52,109,103,84,105,109,101,76,105,115,116,101,110,101,114,0,0,0,0,49,52,109,103,84,101,120,116,117,114,101,73,109,97,103,101,0,0,0,0,49,52,109,103,84,101,120,116,117,114,101,65,114,114,97,121,0,0,0,0,49,52,109,103,83,116,97,99,107,67,111,110,116,114,111,108,0,0,0,0,49,52,109,103,83,112,108,105,116,67,111,110,116,114,111,108,0,0,0,0,49,52,109,103,83,105,109,112,108,101,87,105,110,100,111,119,0,0,0,0,49,52,109,103,83,105,109,112,108,101,84,97,98,98,101,100,0,0,0,0,49,52,109,103,83,105,109,112,108,101,66,117,116,116,111,110,0,0,0,0,49,52,109,103,76,97,98,101,108,67,111,110,116,114,111,108,0,0,0,0,49,52,109,103,71,76,71,101,110,83,117,114,102,97,99,101,0,0,0,0,49,52,109,103,70,105,101,108,100,67,111,110,116,114,111,108,0,0,0,0,49,52,109,103,67,111,108,117,109,110,76,97,121,111,117,116,0,0,0,0,49,52,109,103,51,68,69,114,114,111,114,84,97,98,108,101,0,0,0,0,49,51,109,103,87,101,98,71,76,83,104,97,100,101,114,0,49,51,109,103,84,101,120,116,117,114,101,67,117,98,101,0,49,51,109,103,84,97,98,108,101,82,111,119,84,97,103,0,49,51,109,103,84,97,98,108,101,76,97,121,111,117,116,0,49,51,109,103,84,97,98,108,101,67,111,108,84,97,103,0,49,51,109,103,83,116,114,105,110,103,65,114,114,97,121,0,49,51,109,103,83,105,109,112,108,101,83,116,121,108,101,0,49,51,109,103,83,105,109,112,108,101,83,116,97,99,107,0,49,51,109,103,83,105,109,112,108,101,83,112,108,105,116,0,49,51,109,103,83,105,109,112,108,101,76,97,98,101,108,0,49,51,109,103,83,105,109,112,108,101,70,105,101,108,100,0,49,51,109,103,79,112,116,105,111,110,115,70,105,108,101,0,49,51,109,103,76,105,115,116,73,116,101,109,84,97,103,0,49,51,109,103,76,105,115,116,67,111,110,116,114,111,108,0,49,51,109,103,75,101,121,76,105,115,116,101,110,101,114,0,49,51,109,103,73,110,100,101,120,66,117,102,102,101,114,0,49,51,109,103,70,111,114,109,67,111,110,116,114,111,108,0,49,51,109,103,70,111,110,116,76,105,115,116,84,97,103,0,49,51,109,103,69,114,114,111,114,86,97,114,84,97,103,0,49,51,109,103,69,114,114,111,114,77,115,103,84,97,103,0,49,51,109,103,67,104,101,99,107,98,111,120,84,97,103,0,49,51,109,103,65,112,112,108,105,99,97,116,105,111,110,0,49,50,109,103,88,77,76,83,99,97,110,110,101,114,0,0,49,50,109,103,84,111,112,67,111,110,116,114,111,108,0,0,49,50,109,103,84,101,120,116,70,111,114,109,97,116,0,0,49,50,109,103,84,101,120,116,66,117,102,102,101,114,0,0,49,50,109,103,83,111,108,105,100,80,97,105,110,116,0,0,49,50,109,103,83,105,109,112,108,101,76,105,115,116,0,0,49,50,109,103,79,112,116,105,111,110,115,84,97,103,0,0,49,50,109,103,72,101,97,100,105,110,103,84,97,103,0,0,49,50,109,103,71,101,110,83,117,114,102,97,99,101,0,0,49,50,109,103,71,101,110,67,111,110,116,101,120,116,0,0,49,50,109,103,70,111,114,109,80,97,114,115,101,114,0,0,49,50,109,103,69,114,114,111,114,84,97,98,108,101,0,0,49,50,109,103,67,117,114,115,111,114,68,101,102,110,0,0,49,50,109,103,67,111,110,115,111,108,101,84,97,103,0,0,49,49,109,103,88,77,76,80,97,114,115,101,114,0,0,0,49,49,109,103,82,101,99,116,70,114,97,109,101,0,0,0,49,49,109,103,69,120,99,101,112,116,105,111,110,0,0,0,49,49,109,103,67,104,105,108,100,68,101,115,99,0,0,0,49,49,109,103,66,117,116,116,111,110,84,97,103,0,0,0,49,48,109,103,84,101,120,116,83,99,97,110,0,0,0,0,49,48,109,103,84,101,120,116,80,97,103,101,0,0,0,0,49,48,109,103,84,101,120,116,68,114,97,119,0,0,0,0,49,48,109,103,84,97,98,108,101,84,97,103,0,0,0,0,49,48,109,103,84,97,98,108,101,82,111,119,0,0,0,0,49,48,109,103,83,99,114,111,108,108,101,114,0,0,0,0,49,48,109,103,82,101,115,111,117,114,99,101,0,0,0,0,49,48,109,103,80,116,114,65,114,114,97,121,0,0,0,0,49,48,109,103,76,97,98,101,108,84,97,103,0,0,0,0,49,48,109,103,71,101,110,73,109,97,103,101,0,0,0,0,49,48,109,103,70,114,97,103,68,101,115,99,0,0,0,0,49,48,109,103,70,111,114,109,80,97,110,101,0,0,0,0,49,48,109,103,70,111,110,116,76,105,115,116,0,0,0,0,49,48,109,103,70,105,101,108,100,84,97,103,0,0,0,0,49,48,109,103,69,114,114,111,114,77,115,103,0,0,0,0,49,48,109,103,66,114,101,97,107,84,97,103,0,0,0,0,49,48,109,103,66,108,111,99,107,84,97,103,0,0,0,0,49,48,71,117,105,84,101,115,116,65,108,108,0,0,0,0,116,60,80,0,28,115,80,0,116,60,80,0,72,115,80,0,0,0,0,0,80,115,80,0,0,0,0,0,96,115,80,0,0,0,0,0,0,0,0,0,112,115,80,0,0,0,0,0,148,133,80,0,0,0,0,0,128,115,80,0,0,0,0,0,80,134,80,0,0,0,0,0,144,115,80,0,148,60,80,0,184,115,80,0,0,0,0,0,1,0,0,0,184,126,80,0,0,0,0,0,0,0,0,0,248,115,80,0,0,0,0,0,12,116,80,0,40,127,80,0,0,0,0,0,52,116,80,0,28,127,80,0,0,0,0,0,92,116,80,0,28,127,80,0,0,0,0,0,132,116,80,0,16,127,80,0,0,0,0,0,168,116,80,0,40,127,80,0,0,0,0,0,204,116,80,0,40,127,80,0,0,0,0,0,240,116,80,0,132,126,80,0,116,60,80,0,20,117,80,0,0,0,0,0,24,117,80,0,180,127,80,0,0,0,0,0,36,117,80,0,0,0,0,0,48,117,80,0,180,127,80,0,0,0,0,0,60,117,80,0,180,127,80,0,0,0,0,0,72,117,80,0,180,127,80,0,0,0,0,0,84,117,80,0,52,128,80,0,0,0,0,0,96,117,80,0,64,128,80,0,0,0,0,0,108,117,80,0,180,127,80,0,0,0,0,0,120,117,80,0,180,127,80,0,0,0,0,0,132,117,80,0,0,0,0,0,144,117,80,0,0,0,0,0,156,117,80,0,0,0,0,0,168,117,80,0,0,0,0,0,180,117,80,0,0,0,0,0,192,117,80,0,180,127,80,0,148,60,80,0,204,117,80,0,0,0,0,0,3,0,0,0,220,129,80,0,2,0,0,0,144,129,80,0,2,4,0,0,212,129,80,0,2,8,0,0,0,0,0,0,216,117,80,0,0,0,0,0,228,117,80,0,232,133,80,0,0,0,0,0,240,117,80,0,0,0,0,0,252,117,80,0,232,133,80,0,0,0,0,0,8,118,80,0,232,133,80,0,0,0,0,0,20,118,80,0,232,133,80,0,0,0,0,0,28,118,80,0,232,133,80,0,0,0,0,0,36,118,80,0,232,133,80,0,0,0,0,0,44,118,80,0,92,129,80,0,0,0,0,0,68,118,80,0,148,130,80,0,0,0,0,0,92,118,80,0,164,130,80,0,0,0,0,0,116,118,80,0,172,130,80,0,0,0,0,0,140,118,80,0,164,127,80,0,0,0,0,0,164,118,80,0,0,0,0,0,188,118,80,0,0,0,0,0,212,118,80,0,132,131,80,0,0,0,0,0,236,118,80,0,88,132,80,0,148,60,80,0,4,119,80,0,0,0,0,0,2,0,0,0,136,128,80,0,2,0,0,0,152,129,80,0,0,140,0,0,148,60,80,0,28,119,80,0,0,0,0,0,2,0,0,0,164,127,80,0,2,0,0,0,224,133,80,0,2,140,0,0,0,0,0,0,52,119,80,0,0,0,0,0,76,119,80,0,0,0,0,0,100,119,80,0,104,129,80,0,148,60,80,0,124,119,80,0,0,0,0,0,3,0,0,0,220,128,80,0,2,0,0,0,56,130,80,0,2,144,0,0,156,130,80,0,2,148,0,0,0,0,0,0,144,119,80,0,0,0,0,0,164,119,80,0,0,0,0,0,184,119,80,0,164,127,80,0,0,0,0,0,204,119,80,0,88,133,80,0,0,0,0,0,224,119,80,0,148,60,80,0,244,119,80,0,0,0,0,0,2,0,0,0,80,129,80,0,2,0,0,0,56,130,80,0,2,140,0,0,0,0,0,0,8,120,80,0,0,0,0,0,28,120,80,0,0,0,0,0,48,120,80,0,252,128,80,0,0,0,0,0,68,120,80,0,0,0,0,0,88,120,80,0,0,0,0,0,108,120,80,0,164,127,80,0,0,0,0,0,128,120,80,0,164,127,80,0,0,0,0,0,148,120,80,0,0,0,0,0,168,120,80,0,0,0,0,0,188,120,80,0,164,127,80,0,148,60,80,0,208,120,80,0,0,0,0,0,3,0,0,0,188,129,80,0,2,0,0,0,56,130,80,0,2,140,0,0,156,130,80,0,2,144,0,0,148,60,80,0,228,120,80,0,0,0,0,0,2,0,0,0,200,129,80,0,2,0,0,0,152,129,80,0,2,140,0,0,0,0,0,0,248,120,80,0,0,0,0,0,12,121,80,0,0,0,0,0,32,121,80,0,0,0,0,0,52,121,80,0,0,0,0,0,72,121,80,0,180,127,80,0,0,0,0,0,92,121,80,0,180,127,80,0,0,0,0,0,112,121,80,0,164,127,80,0,0,0,0,0,132,121,80,0,180,129,80,0,0,0,0,0,152,121,80,0,64,129,80,0,0,0,0,0,172,121,80,0,0,0,0,0,192,121,80,0,0,0,0,0,212,121,80,0,0,0,0,0,232,121,80,0,0,0,0,0,252,121,80,0,164,127,80,0,0,0,0,0,16,122,80,0,164,127,80,0,148,60,80,0,36,122,80,0,0,0,0,0,3,0,0,0,164,127,80,0,2,0,0,0,220,129,80,0,2,140,0,0,56,130,80,0,2,144,0,0,148,60,80,0,56,122,80,0,0,0,0,0,2,0,0,0,228,129,80,0,2,0,0,0,56,130,80,0,2,140,0,0,148,60,80,0,76,122,80,0,0,0,0,0,3,0,0,0,112,130,80,0,2,0,0,0,56,130,80,0,2,140,0,0,80,130,80,0,2,144,0,0,0,0,0,0,96,122,80,0,164,127,80,0,0,0,0,0,116,122,80,0,52,133,80,0,0,0,0,0,136,122,80,0,164,127,80,0,0,0,0,0,156,122,80,0,72,130,80,0,0,0,0,0,176,122,80,0,88,128,80,0,0,0,0,0,196,122,80,0,196,127,80,0,0,0,0,0,212,122,80,0,0,0,0,0,228,122,80,0,180,127,80,0,0,0,0,0,244,122,80,0,72,130,80,0,0,0,0,0,4,123,80,0,180,127,80,0,0,0,0,0,20,123,80,0,0,0,0,0,36,123,80,0,0,128,80,0,0,0,0,0,52,123,80,0,180,130,80,0,148,60,80,0,68,123,80,0,0,0,0,0,2,0,0,0,192,130,80,0,2,0,0,0,56,130,80,0,2,140,0,0,0,0,0,0,84,123,80,0,60,131,80,0,148,60,80,0,100,123,80,0,0,0,0,0,4,0,0,0,84,131,80,0,2,0,0,0,80,132,80,0,2,140,0,0,56,130,80,0,2,144,0,0,80,130,80,0,2,148,0,0,0,0,0,0,116,123,80,0,124,133,80,0,0,0,0,0,132,123,80,0,180,127,80,0,0,0,0,0,148,123,80,0,164,127,80,0,0,0,0,0,164,123,80,0,0,0,0,0,180,123,80,0,0,0,0,0,196,123,80,0,164,127,80,0,0,0,0,0,212,123,80,0,180,127,80,0,0,0,0,0,228,123,80,0,180,127,80,0,0,0,0,0,244,123,80,0,180,127,80,0,0,0,0,0,4,124,80,0,180,127,80,0,0,0,0,0,20,124,80,0,0,0,0,0,36,124,80,0,148,60,80,0,52,124,80,0,0,0,0,0,2,0,0,0,164,127,80,0,2,0,0,0,72,129,80,0,2,140,0,0,0,0,0,0,68,124,80,0,176,133,80,0,0,0,0,0,84,124,80,0,0,0,0,0,100,124,80,0,8,128,80,0,148,60,80,0,116,124,80,0,0,0,0,0,4,0,0,0,68,132,80,0,2,0,0,0,56,130,80,0,2,140,0,0,80,130,80,0,2,144,0,0,152,129,80,0,2,148,0,0,0,0,0,0,132,124,80,0,180,127,80,0,0,0,0,0,148,124,80,0,180,127,80,0,0,0,0,0,164,124,80,0,72,127,80,0,0,0,0,0,180,124,80,0,172,127,80,0,0,0,0,0,196,124,80,0,124,133,80,0,0,0,0,0,212,124,80,0,124,133,80,0,0,0,0,0,228,124,80,0,124,133,80,0,0,0,0,0,244,124,80,0,180,127,80,0,0,0,0,0,4,125,80,0,164,132,80,0,0,0,0,0,20,125,80,0,28,128,80,0,0,0,0,0,36,125,80,0,0,0,0,0,52,125,80,0,0,0,0,0,68,125,80,0,180,127,80,0,0,0,0,0,84,125,80,0,0,0,0,0,100,125,80,0,0,0,0,0,116,125,80,0,204,132,80,0,0,0,0,0,132,125,80,0,180,127,80,0,0,0,0,0,148,125,80,0,0,0,0,0,164,125,80,0,0,0,0,0,180,125,80,0,0,0,0,0,196,125,80,0,0,0,0,0,212,125,80,0,180,127,80,0,0,0,0,0,228,125,80,0,20,128,80,0,0,0,0,0,244,125,80,0,148,60,80,0,4,126,80,0,0,0,0,0,2,0,0,0,96,132,80,0,2,0,0,0,184,133,80,0,2,140,0,0,0,0,0,0,20,126,80,0,124,133,80,0,0,0,0,0,36,126,80,0,180,127,80,0,0,0,0,0,52,126,80,0,0,0,0,0,68,126,80,0,180,127,80,0,0,0,0,0,84,126,80,0,180,127,80,0,0,0,0,0,100,126,80,0,156,132,80,0,0,0,0,0,224,16,80,0,8,0,0,0,0,0,0,0,252,56,80,0,10,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,8,0,0,0,0,0,0,0,252,56,80,0,10,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,8,0,0,0,0,0,0,0,68,16,80,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,8,0,0,0,0,0,0,0,68,16,80,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,8,0,0,0,0,0,0,0,68,16,80,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,8,0,0,0,0,0,0,0,68,16,80,0,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,9,0,0,0,0,0,0,0,152,32,80,0,9,0,0,0,12,0,0,0,68,16,80,0,9,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,224,16,80,0,9,0,0,0,0,0,0,0,152,32,80,0,9,0,0,0,12,0,0,0,68,16,80,0,8,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0])
, "i8", ALLOC_NONE, TOTAL_STACK)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(2596);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(1248);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(566);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(1432);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(32);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(328);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(2682);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(1046);
HEAP32[(((__ZTVN10__cxxabiv119__pointer_type_infoE)+(8))>>2)]=(2596);
HEAP32[(((__ZTVN10__cxxabiv119__pointer_type_infoE)+(12))>>2)]=(576);
HEAP32[(((__ZTVN10__cxxabiv119__pointer_type_infoE)+(16))>>2)]=(566);
HEAP32[(((__ZTVN10__cxxabiv119__pointer_type_infoE)+(20))>>2)]=(1432);
HEAP32[(((__ZTVN10__cxxabiv119__pointer_type_infoE)+(24))>>2)]=(1826);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(2596);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(2552);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(566);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(1432);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(32);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(1350);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(956);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(1242);
HEAP32[((__ZTIt)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIt)+(4))>>2)]=((5272352)|0);
HEAP32[((__ZTIs)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIs)+(4))>>2)]=((5272356)|0);
HEAP32[((__ZTIm)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIm)+(4))>>2)]=((5272360)|0);
HEAP32[((__ZTIl)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIl)+(4))>>2)]=((5272364)|0);
HEAP32[((__ZTIj)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIj)+(4))>>2)]=((5272368)|0);
HEAP32[((__ZTIi)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIi)+(4))>>2)]=((5272372)|0);
HEAP32[((__ZTIh)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIh)+(4))>>2)]=((5272376)|0);
HEAP32[((__ZTIf)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIf)+(4))>>2)]=((5272380)|0);
HEAP32[((__ZTId)>>2)]=(((5258356)|0));
HEAP32[(((__ZTId)+(4))>>2)]=((5272384)|0);
HEAP32[((__ZTIc)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIc)+(4))>>2)]=((5272388)|0);
HEAP32[((__ZTIa)>>2)]=(((5258356)|0));
HEAP32[(((__ZTIa)+(4))>>2)]=((5272396)|0);
HEAP32[((5275268)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275276)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275284)>>2)]=__ZTISt9exception;
HEAP32[((5275288)>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((5275304)>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((5275320)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275352)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275360)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275372)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275384)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275396)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275408)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275420)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275432)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275452)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275464)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275472)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275484)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275496)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275508)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275532)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275544)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275556)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275564)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275572)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275580)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275588)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275596)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275648)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275656)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275668)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275676)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275688)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275700)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275712)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275724)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275736)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275748)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275760)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275772)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275784)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275796)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275804)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275812)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275824)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275900)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275908)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275916)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275968)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275976)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5275984)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5275996)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276008)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276048)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276056)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276064)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276076)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276084)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276092)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276104)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276116)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276124)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276132)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276216)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276224)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276232)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276240)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276248)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276260)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276272)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276284)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276296)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276308)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276316)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276324)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276332)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276340)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276352)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276476)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276488)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276500)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276512)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276524)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276536)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276548)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276556)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276568)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276580)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276592)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276600)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276612)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276656)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276716)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276728)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276740)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276752)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276760)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276768)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276780)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276792)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276804)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276816)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276828)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276836)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276876)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276888)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5276896)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276956)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276968)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276980)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5276992)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277004)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277016)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277028)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277040)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277052)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277064)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277076)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277084)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277092)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277104)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277112)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277120)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277132)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277144)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277152)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277160)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277168)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277176)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277188)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277200)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277240)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277252)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277264)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5277272)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277284)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5277296)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
if (!awaitingMemoryInitializer) runPostSets();
  var _sqrt=Math.sqrt;
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  function _llvm_eh_typeid_for(type) {
      return type;
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_free_exception(ptr) {
      return _free(ptr);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return tempRet0 = typeArray[i],thrown;
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return tempRet0 = throwntype,thrown;
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      __THREW__ = 0;
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
var __embind_register_function; // stub for __embind_register_function
  var GL={counter:1,buffers:[],programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],currArrayBuffer:0,currElementArrayBuffer:0,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],uniformTable:{},packAlignment:4,unpackAlignment:4,init:function () {
        Browser.moduleContextCreatedCallbacks.push(GL.initExtensions);
      },getNewId:function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },MINI_TEMP_BUFFER_SIZE:16,miniTempBuffer:null,miniTempBufferViews:[0],MAX_TEMP_BUFFER_SIZE:2097152,tempBufferIndexLookup:null,tempVertexBuffers:null,tempIndexBuffers:null,tempQuadIndexBuffer:null,generateTempBuffers:function (quads) {
        this.tempBufferIndexLookup = new Uint8Array(this.MAX_TEMP_BUFFER_SIZE+1);
        this.tempVertexBuffers = [];
        this.tempIndexBuffers = [];
        var last = -1, curr = -1;
        var size = 1;
        for (var i = 0; i <= this.MAX_TEMP_BUFFER_SIZE; i++) {
          if (i > size) {
            size <<= 1;
          }
          if (size != last) {
            curr++;
            this.tempVertexBuffers[curr] = Module.ctx.createBuffer();
            Module.ctx.bindBuffer(Module.ctx.ARRAY_BUFFER, this.tempVertexBuffers[curr]);
            Module.ctx.bufferData(Module.ctx.ARRAY_BUFFER, size, Module.ctx.DYNAMIC_DRAW);
            Module.ctx.bindBuffer(Module.ctx.ARRAY_BUFFER, null);
            this.tempIndexBuffers[curr] = Module.ctx.createBuffer();
            Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, this.tempIndexBuffers[curr]);
            Module.ctx.bufferData(Module.ctx.ELEMENT_ARRAY_BUFFER, size, Module.ctx.DYNAMIC_DRAW);
            Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, null);
            last = size;
          }
          this.tempBufferIndexLookup[i] = curr;
        }
        if (quads) {
          // GL_QUAD indexes can be precalculated
          this.tempQuadIndexBuffer = Module.ctx.createBuffer();
          Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, this.tempQuadIndexBuffer);
          var numIndexes = this.MAX_TEMP_BUFFER_SIZE >> 1;
          var quadIndexes = new Uint16Array(numIndexes);
          var i = 0, v = 0;
          while (1) {
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+1;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+2;
            if (i >= numIndexes) break;
            quadIndexes[i++] = v+3;
            if (i >= numIndexes) break;
            v += 4;
          }
          Module.ctx.bufferData(Module.ctx.ELEMENT_ARRAY_BUFFER, quadIndexes, Module.ctx.STATIC_DRAW);
          Module.ctx.bindBuffer(Module.ctx.ELEMENT_ARRAY_BUFFER, null);
        }
      },scan:function (table, object) {
        for (var item in table) {
          if (table[item] == object) return item;
        }
        return 0;
      },findToken:function (source, token) {
        function isIdentChar(ch) {
          if (ch >= 48 && ch <= 57) // 0-9
            return true;
          if (ch >= 65 && ch <= 90) // A-Z
            return true;
          if (ch >= 97 && ch <= 122) // a-z
            return true;
          return false;
        }
        var i = -1;
        do {
          i = source.indexOf(token, i + 1);
          if (i < 0) {
            break;
          }
          if (i > 0 && isIdentChar(source[i - 1])) {
            continue;
          }
          i += token.length;
          if (i < source.length - 1 && isIdentChar(source[i + 1])) {
            continue;
          }
          return true;
        } while (true);
        return false;
      },getSource:function (shader, count, string, length) {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var frag;
          if (length) {
            var len = HEAP32[(((length)+(i*4))>>2)];
            if (len < 0) {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
            } else {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)], len);
            }
          } else {
            frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
          }
          source += frag;
        }
        // Let's see if we need to enable the standard derivatives extension
        type = Module.ctx.getShaderParameter(GL.shaders[shader], 0x8B4F /* GL_SHADER_TYPE */);
        if (type == 0x8B30 /* GL_FRAGMENT_SHADER */) {
          if (GL.findToken(source, "dFdx") ||
              GL.findToken(source, "dFdy") ||
              GL.findToken(source, "fwidth")) {
            source = "#extension GL_OES_standard_derivatives : enable\n" + source;
            var extension = Module.ctx.getExtension("OES_standard_derivatives");
          }
        }
        return source;
      },computeImageSize:function (width, height, sizePerPixel, alignment) {
        function roundedToNextMultipleOf(x, y) {
          return Math.floor((x + y - 1) / y) * y
        }
        var plainRowSize = width * sizePerPixel;
        var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
        return (height <= 0) ? 0 :
                 ((height - 1) * alignedRowSize + plainRowSize);
      },getTexPixelData:function (type, format, width, height, pixels, internalFormat) {
        var sizePerPixel;
        switch (type) {
          case 0x1401 /* GL_UNSIGNED_BYTE */:
            switch (format) {
              case 0x1906 /* GL_ALPHA */:
              case 0x1909 /* GL_LUMINANCE */:
                sizePerPixel = 1;
                break;
              case 0x1907 /* GL_RGB */:
                sizePerPixel = 3;
                break;
              case 0x1908 /* GL_RGBA */:
                sizePerPixel = 4;
                break;
              case 0x190A /* GL_LUMINANCE_ALPHA */:
                sizePerPixel = 2;
                break;
              default:
                throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x8363 /* GL_UNSIGNED_SHORT_5_6_5 */:
          case 0x8033 /* GL_UNSIGNED_SHORT_4_4_4_4 */:
          case 0x8034 /* GL_UNSIGNED_SHORT_5_5_5_1 */:
            sizePerPixel = 2;
            break;
          case 0x1406 /* GL_FLOAT */:
            assert(GL.floatExt, 'Must have OES_texture_float to use float textures');
            switch (format) {
              case 0x1907 /* GL_RGB */:
                sizePerPixel = 3*4;
                break;
              case 0x1908 /* GL_RGBA */:
                sizePerPixel = 4*4;
                break;
              default:
                throw 'Invalid format (' + format + ')';
            }
            internalFormat = Module.ctx.RGBA;
            break;
          default:
            throw 'Invalid type (' + type + ')';
        }
        var bytes = GL.computeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
        if (type == 0x1401 /* GL_UNSIGNED_BYTE */) {
          pixels = HEAPU8.subarray((pixels),(pixels+bytes));
        } else if (type == 0x1406 /* GL_FLOAT */) {
          pixels = HEAPF32.subarray((pixels)>>2,(pixels+bytes)>>2);
        } else {
          pixels = HEAPU16.subarray((pixels)>>1,(pixels+bytes)>>1);
        }
        return {
          pixels: pixels,
          internalFormat: internalFormat
        }
      },initExtensions:function () {
        if (GL.initExtensions.done) return;
        GL.initExtensions.done = true;
        if (!Module.useWebGL) return; // an app might link both gl and 2d backends
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
          GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i+1);
        }
        GL.maxVertexAttribs = Module.ctx.getParameter(Module.ctx.MAX_VERTEX_ATTRIBS);
        GL.compressionExt = Module.ctx.getExtension('WEBGL_compressed_texture_s3tc') ||
                            Module.ctx.getExtension('MOZ_WEBGL_compressed_texture_s3tc') ||
                            Module.ctx.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
        GL.anisotropicExt = Module.ctx.getExtension('EXT_texture_filter_anisotropic') ||
                            Module.ctx.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                            Module.ctx.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        GL.floatExt = Module.ctx.getExtension('OES_texture_float');
      }};function _glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        Module.ctx.deleteTexture(GL.textures[id]);
        GL.textures[id] = null;
      }
    }
  function _glBindTexture(target, texture) {
      Module.ctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }
  function _glTexParameteri(x0, x1, x2) { Module.ctx.texParameteri(x0, x1, x2) }
  function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      if (pixels) {
        var data = GL.getTexPixelData(type, format, width, height, pixels, -1);
        pixels = data.pixels;
      } else {
        pixels = null;
      }
      Module.ctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
    }
  function _glGenerateMipmap(x0) { Module.ctx.generateMipmap(x0) }
  function _glGetUniformLocation(program, name) {
      name = Pointer_stringify(name);
      var ptable = GL.uniformTable[program];
      if (!ptable) ptable = GL.uniformTable[program] = {};
      var id = ptable[name];
      if (id) return id; 
      var loc = Module.ctx.getUniformLocation(GL.programs[program], name);
      if (!loc) return -1;
      id = GL.getNewId(GL.uniforms);
      GL.uniforms[id] = loc;
      ptable[name] = id;
      return id;
    }
var _mgCanvasInit; // stub for _mgCanvasInit
var _mgCanvasTerm; // stub for _mgCanvasTerm
  function _glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(((framebuffers)+(i*4))>>2)];
        Module.ctx.deleteFramebuffer(GL.framebuffers[id]);
        GL.framebuffers[id] = null;
      }
    }
  function _glGenFramebuffers(n, ids) {
      for (var i = 0; i < n; ++i) {
        var id = GL.getNewId(GL.framebuffers);
        GL.framebuffers[id] = Module.ctx.createFramebuffer();
        HEAP32[(((ids)+(i*4))>>2)]=id;
      }
    }
  function _glBindFramebuffer(target, framebuffer) {
      Module.ctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
    }
  function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      Module.ctx.framebufferTexture2D(target, attachment, textarget,
                                      GL.textures[texture], level);
    }
  function _glCheckFramebufferStatus(x0) { return Module.ctx.checkFramebufferStatus(x0) }
  function _glFrontFace(x0) { Module.ctx.frontFace(x0) }
  function _glBlendFunc(x0, x1) { Module.ctx.blendFunc(x0, x1) }
  function _glEnable(x0) { Module.ctx.enable(x0) }
  function _glDisable(x0) { Module.ctx.disable(x0) }
  function _glViewport(x0, x1, x2, x3) { Module.ctx.viewport(x0, x1, x2, x3) }
  var _tan=Math.tan;
  function _glDeleteProgram(program) {
      Module.ctx.deleteProgram(GL.programs[program]);
      GL.programs[program] = null;
      GL.uniformTable[program] = null;
    }
  function _glUseProgram(program) {
      Module.ctx.useProgram(program ? GL.programs[program] : null);
    }
  function _glUniformMatrix3fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[8];
        for (var i = 0; i < 9; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*36)>>2);
      }
      Module.ctx.uniformMatrix3fv(location, transpose, view);
    }
  function _glUniformMatrix4fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[15];
        for (var i = 0; i < 16; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*64)>>2);
      }
      Module.ctx.uniformMatrix4fv(location, transpose, view);
    }
  function _glUniform2f(location, v0, v1) {
      location = GL.uniforms[location];
      Module.ctx.uniform2f(location, v0, v1);
    }
  function _glUniform3f(location, v0, v1, v2) {
      location = GL.uniforms[location];
      Module.ctx.uniform3f(location, v0, v1, v2);
    }
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return tempRet0 = x*y > 4294967295,(x*y)>>>0;
    }
  function _glUniform3fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[2];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*12)>>2);
      }
      Module.ctx.uniform3fv(location, view);
    }
  function _glUniform4f(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      Module.ctx.uniform4f(location, v0, v1, v2, v3);
    }
  function _glUniform1i(location, v0) {
      location = GL.uniforms[location];
      Module.ctx.uniform1i(location, v0);
    }
  function _glUniform1f(location, v0) {
      location = GL.uniforms[location];
      Module.ctx.uniform1f(location, v0);
    }
  function _glUniform1fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count == 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[0];
        view[0] = HEAPF32[((value)>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*4)>>2);
      }
      Module.ctx.uniform1fv(location, view);
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]|0 != 0) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],HEAPF64[(tempDoublePtr)>>3]);
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = flagAlternative ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*') || nullString;
              var argLength = _strlen(arg);
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              for (var i = 0; i < argLength; i++) {
                ret.push(HEAPU8[((arg++)|0)]);
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _glClearColor(x0, x1, x2, x3) { Module.ctx.clearColor(x0, x1, x2, x3) }
  function _glClear(x0) { Module.ctx.clear(x0) }
  function _glActiveTexture(x0) { Module.ctx.activeTexture(x0) }
  function _glEnableVertexAttribArray(index) {
      Module.ctx.enableVertexAttribArray(index);
    }
  function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      Module.ctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }
  function _glDisableVertexAttribArray(index) {
      Module.ctx.disableVertexAttribArray(index);
    }
  function _glBindBuffer(target, buffer) {
      if (target == Module.ctx.ARRAY_BUFFER) {
        GL.currArrayBuffer = buffer;
      } else if (target == Module.ctx.ELEMENT_ARRAY_BUFFER) {
        GL.currElementArrayBuffer = buffer;
      }
      Module.ctx.bindBuffer(target, buffer ? GL.buffers[buffer] : null);
    }
  function _glDrawArrays(mode, first, count) {
      Module.ctx.drawArrays(mode, first, count);
    }
  function _glDrawElements(mode, count, type, indices) {
      Module.ctx.drawElements(mode, count, type, indices);
    }
  function _glStencilFunc(x0, x1, x2) { Module.ctx.stencilFunc(x0, x1, x2) }
  function _glStencilOpSeparate(x0, x1, x2, x3) { Module.ctx.stencilOpSeparate(x0, x1, x2, x3) }
  function _glDepthFunc(x0) { Module.ctx.depthFunc(x0) }
  function _glColorMask(x0, x1, x2, x3) { Module.ctx.colorMask(x0, x1, x2, x3) }
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32=_memset;
  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.textures); 
        GL.textures[id] = Module.ctx.createTexture();
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }
  function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      if (pixels) {
        var data = GL.getTexPixelData(type, format, width, height, pixels, internalFormat);
        pixels = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixels = null;
      }
      Module.ctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
    }
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STACK);
  var _stdout=allocate(1, "i32*", ALLOC_STACK);
  var _stderr=allocate(1, "i32*", ALLOC_STACK);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STACK);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
          if (!hasByteServing) chunkSize = datalength;
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        assert(Math.max(_stdin, _stdout, _stderr) < 128); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'];
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        this.lockPointer = lockPointer;
        this.resizeCanvas = resizeCanvas;
        if (typeof this.lockPointer === 'undefined') this.lockPointer = true;
        if (typeof this.resizeCanvas === 'undefined') this.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!this.fullScreenHandlersInstalled) {
          this.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen(); 
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};var SDL={defaults:{width:320,height:200,copyOnLock:true},version:null,surfaces:{},events:[],fonts:[null],audios:[null],music:{audio:null,volume:1},mixerFrequency:22050,mixerFormat:32784,mixerNumChannels:2,mixerChunkSize:1024,channelMinimumNumber:0,GL:false,keyboardState:null,shiftKey:false,ctrlKey:false,altKey:false,textInput:false,startTime:null,mouseX:0,mouseY:0,buttonState:0,DOMButtons:[0,0,0],DOMEventToSDLEvent:{},keyCodes:{16:1249,17:1248,18:1250,33:1099,34:1102,37:1104,38:1106,39:1103,40:1105,46:127,96:1112,97:1113,98:1114,99:1115,100:1116,101:1117,102:1118,103:1119,104:1120,105:1121,112:1082,113:1083,114:1084,115:1085,116:1086,117:1087,118:1088,119:1089,120:1090,121:1091,122:1092,123:1093,173:45,188:44,190:46,191:47,192:96},scanCodes:{9:43,13:40,27:41,32:44,44:54,46:55,47:56,48:39,49:30,50:31,51:32,52:33,53:34,54:35,55:36,56:37,57:38,92:49,97:4,98:5,99:6,100:7,101:8,102:9,103:10,104:11,105:12,106:13,107:14,108:15,109:16,110:17,111:18,112:19,113:20,114:21,115:22,116:23,117:24,118:25,119:26,120:27,121:28,122:29,305:224,308:226},structs:{Rect:{__size__:16,x:0,y:4,w:8,h:12},PixelFormat:{__size__:36,format:0,palette:4,BitsPerPixel:8,BytesPerPixel:9,padding1:10,padding2:11,Rmask:12,Gmask:16,Bmask:20,Amask:24,Rloss:28,Gloss:29,Bloss:30,Aloss:31,Rshift:32,Gshift:33,Bshift:34,Ashift:35},KeyboardEvent:{__size__:16,type:0,windowID:4,state:8,repeat:9,padding2:10,padding3:11,keysym:12},keysym:{__size__:16,scancode:0,sym:4,mod:8,unicode:12},TextInputEvent:{__size__:264,type:0,windowID:4,text:8},MouseMotionEvent:{__size__:28,type:0,windowID:4,state:8,padding1:9,padding2:10,padding3:11,x:12,y:16,xrel:20,yrel:24},MouseButtonEvent:{__size__:20,type:0,windowID:4,button:8,state:9,padding1:10,padding2:11,x:12,y:16},ResizeEvent:{__size__:12,type:0,w:4,h:8},AudioSpec:{__size__:24,freq:0,format:4,channels:6,silence:7,samples:8,size:12,callback:16,userdata:20},version:{__size__:3,major:0,minor:1,patch:2}},loadRect:function (rect) {
        return {
          x: HEAP32[((rect + SDL.structs.Rect.x)>>2)],
          y: HEAP32[((rect + SDL.structs.Rect.y)>>2)],
          w: HEAP32[((rect + SDL.structs.Rect.w)>>2)],
          h: HEAP32[((rect + SDL.structs.Rect.h)>>2)]
        };
      },loadColorToCSSRGB:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgb(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ')';
      },loadColorToCSSRGBA:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgba(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ',' + (((rgba >> 24)&255)/255) + ')';
      },translateColorToCSSRGBA:function (rgba) {
        return 'rgba(' + ((rgba >> 24)&255) + ',' + ((rgba >> 16)&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba&255)/255) + ')';
      },translateRGBAToCSSRGBA:function (r, g, b, a) {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (a/255) + ')';
      },translateRGBAToColor:function (r, g, b, a) {
        return (r << 24) + (g << 16) + (b << 8) + a;
      },makeSurface:function (width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var surf = _malloc(14*Runtime.QUANTUM_SIZE);  // SDL_Surface has 14 fields of quantum size
        var buffer = _malloc(width*height*4); // TODO: only allocate when locked the first time
        var pixelFormat = _malloc(18*Runtime.QUANTUM_SIZE);
        flags |= 1; // SDL_HWSURFACE - this tells SDL_MUSTLOCK that this needs to be locked
        //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
        var is_SDL_HWPALETTE = flags & 0x00200000;  
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        HEAP32[((surf+Runtime.QUANTUM_SIZE*0)>>2)]=flags         // SDL_Surface.flags
        HEAP32[((surf+Runtime.QUANTUM_SIZE*1)>>2)]=pixelFormat // SDL_Surface.format TODO
        HEAP32[((surf+Runtime.QUANTUM_SIZE*2)>>2)]=width         // SDL_Surface.w
        HEAP32[((surf+Runtime.QUANTUM_SIZE*3)>>2)]=height        // SDL_Surface.h
        HEAP32[((surf+Runtime.QUANTUM_SIZE*4)>>2)]=width * bpp       // SDL_Surface.pitch, assuming RGBA or indexed for now,
                                                                                 // since that is what ImageData gives us in browsers
        HEAP32[((surf+Runtime.QUANTUM_SIZE*5)>>2)]=buffer      // SDL_Surface.pixels
        HEAP32[((surf+Runtime.QUANTUM_SIZE*6)>>2)]=0      // SDL_Surface.offset
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.format)>>2)]=-2042224636 // SDL_PIXELFORMAT_RGBA8888
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.palette)>>2)]=0 // TODO
        HEAP8[((pixelFormat + SDL.structs.PixelFormat.BitsPerPixel)|0)]=bpp * 8
        HEAP8[((pixelFormat + SDL.structs.PixelFormat.BytesPerPixel)|0)]=bpp
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Rmask)>>2)]=rmask || 0x000000ff
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Gmask)>>2)]=gmask || 0x0000ff00
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Bmask)>>2)]=bmask || 0x00ff0000
        HEAP32[((pixelFormat + SDL.structs.PixelFormat.Amask)>>2)]=amask || 0xff000000
        // Decide if we want to use WebGL or not
        var useWebGL = (flags & 0x04000000) != 0; // SDL_OPENGL
        SDL.GL = SDL.GL || useWebGL;
        var canvas;
        if (!usePageCanvas) {
          canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
        } else {
          canvas = Module['canvas'];
        }
        var ctx = Browser.createContext(canvas, useWebGL, usePageCanvas);
        SDL.surfaces[surf] = {
          width: width,
          height: height,
          canvas: canvas,
          ctx: ctx,
          surf: surf,
          buffer: buffer,
          pixelFormat: pixelFormat,
          alpha: 255,
          flags: flags,
          locked: 0,
          usePageCanvas: usePageCanvas,
          source: source,
          isFlagSet: function (flag) {
            return flags & flag;
          }
        };
        return surf;
      },copyIndexedColorData:function (surfData, rX, rY, rW, rH) {
        // HWPALETTE works with palette
        // setted by SDL_SetColors
        if (!surfData.colors) {
          return;
        }
        var fullWidth  = Module['canvas'].width;
        var fullHeight = Module['canvas'].height;
        var startX  = rX || 0;
        var startY  = rY || 0;
        var endX    = (rW || (fullWidth - startX)) + startX;
        var endY    = (rH || (fullHeight - startY)) + startY;
        var buffer  = surfData.buffer;
        var data    = surfData.image.data;
        var colors  = surfData.colors;
        for (var y = startY; y < endY; ++y) {
          var indexBase = y * fullWidth;
          var colorBase = indexBase * 4;
          for (var x = startX; x < endX; ++x) {
            // HWPALETTE have only 256 colors (not rgba)
            var index = HEAPU8[((buffer + indexBase + x)|0)] * 3;
            var colorOffset = colorBase + x * 4;
            data[colorOffset   ] = colors[index   ];
            data[colorOffset +1] = colors[index +1];
            data[colorOffset +2] = colors[index +2];
            //unused: data[colorOffset +3] = color[index +3];
          }
        }
      },freeSurface:function (surf) {
        _free(SDL.surfaces[surf].buffer);
        _free(SDL.surfaces[surf].pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
      },receiveEvent:function (event) {
        switch(event.type) {
          case 'mousemove':
            if (Browser.pointerLock) {
              // workaround for firefox bug 750111
              if ('mozMovementX' in event) {
                event['movementX'] = event['mozMovementX'];
                event['movementY'] = event['mozMovementY'];
              }
              // workaround for Firefox bug 782777
              if (event['movementX'] == 0 && event['movementY'] == 0) {
                // ignore a mousemove event if it doesn't contain any movement info
                // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
                return false;
              }
            }
            // fall through
          case 'keydown': case 'keyup': case 'keypress': case 'mousedown': case 'mouseup': case 'DOMMouseScroll': case 'mousewheel':
            if (event.type == 'DOMMouseScroll' || event.type == 'mousewheel') {
              var button = (event.type == 'DOMMouseScroll' ? event.detail : -event.wheelDelta) > 0 ? 4 : 3;
              var event2 = {
                type: 'mousedown',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
              SDL.events.push(event2);
              event = {
                type: 'mouseup',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
            } else if (event.type == 'mousedown') {
              SDL.DOMButtons[event.button] = 1;
            } else if (event.type == 'mouseup') {
              if (!SDL.DOMButtons[event.button]) return false; // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
                                                               // since we add a mouseup in that case
              SDL.DOMButtons[event.button] = 0;
            }
            if (event.type == 'keypress' && !SDL.textInput) {
              break;
            }
            SDL.events.push(event);
            if (SDL.events.length >= 10000) {
              Module.printErr('SDL event queue full, dropping earliest event');
              SDL.events.shift();
            }
            break;
          case 'mouseout':
            // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
            for (var i = 0; i < 3; i++) {
              if (SDL.DOMButtons[i]) {
                SDL.events.push({
                  type: 'mouseup',
                  button: i,
                  pageX: event.pageX,
                  pageY: event.pageY
                });
                SDL.DOMButtons[i] = 0;
              }
            }
            break;
          case 'unload':
            if (Browser.mainLoop.runner) {
              SDL.events.push(event);
              // Force-run a main event loop, since otherwise this event will never be caught!
              Browser.mainLoop.runner();
            }
            return true;
          case 'resize':
            SDL.events.push(event);
            break;
        }
        return false;
      },makeCEvent:function (event, ptr) {
        if (typeof event === 'number') {
          // This is a pointer to a native C event that was SDL_PushEvent'ed
          _memcpy(ptr, event, SDL.structs.KeyboardEvent.__size__); // XXX
          return;
        }
        switch(event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            //Module.print('Received key event: ' + event.keyCode);
            var key = event.keyCode;
            if (key >= 65 && key <= 90) {
              key += 32; // make lowercase for SDL
            } else {
              key = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
            var scan;
            if (key >= 1024) {
              scan = key - 1024;
            } else {
              scan = SDL.scanCodes[key] || key;
            }
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type]
            //HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.which))>>2)]=1
            HEAP8[(((ptr)+(SDL.structs.KeyboardEvent.state))|0)]=down ? 1 : 0
            HEAP8[(((ptr)+(SDL.structs.KeyboardEvent.repeat))|0)]=0 // TODO
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.scancode))>>2)]=scan
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.sym))>>2)]=key
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.mod))>>2)]=0
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.keysym + SDL.structs.keysym.unicode))>>2)]=key
            HEAP8[(((SDL.keyboardState)+(SDL.keyCodes[event.keyCode] || event.keyCode))|0)]=event.type == "keydown";
            if (event.keyCode == 16) { //shift
              SDL.shiftKey = event.type == "keydown";
            } else if (event.keyCode == 17) { //control
              SDL.ctrlKey = event.type == "keydown";
            } else if (event.keyCode == 18) { //alt
              SDL.altKey = event.type == "keydown";
            }
            break;
          }
          case 'keypress': {
            HEAP32[(((ptr)+(SDL.structs.TextInputEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type]
            // Not filling in windowID for now
            var cStr = intArrayFromString(String.fromCharCode(event.charCode));
            for (var i = 0; i < cStr.length; ++i) {
              HEAP8[(((ptr)+(SDL.structs.TextInputEvent.text + i))|0)]=cStr[i];
            }
            break;
          }
          case 'mousedown': case 'mouseup':
            if (event.type == 'mousedown') {
              // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
              // and DOM buttons are 0-2, so this means that the below formula is
              // correct.
              SDL.buttonState |= 1 << event.button;
            } else if (event.type == 'mouseup') {
              SDL.buttonState &= ~(1 << event.button);
            }
            // fall through
          case 'mousemove': {
            if (Browser.pointerLock) {
              // When the pointer is locked, calculate the coordinates
              // based on the movement of the mouse.
              // Workaround for Firefox bug 764498
              if (event.type != 'mousemove' &&
                  ('mozMovementX' in event)) {
                var movementX = 0, movementY = 0;
              } else {
                var movementX = Browser.getMovementX(event);
                var movementY = Browser.getMovementY(event);
              }
              var x = SDL.mouseX + movementX;
              var y = SDL.mouseY + movementY;
            } else {
              // Otherwise, calculate the movement based on the changes
              // in the coordinates.
              var rect = Module["canvas"].getBoundingClientRect();
              var x = event.pageX - (window.scrollX + rect.left);
              var y = event.pageY - (window.scrollY + rect.top);
              // the canvas might be CSS-scaled compared to its backbuffer;
              // SDL-using content will want mouse coordinates in terms
              // of backbuffer units.
              var cw = Module["canvas"].width;
              var ch = Module["canvas"].height;
              x = x * (cw / rect.width);
              y = y * (ch / rect.height);
              var movementX = x - SDL.mouseX;
              var movementY = y - SDL.mouseY;
            }
            if (event.type != 'mousemove') {
              var down = event.type === 'mousedown';
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(SDL.structs.MouseButtonEvent.button))|0)]=event.button+1; // DOM buttons are 0-2, SDL 1-3
              HEAP8[(((ptr)+(SDL.structs.MouseButtonEvent.state))|0)]=down ? 1 : 0;
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.x))>>2)]=x;
              HEAP32[(((ptr)+(SDL.structs.MouseButtonEvent.y))>>2)]=y;
            } else {
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(SDL.structs.MouseMotionEvent.state))|0)]=SDL.buttonState;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.x))>>2)]=x;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.y))>>2)]=y;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.xrel))>>2)]=movementX;
              HEAP32[(((ptr)+(SDL.structs.MouseMotionEvent.yrel))>>2)]=movementY;
            }
            SDL.mouseX = x;
            SDL.mouseY = y;
            break;
          }
          case 'unload': {
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
            break;
          }
          case 'resize': {
            HEAP32[(((ptr)+(SDL.structs.KeyboardEvent.type))>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP32[(((ptr)+(SDL.structs.ResizeEvent.w))>>2)]=event.w;
            HEAP32[(((ptr)+(SDL.structs.ResizeEvent.h))>>2)]=event.h;
            break;
          }
          default: throw 'Unhandled SDL event: ' + event.type;
        }
      },estimateTextWidth:function (fontData, text) {
        var h = fontData.size;
        var fontString = h + 'px sans-serif';
        // TODO: use temp context, not screen's, to avoid affecting its performance?
        var tempCtx = SDL.surfaces[SDL.screen].ctx;
        tempCtx.save();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        tempCtx.restore();
        return ret;
      },allocateChannels:function (num) { // called from Mix_AllocateChannels and init
        if (SDL.numChannels && SDL.numChannels >= num) return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
          SDL.channels[i] = {
            audio: null,
            volume: 1.0
          };
        }
      },setGetVolume:function (info, volume) {
        if (!info) return 0;
        var ret = info.volume * 128; // MIX_MAX_VOLUME
        if (volume != -1) {
          info.volume = volume / 128;
          if (info.audio) info.audio.volume = info.volume;
        }
        return ret;
      },debugSurface:function (surfData) {
        console.log('dumping surface ' + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
          console.log('   diagonal ' + i + ':' + [data[i*surfData.width*4 + i*4 + 0], data[i*surfData.width*4 + i*4 + 1], data[i*surfData.width*4 + i*4 + 2], data[i*surfData.width*4 + i*4 + 3]]);
        }
      }};function _SDL_LockSurface(surf) {
      var surfData = SDL.surfaces[surf];
      surfData.locked++;
      if (surfData.locked > 1) return 0;
      surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
      if (surf == SDL.screen) {
        var data = surfData.image.data;
        var num = data.length;
        for (var i = 0; i < num/4; i++) {
          data[i*4+3] = 255; // opacity, as canvases blend alpha
        }
      }
      if (SDL.defaults.copyOnLock) {
        // Copy pixel data to somewhere accessible to 'C/C++'
        if (surfData.isFlagSet(0x00200000 /* SDL_HWPALETTE */)) {
          // If this is neaded then
          // we should compact the data from 32bpp to 8bpp index.
          // I think best way to implement this is use
          // additional colorMap hash (color->index).
          // Something like this:
          //
          // var size = surfData.width * surfData.height;
          // var data = '';
          // for (var i = 0; i<size; i++) {
          //   var color = SDL.translateRGBAToColor(
          //     surfData.image.data[i*4   ], 
          //     surfData.image.data[i*4 +1], 
          //     surfData.image.data[i*4 +2], 
          //     255);
          //   var index = surfData.colorMap[color];
          //   HEAP8[(((surfData.buffer)+(i))|0)]=index;
          // }
          throw 'CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set' + new Error().stack;
        } else {
        HEAPU8.set(surfData.image.data, surfData.buffer);
        }
      }
      // Mark in C/C++-accessible SDL structure
      // SDL_Surface has the following fields: Uint32 flags, SDL_PixelFormat *format; int w, h; Uint16 pitch; void *pixels; ...
      // So we have fields all of the same size, and 5 of them before us.
      // TODO: Use macros like in library.js
      HEAP32[(((surf)+(5*Runtime.QUANTUM_SIZE))>>2)]=surfData.buffer;
      return 0;
    }function _IMG_Load(filename) {
      filename = FS.standardizePath(Pointer_stringify(filename));
      if (filename[0] == '/') {
        // Convert the path to relative
        filename = filename.substr(1);
      }
      var raw = Module["preloadedImages"][filename];
      if (!raw) {
        if (raw === null) Module.printErr('Trying to reuse preloaded image, but freePreloadedMediaOnUse is set!');
        Runtime.warnOnce('Cannot find preloaded image ' + filename);
        return 0;
      }
      if (Module['freePreloadedMediaOnUse']) {
        Module["preloadedImages"][filename] = null;
      }
      var surf = SDL.makeSurface(raw.width, raw.height, 0, false, 'load:' + filename);
      var surfData = SDL.surfaces[surf];
      surfData.ctx.globalCompositeOperation = "copy";
      surfData.ctx.drawImage(raw, 0, 0, raw.width, raw.height, 0, 0, raw.width, raw.height);
      surfData.ctx.globalCompositeOperation = "source-over";
      // XXX SDL does not specify that loaded images must have available pixel data, in fact
      //     there are cases where you just want to blit them, so you just need the hardware
      //     accelerated version. However, code everywhere seems to assume that the pixels
      //     are in fact available, so we retrieve it here. This does add overhead though.
      _SDL_LockSurface(surf);
      surfData.locked--; // The surface is not actually locked in this hack
      if (SDL.GL) {
        // After getting the pixel data, we can free the canvas and context if we do not need to do 2D canvas blitting
        surfData.canvas = surfData.ctx = null;
      }
      return surf;
    }
  function _SDL_FreeSurface(surf) {
      if (surf) SDL.freeSurface(surf);
    }
  function _glGenBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.buffers);
        GL.buffers[id] = Module.ctx.createBuffer();
        HEAP32[(((buffers)+(i*4))>>2)]=id;
      }
    }
  function _glBufferData(target, size, data, usage) {
      Module.ctx.bufferData(target, HEAPU8.subarray(data, data+size), usage);
    }
  function _glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        Module.ctx.deleteBuffer(GL.buffers[id]);
        GL.buffers[id] = null;
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
      }
    }
  function _glGetError() { return Module.ctx.getError() }
  function _glGetShaderiv(shader, pname, p) {
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        HEAP32[((p)>>2)]=Module.ctx.getShaderInfoLog(GL.shaders[shader]).length + 1;
      } else {
        HEAP32[((p)>>2)]=Module.ctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }
  function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = Module.ctx.getShaderInfoLog(GL.shaders[shader]);
      // Work around a bug in Chromium which causes getShaderInfoLog to return null
      if (!log) {
        log = "";
      }
      log = log.substr(0, maxLength - 1);
      writeStringToMemory(log, infoLog);
      if (length) {
        HEAP32[((length)>>2)]=log.length
      }
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) return 0;
      var bytesRead = _read(stream, ptr, bytesToRead);
      var streamObj = FS.streams[stream];
      if (bytesRead == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        if (bytesRead < bytesToRead) streamObj.eof = true;
        return Math.floor(bytesRead / size);
      }
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      Module.ctx.shaderSource(GL.shaders[shader], source);
    }
  function _glCompileShader(shader) {
      Module.ctx.compileShader(GL.shaders[shader]);
    }
  function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = Module.ctx.createShader(shaderType);
      return id;
    }
  function _glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      GL.programs[id] = Module.ctx.createProgram();
      return id;
    }
  function _glAttachShader(program, shader) {
      Module.ctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  function _glBindAttribLocation(program, index, name) {
      name = Pointer_stringify(name);
      Module.ctx.bindAttribLocation(GL.programs[program], index, name);
    }
  function _glLinkProgram(program) {
      Module.ctx.linkProgram(GL.programs[program]);
      GL.uniformTable[program] = {}; // uniforms no longer keep the same names after linking
    }
  function _glDeleteShader(shader) {
      Module.ctx.deleteShader(GL.shaders[shader]);
      GL.shaders[shader] = null;
    }
  function _glGetProgramiv(program, pname, p) {
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        HEAP32[((p)>>2)]=Module.ctx.getProgramInfoLog(GL.programs[program]).length + 1;
      } else {
        HEAP32[((p)>>2)]=Module.ctx.getProgramParameter(GL.programs[program], pname);
      }
    }
  function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = Module.ctx.getProgramInfoLog(GL.programs[program]);
      // Work around a bug in Chromium which causes getProgramInfoLog to return null
      if (!log) {
        log = "";
      }
      log = log.substr(0, maxLength - 1);
      writeStringToMemory(log, infoLog);
      if (length) {
        HEAP32[((length)>>2)]=log.length
      }
    }
  var ___stat_struct_layout={__size__:68,st_dev:0,st_ino:4,st_mode:8,st_nlink:12,st_uid:16,st_gid:20,st_rdev:24,st_size:28,st_atime:32,st_spare1:36,st_mtime:40,st_spare2:44,st_ctime:48,st_spare3:52,st_blksize:56,st_blocks:60,st_spare4:64};function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      var obj = FS.findObject(Pointer_stringify(path), dontResolveLastLink);
      if (obj === null || !FS.forceLoadFile(obj)) return -1;
      var offsets = ___stat_struct_layout;
      // Constants.
      HEAP32[(((buf)+(offsets.st_nlink))>>2)]=1
      HEAP32[(((buf)+(offsets.st_uid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_gid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_blksize))>>2)]=4096
      // Variables.
      HEAP32[(((buf)+(offsets.st_ino))>>2)]=obj.inodeNumber
      var time = Math.floor(obj.timestamp / 1000);
      if (offsets.st_atime === undefined) {
        offsets.st_atime = offsets.st_atim.tv_sec;
        offsets.st_mtime = offsets.st_mtim.tv_sec;
        offsets.st_ctime = offsets.st_ctim.tv_sec;
        var nanosec = (obj.timestamp % 1000) * 1000;
        HEAP32[(((buf)+(offsets.st_atim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_mtim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_ctim.tv_nsec))>>2)]=nanosec
      }
      HEAP32[(((buf)+(offsets.st_atime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_mtime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_ctime))>>2)]=time
      var mode = 0;
      var size = 0;
      var blocks = 0;
      var dev = 0;
      var rdev = 0;
      if (obj.isDevice) {
        //  Device numbers reuse inode numbers.
        dev = rdev = obj.inodeNumber;
        size = blocks = 0;
        mode = 0x2000;  // S_IFCHR.
      } else {
        dev = 1;
        rdev = 0;
        // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
        //       but this is not required by the standard.
        if (obj.isFolder) {
          size = 4096;
          blocks = 1;
          mode = 0x4000;  // S_IFDIR.
        } else {
          var data = obj.contents || obj.link;
          size = data.length;
          blocks = Math.ceil(data.length / 4096);
          mode = obj.link === undefined ? 0x8000 : 0xA000;  // S_IFREG, S_IFLNK.
        }
      }
      HEAP32[(((buf)+(offsets.st_dev))>>2)]=dev;
      HEAP32[(((buf)+(offsets.st_rdev))>>2)]=rdev;
      HEAP32[(((buf)+(offsets.st_size))>>2)]=size
      HEAP32[(((buf)+(offsets.st_blocks))>>2)]=blocks
      if (obj.read) mode |= 0x16D;  // S_IRUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH.
      if (obj.write) mode |= 0x92;  // S_IWUSR | S_IWGRP | S_IWOTH.
      HEAP32[(((buf)+(offsets.st_mode))>>2)]=mode
      return 0;
    }
var _mgCanvasLoadFont; // stub for _mgCanvasLoadFont
  var _ceil=Math.ceil;
var _mgCanvasDeleteFont; // stub for _mgCanvasDeleteFont
  function _glScissor(x0, x1, x2, x3) { Module.ctx.scissor(x0, x1, x2, x3) }
  function _glBlendFuncSeparate(x0, x1, x2, x3) { Module.ctx.blendFuncSeparate(x0, x1, x2, x3) }
var _mgCanvasGetChar; // stub for _mgCanvasGetChar
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _opendir(dirname) {
      // DIR *opendir(const char *dirname);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/opendir.html
      // NOTE: Calculating absolute path redundantly since we need to associate it
      //       with the opened stream.
      var path = FS.absolutePath(Pointer_stringify(dirname));
      if (path === null) {
        ___setErrNo(ERRNO_CODES.ENOENT);
        return 0;
      }
      var target = FS.findObject(path);
      if (target === null) return 0;
      if (!target.isFolder) {
        ___setErrNo(ERRNO_CODES.ENOTDIR);
        return 0;
      } else if (!target.read) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return 0;
      }
      var id = FS.streams.length; // Keep dense
      var contents = [];
      for (var key in target.contents) contents.push(key);
      FS.streams[id] = {
        path: path,
        object: target,
        // An index into contents. Special values: -2 is ".", -1 is "..".
        position: -2,
        isRead: true,
        isWrite: false,
        isAppend: false,
        error: false,
        eof: false,
        ungotten: [],
        // Folder-specific properties:
        // Remember the contents at the time of opening in an array, so we can
        // seek between them relying on a single order.
        contents: contents,
        // Each stream has its own area for readdir() returns.
        currentEntry: _malloc(___dirent_struct_layout.__size__)
      };
      return id;
    }
  function _readdir_r(dirp, entry, result) {
      // int readdir_r(DIR *dirp, struct dirent *entry, struct dirent **result);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/readdir_r.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        return ___setErrNo(ERRNO_CODES.EBADF);
      }
      var stream = FS.streams[dirp];
      var loc = stream.position;
      var entries = 0;
      for (var key in stream.contents) entries++;
      if (loc < -2 || loc >= entries) {
        HEAP32[((result)>>2)]=0
      } else {
        var name, inode, type;
        if (loc === -2) {
          name = '.';
          inode = 1;  // Really undefined.
          type = 4; //DT_DIR
        } else if (loc === -1) {
          name = '..';
          inode = 1;  // Really undefined.
          type = 4; //DT_DIR
        } else {
          var object;
          name = stream.contents[loc];
          object = stream.object.contents[name];
          inode = object.inodeNumber;
          type = object.isDevice ? 2 // DT_CHR, character device.
                : object.isFolder ? 4 // DT_DIR, directory.
                : object.link !== undefined ? 10 // DT_LNK, symbolic link.
                : 8; // DT_REG, regular file.
        }
        stream.position++;
        var offsets = ___dirent_struct_layout;
        HEAP32[(((entry)+(offsets.d_ino))>>2)]=inode
        HEAP32[(((entry)+(offsets.d_off))>>2)]=stream.position
        HEAP32[(((entry)+(offsets.d_reclen))>>2)]=name.length + 1
        for (var i = 0; i < name.length; i++) {
          HEAP8[(((entry + offsets.d_name)+(i))|0)]=name.charCodeAt(i)
        }
        HEAP8[(((entry + offsets.d_name)+(i))|0)]=0
        HEAP8[(((entry)+(offsets.d_type))|0)]=type
        HEAP32[((result)>>2)]=entry
      }
      return 0;
    }function _readdir(dirp) {
      // struct dirent *readdir(DIR *dirp);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/readdir_r.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      } else {
        if (!_readdir.result) _readdir.result = _malloc(4);
        _readdir_r(dirp, FS.streams[dirp].currentEntry, _readdir.result);
        if (HEAP32[((_readdir.result)>>2)] === 0) {
          return 0;
        } else {
          return FS.streams[dirp].currentEntry;
        }
      }
    }
  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _closedir(dirp) {
      // int closedir(DIR *dirp);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/closedir.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        return ___setErrNo(ERRNO_CODES.EBADF);
      } else {
        _free(FS.streams[dirp].currentEntry);
        FS.streams[dirp] = null;
        return 0;
      }
    }
  function _SDL_SetVideoMode(width, height, depth, flags) {
      ['mousedown', 'mouseup', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mouseout'].forEach(function(event) {
        Module['canvas'].addEventListener(event, SDL.receiveEvent, true);
      });
      Browser.setCanvasSize(width, height, true);
      SDL.screen = SDL.makeSurface(width, height, flags, true, 'screen');
      if (!SDL.addedResizeListener) {
        SDL.addedResizeListener = true;
        Browser.resizeListeners.push(function(w, h) {
          SDL.receiveEvent({
            type: 'resize',
            w: w,
            h: h
          });
        });
      }
      return SDL.screen;
    }
  function _SDL_Init(what) {
      SDL.startTime = Date.now();
      // capture all key events. we just keep down and up, but also capture press to prevent default actions
      if (!Module['doNotCaptureKeyboard']) {
        document.onkeydown = SDL.receiveEvent;
        document.onkeyup = SDL.receiveEvent;
        document.onkeypress = SDL.receiveEvent;
      }
      window.onunload = SDL.receiveEvent;
      SDL.keyboardState = _malloc(0x10000);
      _memset(SDL.keyboardState, 0, 0x10000);
      // Initialize this structure carefully for closure
      SDL.DOMEventToSDLEvent['keydown'] = 0x300 /* SDL_KEYDOWN */;
      SDL.DOMEventToSDLEvent['keyup'] = 0x301 /* SDL_KEYUP */;
      SDL.DOMEventToSDLEvent['keypress'] = 0x303 /* SDL_TEXTINPUT */;
      SDL.DOMEventToSDLEvent['mousedown'] = 0x401 /* SDL_MOUSEBUTTONDOWN */;
      SDL.DOMEventToSDLEvent['mouseup'] = 0x402 /* SDL_MOUSEBUTTONUP */;
      SDL.DOMEventToSDLEvent['mousemove'] = 0x400 /* SDL_MOUSEMOTION */;
      SDL.DOMEventToSDLEvent['unload'] = 0x100 /* SDL_QUIT */;
      SDL.DOMEventToSDLEvent['resize'] = 0x7001 /* SDL_VIDEORESIZE/SDL_EVENT_COMPAT2 */;
      return 0; // success
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _srand(seed) {}
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
var __ZN16mgScriptPlatform13destroyWindowEv; // stub for __ZN16mgScriptPlatform13destroyWindowEv
  function _glGetString(name_) {
      switch(name_) {
        case 0x1F00 /* GL_VENDOR */:
        case 0x1F01 /* GL_RENDERER */:
        case 0x1F02 /* GL_VERSION */:
          return allocate(intArrayFromString(Module.ctx.getParameter(name_)), 'i8', ALLOC_NORMAL);
        case 0x1F03 /* GL_EXTENSIONS */:
          return allocate(intArrayFromString(Module.ctx.getSupportedExtensions().join(' ')), 'i8', ALLOC_NORMAL);
        case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
          return allocate(intArrayFromString('OpenGL ES GLSL 1.00 (WebGL)'), 'i8', ALLOC_NORMAL);
        default:
          throw 'Failure: Invalid glGetString value: ' + name_;
      }
    }
  function _glGetIntegerv(name_, p) {
      switch(name_) { // Handle a few trivial GLES values 
        case 0x8DFA: // GL_SHADER_COMPILER
          HEAP32[((p)>>2)]=1;
          return;
        case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
          HEAP32[((p)>>2)]=0;
          return;
      }
      var result = Module.ctx.getParameter(name_);
      switch (typeof(result)) {
        case "number":
          HEAP32[((p)>>2)]=result;
          break;
        case "boolean":
          HEAP8[(p)]=result ? 1 : 0;
          break;
        case "string":
          throw 'Native code calling glGetIntegerv(' + name_ + ') on a name which returns a string!';
        case "object":
          if (result === null) {
            HEAP32[((p)>>2)]=0;
          } else if (result instanceof Float32Array ||
                     result instanceof Uint32Array ||
                     result instanceof Int32Array ||
                     result instanceof Array) {
            for (var i = 0; i < result.length; ++i) {
              HEAP32[(((p)+(i*4))>>2)]=result[i];
            }
          } else if (result instanceof WebGLBuffer) {
            HEAP32[((p)>>2)]=GL.scan(GL.buffers, result);
          } else if (result instanceof WebGLProgram) {
            HEAP32[((p)>>2)]=GL.scan(GL.programs, result);
          } else if (result instanceof WebGLFramebuffer) {
            HEAP32[((p)>>2)]=GL.scan(GL.framebuffers, result);
          } else if (result instanceof WebGLRenderbuffer) {
            HEAP32[((p)>>2)]=GL.scan(GL.renderbuffers, result);
          } else if (result instanceof WebGLTexture) {
            HEAP32[((p)>>2)]=GL.scan(GL.textures, result);
          } else {
            throw 'Unknown object returned from WebGL getParameter';
          }
          break;
        case "undefined":
          throw 'Native code calling glGetIntegerv(' + name_ + ') and it returns undefined';
        default:
          throw 'Why did we hit the default case?';
      }
    }
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getNativeFieldSize('void*');
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getNativeFieldSize('void*');
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if(format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' || type == 'E') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   (type === 'x' && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getNativeFieldSize('void*');
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if(longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/4294967296), 4294967295)>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'f':
            case 'e':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                (HEAPF64[(tempDoublePtr)>>3]=parseFloat(text),HEAP32[((argPtr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((argPtr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)])
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  var _floor=Math.floor;
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isCreate || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id = FS.streams.length; // Keep dense
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        FS.streams[id] = {
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        };
      } else {
        FS.streams[id] = {
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        };
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _tolower(chr) {
      chr = chr|0;
      if ((chr|0) < 65) return chr|0;
      if ((chr|0) > 90) return chr|0;
      return (chr - 65 + 97)|0;
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _SDL_GetTicks() {
      return Math.floor(Date.now() - SDL.startTime);
    }
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while ((HEAP8[(((psrc)+(i-1))|0)])|0 != 0);
      return pdest|0;
    }
  var _cos=Math.cos;
  var _sin=Math.sin;
  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP8[(dest)]=HEAP8[(src)];
        }
      } else {
        _memcpy(dest, src, num);
      }
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function _llvm_va_copy(ppdest, ppsrc) {
      HEAP8[(ppdest)]=HEAP8[(ppsrc)];HEAP8[(((ppdest)+(1))|0)]=HEAP8[(((ppsrc)+(1))|0)];HEAP8[(((ppdest)+(2))|0)]=HEAP8[(((ppsrc)+(2))|0)];HEAP8[(((ppdest)+(3))|0)]=HEAP8[(((ppsrc)+(3))|0)];
      /* Alternate implementation that copies the actual DATA; it assumes the va_list is prefixed by its size
      var psrc = IHEAP[ppsrc]-1;
      var num = IHEAP[psrc]; // right before the data, is the number of (flattened) values
      var pdest = _malloc(num+1);
      _memcpy(pdest, psrc, num+1);
      IHEAP[ppdest] = pdest+1;
      */
    }
  var _vsnprintf=_snprintf;
  var _vsprintf=_sprintf;
var __embind_register_void; // stub for __embind_register_void
var __embind_register_bool; // stub for __embind_register_bool
var __embind_register_integer; // stub for __embind_register_integer
var __embind_register_float; // stub for __embind_register_float
var __embind_register_cstring; // stub for __embind_register_cstring
var __embind_register_emval; // stub for __embind_register_emval
  function __ZNSt9exceptionD2Ev(){}
  var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___setErrNo.ret;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
      return ret;  // Previous break location.
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
GL.init()
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___setErrNo(0);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
var FUNCTION_TABLE = [0,0,__ZN12mgSolidPaintD2Ev,0,__ZThn140_N12mgTopControl11controlShowEPv,0,__ZN10mgFormPane16childSizeAtWidthEPKviR11mgDimension,0,__ZN16mgScriptPlatformD2Ev,0,__ZN13mgTableLayout6newRowEv
,0,__ZN10mgBreakTagD1Ev,0,__ZN9mgControl21dispatchControlEnableEPv,0,__ZN12mgConsoleTag11tagEndAttrsEP11mgXMLParser,0,__ZN9mgControl10newContextEv,0,__ZN12mgGenContext11deleteStateEPv
,0,__ZN14mgWebGLDisplay9setShaderEP8mgShader,0,__ZNK9mgControl7getSizeER11mgDimension,0,__ZThn140_N17mgSimpleScrollbar20removeScrollListenerEP16mgScrollListener,0,__ZN15mgSimpleDesktop10findWindowEP9mgControl,0,__ZN14mgVertexBufferD2Ev
,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZThn140_N15mgSimpleConsole20guiScrollSetPositionEPvi,0,__ZN13mgTableLayout12distribWidthEiii,0,__ZN13mgTableColTag11tagEndAttrsEP11mgXMLParser,0,__ZN9mgControl17dispatchMouseMoveEPviii
,0,__ZN12mgXMLScannerD0Ev,0,__ZN15mgSimpleDesktop9mouseDragEPviii,0,__ZN14mgSimpleWindow8setTitleEPKc,0,__ZN15mgCursorDefnTagD1Ev,0,__ZN14mgSimpleWindow18setContentLocationEiii
,0,__ZN14mgWebGLDisplay15renderToTextureEP14mgTextureImagej,0,__ZN18mgWebGLTextureCubeD0Ev,0,__ZN13mgSimpleLabel11setMaxLabelEPKc,0,__ZN16mgSimpleCheckbox20removeSelectListenerEP16mgSelectListener,0,__ZN15mgSimpleDesktop17setWindowLocationEP9mgControljii
,0,__ZN16mgScriptPlatform14getMultiSampleEv,0,__ZN19mgMapStringToString9removeKeyEPKc,0,__ZN8SampleUI7animateEdd,0,__ZThn140_N18mgSimpleScrollPane20guiScrollSetPositionEPvi,0,__ZN16mgSimpleCheckboxD2Ev
,0,__ZNK6mgFont9getItalicEv,0,__ZN14mgWebGLDisplay13setProjectionEii,0,__ZN10GuiTestAll10appMouseUpEii,0,__ZN9mgControl17dispatchMouseDownEPviiii,0,__ZN8SampleUI9guiChangeEPvPKc
,0,__ZN18mgGLTextureSurface13createBuffersEv,0,__ZN16mgScriptPlatform11resetTimingEv,0,__ZN19mgWebGLVertexBuffer5resetEv,0,__ZN10mgFormPane20preferredSizeAtWidthEiR11mgDimension,0,__ZN16mgDisplaySupport15setGraphicsSizeEii
,0,__ZN17mgDisplayServices13withinFrustumEdddd,0,__ZThn140_N13mgSimpleSplit10mouseEnterEPvii,0,__ZNK6mgFont15getAveCharWidthEv,0,__ZN14mgSimpleWindow11minimumSizeER11mgDimension,0,__ZN14mgGLGenSurface9loadImageEP10mgGenImage
,0,__ZThn144_N17mgSimpleScrollbar9mouseDragEPviii,0,__ZN19mgMapStringToStringD0Ev,0,__ZNK15mgMapDWordToPtr16getStartPositionEv,0,__ZN9mgTextTagD1Ev,0,___cxa_pure_virtual
,0,__ZN18mgGLTextureSurface10getSurfaceEv,0,__ZN17mgSimpleScrollbar7getViewERiS0_,0,__ZN14mgGLGenSurfaceD0Ev,0,__ZN9mgControl19dispatchControlHideEPv,0,__ZN13mgCheckboxTag8tagCloseEP11mgXMLParser
,0,__ZN9mgControl26dispatchControlRemoveChildEPv,0,__ZN7mgStyle7setAttrEPKcS1_PK6mgIcon,0,__ZN12mgXMLScanner9parseFileEPKc,0,__ZN16mgScriptPlatform14getWindowTitleER8mgString,0,__ZN16mgScriptPlatform16getMouseRelativeEv
,0,__ZNK13mgOptionsFile10getIntegerEPKci,0,__ZN13mgSimpleField5resetEv,0,__ZN19mgWebGLTextureImage12updateMemoryEiiiiPKh,0,__ZN14mgSimpleButton7mouseUpEPviiii,0,__ZN8SampleUI12guiSelectionEPvPKcj
,0,__ZN14mgGLGenSurface11deleteTilesEv,0,__ZN15mgSimpleDesktop14setWindowTitleEP9mgControlPKc,0,__ZN12mgHeadingTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN12mgTopControl16surfaceMouseExitEv,0,__ZThn140_N14mgSimpleTabbed9mouseDownEPviiii
,0,__ZN10mgFormPane16getDefaultFormatER11mgTextAlignRsS2_S2_Rj,0,__ZN13mgSimpleLabel13preferredSizeER11mgDimension,0,__ZN14mgWebGLSupport11termDisplayEv,0,__ZThn148_N12mgSimpleList17guiScrollLineDownEPv,0,__ZThn140_N10mgFormPane16getDefaultFormatER11mgTextAlignRsS2_S2_Rj
,0,__ZN10mgTextScanD0Ev,0,__ZN13mgListItemTag7tagOpenEP11mgXMLParser,0,__ZN12mgSimpleList7mouseUpEPviiii,0,__ZN12mgXMLScanner7commentEPKc,0,__ZNK11mgRectFrame15paintForegroundEP9mgContextiiii
,0,__ZN9mgControl15paintBackgroundEP9mgContext,0,__ZN15mgSimpleDesktop12guiTimerTickEdd,0,__ZN18mgMapStringToDWord9removeAllEv,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK8mgPoint3,0,__ZN13mgSimpleSplit9mouseDragEPviii
,0,__ZN14mgWebGLDisplay13deleteBuffersEv,0,__ZN16mgScriptPlatform7mouseUpEii,0,__ZN13mgTableLayout13initColWidthsEv,0,__ZN12mgGenContext7setClipEiiii,0,__ZThn144_N14mgSimpleWindow10mouseEnterEPvii
,0,__ZN9mgTextTag10tagContentEP11mgXMLParserPKci,0,__Z12mgMouseEnterii,0,__ZN6mgFontD0Ev,0,__ZN13mgIndexBufferD0Ev,0,__ZN17mgSimpleScrollbar9mouseDragEPviii
,0,__ZN10mgFontList9createTagEPKc,0,__ZN16mgScriptPlatform6getDPIEv,0,__ZN9mgListTagD0Ev,0,__ZN14mgWebGLDisplay15decalBackgroundEj,0,__ZN10mgFormPane13preferredSizeER11mgDimension
,0,__ZN13mgTableLayout16positionChildrenEii,0,__ZN10GuiTestAllD0Ev,0,__ZThn140_N13mgSimpleSplit9mouseDragEPviii,0,__ZN11mgXMLParser9createTagEPKc,0,__ZN15mgSimpleDesktop10mouseClickEPviiiii
,0,__ZN8mgPreTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN12mgGenContext8drawRectEdddd,0,__ZN13mgSimpleStackD2Ev,0,__ZN7mgImageD0Ev,0,__ZN9mgGenIconD1Ev
,0,__ZNSt9bad_allocD2Ev,0,__ZNSt9bad_allocD0Ev,0,__ZThn140_N12mgTopControl15controlAddChildEPv,0,__ZN9mgFormTagD0Ev,0,__ZN7mgStyle12getColorAttrEPKcS1_S1_R7mgColor
,0,__ZThn148_N17mgSimpleScrollbar12guiTimerTickEdd,0,__ZN16mgSimpleCheckbox8setLabelEPKc,0,__ZN9mgControl11setLocationERK7mgPoint,0,__ZN18mgSimpleScrollPane15guiScrollLineUpEPv,0,__ZThn140_N15mgSimpleDesktop10mouseEnterEPvii
,0,__ZThn140_N12mgTopControl13controlDeleteEPv,0,__ZN14mgSimpleWindow9mouseExitEPv,0,__ZN15mgErrorTableTagD0Ev,0,__ZN18mgGLTextureSurfaceD0Ev,0,__ZN9mgTextTag7tagAttrEP11mgXMLParserPKcS3_
,0,__ZThn140_N13mgSimpleField5keyUpEPvii,0,__ZThn140_N18mgSimpleScrollPane15guiScrollPageUpEPv,0,__ZN9mgControl21dispatchControlResizeEPv,0,__ZN12mgTextFormat11outputChildEP11mgChildDesc,0,__ZNK19mgMapStringToString6lookupEPKcR8mgString
,0,__ZN17mgDisplayServices8findFontEPKcjjR8mgString,0,__ZThn140_N18mgSimpleScrollPane17guiScrollPageDownEPv,0,__ZN19mgMapStringToDouble9removeKeyEPKc,0,__ZN10mgBlockTagD1Ev,0,__ZN13mgTableLayout11removeChildEP9mgControl
,0,__ZN13mgTableColTag7tagOpenEP11mgXMLParser,0,__ZN12mgErrorTable6addMsgEPKcR10mgPtrArray,0,__ZNK6mgFont9getHeightEv,0,__ZN16mgSimpleCheckbox10mouseClickEPviiiii,0,__ZN12mgGenSurface14removeResourceEPK10mgResource
,0,__ZN14mgSimpleButton17addActionListenerEP16mgActionListener,0,__ZN8SampleUI11hasKeyFocusEv,0,__ZN9mgControl13paintChildrenEP9mgContextiiii,0,__ZN12mgSimpleList9mouseMoveEPviii,0,__ZN8mgXMLTag10tagContentEP11mgXMLParserPKci
,0,__ZN9mgControl21removeControlListenerEP17mgControlListener,0,__ZN14mgSimpleButtonD0Ev,0,__ZN9mgControl6damageERK11mgRectangle,0,__ZNK18mgMapStringToDWord16getStartPositionEv,0,__ZN18mgWebGLTextureCube9setFilterEi
,0,__ZN12mgSimpleList12updateLayoutEv,0,__ZN15mgSimpleConsole15setDisplayLinesEi,0,__ZN16mgScriptPlatform7keyDownEii,0,__ZN13mgSimpleField9mouseMoveEPviii,0,__ZThn140_N10mgFormPane16childSizeAtWidthEPKviR11mgDimension
,0,__ZN13mgTableRowTag10tagContentEP11mgXMLParserPKci,0,__ZN14mgWebGLDisplayD2Ev,0,__ZNK10mgPtrArray4lastEv,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN19mgMapStringToDouble5setAtEPKcd
,0,__ZN8SampleUI6resizeEii,0,__ZN8mgStringD2Ev,0,__ZN10mgFieldTag7tagOpenEP11mgXMLParser,0,__ZN8mgPreTag10tagContentEP11mgXMLParserPKci,0,__ZN18mgSimpleScrollPane13setHScrollbarEP18mgScrollbarControl
,0,__ZN14mgGLGenSurface11stringWidthEPK9mgGenFontPKci,0,__ZN9mgControl16addFocusListenerEP15mgFocusListener,0,__ZN11mgRectFrameD0Ev,0,__ZN5mgPenD0Ev,0,__ZN13mgSimpleSplit9mouseMoveEPviii
,0,__ZN12mgTopControl17changeMouseTargetEP9mgControlii,0,__ZN12mgSimpleList5paintEP9mgContext,0,__ZThn140_N16mgSimpleCheckbox9mouseDragEPviii,0,__ZN17mgSimpleScrollbarD2Ev,0,__ZN12mgGenSurfaceD0Ev
,0,__ZN15mgSimpleConsole15guiScrollLineUpEPv,0,__ZN14mgColumnLayout11minimumSizeER11mgDimension,0,__ZN13mgTableLayout11getGridSizeEv,0,__ZN10GuiTestAll13appMouseWheelEii,0,__ZN12mgTextFormatD0Ev
,0,__ZN13mgListItemTag10tagContentEP11mgXMLParserPKci,0,__ZN12mgGenSurface11createBrushERK7mgColor,0,__ZN16mgSimpleCheckbox9mouseDragEPviii,0,__ZN12mgGenContext9drawImageEPK7mgImagedd,0,__ZThn140_N12mgTopControl11controlHideEPv
,0,__ZN14mgSimpleTabbedD2Ev,0,__ZN18mgWebGLIndexBufferD0Ev,0,__ZN16mgScriptPlatformD0Ev,0,__ZN14mgWebGLSupport12getShaderLogEjR8mgString,0,__ZN13mgSimpleStyle14createCheckboxEP9mgControlPKcS3_
,0,__ZN14mgSimpleButton10mouseEnterEPvii,0,__ZN16mgSimpleCheckboxD0Ev,0,__ZN9mgControl14addKeyListenerEP13mgKeyListener,0,__ZN18mgSimpleScrollPane13preferredSizeER11mgDimension,0,__ZN17mgDisplayServices6getFOVEv
,0,__ZN12mgSimpleList15guiScrollLineUpEPv,0,__ZN10GuiTestAll12appMouseExitEv,0,__ZN15mgSimpleDesktop9mouseExitEPv,0,__ZN8mgPreTag7tagOpenEP11mgXMLParser,0,__ZN13mgSimpleLabel5paintEP9mgContext
,0,__ZN9mgControl10setVisibleEj,0,__ZN13mgOptionsFile9createTagEPKc,0,__ZThn140_N10mgFormPane10drawStringEPKvliiPKci,0,__ZThn140_N15mgSimpleDesktop9mouseDragEPviii,0,__ZN12mgConsoleTag7tagOpenEP11mgXMLParser
,0,__ZThn140_N12mgTopControl11controlMoveEPv,0,__ZN12mgXMLScanner12tagNoContentEv,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN12mgTopControl13controlResizeEPv,0,__ZN14mgSimpleTabbed9mouseMoveEPviii
,0,__ZN9mgListTagD1Ev,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKciPKf,0,__ZN9mgFormTag10tagContentEP11mgXMLParserPKci,0,__ZN10mgGenImageD0Ev,0,__ZN12mgTopControl11setKeyFocusEP9mgControl
,0,__ZN12mgGenContext14drawIconWithinEPK6mgIcondddd,0,__ZN10mgLabelTag8tagCloseEP11mgXMLParser,0,__ZN13mgErrorMsgTag10tagContentEP11mgXMLParserPKci,0,__ZN12mgSimpleList9mouseExitEPv,0,__ZN19mgWebGLTextureArrayD0Ev
,0,__ZN9mgControl13dispatchKeyUpEPvii,0,__ZThn148_N12mgSimpleList15guiScrollLineUpEPv,0,__ZN14mgTextureArrayD2Ev,0,__ZThn140_N16mgSimpleCheckbox10mouseEnterEPvii,0,__ZN8mgXMLTag8tagCloseEP11mgXMLParser
,0,__ZN9mgTextTagD0Ev,0,__ZN14mgSimpleWindow8setFlagsEj,0,__ZN9mgControl11minimumSizeER11mgDimension,0,__ZN12mgErrorTable9createTagEPKc,0,__ZN14mgWebGLDisplay11clearBufferEi
,0,__ZN12mgGenContext12setTextColorERK7mgColor,0,__ZN8mgShaderD0Ev,0,__ZN18mgMapStringToDWord5setAtEPKcj,0,__ZN11mgXMLParser11popTagStackEv,0,__ZN19mgWebGLTextureImageD2Ev
,0,__ZThn140_N13mgSimpleSplit9mouseMoveEPviii,0,__ZN15mgMapDWordToPtrD2Ev,0,__ZN10mgFragDescD0Ev,0,__ZN13mgSimpleStyle11createStackEP9mgControlPKc,0,__ZN13mgSimpleStack10selectPaneEPKc
,0,__ZThn140_N13mgSimpleField7keyDownEPvii,0,__ZN11mgChildDescD1Ev,0,__ZNK16mgMapStringToPtr6lookupEPKcRPKv,0,__ZN13mgSimpleField8getFrameERPK7mgFrameR7mgColor,0,__ZN14mgSimpleTabbed10removePaneEPKc
,0,__ZN13mgIndexBufferD2Ev,0,__ZN10mgLabelTagD0Ev,0,__ZN16mgScriptPlatform9logTimingEj,0,__ZN7mgStyle13getDoubleAttrEPKcS1_S1_Rd,0,__ZN12mgCursorDefnD2Ev
,0,__ZN13mgTableLayout12setCellFrameEPK7mgFrame,0,__ZN8mgXMLTagD0Ev,0,__ZThn140_N12mgSimpleList9mouseDownEPviiii,0,__ZN18mgSimpleScrollPane20guiScrollSetPositionEPvi,0,__ZN9mgControl15paintForegroundEP9mgContext
,0,__ZN10GuiTestAllD2Ev,0,__ZN14mgWebGLSupport10checkErrorEv,0,__ZN14mgSimpleButton15sendActionEventEPKc,0,__ZN13mgSimpleSplit9mouseExitEPv,0,__ZN9mgControl9setLayoutEP15mgLayoutManager
,0,__ZN9mgControl12isMouseFocusEv,0,__ZN9mgControl8getStyleEv,0,__ZN16mgSimpleCheckbox10mouseEnterEPvii,0,__ZNK12mgGenSurface14getSurfaceSizeERiS0_,0,__ZN16mgSimpleCheckbox8setStateEj
,0,__ZN15mgCursorDefnTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN13mgTableLayout8setChildEPvP9mgControl,0,__ZN13mgListItemTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN8mgXMLTag10getBooleanEP11mgXMLParserPKcS3_,0,__ZN15mgSimpleDesktop14windowMaximizeEP9mgControl
,0,__ZThn140_N10mgFormPane8getUnitsEv,0,__ZN14mgWebGLDisplay19createTextureMemoryEiiij,0,__ZN18mgSimpleScrollPane17guiScrollLineDownEPv,0,__ZN10mgTableTag8tagCloseEP11mgXMLParser,0,__ZN15mgSimpleConsole15guiScrollPageUpEPv
,0,__ZN9mgControl13notifyVisibleEj,0,__ZThn140_N14mgSimpleButton9mouseExitEPv,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZN9mgControl15dispatchKeyCharEPvii,0,__ZN13mgTableRowTagD1Ev
,0,__ZN9mgControl6damageEiiii,0,__ZN12mgGenContext8drawIconEPK6mgIcondddd,0,__ZN10__cxxabiv119__pointer_type_infoD0Ev,0,__ZN10GuiTestAll14updateMovementEdd,0,__ZN16mgScriptPlatform7exitAppEv
,0,__ZN14mgSimpleButton10mouseClickEPviiiii,0,__ZThn140_N12mgSimpleList10mouseEnterEPvii,0,__ZN10mgFieldTag11tagEndAttrsEP11mgXMLParser,0,__ZThn140_N14mgSimpleButton7mouseUpEPviiii,0,__ZThn140_N15mgSimpleConsole17guiScrollLineDownEPv
,0,__ZNK13mgStringArray5firstEv,0,__ZN13mgStringArray5setAtEiPKc,0,__ZN13mgSimpleField9mouseDragEPviii,0,__ZN13mgFontListTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN14mgWebGLDisplay15renderToDisplayEv
,0,__ZN13mgSimpleSplit12updateLayoutEv,0,__ZN19mgWebGLVertexBufferD0Ev,0,__ZN16mgScriptPlatform17setDisplayLibraryEPKc,0,__ZN12mgTextFormat12getMinHeightEv,0,__ZN14mgSimpleButton9mouseExitEPv
,0,__ZN7mgStyle7setAttrEPKcS1_RK7mgColor,0,__ZN10mgTableTag7tagOpenEP11mgXMLParser,0,__ZN15mgSimpleDesktop12windowResizeEP9mgControl,0,__ZN7mgStyle7setAttrEPKcS1_PK7mgFrame,0,__ZN9mgParaTagD1Ev
,0,__ZN12mgConsoleTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZThn140_N16mgSimpleCheckbox7mouseUpEPviiii,0,__ZThn140_N10mgFormPane13measureStringEPKvPKci,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcff,0,__ZN7mgStyle12getFrameAttrEPKcS1_S1_RPK7mgFrame
,0,__ZN13mgWebGLShaderD0Ev,0,__ZN7mgStyle7setAttrEPKcS1_PK5mgPen,0,__ZN15mgSimpleDesktop14windowMinimizeEP9mgControl,0,__ZN12mgFormParser13processTopTagEP8mgXMLTag,0,__ZN6mgIconD0Ev
,0,__ZN15mgMapDWordToPtr5setAtEjPKv,0,__ZN9mgControl7setNameEPKc,0,__ZN14mgColumnLayout13preferredSizeER11mgDimension,0,__ZN9mgControl7getPageEv,0,__ZN15mgSimpleDesktop13surfaceWindowEP9mgControl
,0,__ZNK19mgMapStringToDouble6lookupEPKcRd,0,__ZN9mgParaTag7tagOpenEP11mgXMLParser,0,__ZN15mgSimpleConsole15updateScrollersEv,0,__ZN14mgGLGenSurface13createBuffersEv,0,__ZN12mgFormParser7popListEv
,0,__ZN12mgXMLScanner5parseEiPKc,0,__ZN9mgControl11setKeyFocusEPS_,0,__ZN10mgFontListD0Ev,0,__ZThn140_N13mgSimpleSplit10mouseClickEPviiiii,0,__ZN13mgSimpleSplit11minimumSizeER11mgDimension
,0,__ZN19mgMapStringToString5setAtEPKcS1_,0,__ZN8SampleUID2Ev,0,__ZN12mgGenSurfaceD2Ev,0,__ZN13mgOptionsFile13processTopTagEP8mgXMLTag,0,__ZNK7mgFrame15paintBackgroundEP9mgContextiiii
,0,__ZN12mgSimpleList15updateScrollersEv,0,__ZN16mgScriptPlatform14setMultiSampleEj,0,__ZN9mgControl21dispatchControlDeleteEPv,0,__ZN12mgGenContext9drawImageEPK7mgImagedddd,0,__ZN16mgScriptPlatform18drawOverlayTextureEjiiii
,0,__ZN14mgWebGLDisplay10decalStartEv,0,__ZN15mgSimpleDesktop10windowMoveEP9mgControl,0,__ZN16mgMapStringToPtrD2Ev,0,__ZN14mgSimpleTabbed9mouseDownEPviiii,0,__ZN12mgGenSurface6damageEiiii
,0,__ZN12mgGenSurface6repairER11mgRectangle,0,__ZN13mgSimpleStyle11createLabelEP9mgControlPKcS3_,0,__ZN15mgSimpleDesktop7mouseUpEPviiii,0,__ZN9mgControl18removeTimeListenerEP14mgTimeListener,0,__ZThn140_N15mgSimpleDesktop9mouseMoveEPviii
,0,__ZN14mgColumnLayout20preferredSizeAtWidthEiR11mgDimension,0,__ZN9mgControl13getMouseFocusEv,0,__ZN16mgSimpleCheckbox9mouseDownEPviiii,0,__ZN11mgXMLParser13getTagStackAtEi,0,__ZNK6mgFont9getAscentEv
,0,__ZN14mgWebGLDisplay11setLightDirEddd,0,__ZThn140_N15mgSimpleDesktop9mouseExitEPv,0,__ZN8SampleUI9guiActionEPvPKc,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKci,0,__ZN13mgSimpleField12guiFocusLostEPv
,0,__ZN14mgGLGenSurface9stringFitEPK9mgGenFontPKcii,0,__ZN14mgWebGLDisplay10setZEnableEj,0,__ZN13mgListItemTag8tagCloseEP11mgXMLParser,0,__ZThn140_N17mgSimpleScrollbar8setRangeEii,0,__ZN14mgWebGLDisplay15newVertexBufferEiPK14mgVertexAttribij
,0,__ZN17mgDisplayServices16setMouseRelativeEj,0,__ZN15mgErrorTableTagD1Ev,0,__ZN16mgSimpleCheckbox7mouseUpEPviiii,0,__ZN11mgXMLParser13processTopTagEP8mgXMLTag,0,__ZN18mgSimpleScrollPane11minimumSizeER11mgDimension
,0,__ZThn140_N18mgSimpleScrollPane15guiScrollLineUpEPv,0,__ZN13mgTableRowTag7tagOpenEP11mgXMLParser,0,__ZN9mgGenFontD0Ev,0,__ZNK13mgStringArrayixEi,0,__ZN12mgErrorTable10createTextER8mgStringPKcS3_S3_
,0,__ZN12mgOptionsTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZNK10mgPtrArray3topEv,0,__ZN10mgFormPaneD0Ev,0,__ZN20mgPlatformErrorTableD0Ev,0,__ZN10mgFormPane8setFrameEPK7mgFrame
,0,__ZN20mgPlatformErrorTableD1Ev,0,__ZN13mgErrorVarTag7tagOpenEP11mgXMLParser,0,__ZN15mgSimpleDesktop20enableWindowFeaturesEP9mgControlj,0,__ZN14mgSimpleTabbed11getSelectedER8mgString,0,__ZN12mgHeadingTagD1Ev
,0,__ZN9mgControl15releaseKeyFocusEv,0,__ZN9mgControl21getLocationInAncestorEPS_R7mgPoint,0,__ZN18mgWebGLIndexBuffer11loadDisplayEv,0,__ZN12mgTopControl10newContextEv,0,__ZN16mgScriptPlatform18getFontDirectoriesER13mgStringArray
,0,__ZN11mgButtonTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN14mgSimpleTabbed10mouseEnterEPvii,0,__ZN12mgGenSurface9createPenEdRK7mgColor,0,__ZN14mgColumnLayout15paintForegroundEP9mgContext,0,__ZN10__cxxabiv123__fundamental_type_infoD0Ev
,0,__ZN6mgIconD1Ev,0,__ZN9mgControl16getLocationInTopER7mgPoint,0,__ZThn140_N16mgSimpleCheckbox10mouseClickEPviiiii,0,__ZN9mgFontTagD2Ev,0,__ZN14mgColumnLayoutD0Ev
,0,__ZN14mgSimpleButton9mouseDragEPviii,0,__ZThn144_N17mgSimpleScrollbar10mouseEnterEPvii,0,__ZN12mgSimpleList12setItemStateEPKcj,0,__ZThn140_N12mgTopControl14controlDisableEPv,0,__ZN9mgTextTag7tagOpenEP11mgXMLParser
,0,__ZN8SampleUI13useMousePointEii,0,__ZThn140_N17mgSimpleScrollbar7setViewEii,0,__ZThn140_N10mgFormPane7getFontEPKcsjj,0,__ZN15mgMapDWordToPtr9removeAllEv,0,__ZN12mgTextFormat12clearMarginsE11mgTextAlign
,0,__ZN8mgPreTagD1Ev,0,__ZN9mgControl10setEnabledEj,0,__ZNK13mgOptionsFile10getBooleanEPKcj,0,__ZN14mgSimpleWindow9mouseDownEPviiii,0,__ZN10GuiTestAll17appRequestDisplayEv
,0,__ZThn144_N17mgSimpleScrollbar10mouseClickEPviiiii,0,__ZN16mgUtilErrorTableD1Ev,0,__ZN9mgControl8addChildEPS_,0,__ZN10mgFormPane11setCntlNameEPKcP9mgControl,0,__ZN12mgErrorTable7msgTextER8mgStringPK10mgErrorMsg
,0,__ZN12mgTopControl12surfaceKeyUpEii,0,__ZN10mgTextDrawD2Ev,0,__ZN10mgFormPane8getUnitsEv,0,__ZN15mgSimpleDesktop21removeDesktopListenerEP17mgDesktopListener,0,__ZN9mgControl10isKeyFocusEv
,0,__ZN11mgXMLParserD0Ev,0,__ZN16mgScriptPlatform12createWindowEv,0,__ZN12mgGenContext10drawStringEPKcidd,0,__ZN18mgSimpleScrollPane15getScrollParentEv,0,__ZN14mgWebGLDisplay8initViewEv
,0,__ZN15mgSimpleDesktop5paintEP9mgContext,0,__ZN7mgStyle11getIconAttrEPKcS1_S1_RPK6mgIcon,0,__ZNK9mgControl7getNameEv,0,__ZN13mgErrorMsgTagD1Ev,0,__ZN7mgStyle7setAttrEPKcS1_PK7mgBrush
,0,__ZN10emscripten8internal7InvokerIvJEE6invokeEPFvvE,0,__ZN13mgSimpleField7setTextEPKc,0,__ZN14mgSimpleWindow10mouseEnterEPvii,0,__ZN12mgTextFormat7newWordEv,0,__ZN12mgTextFormat7addFragEjPKci
,0,__ZN9mgControl12sinkToBottomEv,0,__ZN14mgSimpleWindow9mouseMoveEPviii,0,__ZN13mgErrorMsgTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN13mgTableLayout13getRowHeightsEv,0,__ZN14mgGLGenSurface14setSurfaceSizeEii
,0,__ZN12mgFormParser8pushListEP9mgListTag,0,__ZN13mgSimpleStack7addPaneEPKc,0,__ZN13mgCheckboxTag7tagOpenEP11mgXMLParser,0,__ZN12mgHeadingTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN13mgTableLayoutD2Ev
,0,__ZN14mgWebGLDisplay18drawOverlaySurfaceEPK16mgTextureSurfaceii,0,__ZN13mgTableLayout12setRowWeightEi,0,__ZN17mgDisplayServicesD0Ev,0,__ZN14mgWebGLDisplay17canRepeatTexturesEv,0,__ZN10mgPtrArray3popEv
,0,__ZN15mgSimpleDesktop9mouseDownEPviiii,0,__ZN10GuiTestAll8appKeyUpEii,0,__ZNK9mgGenFont12stringExtentEPKciR7mgPointR11mgRectangle,0,__ZN17mgDisplayServices6setDPIEi,0,__ZN10mgFormPane19setDefaultTextColorERK7mgColor
,0,__ZN14mgWebGLDisplay15getMVPTransformER9mgMatrix4,0,__ZN16mgScriptPlatform11scanFontDirER13mgStringArrayPKc,0,__ZN13mgFontListTagD0Ev,0,__ZN12mgXMLScanner9attrValueEPKc,0,__ZN15mgSimpleConsole10formatLineEiRK7mgColorPK6mgFontPKci
,0,__ZN10emscripten8internal7InvokerIvJiiiEE6invokeEPFviiiEiii,0,__ZN9mgFontTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZThn140_N12mgSimpleList10mouseClickEPviiiii,0,__ZN7mgStyle13getStringAttrEPKcS1_S1_R8mgString,0,__ZN12mgXMLScanner7contentEPKci
,0,__ZN12mgGenContext8setBrushEPK7mgBrush,0,__ZN12mgSimpleList14canMultiSelectEv,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN12mgGenContext12setAlphaModeEi,0,__ZNK12mgSolidPaint5paintEP9mgContextiiii
,0,__ZN14mgWebGLDisplay4drawEiP14mgVertexBufferP13mgIndexBufferii,0,__ZN17mgSimpleScrollbar17addScrollListenerEP16mgScrollListener,0,__ZNK7mgFrame13getInsideRectER11mgRectangle,0,__ZN16mgScriptPlatform4idleEv,0,__ZN12mgTopControl13getMouseFocusEv
,0,__ZN12mgSimpleList17guiScrollLineDownEPv,0,__ZN7mgImageD1Ev,0,__ZN13mgSimpleField10getCursorXERK8mgString,0,__ZN11mgXMLParser7findTagEPKc,0,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi
,0,__ZN9mgFormTagD1Ev,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK9mgMatrix4,0,__ZN9mgTextTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN15mgSimpleDesktop10showWindowEP9mgControl,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK9mgMatrix3
,0,__ZN17mgDisplayServices12setEyeMatrixERK9mgMatrix4,0,__ZN18mgGLTextureSurfaceD2Ev,0,__ZNK14mgGLGenSurface10displayDPIEv,0,__ZN17mgDisplayServices10cursorMoveEii,0,__ZN13mgStringArray9removeAllEv
,0,__ZNK9mgControl8getChildEi,0,__ZN12mgSimpleList8addEntryEPKcS1_PK6mgIcon,0,__ZN13mgOptionsFileD0Ev,0,__ZNK7mgFrame14getOutsideRectER11mgRectangle,0,__ZN17mgDisplayServices12cursorEnableEj
,0,__ZN14mgSimpleTabbed7addPaneEPKcS1_,0,__ZN9mgControl18addControlListenerEP17mgControlListener,0,__ZN14mgSimpleWindow5paintEP9mgContext,0,__ZN9mgRuleTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN14mgWebGLSupport11swapBuffersEv
,0,__ZN15mgSimpleDesktop11windowCloseEP9mgControl,0,__ZN12mgSimpleList20guiScrollSetPositionEPvi,0,__ZN13mgTextureCubeD2Ev,0,__ZN17mgDisplayServices13setScreenSizeEii,0,__ZN14mgSimpleWindowD2Ev
,0,__ZN17mgDisplayServices11cursorTrackEj,0,__ZN14mgWebGLDisplay10loadShaderEPKcPK14mgVertexAttrib,0,__ZN17mgDisplayServices13getCursorPosnERiS0_,0,__ZN13mgTableLayout9removeAllEv,0,__ZNK14mgGLGenSurface11drawOverlayEii
,0,__ZN9mgControl19dispatchControlMoveEPv,0,__ZN16mgScriptPlatform15getWindowBoundsERiS0_S0_S0_,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN14mgWebGLSupport12checkVersionEiiR8mgString,0,__ZThn140_N14mgSimpleTabbed10mouseEnterEPvii
,0,__ZN17mgSimpleScrollbar7setViewEii,0,__ZN9mgListTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN13mgCheckboxTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN9mgControl12takeKeyFocusEv,0,__ZN12mgTextFormat9initChildEP11mgChildDesci
,0,__ZN12mgSimpleList15setDisplayLinesEi,0,__ZN9mgControlD2Ev,0,__ZN16mgSimpleCheckbox8getStateEv,0,__ZThn4_N8SampleUI12guiSelectionEPvPKcj,0,__ZN19mgMapStringToDoubleD2Ev
,0,__ZN16mgScriptPlatform10screenShotEPKc,0,__ZN13mgTableLayout15paintForegroundEP9mgContext,0,__ZN9mgRuleTag7tagOpenEP11mgXMLParser,0,__ZN8mgXMLTag9getDoubleEP11mgXMLParserPKcS3_,0,__ZN9mgParaTag8tagCloseEP11mgXMLParser
,0,__ZN11mgXMLParser8attrNameEPKc,0,__ZN13mgSimpleSplitD0Ev,0,__ZNK19mgMapStringToString6lengthEv,0,__ZN12mgGenContext9translateEdd,0,__ZN12mgXMLScanner8tagCloseEPKc
,0,__ZN17mgDisplayServices9eyeVectorER8mgPoint3,0,__ZN15mgCursorDefnTagD0Ev,0,__ZN16mgScriptPlatform12getDepthBitsEv,0,__ZN9mgControl9getBoundsER11mgRectangle,0,__ZN18mgWebGLTextureCubeD2Ev
,0,__ZNK18mgMapStringToDWord6lookupEPKcRj,0,__ZNK9mgControl7getSizeERiS0_,0,__ZN12mgHeadingTag7tagOpenEP11mgXMLParser,0,__ZN10mgFormPane18getDefaultFontSizeEv,0,__ZN12mgTopControl14controlDisableEPv
,0,__ZN18mgMapStringToDWordD2Ev,0,__ZThn140_N15mgSimpleDesktop10mouseClickEPviiiii,0,__ZN17mgSimpleScrollbar9mouseMoveEPviii,0,__ZN13mgSimpleSplit5paintEP9mgContext,0,__ZThn144_N17mgSimpleScrollbar9mouseMoveEPviii
,0,__ZN13mgTableLayoutD0Ev,0,__ZN12mgTextFormat9addTargetEPi,0,__ZN9mgControl12paintControlEP9mgContextiiii,0,__ZThn140_N16mgSimpleCheckbox9mouseDownEPviiii,0,__ZN12mgXMLScanner7tagOpenEPKc
,0,__ZN14mgSimpleTabbed7mouseUpEPviiii,0,__ZN13mgTableColTagD1Ev,0,__ZN15mgSimpleConsole5paintEP9mgContext,0,__ZThn148_N12mgSimpleList20guiScrollSetPositionEPvi,0,__ZN19mgWebGLTextureImageD0Ev
,0,__ZNK11mgRectFrame13getInsideRectER11mgRectangle,0,__ZThn140_N12mgSimpleList9mouseMoveEPviii,0,__ZN14mgVertexBuffer5resetEv,0,__ZN15mgMapDWordToPtr9removeKeyEj,0,__ZN12mgSimpleList20removeSelectListenerEP16mgSelectListener
,0,__ZN5mgPenD1Ev,0,__ZN17mgDisplayServices13cursorSetPosnEii,0,__ZN13mgTableLayout11stretchRowsEiiij,0,__ZN14mgWebGLDisplay4drawEiP14mgVertexBufferP13mgIndexBuffer,0,__ZN12mgConsoleTagD0Ev
,0,__ZN14mgWebGLDisplay10setTextureEPK14mgTextureArrayi,0,__ZN15mgSimpleDesktop13preferredSizeER11mgDimension,0,__ZN8mgPreTag8tagCloseEP11mgXMLParser,0,__ZN13mgSimpleSplit13preferredSizeER11mgDimension,0,__ZN12mgTextBufferD2Ev
,0,__ZN17mgSimpleScrollbar9mouseDownEPviiii,0,__ZNK12mgXMLScanner8errorMsgEPKcS1_S1_z,0,__ZN13mgTableLayout11stretchColsEiiij,0,__ZN10GuiTestAll7turnEyeEii,0,__ZN7mgStyle10getPenAttrEPKcS1_S1_RPK5mgPen
,0,__ZNK15mgMapDWordToPtr12getNextAssocERiRjRPKv,0,__ZN13mgTableLayout12getTableSizeEv,0,__ZN14mgWebGLDisplay10setTextureEPK13mgTextureCubei,0,__ZN11mgXMLParser12tagNoContentEv,0,__ZThn140_N17mgSimpleScrollbar7getViewERiS0_
,0,__ZN19mgMapStringToDoubleD0Ev,0,__ZN12mgTopControl15controlAddChildEPv,0,__ZN16mgSimpleCheckbox13preferredSizeER11mgDimension,0,__ZN12mgSimpleList15getSelectedItemEiR8mgString,0,__ZN14mgWebGLDisplay15setLightAmbientEddd
,0,__ZN9mgControl20preferredSizeAtWidthEiR11mgDimension,0,__ZN16mgSimpleCheckbox15sendSelectEventEv,0,__ZN15mgSimpleDesktop14setContentSizeEP9mgControlii,0,__ZN10GuiTestAll8viewDrawEv,0,__Z9mgKeyDownii
,0,__ZN14mgGLGenSurface18fillImageRectangleEP17mgGenContextStatePvdddddddd,0,__ZN14mgWebGLDisplay10drawCursorEv,0,__ZN12mgGenContext7getClipER11mgRectangle,0,__ZN10mgResourceD0Ev,0,__ZN7mgStyleD2Ev
,0,__ZN10GuiTestAll13appMouseEnterEii,0,__ZN13mgSimpleLabel11minimumSizeER11mgDimension,0,__ZN12mgTopControl11controlMoveEPv,0,__ZNK14mgSimpleWindow14getContentSizeER11mgDimension,0,__ZN9mgControl19dispatchControlShowEPv
,0,__ZThn8_N8SampleUI9guiChangeEPvPKc,0,__ZN14mgWebGLSupport17compileShaderPairEPKcS1_iPS1_PKj,0,__ZN12mgErrorTableD0Ev,0,__ZN19mgWebGLVertexBuffer13unloadDisplayEv,0,__ZN9mgControl17dispatchMouseDragEPviii
,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN13mgCheckboxTagD1Ev,0,__ZN16mgScriptPlatform12mouseMoveRelEiii,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,__ZThn144_N14mgSimpleButton12guiFocusLostEPv
,0,__ZN9mgControl9setBoundsERK11mgRectangle,0,__ZN12mgFormParserD2Ev,0,__ZN9mgControl5paintEP9mgContext,0,__ZN13mgSimpleField20removeChangeListenerEP16mgChangeListener,0,__ZNK18mgGLTextureSurface11drawOverlayEii
,0,__ZThn140_N12mgTopControl13controlResizeEPv,0,__ZN9mgParaTag10tagContentEP11mgXMLParserPKci,0,__ZN13mgTableColTagD0Ev,0,__ZN10mgFieldTag8tagCloseEP11mgXMLParser,0,__ZN13mgTableLayout13preferredSizeER11mgDimension
,0,__ZN18mgSimpleScrollPane15updateScrollersEv,0,__ZN12mgFormParser7topListEv,0,__ZN11mgButtonTag8tagCloseEP11mgXMLParser,0,__ZN8mgXMLTag10getIntegerEP11mgXMLParserPKcS3_,0,__ZN14mgWebGLDisplay10setTextureEPK14mgTextureImagei
,0,__ZN11mgXMLParser9attrValueEPKc,0,__ZN9mgControl11removeChildEPS_,0,__ZN18mgSimpleScrollPaneD0Ev,0,__ZN10mgFormPane7getFontEPKcsjj,0,__ZThn144_N17mgSimpleScrollbar9mouseDownEPviiii
,0,__ZN14mgSimpleButton5paintEP9mgContext,0,__ZN12mgTextFormat10newMarginsEv,0,__ZN14mgGLGenSurface10drawStringEP17mgGenContextStatePKcidd,0,__ZN12mgTextFormat8addSpaceEi,0,__ZNK15mgMapDWordToPtr6lengthEv
,0,__ZN9mgRuleTag8tagCloseEP11mgXMLParser,0,__ZN9mgFormTag7tagOpenEP11mgXMLParser,0,__ZN17mgDisplayServices12getDepthBitsEv,0,__ZN12mgOptionsTagD0Ev,0,__ZThn140_N17mgSimpleScrollbar10isFullViewEv
,0,__ZN7mgStyle7setAttrEPKcS1_S1_,0,__ZN16mgSimpleCheckbox11minimumSizeER11mgDimension,0,__ZN9mgControl19removeMouseListenerEP15mgMouseListener,0,__ZThn140_N13mgSimpleField7keyCharEPvii,0,__ZN16mgScriptPlatform13setErrorTableEP12mgErrorTable
,0,__ZN12mgTopControl14surfaceKeyCharEii,0,__ZN14mgSimpleTabbed12updateLayoutEv,0,__ZN9mgControl9getLayoutEv,0,__ZThn144_N15mgSimpleDesktop12guiTimerTickEdd,0,__ZN13mgTableLayout16setColRightInsetEi
,0,__ZN16mgScriptPlatform16setMouseRelativeEj,0,__ZN14mgColumnLayout11removeChildEP9mgControl,0,__ZN10GuiTestAll7appIdleEv,0,__ZNK15mgMapDWordToPtr6lookupEjRPKv,0,__ZN12mgTopControl16surfaceMouseDownEiiii
,0,__ZN13mgSimpleStyle11createFieldEP9mgControlPKc,0,__ZN14mgSimpleTabbed10selectPaneEPKc,0,__ZN14mgGLGenSurface16resizeTiledImageEii,0,__ZN10GuiTestAll7appInitEv,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib
,0,__ZN9mgControl15dispatchMouseUpEPviiii,0,__ZN14mgSimpleButton14guiFocusGainedEPv,0,__ZN17mgDisplayServices18frustumBuildPlanesEv,0,__ZN14mgWebGLSupport14builtinShadersEv,0,__ZN9mgControl16addMouseListenerEP15mgMouseListener
,0,__ZNK19mgMapStringToString16getStartPositionEv,0,__ZN11mgXMLParser16getTagStackDepthEv,0,__ZN7mgFrameD2Ev,0,__ZN10GuiTestAll12appMouseMoveEiii,0,__ZN14mgWebGLSupport11initDisplayEv
,0,__ZThn140_N15mgSimpleConsole15guiScrollLineUpEPv,0,__ZN13mgSimpleField7mouseUpEPviiii,0,__ZN10mgTableTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZThn140_N16mgSimpleCheckbox9mouseMoveEPviii,0,__ZN9mgRuleTagD1Ev
,0,__ZN16mgScriptPlatform9mouseExitEv,0,__ZN12mgGenContext8setStateEPv,0,__ZN10mgResourceD1Ev,0,__ZThn144_N14mgSimpleWindow9mouseDownEPviiii,0,__ZN13mgSimpleSplitD2Ev
,0,__ZN18mgWebGLIndexBufferD2Ev,0,__Z14mgMouseMoveAbsiii,0,__ZN14mg3DErrorTableD0Ev,0,__ZN10mgFieldTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN14mgGLGenSurface8loadIconEP9mgGenIcon
,0,__ZN12mgXMLScanner12CDATAContentEPKci,0,__ZN12mgGenSurface12saveResourceEPK10mgResource,0,__ZN14mgWebGLDisplay14newIndexBufferEijj,0,__ZN16mgScriptPlatform13windowResizedEii,0,__ZN11mgButtonTagD1Ev
,0,__ZN14mgGLGenSurface13deleteBuffersEv,0,__ZN15mgSimpleConsoleD2Ev,0,__ZN13mgStringArray8insertAtEiPKc,0,__ZN9mgControl12isAncestorOfEPS_,0,__ZN12mgXMLScanner8attrNameEPKc
,0,__ZN13mgStringArrayD0Ev,0,__ZN14mgWebGLDisplay9clearViewEv,0,__ZN16mgScriptPlatform16setSwapImmediateEj,0,__ZN10GuiTestAll10appKeyDownEii,0,__ZN13mgSimpleField10mouseClickEPviiiii
,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZN13mgSimpleLabelD2Ev,0,__ZNK13mgOptionsFile9getDoubleEPKcd,0,__ZN10mgBlockTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN10mgBlockTag7tagOpenEP11mgXMLParser
,0,__ZN7mgStyle7setAttrEPKcS1_PK7mgPaint,0,__ZN12mgSimpleList15guiScrollPageUpEPv,0,__ZN8SampleUI10toggleHelpEv,0,__ZN15mgSimpleConsole20guiScrollSetPositionEPvi,0,__ZN12mgGenContext10getSurfaceEv
,0,__ZThn140_N14mgSimpleButton9mouseDownEPviiii,0,__ZN14mgVertexBufferD0Ev,0,__ZN10mgFontListD2Ev,0,__ZN12mgTopControl17surfaceMouseEnterEii,0,__ZN16mgScriptPlatform11swapBuffersEv
,0,__ZN12mgSimpleListD0Ev,0,__ZN12mgFormParserD0Ev,0,__ZN12mgGenSurface14setSurfaceSizeEii,0,__ZN10mgErrorMsgD0Ev,0,__ZN15mgSimpleDesktop10mouseEnterEPvii
,0,__ZN13mgSimpleField11minimumSizeER11mgDimension,0,__ZN13mgTableLayout12setColWeightEi,0,__ZN13mgSimpleSplit10mouseEnterEPvii,0,__ZN11mgXMLParser7contentEPKci,0,__ZN12mgSimpleList11minimumSizeER11mgDimension
,0,__ZN12mgTopControl13controlEnableEPv,0,__ZN12mgSimpleList17guiScrollPageDownEPv,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK8mgPoint4,0,__ZN8SampleUI18createControlPanelEP9mgControl,0,__ZN12mgOptionsTagD1Ev
,0,__ZThn140_N17mgSimpleScrollbar8getRangeERiS0_,0,__ZN12mgTopControl16surfaceMouseDragEiii,0,__ZN12mgTopControl6damageEiiii,0,__ZThn144_N12mgSimpleList14guiFocusGainedEPv,0,__ZNK6mgFont7getBoldEv
,0,__ZN13mgTableLayout17setRowBottomInsetEi,0,__ZN10mgFormPane11minimumSizeER11mgDimension,0,__ZN12mgSimpleList12guiFocusLostEPv,0,__ZN15mgSimpleDesktopD0Ev,0,__ZN9mgControl11setLocationEii
,0,__ZN19mgMapStringToStringD2Ev,0,__ZN13mgSimpleFieldD2Ev,0,__ZN9mgRuleTag10tagContentEP11mgXMLParserPKci,0,__ZN12mgGenSurface10createIconEPKc,0,__ZN12mgGenSurface9createPenEdPKc
,0,__ZN9mgControl19removeFocusListenerEP15mgFocusListener,0,__ZN14mgWebGLDisplay11setMatColorEdddd,0,__ZN12mgFormParser7getCntlEPKc,0,__ZN14mgWebGLSupportD0Ev,0,__ZN8SampleUI13hasMouseFocusEv
,0,__ZN12mgCursorDefnD0Ev,0,__ZN16mgSimpleCheckbox17addSelectListenerEP16mgSelectListener,0,__ZN13mgSimpleStack11minimumSizeER11mgDimension,0,__ZN12mgGenSurface18removeAllResourcesEv,0,__ZN16mgScriptPlatform10mouseEnterEii
,0,__ZN14mgWebGLDisplay16loadShaderSourceEPKcS1_S1_PK14mgVertexAttrib,0,__ZN10mgFormPane7getCntlEPKc,0,__ZN16mgScriptPlatform11termDisplayEv,0,__ZN9mgControl19dispatchFocusGainedEPv,0,__ZN10GuiTestAll16appDeleteBuffersEv
,0,__ZN12mgGenSurface9createPenEddddd,0,__ZN13mgTableColTag10tagContentEP11mgXMLParserPKci,0,__ZN9mgRuleTagD0Ev,0,__ZN10mgFormPane16childSetPositionEPKviiii,0,__ZN16mgScriptPlatform12mouseMoveAbsEiii
,0,__ZN14mgWebGLDisplay17getOverlayShadersERP8mgShaderS2_S2_S2_S2_,0,__ZN16mgScriptPlatform16getSwapImmediateEv,0,__ZN14mgWebGLDisplay8decalEndEv,0,__ZN13mgSimpleSplit7addPaneEi,0,__ZN17mgSimpleScrollbar5paintEP9mgContext
,0,__ZN15mgSimpleConsole11minimumSizeER11mgDimension,0,__ZN16mgScriptPlatform14setWindowTitleEPKc,0,__ZN12mgGenContextD0Ev,0,__ZN9mgControl15acceptsKeyFocusEv,0,__ZN13mgSimpleField15setDisplayCountEi
,0,__ZN17mgSimpleScrollbar7mouseUpEPviiii,0,__ZN12mgGenContext8drawIconEPK6mgIcondd,0,__ZN11mgButtonTagD0Ev,0,__ZN10GuiTestAll12appMouseDragEiii,0,__ZN9mgControl18dispatchMouseClickEPviiiii
,0,__ZN18mgSimpleScrollPane15guiScrollPageUpEPv,0,__ZN14mgSimpleButton9mouseDownEPviiii,0,__ZN13mgSimpleStyleD2Ev,0,__ZN16mgScriptPlatform8termViewEv,0,__Z6mgIdlev
,0,__ZN13mgTableLayout13distribHeightEiiiPi,0,__ZN9mgParaTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN12mgHeadingTagD0Ev,0,__ZN10mgLabelTagD1Ev,0,__ZN14mgGLGenSurface12stringExtentEPK9mgGenFontPKciR7mgPointR11mgRectangle
,0,__ZN17mgDisplayServices6getDPIEv,0,__ZN11mgRectFrameD2Ev,0,__ZN12mgGenSurface11createBrushEPKc,0,__ZN14mgTextureImageD2Ev,0,__ZN12mgXMLScanner21processingInstructionEPKc
,0,__ZN15mgErrorTableTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZNK9mgGenFont11stringWidthEPKci,0,__ZNK18mgMapStringToDWord12getNextAssocERiR8mgStringRj,0,__ZN14mgWebGLDisplay17setModelTransformERK9mgMatrix4,0,__ZN14mgWebGLDisplay13createBuffersEv
,0,__ZN9mgControl17dispatchFocusLostEPv,0,__ZN14mgGLGenSurface17resizeSingleImageEii,0,__ZN10mgFontList8findFontERK13mgStringArrayPKcjjR8mgString,0,__ZN16mgSimpleCheckbox9mouseExitEPv,0,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv
,0,__ZN13mgTableColTag7tagAttrEP11mgXMLParserPKcS3_,0,__Z11mgMouseDownii,0,__ZN15mgSimpleConsole13reformatLinesEi,0,__ZN7mgStyle12getBrushAttrEPKcS1_S1_RPK7mgBrush,0,__ZN10mgFormPane14getLinkDescentEv
,0,__ZN14mgSimpleTabbed9mouseExitEPv,0,__ZN10mgFormPane18getDefaultFontFaceER8mgString,0,__ZThn140_N14mgSimpleTabbed9mouseMoveEPviii,0,__ZN13mgTableRowTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN16mgScriptPlatform13getFullscreenEv
,0,__ZN8mgXMLTagD1Ev,0,__ZN16mgUtilErrorTableD0Ev,0,__ZN12mgSolidPaintD0Ev,0,__ZN12mgTextFormatD2Ev,0,__ZN13mgTableRowTagD0Ev
,0,__ZN18mgMapStringToDWord9removeKeyEPKc,0,__ZThn140_N12mgSimpleList7mouseUpEPviiii,0,__ZThn144_N14mgSimpleWindow9mouseDragEPviii,0,__ZNK19mgMapStringToDouble12getNextAssocERiR8mgStringRd,0,__ZN10mgTextDraw10outputLineEiiiiR10mgPtrArray
,0,__ZNK9mgControl9getParentEv,0,__ZN14mgSimpleButton8setLabelEPKc,0,__ZN10mgFormPane10drawStringEPKvliiPKci,0,__ZN14mgWebGLDisplay20createOverlaySurfaceEv,0,__ZN8mgXMLTag11getFileNameEP11mgXMLParserPKcS3_R8mgString
,0,__ZN16mgScriptPlatform11checkErrorsEv,0,__ZN13mgSimpleStyle13createDesktopEP9mgControlPKc,0,__ZN7mgStyle7setAttrEPKcS1_d,0,__ZN10mgTableTag11tagEndAttrsEP11mgXMLParser,0,__ZN13mgSimpleFieldD0Ev
,0,__ZN15mgSimpleConsole13preferredSizeER11mgDimension,0,__ZN8SampleUI14createLeftSideEP9mgControlPKc,0,__ZN14mgSimpleButton9mouseMoveEPviii,0,__ZN18mgSimpleScrollPane17guiScrollPageDownEPv,0,__ZN17mgSimpleScrollbar9mouseExitEPv
,0,__ZNK9mgControl11getLocationERiS0_,0,__ZN7mgStyle7setAttrEPKcS1_i,0,__ZN12mgTextFormat10outputLineEiiiiR10mgPtrArray,0,__ZN19mgWebGLTextureArray9setFilterEi,0,__ZThn140_N12mgTopControl18controlRemoveChildEPv
,0,__ZN14mgGLGenSurface17fillSolidTriangleEP17mgGenContextStateRK7mgColordddddd,0,__ZNK19mgMapStringToDouble16getStartPositionEv,0,__ZN17mgSimpleScrollbar10mouseClickEPviiiii,0,__ZN13mgSimpleSplit10mouseClickEPviiiii,0,__ZN13mgTableRowTag7tagAttrEP11mgXMLParserPKcS3_
,0,__ZN9mgParaTagD0Ev,0,__ZN12mgGenSurface10createFontEPKcijj,0,__ZN7mgStyle11getFontAttrEPKcS1_S1_RPK6mgFont,0,__ZN17mgSimpleScrollbar10isFullViewEv,0,__ZN14mgWebGLDisplay15loadTextureCubeEPKcS1_S1_S1_S1_S1_
,0,__ZN10mgFormPane13parseFormFileEPKc,0,__ZN13mgSimpleField5keyUpEPvii,0,__ZThn140_N12mgTopControl13controlEnableEPv,0,__ZN9mgControl23dispatchControlAddChildEPv,0,__ZN13mgWebGLShaderD2Ev
,0,__ZN13mgTableLayout10initLayoutEv,0,__ZN10GuiTestAll12appMouseDownEii,0,__ZN15mgSimpleDesktop12layoutWindowEP9mgControl,0,__ZN18mgGLTextureSurface13deleteBuffersEv,0,__ZNK13mgStringArray4lastEv
,0,__ZN13mgSimpleField7getTextER8mgString,0,__ZN17mgDisplayServices11swapBuffersEv,0,__ZN10mgFormPane11getFontInfoEPKvRiS2_S2_,0,__ZN7mgBrushD1Ev,0,__ZN10mgTextScanD2Ev
,0,__ZN13mgSimpleSplit9mouseDownEPviiii,0,__ZN9mgListTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZThn140_N14mgSimpleTabbed10mouseClickEPviiiii,0,__ZN12mgOptionsTag8tagCloseEP11mgXMLParser,0,__ZN13mgStringArray3addEPKc
,0,__ZN13mgSimpleField9mouseDownEPviiii,0,__ZN13mgSimpleLabelD0Ev,0,__ZN14mgGLGenSurface10deleteFontEP9mgGenFont,0,__ZN13mgListItemTagD0Ev,0,__ZN15mgLayoutManagerD1Ev
,0,__ZN10mgFormPaneD2Ev,0,__ZN12mgTopControl18controlRemoveChildEPv,0,__ZN12mgSimpleList9mouseDragEPviii,0,__ZN13mgSimpleStyle11createSplitEP9mgControlPKc,0,__ZN16mgScriptPlatform17getDisplayLibraryER8mgString
,0,__ZN9mgGenIconD0Ev,0,__ZThn140_N13mgSimpleSplit9mouseExitEPv,0,__ZN13mgTableLayout11minimumSizeER11mgDimension,0,__ZThn144_N14mgSimpleWindow9mouseExitEPv,0,__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString
,0,__ZN12mgGenContext8drawLineEdddd,0,__ZN16mgMapStringToPtr5setAtEPKcPKv,0,__ZN12mgTopControl8getStyleEv,0,__ZN16mgScriptPlatform15setWindowBoundsEiiii,0,__ZN13mgSimpleStack12updateLayoutEv
,0,__ZN10mgErrorMsgD2Ev,0,__ZN9mgFormTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZN14mgSimpleWindow9guiActionEPvPKc,0,__ZN12mgSimpleList14guiFocusGainedEPv
,0,__ZN12mgXMLScanner8endAttrsEv,0,__ZThn148_N13mgSimpleField12guiFocusLostEPv,0,__ZN13mgTableLayout8setFrameEPK7mgFrame,0,__ZN13mgSimpleStyle13createConsoleEP9mgControlPKc,0,__Z9mgMouseUpii
,0,__ZN7mgStyle7setAttrEPKcS1_PK6mgFont,0,__ZN12mgTopControl7getPageEv,0,__ZNK12mgGenSurface12findResourceEPKc,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcf,0,__ZN14mgGLGenSurface17fillImageTriangleEP17mgGenContextStatePvdddddd
,0,__ZN10mgFormPane19getDefaultTextColorER7mgColor,0,__ZN14mgSimpleWindow10mouseClickEPviiiii,0,__ZN18mgSimpleScrollPane13setVScrollbarEP18mgScrollbarControl,0,__ZN12mgGenSurface11createBrushEdddd,0,__ZN12mgTopControl14surfaceKeyDownEii
,0,__ZN18mgGLTextureSurface10getTextureEv,0,__ZN10mgPtrArray5resetEv,0,__ZN14mgWebGLDisplay4drawEiP14mgVertexBuffer,0,__ZThn140_N14mgSimpleButton9mouseDragEPviii,0,__ZN12mgGenSurface9damageAllEv
,0,__ZN9mgListTag8tagCloseEP11mgXMLParser,0,__ZN14mgSimpleButton12guiFocusLostEPv,0,__ZThn144_N14mgSimpleButton14guiFocusGainedEPv,0,__ZN19mgWebGLTextureArray7setWrapEii,0,__ZThn144_N13mgSimpleField9mouseDragEPviii
,0,__ZN13mgSimpleField7keyDownEPvii,0,__ZN12mgGenContext15drawImageWithinEPK7mgImagedddd,0,__ZThn144_N13mgSimpleField9mouseExitEPv,0,__ZNK13mgStringArray3topEv,0,__ZN13mgSimpleStack10removePaneEPKc
,0,__ZN13mgSimpleStack11getSelectedER8mgString,0,__ZN13mgSimpleField7keyCharEPvii,0,__ZN10mgLabelTag7tagOpenEP11mgXMLParser,0,__ZN16mgScriptPlatform13destroyWindowEv,0,__ZN9mgControl7setSizeEii
,0,__ZN8mgXMLTag7tagOpenEP11mgXMLParser,0,__ZN13mgStringArray4pushEPKc,0,__ZN14mgWebGLDisplay10setCullingEj,0,__ZN13mgSimpleField14guiFocusGainedEPv,0,__ZN13mgSimpleStyle10createListEP9mgControlPKc
,0,__ZN14mgSimpleWindow17setWindowLocationEiii,0,__ZThn144_N13mgSimpleField10mouseClickEPviiiii,0,__ZN9mgControl18findControlAtPointEii,0,__ZN12mgSimpleList13preferredSizeER11mgDimension,0,__ZN15mgSimpleConsole12updateLayoutEv
,0,__ZN12mgGenContextD2Ev,0,__ZN14mgGLGenSurface11deleteImageEP10mgGenImage,0,__ZN17mgSimpleScrollbar13setHorizontalEj,0,__ZN10emscripten8internal7InvokerIvJiiEE6invokeEPFviiEii,0,__ZN12mgTopControl14surfaceMouseUpEiiii
,0,__ZN10mgPtrArrayD0Ev,0,__ZN14mgWebGLDisplay17getModelTransformER9mgMatrix4,0,__ZN12mgGenContext8drawIconEPK6mgIcondddddddd,0,__ZN13mgSimpleStyle12createButtonEP9mgControlPKcS3_S3_,0,__ZN8SampleUI13toggleConsoleEv
,0,__ZN9mgFontTagD0Ev,0,__ZN12mgXMLScanner5resetEv,0,__ZN10mgFormPane6pointsEd,0,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,0,__ZN13mgSimpleField17addChangeListenerEP16mgChangeListener
,0,__ZN15mgSimpleDesktop18addDesktopListenerEP17mgDesktopListener,0,__ZN14mgSimpleButtonD2Ev,0,__ZNK12mgGenSurface9isDamagedEv,0,__ZN13mgListItemTagD1Ev,0,__ZN14mgWebGLDisplay21supportsIntegerVertexEv
,0,__ZN16mgScriptPlatform13setFullscreenEj,0,__ZN14mgWebGLDisplay14setTransparentEj,0,__ZN13mgTableLayout14controlResizedEv,0,__ZN14mgWebGLDisplay13setLightColorEddd,0,__ZN12mgConsoleTagD1Ev
,0,__ZN13mgTableLayout15setColLeftInsetEi,0,__ZN13mgCheckboxTagD0Ev,0,__ZN12mgErrorTable13processTopTagEP8mgXMLTag,0,__ZN19mgWebGLTextureArrayD2Ev,0,__ZN17mgSimpleScrollbar20removeScrollListenerEP16mgScrollListener
,0,__ZN16mgMapStringToPtr9removeKeyEPKc,0,__ZN13mgErrorMsgTagD0Ev,0,__ZN14mgSimpleWindowD0Ev,0,__ZN10mgBreakTag10tagContentEP11mgXMLParserPKci,0,__ZN12mgTextFormat4doneEv
,0,__ZN8mgStringD0Ev,0,__ZNK19mgMapStringToString12getNextAssocERiR8mgStringS2_,0,__ZN17mgSimpleScrollbar8getRangeERiS0_,0,__ZThn140_N14mgSimpleButton9mouseMoveEPviii,0,__ZN13mgStringArray3popER8mgString
,0,__ZN15mgSimpleDesktop10hideWindowEP9mgControl,0,__ZN9mgControl17removeKeyListenerEP13mgKeyListener,0,__ZN14mgWebGLDisplay18drawOverlayTextureEPK14mgTextureImageiiii,0,__ZN15mgSimpleDesktop14windowIsActiveEP9mgControl,0,__ZNK10mgPtrArray5firstEv
,0,__ZN12mgErrorTable7msgTextER8mgStringPKcS3_S3_z,0,__ZThn140_N12mgSimpleList9mouseDragEPviii,0,__ZN17mgSimpleScrollbarD0Ev,0,__ZN10mgBreakTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN18mgWebGLTextureCube7setWrapEii
,0,__ZN15mgLayoutManagerD0Ev,0,__ZNK6mgFont11getFaceNameER8mgString,0,__ZN9mgControl10getEnabledEv,0,__ZN12mgTopControl7animateEdd,0,__ZN10mgBlockTag8tagCloseEP11mgXMLParser
,0,__ZN12mgFormParser8pushTextEP12mgTextBuffer,0,__ZNK9mgControl11getLocationER7mgPoint,0,__ZN17mgSimpleScrollbar12guiTimerTickEdd,0,__ZNKSt9bad_alloc4whatEv,0,__ZN14mgSimpleTabbedD0Ev
,0,__ZN13mgStringArrayD2Ev,0,__ZN12mgTextFormat7newFontEv,0,__ZN12mgTopControl15addTimeListenerEP14mgTimeListener,0,__ZThn140_N14mgSimpleTabbed9mouseExitEPv,0,__ZN14mgSimpleButton20removeActionListenerEP16mgActionListener
,0,__ZN12mgFormParser7topCntlEv,0,__Z10mgShutdownv,0,__ZN13mgSimpleField13preferredSizeER11mgDimension,0,__Z14mgMouseMoveReliii,0,__ZN13mgOptionsFileD2Ev
,0,__ZN10mgTableRowD2Ev,0,__ZN12mgGenContext9drawImageEPK7mgImagedddddddd,0,__ZNK11mgRectFrame14getOutsideRectER11mgRectangle,0,__ZN15mgSimpleConsoleD0Ev,0,__ZN14mgWebGLDisplay4drawEiP14mgVertexBufferii
,0,__ZN10mgFormPane18setDefaultFontFaceEPKc,0,__ZN16mgMapStringToPtr9removeAllEv,0,__ZN12mgFormParser9createTagEPKc,0,__ZN15mgSimpleDesktop11minimumSizeER11mgDimension,0,__ZN13mgTableLayout9findChildEP9mgControl
,0,__ZNK19mgMapStringToDouble6lengthEv,0,__ZThn140_N16mgSimpleCheckbox9mouseExitEPv,0,__ZN12mgTopControl18removeTimeListenerEP14mgTimeListener,0,__ZN9mgTextTag8tagCloseEP11mgXMLParser,0,__ZN6mgFontD1Ev
,0,__ZN10mgFieldTagD1Ev,0,__ZN10mgFormPane10childResetEPKv,0,__ZNK12mgXMLScanner9exceptionEPKcz,0,__ZN12mgTopControl11getKeyFocusEv,0,__ZN13mgTableLayout15paintBackgroundEP9mgContext
,0,__ZN18mgMapStringToDWordD0Ev,0,__ZN12mgGenSurface10newContextEv,0,__ZN18mgSimpleScrollPane12updateLayoutEv,0,__ZN8SampleUI8setValueEdd,0,__ZN10mgTableTag7tagAttrEP11mgXMLParserPKcS3_
,0,__ZN9mgControl16addChildToBottomEPS_,0,__ZN14mgGLGenSurface8loadFontEP9mgGenFont,0,__ZNK13mgStringArray5getAtEi,0,__ZN10mgLabelTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN12mgGenContext8getStateEv
,0,__ZThn140_N15mgSimpleConsole17guiScrollPageDownEPv,0,__ZN8mgXMLTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN9mgControl21getLocationInAncestorEPS_R11mgRectangle,0,__ZN9mgControl18dispatchMouseEnterEPvii,0,__ZN13mgTableLayout14setRowTopInsetEi
,0,__ZN15mgSimpleDesktop12removeWindowEP9mgControl,0,__ZN9mgRuleTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN11mgButtonTag11tagEndAttrsEP11mgXMLParser,0,__ZN16mgScriptPlatform11initDisplayEv,0,__ZN13mgSimpleField9mouseExitEPv
,0,__ZN17mgDisplayServices6setFOVEd,0,__ZN11mgXMLParserD2Ev,0,__ZN8mgPreTagD0Ev,0,__ZN10mgFontList13processTopTagEP8mgXMLTag,0,__ZThn140_N14mgSimpleButton10mouseClickEPviiiii
,0,__ZN9mgControl6damageEv,0,__ZNK13mgOptionsFile8getPointEPKcRK8mgPoint3RS2_,0,__ZN10mgGenImageD1Ev,0,__ZN13mgSimpleField13enableHistoryEj,0,__ZN14mgSimpleWindow15initContentSizeEv
,0,__ZN10mgTableTagD0Ev,0,__ZThn148_N12mgSimpleList17guiScrollPageDownEPv,0,__ZThn140_N10mgFormPane14getLinkDescentEv,0,__ZN13mgCheckboxTag11tagEndAttrsEP11mgXMLParser,0,__ZN9mgControl13preferredSizeER11mgDimension
,0,__ZN10mgPtrArrayD2Ev,0,__ZN12mgXMLScanner8parseEndEv,0,__Z11mgMouseExitv,0,__ZN9mgListTag7tagOpenEP11mgXMLParser,0,__ZN10mgTextDrawD0Ev
,0,__ZN14mgGLGenSurface5flushEv,0,__ZN14mgTextureArrayD0Ev,0,__ZN14mgWebGLDisplayD0Ev,0,__ZN17mgDisplayServices12cursorVectorER8mgPoint3,0,__ZN14mgColumnLayoutD2Ev
,0,__ZN12mgHeadingTag8tagCloseEP11mgXMLParser,0,__ZN12mgTextFormat7newLineEi,0,__ZN14mgWebGLDisplay10setFrontCWEj,0,__ZN14mg3DErrorTableD1Ev,0,__ZN8SampleUID0Ev
,0,__ZN14mgGLGenSurface18fillSolidRectangleEP17mgGenContextStateRK7mgColordddd,0,__ZThn140_N14mgSimpleWindow9guiActionEPvPKc,0,__ZN13mgErrorVarTagD1Ev,0,__ZN15mgSimpleConsole7addLineERK7mgColorPK6mgFontPKc,0,__ZN9mgControl10raiseToTopEv
,0,__ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKciPK8mgPoint3,0,__ZN14mgWebGLDisplay20appendModelTransformERK9mgMatrix4,0,__ZN14mgGLGenSurface6repairER11mgRectangle,0,__ZN10mgFormPane18setDefaultFontSizeEi,0,__ZN17mgDisplayServicesD2Ev
,0,__ZN14mgSimpleWindow13preferredSizeER11mgDimension,0,__ZN13mgSimpleSplit11findDividerEii,0,__ZN13mgErrorVarTagD0Ev,0,__ZN12mgTextFormat6addTabEi,0,__ZN16mgScriptPlatform9mouseDownEii
,0,__ZN9mgGenFontD2Ev,0,__ZN13mgTableColTag8tagCloseEP11mgXMLParser,0,__ZN13mgTableLayout10termLayoutEv,0,__ZN11mgChildDescD0Ev,0,__ZN9mgControlD0Ev
,0,__ZN13mgSimpleStyle16createScrollPaneEP9mgControlPKc,0,__ZThn140_N10mgFormPane14getDefaultFontER8mgStringRsRjS3_S3_,0,__ZN13mgSimpleStack13preferredSizeER11mgDimension,0,__ZN15mgMapDWordToPtrD0Ev,0,__ZThn140_N14mgSimpleTabbed9mouseDragEPviii
,0,__ZN16mgSimpleCheckbox9mouseMoveEPviii,0,__ZN9mgListTag10tagContentEP11mgXMLParserPKci,0,__ZN14mgSimpleButton7setIconEPKc,0,__Z7mgKeyUpii,0,__ZN12mgXMLScannerD2Ev
,0,__ZN7mgFrameD0Ev,0,__ZN12mgSimpleListD2Ev,0,__ZN12mgCursorDefn9createTagEPKc,0,__ZN11mgXMLParser12CDATAContentEPKci,0,__ZN13mgTableLayout6endRowEv
,0,__ZThn140_N12mgSimpleList9mouseExitEPv,0,__ZN10mgFormPane5paintEP9mgContext,0,__ZThn144_N14mgSimpleWindow10mouseClickEPviiiii,0,__ZN14mgSimpleTabbed9mouseDragEPviii,0,__ZN15mgSimpleDesktop9mouseMoveEPviii
,0,__ZN9mgControl11getKeyFocusEv,0,__ZN12mgTopControl16surfaceMouseMoveEiii,0,__ZNK13mgOptionsFile9getStringEPKcS1_R8mgString,0,__ZN13mgStringArray6removeEPKc,0,__ZN12mgGenContext6setPenEPK5mgPen
,0,__ZN14mgColumnLayout14controlResizedEv,0,__ZN12mgTopControl11controlHideEPv,0,__ZN13mgErrorVarTag7tagAttrEP11mgXMLParserPKcS3_,0,__ZN13mgSimpleStack11setSameSizeEj,0,__ZN11mgXMLParser8tagCloseEPKc
,0,__ZN11mgButtonTag7tagOpenEP11mgXMLParser,0,__ZN16mgScriptPlatform7keyCharEii,0,__ZN10mgFormPane7setFormEPKci,0,__ZN14mgWebGLDisplay20createTextureSurfaceEv,0,__ZN13mgSimpleSplit11setVerticalEj
,0,__ZNK9mgControl10childCountEv,0,__ZN9mgControl15addTimeListenerEP14mgTimeListener,0,__ZN10mgTableTagD1Ev,0,__ZThn140_N10mgFormPane16childSetPositionEPKviiii,0,__ZThn144_N13mgSimpleField7mouseUpEPviiii
,0,__ZN14mgWebGLDisplay12deleteShaderEP8mgShader,0,__ZN7mgStyleD0Ev,0,__ZN10mgBreakTag7tagOpenEP11mgXMLParser,0,__ZN12mgErrorTableD2Ev,0,__ZN14mgSimpleTabbed5paintEP9mgContext
,0,__ZN7mgBrushD0Ev,0,__ZN12mgTextBufferD0Ev,0,__ZN9mgControl17dispatchMouseExitEPv,0,__ZN13mgTableRowTag11tagEndAttrsEP11mgXMLParser,0,__ZN12mgTopControlD0Ev
,0,__ZThn148_N13mgSimpleField14guiFocusGainedEPv,0,__ZN12mgHeadingTag10tagContentEP11mgXMLParserPKci,0,__ZN16mgScriptPlatform19compileGLShaderPairEPKcS1_iPS1_PKj,0,__ZNK16mgMapStringToPtr12getNextAssocERiR8mgStringRPKv,0,__ZN9mgFormTag8tagCloseEP11mgXMLParser
,0,__ZThn140_N13mgSimpleSplit7mouseUpEPviiii,0,__ZN9mgControl12updateLayoutEv,0,__ZNK16mgMapStringToPtr6lengthEv,0,__ZN15mgSimpleConsole15setHistoryLinesEi,0,__ZN10GuiTestAll7animateEdd
,0,__ZN14mgColumnLayout8setFrameEPK7mgFrame,0,__ZThn140_N13mgSimpleSplit9mouseDownEPviiii,0,__ZN13mgFontListTagD2Ev,0,__ZN13mgTableLayout7addCellEP9mgControl12mgTableAlignS2_ii,0,__ZN16mgSimpleCheckbox5paintEP9mgContext
,0,__ZN12mgTopControl13controlDeleteEPv,0,__ZN13mgSimpleField5paintEP9mgContext,0,__ZN14mgWebGLDisplay18loadOverlayShadersEv,0,__ZN12mgSimpleList9mouseDownEPviiii,0,__ZN14mgGLGenSurface10deleteIconEP9mgGenIcon
,0,__ZNK16mgMapStringToPtr16getStartPositionEv,0,__ZN10mgFormPane14getDefaultFontER8mgStringRsRjS3_S3_,0,__ZThn140_N18mgSimpleScrollPane17guiScrollLineDownEPv,0,__ZNK6mgFont7getSizeEv,0,__ZN9mgControl7setSizeERK11mgDimension
,0,__ZN15mgSimpleDesktop9addWindowEPKc,0,__ZN10GuiTestAll16appCreateBuffersEv,0,__ZN16mgMapStringToPtrD0Ev,0,__ZN16mgScriptPlatform5keyUpEii,0,__ZN12mgFormParser8pushCntlEP9mgControl
,0,__ZN10GuiTestAll10appKeyCharEii,0,__ZNK7mgFrame14getOutsideSizeERK11mgDimensionRS0_,0,__ZN12mgGenContext5flushEv,0,__ZN14mgWebGLSupport18drawOverlayTextureEjiiii,0,__ZN14mgGLGenSurface12drawGraphicsEv
,0,__ZThn144_N14mgSimpleWindow7mouseUpEPviiii,0,__ZN13mgTextureCubeD0Ev,0,__ZN12mgSimpleList17getSelectionCountEv,0,__ZN13mgSimpleField16updateScrollPosnEv,0,__ZN14mgWebGLDisplay16setCursorTextureEPKcii
,0,__ZN10GuiTestAll12loadTexturesEv,0,__ZThn144_N13mgSimpleField9mouseDownEPviiii,0,__ZN12mgTopControl10getSurfaceEv,0,__ZN14mgSimpleTabbed13preferredSizeER11mgDimension,0,__ZN13mgTableLayout20preferredSizeAtWidthEiR11mgDimension
,0,__ZN9mgControl10getSurfaceEv,0,__ZN12mgTopControlD2Ev,0,__ZN10mgTableRowD0Ev,0,__ZN19mgWebGLTextureImage7setWrapEii,0,__ZNK7mgFrame15paintForegroundEP9mgContextiiii
,0,__ZThn144_N14mgSimpleWindow9mouseMoveEPviii,0,__ZN13mgSimpleSplit7mouseUpEPviiii,0,__ZN18mgSimpleScrollPaneD2Ev,0,__ZN17mgDisplayServices15setFrontAndBackEdd,0,__ZN12mgFormParser7popTextEv
,0,__ZThn140_N17mgSimpleScrollbar17addScrollListenerEP16mgScrollListener,0,__ZThn140_N10mgFormPane11getFontInfoEPKvRiS2_S2_,0,__ZN12mgGenContext7setFontEPK6mgFont,0,__ZN13mgSimpleLabel8setLabelEPKc,0,__ZN12mgGenSurface10createFontEPKc
,0,__ZN13mgSimpleStyle12createTabbedEP9mgControlPKc,0,__ZN10mgFieldTagD0Ev,0,__ZN19mgWebGLTextureImage9setFilterEi,0,__ZThn140_N10mgFormPane15childWidthRangeEPKvRiS2_,0,__ZN12mgCursorDefn13processTopTagEP8mgXMLTag
,0,__ZN12mgGenContext8fillRectEdddd,0,__ZThn140_N14mgSimpleButton10mouseEnterEPvii,0,__ZN10mgFragDescD1Ev,0,__ZN14mgSimpleButton11minimumSizeER11mgDimension,0,__ZN14mgSimpleWindow14setContentSizeEii
,0,__ZN15mgSimpleDesktop18setContentLocationEP9mgControljii,0,__ZN10mgBlockTag10tagContentEP11mgXMLParserPKci,0,__ZThn144_N13mgSimpleField9mouseMoveEPviii,0,__ZN12mgSimpleList14setMultiSelectEj,0,__ZN17mgSimpleScrollbar13preferredSizeER11mgDimension
,0,__ZN9mgControl22dispatchControlDisableEPv,0,__ZN15mgSimpleConsole17guiScrollPageDownEPv,0,__ZNK12mgGenSurface6pointsEd,0,__ZThn144_N13mgSimpleField10mouseEnterEPvii,0,__ZN10mgPtrArray4pushEPKv
,0,__ZThn140_N10mgFormPane10childResetEPKv,0,__ZN13mgErrorMsgTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN12mgSimpleList17addSelectListenerEP16mgSelectListener,0,__ZN12mgConsoleTag8tagCloseEP11mgXMLParser,0,__ZN10mgLabelTag11tagEndAttrsEP11mgXMLParser
,0,__ZN14mgSimpleWindow9mouseDragEPviii,0,__ZN8mgXMLTag11tagEndAttrsEP11mgXMLParser,0,__ZN9mgParaTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN17mgDisplayServices8setEyePtERK8mgPoint3,0,__ZN14mgSimpleTabbed11minimumSizeER11mgDimension
,0,__ZNK12mgGenSurface9getDamageER11mgRectangle,0,__ZN19mgWebGLVertexBufferD2Ev,0,__ZN14mgWebGLDisplay16loadTextureArrayERK13mgStringArray,0,__ZThn144_N17mgSimpleScrollbar9mouseExitEPv,0,__ZN14mgWebGLDisplay11loadTextureEPKc
,0,__ZN14mgSimpleWindow15requestedBoundsER11mgDimensionR11mgRectangle,0,__ZN16mgScriptPlatform8initViewEv,0,__ZN7mgStyle14getIntegerAttrEPKcS1_S1_Ri,0,__ZN12mgFormParser11setCntlNameEPKcP9mgControl,0,__ZN14mgTextureImageD0Ev
,0,__ZN12mgFormParser7topTextEv,0,__ZN10GuiTestAll12initMovementEv,0,__ZN13mgTableColTag8tagChildEP11mgXMLParserP8mgXMLTag,0,__ZN14mgWebGLDisplay14getMVTransformER9mgMatrix4,0,__ZN13mgSimpleField10mouseEnterEPvii
,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,__ZN12mgTopControl11controlShowEPv,0,__ZN14mgSimpleTabbed10mouseClickEPviiiii,0,__ZN14mgWebGLSupportD2Ev,0,__ZN10mgBreakTagD0Ev
,0,__ZN18mgWebGLIndexBuffer13unloadDisplayEv,0,__ZN11mgXMLParser8endAttrsEv,0,__ZN7mgStyle12getPaintAttrEPKcS1_S1_RPK7mgPaint,0,__ZN10GuiTestAll10createCubeEv,0,__ZNK18mgMapStringToDWord6lengthEv
,0,__ZN17mgSimpleScrollbar10mouseEnterEPvii,0,__ZN9mgControl15dispatchKeyDownEPvii,0,__ZNK11mgRectFrame14getOutsideSizeERK11mgDimensionRS0_,0,__ZN14mgGLGenSurfaceD2Ev,0,__ZN10mgTableTag10tagContentEP11mgXMLParserPKci
,0,__ZN8mgShaderD2Ev,0,__ZN15mgSimpleConsole17guiScrollLineDownEPv,0,__ZN10mgFormPane13measureStringEPKvPKci,0,__ZN13mgSimpleField15sendChangeEventEv,0,__ZN14mgWebGLSupport13compileShaderEPKcj
,0,__ZN11mgXMLParser7tagOpenEPKc,0,__Z13mgViewResizedii,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,__ZN14mgColumnLayout15paintBackgroundEP9mgContext,0,__ZN9mgControl10getVisibleEv
,0,__ZN12mgSimpleList10mouseEnterEPvii,0,__ZN13mgSimpleStackD0Ev,0,__ZN10GuiTestAll11createFloorEv,0,__ZN15mgSimpleDesktopD2Ev,0,__ZThn144_N12mgSimpleList12guiFocusLostEPv
,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZThn140_N14mgSimpleTabbed7mouseUpEPviiii,0,__ZN19mgWebGLVertexBuffer11loadDisplayEv,0,__ZN12mgTextFormat8addChildEPKv11mgTextAlignS2_,0,__ZN12mgErrorTable10unknownMsgER8mgStringPKcS3_S3_
,0,__ZN13mgTableRowTag8tagCloseEP11mgXMLParser,0,__ZN19mgMapStringToDouble9removeAllEv,0,__ZN13mgStringArray8removeAtEi,0,__ZThn140_N15mgSimpleConsole15guiScrollPageUpEPv,0,__ZN18mgWebGLIndexBuffer5resetEv
,0,__ZThn140_N15mgSimpleDesktop9mouseDownEPviiii,0,__ZN10GuiTestAll10loadCursorEv,0,__ZN8mgXMLTag8tagChildEP11mgXMLParserPS_,0,__ZN12mgTopControl14surfaceResizedEii,0,__ZN14mgSimpleButton13preferredSizeER11mgDimension
,0,__ZN13mgIndexBuffer5resetEv,0,__ZN12mgSimpleList10mouseClickEPviiiii,0,__ZN17mgSimpleScrollbar11minimumSizeER11mgDimension,0,__ZN15mgSimpleDesktop12updateLayoutEv,0,__ZN19mgMapStringToString9removeAllEv
,0,__ZN10GuiTestAll7appTermEv,0,__ZNK9mgGenFont9stringFitEPKcii,0,__ZN12mgSimpleList12getItemStateEPKc,0,__ZThn148_N12mgSimpleList15guiScrollPageUpEPv,0,__ZN14mgSimpleWindow7mouseUpEPviiii
,0,__ZN12mgGenContext10resetStateEv,0,__ZN10GuiTestAll11setDeskModeEj,0,__ZThn140_N15mgSimpleDesktop7mouseUpEPviiii,0,__ZN12mgFormParser7popCntlEv,0,__ZN17mgSimpleScrollbar8setRangeEii
,0,__ZN12mgGenSurface11createImageEPKc,0,__ZN13mgSimpleSplit11resizePanesEv,0,__ZN13mgSimpleStyleD0Ev,0,__ZN12mgTopControl17surfaceMouseClickEiiiii,0,__ZN10mgBlockTagD0Ev
,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZThn144_N17mgSimpleScrollbar7mouseUpEPviiii,0,__ZN10GuiTestAll14appViewResizedEii,0,__Z9mgKeyCharii,0,__ZN12mgTopControl12surfacePaintERK11mgRectangle,0,__ZN10mgFormPane15childWidthRangeEPKvRiS2_,0,__ZN14mgSimpleWindow12updateLayoutEv,0,__ZN12mgXMLScanner9entityRefEPKcR8mgString,0];
// EMSCRIPTEN_START_FUNCS
function __ZN8SampleUIC2EP9mgSurfacePKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r4=r1>>2;HEAP32[r4]=5259400;HEAP32[r4+1]=5259468;HEAP32[r4+2]=5259480;r5=(r1+12|0)>>2;_memset(r1+52|0,0,32);HEAP32[r5]=r2;r2=__Znwj(168);__ZN13mgSimpleStyleC2EP9mgSurface(r2,HEAP32[r5]);r6=r1+16|0;HEAP32[r6>>2]=r2;r2=__Znwj(184);r7=r2;__ZN12mgTopControlC2EP9mgSurfaceP7mgStyle(r7,HEAP32[r5],HEAP32[r6>>2]);r6=(r1+20|0)>>2;HEAP32[r6]=r7;r7=(r1+24|0)>>2;HEAP32[r7]=FUNCTION_TABLE[HEAP32[HEAP32[r4]+44>>2]](r1,r2,r3);r3=FUNCTION_TABLE[HEAP32[HEAP32[r4]+48>>2]](r1,HEAP32[r6]|0);r1=__Znwj(284),r4=r1>>2;r2=r1;r5=HEAP32[r6];r8=r5|0;r9=r1;r10=r1;HEAP32[r10>>2]=5263420;HEAP32[r4+1]=r8;FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+24>>2]](r8,r9);HEAP32[r10>>2]=5265988;HEAP32[r4+3]=5271244;HEAP32[r4+6]=20;HEAP32[r4+4]=r1+28|0;HEAP32[r4+5]=0;HEAP32[r4+35]=5271244;HEAP32[r4+38]=20;HEAP32[r4+36]=r1+156|0;HEAP32[r4+37]=0;HEAP32[r4+2]=0;HEAP32[r4+29]=0;HEAP32[r4+30]=0;HEAP32[r4+28]=-1;HEAP32[r4+27]=-1;_memset(r1+252|0,0,32);r4=HEAP32[r6];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+24>>2]](r4|0,r9);r9=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r9]+40>>2]](r2);r4=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r4]+56>>2]](r2,0);r10=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r10]+48>>2]](r2,HEAP32[r7]|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r10]+48>>2]](r2,r3,1,16,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r4]+68>>2]](r2,0);FUNCTION_TABLE[HEAP32[HEAP32[r9]+40>>2]](r2);FUNCTION_TABLE[HEAP32[HEAP32[r4]+56>>2]](r2,100);r4=HEAP32[HEAP32[r10]+48>>2];r10=__Znwj(140),r3=r10>>2;r1=r10;r8=HEAP32[r6]|0;HEAP32[r3]=5258872;r6=r10+32|0;HEAP32[r6>>2]=5259300;HEAP32[r3+9]=63;r5=r10+52|0;HEAP32[r3+12]=r5;HEAP32[r3+10]=0;HEAP8[r5]=0;HEAP32[r3+11]=128;r5=(r10+116|0)>>2;r11=r10+8|0;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAP32[r11>>2]=r8;HEAP32[r3+3]=0;HEAP32[r3+1]=0;__ZN8mgStringaSEPKc(r6,5244108);r6=(r10+16|0)>>2;HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;HEAP32[r6+3]=0;HEAP32[r3+34]=1;HEAP32[r3+33]=1;r3=HEAP32[r11>>2];if((r3|0)==0){FUNCTION_TABLE[r4](r2,r1,4,64,1,2);r12=HEAP32[r9];r13=r12+44|0;r14=HEAP32[r13>>2];FUNCTION_TABLE[r14](r2);r15=HEAP32[r7];r16=r15;r17=HEAP32[r16>>2];r18=r17+368|0;r19=HEAP32[r18>>2];FUNCTION_TABLE[r19](r15,5257824);return}FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+96>>2]](r3,r1);FUNCTION_TABLE[r4](r2,r1,4,64,1,2);r12=HEAP32[r9];r13=r12+44|0;r14=HEAP32[r13>>2];FUNCTION_TABLE[r14](r2);r15=HEAP32[r7];r16=r15;r17=HEAP32[r16>>2];r18=r17+368|0;r19=HEAP32[r18>>2];FUNCTION_TABLE[r19](r15,5257824);return}function __ZN8SampleUID0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=5259400;HEAP32[r1+4>>2]=5259468;HEAP32[r1+8>>2]=5259480;r2=r1+20|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3)}HEAP32[r2>>2]=0;r2=(r1+16|0)>>2;r3=HEAP32[r2];if((r3|0)==0){HEAP32[r2]=0;r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3);HEAP32[r2]=0;r4=r1;__ZdlPv(r4);return}function __ZN8SampleUID2Ev(r1){var r2,r3;HEAP32[r1>>2]=5259400;HEAP32[r1+4>>2]=5259468;HEAP32[r1+8>>2]=5259480;r2=r1+20|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3)}HEAP32[r2>>2]=0;r2=(r1+16|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);HEAP32[r2]=0;return}function __ZN8SampleUI14createLeftSideEP9mgControlPKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r2=STACKTOP;STACKTOP=STACKTOP+228|0;r4=r2;r5=r2+84;r6=r2+116;r7=r2+148;r8=r2+180;r9=r2+212,r10=r9>>2;r11=(r1+16|0)>>2;r12=HEAP32[r11];r13=FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+36>>2]](r12,HEAP32[r1+20>>2]|0,5253532);r12=r13>>2;FUNCTION_TABLE[HEAP32[HEAP32[r12]+360>>2]](r13,5250996);r14=FUNCTION_TABLE[HEAP32[HEAP32[r12]+360>>2]](r13,5251256);r15=FUNCTION_TABLE[HEAP32[HEAP32[r12]+360>>2]](r13,5257824);r12=(r1+12|0)>>2;r16=HEAP32[r12];r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+12>>2]](r16,5255584);r16=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+64>>2]](r16,5245180,5255356,r17);r16=HEAP32[r11];r18=(r1+32|0)>>2;HEAP32[r18]=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+32>>2]](r16,r14,5245180);r16=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+64>>2]](r16,5244100,5255356,r17);r17=HEAP32[r11];r11=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+12>>2]](r17,r14,5244100);r17=(r1+36|0)>>2;HEAP32[r17]=r11;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+372>>2]](r11,1);r11=HEAP32[r17];FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+376>>2]](r11,r1+8|0);r11=__Znwj(284),r16=r11>>2;r19=r11;r20=r11;r21=r11;HEAP32[r21>>2]=5263420;HEAP32[r16+1]=r14;r22=r14;FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+24>>2]](r14,r20);HEAP32[r21>>2]=5265988;HEAP32[r16+3]=5271244;HEAP32[r16+6]=20;HEAP32[r16+4]=r11+28|0;HEAP32[r16+5]=0;HEAP32[r16+35]=5271244;HEAP32[r16+38]=20;HEAP32[r16+36]=r11+156|0;HEAP32[r16+37]=0;HEAP32[r16+2]=0;HEAP32[r16+29]=0;HEAP32[r16+30]=0;HEAP32[r16+28]=-1;HEAP32[r16+27]=-1;_memset(r11+252|0,0,32);FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+24>>2]](r14,r20);r20=r11>>2;FUNCTION_TABLE[HEAP32[HEAP32[r20]+40>>2]](r19);r14=r11;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+56>>2]](r19,100);r22=r11;FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+48>>2]](r19,HEAP32[r18]|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r20]+40>>2]](r19);FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+56>>2]](r19,0);FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+48>>2]](r19,HEAP32[r17]|0,4,16,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r20]+44>>2]](r19);r19=r4|0;r20=r4+4|0;r17=r4+20|0;r22=(r4+16|0)>>2;r14=r4+8|0;r11=r4+12|0;r16=0;while(1){HEAP32[r19>>2]=5259300;HEAP32[r20>>2]=63;HEAP32[r22]=r17;HEAP32[r14>>2]=0;HEAP8[r17]=0;HEAP32[r11>>2]=128;r21=r16+1|0;__ZN8mgString6formatEPKcz(r4,5243500,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r21,tempInt));r23=HEAP32[r18];r24=HEAP32[HEAP32[r23>>2]+356>>2];__ZN7mgColorC2EPKc(r5,5250680);FUNCTION_TABLE[r24](r23,r5,0,HEAP32[r22]);HEAP32[r19>>2]=5259300;r23=HEAP32[r22];if(!((r23|0)==(r17|0)|(r23|0)==0)){__ZdlPv(r23)}if((r21|0)<50){r16=r21}else{break}}r16=__Znwj(296);r17=r16;__ZN10mgFormPaneC2EP9mgControlPKcP12mgTextBuffer(r17,r15,0,0);r15=(r1+40|0)>>2;HEAP32[r15]=r17;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+364>>2]](r17,5257300);r17=HEAP32[r15];r16=HEAP32[HEAP32[r17>>2]+380>>2];__ZN7mgColorC2EPKc(r6,5250788);FUNCTION_TABLE[r16](r17,r6);r6=HEAP32[r15];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+360>>2]](r6,r3);r3=HEAP32[r12];r6=r7|0;HEAPF64[tempDoublePtr>>3]=.7843137254901961,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r7+8|0;HEAPF64[tempDoublePtr>>3]=.7843137254901961,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r7+16|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r7+24|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=__ZN12mgSolidPaint11createPaintEP9mgSurfaceRK7mgColor(r3,r7)|0;r7=HEAP32[r12];__ZN7mgColorC2EPKc(r8,5250788);HEAP32[r10+1]=10;HEAP32[r10]=10;HEAP32[r10+3]=10;HEAP32[r10+2]=10;r10=__ZN11mgRectFrame11createFrameEP9mgSurface14mgRectEdgeTypeiRK7mgColorPK7mgPaintRK13mgFrameMargin(r7,0,2,r8,r6,r9)|0;r9=HEAP32[r15];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+388>>2]](r9,r10);STACKTOP=r2;return r13}function __ZN8SampleUI18createControlPanelEP9mgControl(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=r3+32,r6=r5>>2;r7=r3+48,r8=r7>>2;r9=__Znwj(140),r10=r9>>2;r11=r9;HEAP32[r10]=5258872;r12=r9+32|0;HEAP32[r12>>2]=5259300;HEAP32[r10+9]=63;r13=r9+52|0;HEAP32[r10+12]=r13;HEAP32[r10+10]=0;HEAP8[r13]=0;HEAP32[r10+11]=128;r13=(r9+116|0)>>2;r14=r9+8|0;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r14>>2]=r2;HEAP32[r10+3]=0;HEAP32[r10+1]=0;__ZN8mgStringaSEPKc(r12,5244108);r12=(r9+16|0)>>2;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r10+34]=1;HEAP32[r10+33]=1;r10=HEAP32[r14>>2];if((r10|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+96>>2]](r10,r11)}r10=(r1+28|0)>>2;HEAP32[r10]=r11;r14=(r1+16|0)>>2;r12=HEAP32[r14];r9=FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+8>>2]](r12,r11,5256056,5255596);r11=HEAP32[r14];r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11,HEAP32[r10],5255148,5254912);r11=HEAP32[r14];r2=r1+44|0;HEAP32[r2>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11,HEAP32[r10],5254608,5254272);r11=HEAP32[r14];r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11,HEAP32[r10],5253896,5253528);r11=HEAP32[r14];r15=r1+48|0;HEAP32[r15>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11,HEAP32[r10],5253268,5254272);r11=HEAP32[r14];r16=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+16>>2]](r11,HEAP32[r10],5252928,5256564,0);r11=HEAP32[r14];r17=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11,HEAP32[r10],5252416,5256528);r11=HEAP32[r14];r14=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+12>>2]](r11,HEAP32[r10],5251912);FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+364>>2]](r16,r1|0);FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+368>>2]](r17,r1+4|0);FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+376>>2]](r14,r1+8|0);r11=__Znwj(284),r18=r11>>2;r19=r11;r20=HEAP32[r10];r21=r11;r22=r11;HEAP32[r22>>2]=5263420;HEAP32[r18+1]=r20;FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+24>>2]](r20,r21);HEAP32[r22>>2]=5265988;HEAP32[r18+3]=5271244;HEAP32[r18+6]=20;HEAP32[r18+4]=r11+28|0;HEAP32[r18+5]=0;HEAP32[r18+35]=5271244;HEAP32[r18+38]=20;HEAP32[r18+36]=r11+156|0;HEAP32[r18+37]=0;HEAP32[r18+2]=0;HEAP32[r18+29]=0;HEAP32[r18+30]=0;HEAP32[r18+28]=-1;HEAP32[r18+27]=-1;_memset(r11+252|0,0,32);r18=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+24>>2]](r18,r21);r21=(r1+12|0)>>2;r1=HEAP32[r21];__ZN7mgColorC2EPKc(r4,5246280);r18=__ZN12mgSolidPaint11createPaintEP9mgSurfaceRK7mgColor(r1,r4)|0;r4=HEAP32[r21];HEAP32[r6+1]=10;HEAP32[r6]=10;HEAP32[r6+3]=10;HEAP32[r6+2]=10;r6=__ZN7mgFrame11createFrameEP9mgSurfacePK7mgPaintRK13mgFrameMargin(r4,r18,r5);r5=r11>>2;FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r19,r6);r6=HEAP32[r21];HEAP32[r8+1]=10;HEAP32[r8]=10;HEAP32[r8+3]=10;HEAP32[r8+2]=10;r8=__ZN7mgFrame11createFrameEP9mgSurfacePK7mgPaintRK13mgFrameMargin(r6,0,r7);r7=r11>>2;FUNCTION_TABLE[HEAP32[HEAP32[r7]+40>>2]](r19);r6=r11>>2;FUNCTION_TABLE[HEAP32[HEAP32[r6]+64>>2]](r19,10);r21=r11>>2;FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,r9|0,4,64,1,2);FUNCTION_TABLE[HEAP32[HEAP32[r7]+40>>2]](r19);FUNCTION_TABLE[HEAP32[HEAP32[r6]+64>>2]](r19,10);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,r12|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,HEAP32[r2>>2]|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r7]+40>>2]](r19);FUNCTION_TABLE[HEAP32[HEAP32[r6]+64>>2]](r19,10);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,r13|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,HEAP32[r15>>2]|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r7]+40>>2]](r19);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,r16|0,3,48,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r5]+52>>2]](r19,r8);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,r17|0,4,64,1,1);FUNCTION_TABLE[HEAP32[HEAP32[r5]+52>>2]](r19,r8);FUNCTION_TABLE[HEAP32[HEAP32[r7]+40>>2]](r19);FUNCTION_TABLE[HEAP32[HEAP32[r21]+48>>2]](r19,r14|0,4,64,1,2);FUNCTION_TABLE[HEAP32[HEAP32[r5]+52>>2]](r19,r8);FUNCTION_TABLE[HEAP32[HEAP32[r7]+44>>2]](r19);STACKTOP=r3;return HEAP32[r10]}function __ZN8SampleUI7animateEdd(r1,r2,r3){var r4;r4=HEAP32[r1+20>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+404>>2]](r4,r2,r3);return}function __ZN8SampleUI6resizeEii(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=r1>>2;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;r7=HEAP32[r4+3];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+80>>2]](r7,r2,r3);r7=(r1+20|0)>>2;r8=HEAP32[r7];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+360>>2]](r8,r2,r3);r3=(r6|0)>>2;HEAP32[r3]=0;r2=(r6+4|0)>>2;HEAP32[r2]=0;r8=r1+24|0;r9=HEAP32[r8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+68>>2]](r9|0,r6);r9=r1+52|0;r10=HEAP32[r3];r11=HEAP32[r2];HEAP32[r9>>2]=0;HEAP32[r4+14]=0;HEAP32[r4+15]=r10;HEAP32[r4+16]=r11;r11=HEAP32[r8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+188>>2]](r11|0,HEAP32[r7]|0,r9);r9=r1+28|0;r11=HEAP32[r9>>2];FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](r11,r6);r6=r1+68|0;r1=HEAP32[r3];r3=HEAP32[r2];HEAP32[r6>>2]=0;HEAP32[r4+18]=0;HEAP32[r4+19]=r1;HEAP32[r4+20]=r3;r3=HEAP32[r9>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+188>>2]](r3,HEAP32[r7]|0,r6);STACKTOP=r5;return}function __ZN8SampleUI8setValueEdd(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=r4,r6=r5>>2;r7=r5|0;HEAP32[r7>>2]=5259300;HEAP32[r6+1]=63;r8=r5+20|0;r9=(r5+16|0)>>2;HEAP32[r9]=r8;HEAP32[r6+2]=0;HEAP8[r8]=0;HEAP32[r6+3]=128;__ZN8mgString6formatEPKcz(r5,5251440,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=r2,HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r2=HEAP32[r1+44>>2];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+356>>2]](r2,HEAP32[r9]);__ZN8mgString6formatEPKcz(r5,5251440,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=r3,HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r3=HEAP32[r1+48>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+356>>2]](r3,HEAP32[r9]);HEAP32[r7>>2]=5259300;r7=HEAP32[r9];if((r7|0)==(r8|0)|(r7|0)==0){STACKTOP=r4;return}__ZdlPv(r7);STACKTOP=r4;return}function __ZN8SampleUI11hasKeyFocusEv(r1){var r2;r2=HEAP32[r1+20>>2];return(FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+216>>2]](r2)|0)!=0&1}function __ZN8SampleUI13hasMouseFocusEv(r1){var r2;r2=HEAP32[r1+20>>2];return(FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+220>>2]](r2)|0)!=0&1}function __ZN8SampleUI13useMousePointEii(r1,r2,r3){var r4,r5,r6,r7;r4=r1>>2;r1=HEAP32[r4+8];do{if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+84>>2]](r1|0)|0)!=0){r5=HEAP32[r4+13];if((r5|0)>=(r2|0)){break}if((HEAP32[r4+15]+r5|0)<=(r2|0)){break}r5=HEAP32[r4+14];if((r5|0)>=(r3|0)){break}if((HEAP32[r4+16]+r5|0)>(r3|0)){r6=1}else{break}return r6}}while(0);r1=HEAP32[r4+17];do{if((r1|0)<(r2|0)){if((HEAP32[r4+19]+r1|0)<=(r2|0)){r7=1;break}r5=HEAP32[r4+18];if((r5|0)>=(r3|0)){r7=1;break}r7=(HEAP32[r4+20]+r5|0)<=(r3|0)}else{r7=1}}while(0);r6=r7&1^1;return r6}function __ZN8SampleUI13toggleConsoleEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3,r5=r4>>2;r6=r4|0;HEAP32[r6>>2]=5259300;HEAP32[r5+1]=63;r7=r4+20|0;r8=(r4+16|0)>>2;HEAP32[r8]=r7;HEAP32[r5+2]=0;HEAP8[r7]=0;HEAP32[r5+3]=128;r5=(r1+24|0)>>2;r1=HEAP32[r5];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+372>>2]](r1,r4);r4=5251256;r1=HEAP32[r8];while(1){r9=HEAP8[r1];r10=HEAP8[r4];r11=r9<<24>>24;if((r11&128|0)==0){r12=_tolower(r11)&255}else{r12=r9}if(r12<<24>>24>-1){r13=_tolower(r10<<24>>24)&255}else{r13=r10}if(r12<<24>>24!=r13<<24>>24){r2=106;break}if(r12<<24>>24==0){r2=100;break}else{r4=r4+1|0;r1=r1+1|0}}if(r2==106){r1=HEAP32[r5];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+368>>2]](r1,5251256)}else if(r2==100){r2=HEAP32[r5];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+368>>2]](r2,5250996)}HEAP32[r6>>2]=5259300;r6=HEAP32[r8];if((r6|0)==(r7|0)|(r6|0)==0){STACKTOP=r3;return}__ZdlPv(r6);STACKTOP=r3;return}function __ZN8SampleUI10toggleHelpEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3,r5=r4>>2;r6=r4|0;HEAP32[r6>>2]=5259300;HEAP32[r5+1]=63;r7=r4+20|0;r8=(r4+16|0)>>2;HEAP32[r8]=r7;HEAP32[r5+2]=0;HEAP8[r7]=0;HEAP32[r5+3]=128;r5=(r1+24|0)>>2;r1=HEAP32[r5];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+372>>2]](r1,r4);r4=5257824;r1=HEAP32[r8];while(1){r9=HEAP8[r1];r10=HEAP8[r4];r11=r9<<24>>24;if((r11&128|0)==0){r12=_tolower(r11)&255}else{r12=r9}if(r12<<24>>24>-1){r13=_tolower(r10<<24>>24)&255}else{r13=r10}if(r12<<24>>24!=r13<<24>>24){r2=128;break}if(r12<<24>>24==0){r2=122;break}else{r4=r4+1|0;r1=r1+1|0}}if(r2==122){r1=HEAP32[r5];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+368>>2]](r1,5250996)}else if(r2==128){r2=HEAP32[r5];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+368>>2]](r2,5257824)}HEAP32[r6>>2]=5259300;r6=HEAP32[r8];if((r6|0)==(r7|0)|(r6|0)==0){STACKTOP=r3;return}__ZdlPv(r6);STACKTOP=r3;return}function __ZN8SampleUI9guiActionEPvPKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+116|0;r4=r2,r5=r4>>2;r6=r2+84;r7=r4|0;HEAP32[r7>>2]=5259300;HEAP32[r5+1]=63;r8=r4+20|0;r9=(r4+16|0)>>2;HEAP32[r9]=r8;HEAP32[r5+2]=0;HEAP8[r8]=0;HEAP32[r5+3]=128;__ZN8mgString6formatEPKcz(r4,5251236,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r3,tempInt));r3=HEAP32[r1+32>>2];r1=HEAP32[HEAP32[r3>>2]+356>>2];__ZN7mgColorC2EPKc(r6,5250680);FUNCTION_TABLE[r1](r3,r6,0,HEAP32[r9]);HEAP32[r7>>2]=5259300;r7=HEAP32[r9];if((r7|0)==(r8|0)|(r7|0)==0){STACKTOP=r2;return}__ZdlPv(r7);STACKTOP=r2;return}function __ZN8SampleUI12guiSelectionEPvPKcj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+116|0;r5=r2,r6=r5>>2;r7=r2+84;r8=r5|0;HEAP32[r8>>2]=5259300;HEAP32[r6+1]=63;r9=r5+20|0;r10=(r5+16|0)>>2;HEAP32[r10]=r9;HEAP32[r6+2]=0;HEAP8[r9]=0;HEAP32[r6+3]=128;__ZN8mgString6formatEPKcz(r5,5250976,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=(r4|0)!=0?5250796:5250412,tempInt));r4=HEAP32[r1+32>>2];r1=HEAP32[HEAP32[r4>>2]+356>>2];__ZN7mgColorC2EPKc(r7,5250680);FUNCTION_TABLE[r1](r4,r7,0,HEAP32[r10]);HEAP32[r8>>2]=5259300;r8=HEAP32[r10];if((r8|0)==(r9|0)|(r8|0)==0){STACKTOP=r2;return}__ZdlPv(r8);STACKTOP=r2;return}function __ZThn4_N8SampleUI12guiSelectionEPvPKcj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+116|0;r5=r2,r6=r5>>2;r7=r2+84;r8=r5|0;HEAP32[r8>>2]=5259300;HEAP32[r6+1]=63;r9=r5+20|0;r10=(r5+16|0)>>2;HEAP32[r10]=r9;HEAP32[r6+2]=0;HEAP8[r9]=0;HEAP32[r6+3]=128;__ZN8mgString6formatEPKcz(r5,5250976,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=(r4|0)!=0?5250796:5250412,tempInt));r4=HEAP32[r1-84+112>>2];r1=HEAP32[HEAP32[r4>>2]+356>>2];__ZN7mgColorC2EPKc(r7,5250680);FUNCTION_TABLE[r1](r4,r7,0,HEAP32[r10]);HEAP32[r8>>2]=5259300;r8=HEAP32[r10];if((r8|0)==(r9|0)|(r8|0)==0){STACKTOP=r2;return}__ZdlPv(r8);STACKTOP=r2;return}function __ZN8SampleUI9guiChangeEPvPKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=STACKTOP;STACKTOP=STACKTOP+232|0;r5=r4,r6=r5>>2;r7=r4+84;r8=r4+116,r9=r8>>2;r10=r4+200;r11=r5|0;HEAP32[r11>>2]=5259300;HEAP32[r6+1]=63;r12=r5+20|0;r13=(r5+16|0)>>2;HEAP32[r13]=r12;HEAP32[r6+2]=0;HEAP8[r12]=0;HEAP32[r6+3]=128;r6=r2;FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+364>>2]](r6,r5);FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+368>>2]](r6);do{if((r6|0)==(HEAP32[r1+36>>2]|0)){r5=HEAP32[r1+32>>2];r14=HEAP32[HEAP32[r5>>2]+356>>2];__ZN7mgColorC2EPKc(r7,5249572);FUNCTION_TABLE[r14](r5,r7,0,HEAP32[r13])}else{FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+204>>2]](r2);r5=r8|0;HEAP32[r5>>2]=5259300;HEAP32[r9+1]=63;r14=r8+20|0;r15=(r8+16|0)>>2;HEAP32[r15]=r14;HEAP32[r9+2]=0;HEAP8[r14]=0;HEAP32[r9+3]=128;r16=HEAP32[r13];__ZN8mgString6formatEPKcz(r8,5249852,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=r16,tempInt));r16=HEAP32[r1+32>>2];r17=HEAP32[HEAP32[r16>>2]+356>>2];__ZN7mgColorC2EPKc(r10,5250680);FUNCTION_TABLE[r17](r16,r10,0,HEAP32[r15]);HEAP32[r5>>2]=5259300;r5=HEAP32[r15];if((r5|0)==(r14|0)|(r5|0)==0){break}__ZdlPv(r5)}}while(0);HEAP32[r11>>2]=5259300;r11=HEAP32[r13];if((r11|0)==(r12|0)|(r11|0)==0){STACKTOP=r4;return}__ZdlPv(r11);STACKTOP=r4;return}function __ZThn8_N8SampleUI9guiChangeEPvPKc(r1,r2,r3){__ZN8SampleUI9guiChangeEPvPKc(r1-84+76|0,r2,r3);return}function __ZN10GuiTestAllD0Ev(r1){HEAP32[r1>>2]=5272224;__ZN13mgOptionsFileD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZN10GuiTestAllD2Ev(r1){HEAP32[r1>>2]=5272224;__ZN13mgOptionsFileD2Ev(r1+4|0);return}function __ZN10GuiTestAll7appInitEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+420|0;r4=r3,r5=r4>>2;r6=r3+84,r7=r6>>2;r8=r3+168,r9=r8>>2;r10=r3+252,r11=r10>>2;r12=r3+336,r13=r12>>2;r14=r4|0;HEAP32[r14>>2]=5259300;HEAP32[r5+1]=63;r15=r4+20|0;r16=(r4+16|0)>>2;HEAP32[r16]=r15;HEAP32[r5+2]=0;HEAP8[r15]=0;HEAP32[r5+3]=128;r5=r1+4|0;r17=(r1+24|0)>>2;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5247648,HEAP32[r17],5245648,r4);r4=r6|0;HEAP32[r4>>2]=5259300;HEAP32[r7+1]=63;r18=r6+20|0;r19=r6+16|0;HEAP32[r19>>2]=r18;HEAP32[r7+2]=0;HEAP8[r18]=0;HEAP32[r7+3]=128;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5244864,HEAP32[r17],5244312,r6);r6=r8|0;HEAP32[r6>>2]=5259300;HEAP32[r9+1]=63;r7=r8+20|0;r20=(r8+16|0)>>2;HEAP32[r20]=r7;HEAP32[r9+2]=0;HEAP8[r7]=0;HEAP32[r9+3]=128;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5243736,HEAP32[r17],5243196,r8);__Z21mgInitDisplayServicesPKcS0_(HEAP32[r16],HEAP32[r20]);r8=HEAP32[1310729];r9=HEAP32[HEAP32[r8>>2]+24>>2];r21=__ZNK13mgOptionsFile10getIntegerEPKci(r5,5257420,0);FUNCTION_TABLE[r9](r8,r21);r21=HEAP32[1310729];r8=HEAP32[HEAP32[r21>>2]+232>>2];r9=__ZNK13mgOptionsFile9getDoubleEPKcd(r5,5256868,60);FUNCTION_TABLE[r8](r21,r9);r9=r10|0;HEAP32[r9>>2]=5259300;HEAP32[r11+1]=63;r21=r10+20|0;r8=(r10+16|0)>>2;HEAP32[r8]=r21;HEAP32[r11+2]=0;HEAP8[r21]=0;HEAP32[r11+3]=128;r11=HEAP32[1310726];__ZN8mgString6formatEPKcz(r10,5256196,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[1310727],HEAP32[tempInt+4>>2]=r11,tempInt));r11=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+40>>2]](r11,HEAP32[r8]);r11=HEAP32[1310729];HEAP32[r2+198]=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+100>>2]](r11,5255752,5277576);r11=HEAP32[1310729];HEAP32[r2+195]=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+100>>2]](r11,5255272,5277528);r11=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r11]+84>>2]](r1);FUNCTION_TABLE[HEAP32[HEAP32[r2]+88>>2]](r1,1);FUNCTION_TABLE[HEAP32[HEAP32[r11]+76>>2]](r1);r10=_SDL_GetTicks()>>>0;r22=r1+752|0;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r22>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r22+4>>2]=HEAP32[tempDoublePtr+4>>2];r22=r1+760|0;HEAPF64[tempDoublePtr>>3]=0,HEAP32[r22>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r22+4>>2]=HEAP32[tempDoublePtr+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r11]+96>>2]](r1);HEAP32[r2+193]=0;HEAP32[r2+194]=0;HEAP32[r2+197]=0;r11=HEAP32[1310729];r22=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+200>>2]](r11);r11=r1+796|0;HEAP32[r11>>2]=r22;do{if((r22|0)==0){HEAP32[r2+200]=0}else{r1=r12|0;HEAP32[r1>>2]=5259300;HEAP32[r13+1]=63;r10=r12+20|0;r23=(r12+16|0)>>2;HEAP32[r23]=r10;HEAP32[r13+2]=0;HEAP8[r10]=0;HEAP32[r13+3]=128;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5254916,HEAP32[r17],5254632,r12);r24=__Znwj(84);r25=HEAP32[r11>>2];__ZN8SampleUIC2EP9mgSurfacePKc(r24,FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+8>>2]](r25),HEAP32[r23]);HEAP32[r2+200]=r24;HEAP32[r1>>2]=5259300;r1=HEAP32[r23];if((r1|0)==(r10|0)|(r1|0)==0){break}__ZdlPv(r1)}}while(0);HEAP32[r9>>2]=5259300;r9=HEAP32[r8];if(!((r9|0)==(r21|0)|(r9|0)==0)){__ZdlPv(r9)}HEAP32[r6>>2]=5259300;r6=HEAP32[r20];if(!((r6|0)==(r7|0)|(r6|0)==0)){__ZdlPv(r6)}HEAP32[r4>>2]=5259300;r4=HEAP32[r19>>2];if(!((r4|0)==(r18|0)|(r4|0)==0)){__ZdlPv(r4)}HEAP32[r14>>2]=5259300;r14=HEAP32[r16];if((r14|0)==(r15|0)|(r14|0)==0){STACKTOP=r3;return}__ZdlPv(r14);STACKTOP=r3;return}function __ZN10GuiTestAll7appTermEv(r1){var r2,r3;r2=r1+484|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3)}HEAP32[r2>>2]=0;r2=r1+480|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3)}HEAP32[r2>>2]=0;r2=r1+800|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+8>>2]](r3)}HEAP32[r2>>2]=0;r2=r1+796|0;r1=HEAP32[r2>>2];if((r1|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1)}HEAP32[r2>>2]=0;r2=HEAP32[1310729];if((r2|0)==0){HEAP32[1310729]=0;return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+308>>2]](r2);HEAP32[1310729]=0;return}function __Z19mgCreateApplicationv(){var r1,r2,r3,r4;r1=__Znwj(804),r2=r1>>2;HEAP32[r2]=5272224;r3=r1+4|0;__ZN13mgOptionsFileC2Ev(r3);r4=(r1+496|0)>>2;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;HEAP32[r4+4]=0;HEAP32[r4+5]=0;r4=r1+664|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r1+624|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r1+584|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r1+544|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];_memset(r1+552|0,0,32);_memset(r1+592|0,0,32);_memset(r1+632|0,0,32);HEAP32[r2+192]=0;HEAP32[r2+193]=0;HEAP32[r2+194]=0;HEAP32[r2+196]=0;HEAP32[r2+197]=0;HEAP32[r2+199]=0;HEAP32[r2+200]=0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+20>>2]](r3,5249880);HEAP32[r2+120]=0;HEAP32[r2+121]=0;return r1}function __ZN10GuiTestAll14updateMovementEdd(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r3=r1+640|0;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=-r4;r5=r1+648|0;r6=-(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r1+656|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=1-r7;r8=r1+544|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r1+552|0;r10=r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r1+560|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r3*r9+r10+r5*r11;r12=r1+576|0;r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+4>>2],HEAPF64[tempDoublePtr>>3]);r12=r1+584|0;r14=r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+4>>2],HEAPF64[tempDoublePtr>>3]);r12=r1+592|0;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+4>>2],HEAPF64[tempDoublePtr>>3]);r12=r3*r13+r14+r5*r15;r16=r1+608|0;r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]);r16=r1+616|0;r18=r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]);r16=r1+624|0;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]);r16=r3*r17+r18+r5*r6;r5=1-r4;r4=-r7;r7=r5*r9+r10+r4*r11;r11=r5*r13+r14+r4*r15;r15=r5*r17+r18+r4*r6;r6=(r1+688|0)>>2;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r6],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+1],HEAPF64[tempDoublePtr>>3]);if(r4!=-1){r18=r1+680|0;r17=(r2-r4)*(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+4>>2],HEAPF64[tempDoublePtr>>3]);r18=(r1+496|0)>>2;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r18],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+1],HEAPF64[tempDoublePtr>>3])+r8*r17;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r18]=HEAP32[tempDoublePtr>>2],HEAP32[r18+1]=HEAP32[tempDoublePtr+4>>2];r18=(r1+504|0)>>2;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r18],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+1],HEAPF64[tempDoublePtr>>3])+r12*r17;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r18]=HEAP32[tempDoublePtr>>2],HEAP32[r18+1]=HEAP32[tempDoublePtr+4>>2];r18=(r1+512|0)>>2;r4=r16*r17+(HEAP32[tempDoublePtr>>2]=HEAP32[r18],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r18]=HEAP32[tempDoublePtr>>2],HEAP32[r18+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];r19=1}else{r19=0}r6=(r1+696|0)>>2;r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r6],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+1],HEAPF64[tempDoublePtr>>3]);if(r18!=-1){r4=r1+680|0;r17=(r2-r18)*(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=(r1+496|0)>>2;r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-r8*r17;HEAPF64[tempDoublePtr>>3]=r18,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r1+504|0)>>2;r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-r12*r17;HEAPF64[tempDoublePtr>>3]=r18,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r1+512|0)>>2;r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-r16*r17;HEAPF64[tempDoublePtr>>3]=r18,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];r20=1}else{r20=r19}r19=(r1+704|0)>>2;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r19],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+1],HEAPF64[tempDoublePtr>>3]);if(r6!=-1){r4=r1+680|0;r18=(r2-r6)*(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=(r1+496|0)>>2;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-r7*r18;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r1+504|0)>>2;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-r11*r18;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r1+512|0)>>2;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-r15*r18;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r19]=HEAP32[tempDoublePtr>>2],HEAP32[r19+1]=HEAP32[tempDoublePtr+4>>2];r21=1}else{r21=r20}r20=(r1+712|0)>>2;r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r20],HEAP32[tempDoublePtr+4>>2]=HEAP32[r20+1],HEAPF64[tempDoublePtr>>3]);if(r19!=-1){r4=r1+680|0;r6=(r2-r19)*(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=(r1+496|0)>>2;r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])+r7*r6;HEAPF64[tempDoublePtr>>3]=r19,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r1+504|0)>>2;r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])+r11*r6;HEAPF64[tempDoublePtr>>3]=r19,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r1+512|0)>>2;r19=r15*r6+(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r19,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r20]=HEAP32[tempDoublePtr>>2],HEAP32[r20+1]=HEAP32[tempDoublePtr+4>>2];r22=1}else{r22=r21}r21=(r1+720|0)>>2;r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r21],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+1],HEAPF64[tempDoublePtr>>3]);if(r20!=-1){r4=r1+680|0;r19=(r1+504|0)>>2;r6=(r2-r20)*(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3])+(HEAP32[tempDoublePtr>>2]=HEAP32[r19],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r19]=HEAP32[tempDoublePtr>>2],HEAP32[r19+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r21]=HEAP32[tempDoublePtr>>2],HEAP32[r21+1]=HEAP32[tempDoublePtr+4>>2];r23=1}else{r23=r22}r22=(r1+728|0)>>2;r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r22],HEAP32[tempDoublePtr+4>>2]=HEAP32[r22+1],HEAPF64[tempDoublePtr>>3]);if(r21!=-1){r19=r1+680|0;r6=(r2-r21)*(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=(r1+504|0)>>2;r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r19],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+1],HEAPF64[tempDoublePtr>>3])-r6;HEAPF64[tempDoublePtr>>3]=r21,HEAP32[r19]=HEAP32[tempDoublePtr>>2],HEAP32[r19+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r22]=HEAP32[tempDoublePtr>>2],HEAP32[r22+1]=HEAP32[tempDoublePtr+4>>2];r24=1}else{r24=r23}r23=(r1+736|0)>>2;r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r23],HEAP32[tempDoublePtr+4>>2]=HEAP32[r23+1],HEAPF64[tempDoublePtr>>3]);if(r22!=-1){r19=r1+672|0;r21=(r1+528|0)>>2;r6=(r2-r22)*(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3])+(HEAP32[tempDoublePtr>>2]=HEAP32[r21],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+1],HEAPF64[tempDoublePtr>>3]);if(r6>180){r25=r6-360}else{r25=r6}HEAPF64[tempDoublePtr>>3]=r25,HEAP32[r21]=HEAP32[tempDoublePtr>>2],HEAP32[r21+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r23]=HEAP32[tempDoublePtr>>2],HEAP32[r23+1]=HEAP32[tempDoublePtr+4>>2];r26=1}else{r26=r24}r24=(r1+744|0)>>2;r23=(HEAP32[tempDoublePtr>>2]=HEAP32[r24],HEAP32[tempDoublePtr+4>>2]=HEAP32[r24+1],HEAPF64[tempDoublePtr>>3]);if(r23==-1){r27=r26;return r27}r26=r1+672|0;r21=(r2-r23)*(HEAP32[tempDoublePtr>>2]=HEAP32[r26>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r26+4>>2],HEAPF64[tempDoublePtr>>3]);r26=(r1+528|0)>>2;r1=(HEAP32[tempDoublePtr>>2]=HEAP32[r26],HEAP32[tempDoublePtr+4>>2]=HEAP32[r26+1],HEAPF64[tempDoublePtr>>3])-r21;if(r1<-180){r28=r1+360}else{r28=r1}HEAPF64[tempDoublePtr>>3]=r28,HEAP32[r26]=HEAP32[tempDoublePtr>>2],HEAP32[r26+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r24]=HEAP32[tempDoublePtr>>2],HEAP32[r24+1]=HEAP32[tempDoublePtr+4>>2];r27=1;return r27}function __ZN10GuiTestAll7turnEyeEii(r1,r2,r3){var r4,r5,r6,r7,r8;r4=(r1+520|0)>>2;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])-(r3|0)/25;r3=(r1+528|0)>>2;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r3],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+1],HEAPF64[tempDoublePtr>>3])-(r2|0)/25;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r3]=HEAP32[tempDoublePtr>>2],HEAP32[r3+1]=HEAP32[tempDoublePtr+4>>2];r2=r5<90?r5:90;r5=r2>-90?r2:-90;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];if(r6<-180){r4=r6+360;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r3]=HEAP32[tempDoublePtr>>2],HEAP32[r3+1]=HEAP32[tempDoublePtr+4>>2];r7=r4}else{r7=r6}if(r7<=180){r8=r1+492|0;HEAP32[r8>>2]=1;return}r6=r7-360;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r3]=HEAP32[tempDoublePtr>>2],HEAP32[r3+1]=HEAP32[tempDoublePtr+4>>2];r8=r1+492|0;HEAP32[r8>>2]=1;return}function __ZN10GuiTestAll17appRequestDisplayEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2,r4=r3>>2;r5=HEAP32[1310728];r6=HEAP32[HEAP32[r5>>2]+8>>2];r7=r1+4|0;r1=__ZNK13mgOptionsFile10getBooleanEPKcj(r7,5254296,0);FUNCTION_TABLE[r6](r5,r1);r1=HEAP32[1310728];r5=HEAP32[HEAP32[r1>>2]+16>>2];r6=__ZNK13mgOptionsFile10getIntegerEPKci(r7,5253932,100);r8=__ZNK13mgOptionsFile10getIntegerEPKci(r7,5253604,100);r9=__ZNK13mgOptionsFile10getIntegerEPKci(r7,5253276,800);r10=__ZNK13mgOptionsFile10getIntegerEPKci(r7,5253064,600);FUNCTION_TABLE[r5](r1,r6,r8,r9,r10);r10=HEAP32[1310728];r9=HEAP32[HEAP32[r10>>2]+32>>2];r8=__ZNK13mgOptionsFile10getBooleanEPKcj(r7,5252704,1);FUNCTION_TABLE[r9](r10,r8);r8=HEAP32[1310728];r10=HEAP32[HEAP32[r8>>2]+24>>2];r9=__ZNK13mgOptionsFile10getBooleanEPKcj(r7,5252432,0);FUNCTION_TABLE[r10](r8,r9);r9=r3|0;HEAP32[r9>>2]=5259300;HEAP32[r4+1]=63;r8=r3+20|0;r10=(r3+16|0)>>2;HEAP32[r10]=r8;HEAP32[r4+2]=0;HEAP8[r8]=0;HEAP32[r4+3]=128;__ZNK13mgOptionsFile9getStringEPKcS1_R8mgString(r7,5252180,5254808,r3);r3=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]>>2]](r3,HEAP32[r10]);HEAP32[r9>>2]=5259300;r9=HEAP32[r10];if((r9|0)==(r8|0)|(r9|0)==0){STACKTOP=r2;return}__ZdlPv(r9);STACKTOP=r2;return}function __ZN10GuiTestAll11setDeskModeEj(r1,r2){var r3,r4;HEAP32[r1+488>>2]=r2;r3=HEAP32[1310729];r4=HEAP32[HEAP32[r3>>2]+40>>2];if((r2|0)==0){r2=HEAP32[r1+484>>2]>>2;FUNCTION_TABLE[r4](r3,HEAP32[r2+119],HEAP32[r2+136],HEAP32[r2+137]);r2=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](r2,0);return}else{r2=HEAP32[r1+480>>2]>>2;FUNCTION_TABLE[r4](r3,HEAP32[r2+119],HEAP32[r2+136],HEAP32[r2+137]);r2=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](r2,1);return}}function __ZN10GuiTestAll12initMovementEv(r1){var r2;r2=r1+688|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+696|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+704|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+712|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+720|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+728|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+736|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+744|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+672|0;HEAPF64[tempDoublePtr>>3]=.12,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+680|0;HEAPF64[tempDoublePtr>>3]=.0025,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+496|0;HEAPF64[tempDoublePtr>>3]=0,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+504|0;HEAPF64[tempDoublePtr>>3]=2.5,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+512|0;HEAPF64[tempDoublePtr>>3]=-3.5,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=(r1+520|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r1+492>>2]=1;return}function __ZN10GuiTestAll12loadTexturesEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=STACKTOP;STACKTOP=STACKTOP+100|0;r3=r2;r4=r2+16,r5=r4>>2;r6=r3|0;HEAP32[r6>>2]=5266196;HEAP32[r3+12>>2]=0;r7=(r3+4|0)>>2;HEAP32[r7]=0;r8=(r3+8|0)>>2;HEAP32[r8]=0;r9=r4|0;HEAP32[r9>>2]=5259300;HEAP32[r5+1]=63;r10=r4+20|0;r11=(r4+16|0)>>2;HEAP32[r11]=r10;HEAP32[r5+2]=0;HEAP8[r10]=0;HEAP32[r5+3]=128;r5=r1+4|0;r12=(r1+24|0)>>2;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5251048,HEAP32[r12],5250800,r4);__ZN13mgStringArray3addEPKc(r3,HEAP32[r11]);__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5250532,HEAP32[r12],5250168,r4);__ZN13mgStringArray3addEPKc(r3,HEAP32[r11]);__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5249892,HEAP32[r12],5249596,r4);__ZN13mgStringArray3addEPKc(r3,HEAP32[r11]);__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5249452,HEAP32[r12],5249436,r4);__ZN13mgStringArray3addEPKc(r3,HEAP32[r11]);__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5249224,HEAP32[r12],5248996,r4);__ZN13mgStringArray3addEPKc(r3,HEAP32[r11]);__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5248844,HEAP32[r12],5248712,r4);__ZN13mgStringArray3addEPKc(r3,HEAP32[r11]);r13=HEAP32[1310729];HEAP32[r1+768>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+64>>2]](r13,r3);__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r5,5248516,HEAP32[r12],5248116,r4);r4=HEAP32[1310729];HEAP32[r1+784>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+60>>2]](r4,HEAP32[r11]);HEAP32[r9>>2]=5259300;r9=HEAP32[r11];if(!((r9|0)==(r10|0)|(r9|0)==0)){__ZdlPv(r9)}HEAP32[r6>>2]=5266196;r6=HEAP32[r8];L295:do{if((r6|0)>0){r9=0;r10=r6;while(1){r11=HEAP32[HEAP32[r7]+(r9<<2)>>2];if((r11|0)==0){r14=r10}else{__ZdlPv(r11);HEAP32[HEAP32[r7]+(r9<<2)>>2]=0;r14=HEAP32[r8]}r11=r9+1|0;if((r11|0)<(r14|0)){r9=r11;r10=r14}else{break L295}}}}while(0);HEAP32[r8]=0;r8=HEAP32[r7];if((r8|0)==0){STACKTOP=r2;return}__ZdlPv(r8);STACKTOP=r2;return}function __ZN10GuiTestAll14appViewResizedEii(r1,r2,r3){var r4;r4=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+20>>2]](r4,r2,r3);r4=HEAP32[r1+800>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+16>>2]](r4,r2,r3);return}function __ZN10GuiTestAll10loadCursorEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2,r4=r3>>2;r5=r3|0;HEAP32[r5>>2]=5259300;HEAP32[r4+1]=63;r6=r3+20|0;r7=(r3+16|0)>>2;HEAP32[r7]=r6;HEAP32[r4+2]=0;HEAP8[r6]=0;HEAP32[r4+3]=128;r4=r1+4|0;r8=r1+24|0;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r4,5251628,HEAP32[r8>>2],5251628,r3);r9=__Znwj(552);__ZN12mgCursorDefnC2EPKc(r9,HEAP32[r7]);HEAP32[r1+480>>2]=r9;__ZNK13mgOptionsFile11getFileNameEPKcS1_S1_R8mgString(r4,5251460,HEAP32[r8>>2],5251460,r3);r3=__Znwj(552);__ZN12mgCursorDefnC2EPKc(r3,HEAP32[r7]);HEAP32[r1+484>>2]=r3;HEAP32[r5>>2]=5259300;r5=HEAP32[r7];if((r5|0)==(r6|0)|(r5|0)==0){STACKTOP=r2;return}__ZdlPv(r5);STACKTOP=r2;return}function __ZN10GuiTestAll7appIdleEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r2;r4=_SDL_GetTicks()>>>0;r5=(r1+752|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+108>>2]](r1,r4,r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3]));HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];r5=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+92>>2]](r5);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+112>>2]](r1);r5=r1+800|0;if((HEAP32[r5>>2]|0)==0){r6=HEAP32[1310729];r7=r6;r8=HEAP32[r7>>2];r9=r8+56|0;r10=HEAP32[r9>>2];FUNCTION_TABLE[r10](r6);r11=HEAP32[1310729];r12=r11;r13=HEAP32[r12>>2];r14=r13+4|0;r15=HEAP32[r14>>2];FUNCTION_TABLE[r15](r11);STACKTOP=r2;return}r4=r1+796|0;r1=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1);if((FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+72>>2]](r16)|0)!=0){r1=r3>>2;HEAP32[r1]=0;HEAP32[r1+1]=0;HEAP32[r1+2]=0;HEAP32[r1+3]=0;r1=r16;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+68>>2]](r16,r3);r17=HEAP32[HEAP32[r5>>2]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+356>>2]](r17,r3);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+76>>2]](r16,r3)}r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+280>>2]](r3,1);r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+276>>2]](r3,0);r3=HEAP32[r4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r3,0,0);r6=HEAP32[1310729];r7=r6;r8=HEAP32[r7>>2];r9=r8+56|0;r10=HEAP32[r9>>2];FUNCTION_TABLE[r10](r6);r11=HEAP32[1310729];r12=r11;r13=HEAP32[r12>>2];r14=r13+4|0;r15=HEAP32[r14>>2];FUNCTION_TABLE[r15](r11);STACKTOP=r2;return}function __ZN10GuiTestAll7animateEdd(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=STACKTOP;STACKTOP=STACKTOP+384|0;r5=r4;r6=r4+128;r7=r4+256;r8=(r1+760|0)>>2;r9=r3/100+(HEAP32[tempDoublePtr>>2]=HEAP32[r8],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];r8=r1+544|0;r9=r1+664|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r1+624|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r1+584|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r8|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];_memset(r1+552|0,0,32);_memset(r1+592|0,0,32);_memset(r1+632|0,0,32);r9=r1+536|0;r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r7+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r7+80|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r7+40|0;r11=r7|0;r12=r7+8|0;r13=r12>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r13+4]=0;HEAP32[r13+5]=0;r13=(r7+48|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r13+4]=0;HEAP32[r13+5]=0;HEAP32[r13+6]=0;HEAP32[r13+7]=0;r13=(r7+88|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r13+4]=0;HEAP32[r13+5]=0;HEAP32[r13+6]=0;HEAP32[r13+7]=0;r13=r10*3.141592653589793/180;r10=Math.cos(r13);HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];r11=Math.sin(r13);HEAPF64[tempDoublePtr>>3]=r11,HEAP32[r12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r12+4>>2]=HEAP32[tempDoublePtr+4>>2];r12=-r11;r11=r7+32|0;HEAPF64[tempDoublePtr>>3]=r12,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r8,r7);r7=r1+528|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r6+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r6+80|0;r10=r6+40|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r6|0;r11=(r6+8|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAP32[r11+6]=0;HEAP32[r11+7]=0;r11=(r6+48|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAP32[r11+6]=0;HEAP32[r11+7]=0;r11=(r6+88|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAP32[r11+6]=0;HEAP32[r11+7]=0;r11=r9*3.141592653589793/180;r9=Math.cos(r11);HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=Math.sin(r11);r11=-r10;r12=r6+16|0;HEAPF64[tempDoublePtr>>3]=r11,HEAP32[r12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r12+4>>2]=HEAP32[tempDoublePtr+4>>2];r12=r6+64|0;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r12+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r8,r6);r6=r1+520|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r5+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r5+80|0;r9=r5+40|0;r12=r5|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r12+4>>2]=HEAP32[tempDoublePtr+4>>2];r12=r5+48|0;r10=(r5+8|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;r10=r12>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;r10=(r5+88|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;r10=r7*3.141592653589793/180;r7=Math.cos(r10);HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=Math.sin(r10);HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r12+4>>2]=HEAP32[tempDoublePtr+4>>2];r12=-r9;r9=r5+72|0;HEAPF64[tempDoublePtr>>3]=r12,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r8,r5);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+80>>2]](r1,r2,r3);HEAP32[r1+492>>2]=0;r5=r1+800|0;r8=HEAP32[r5>>2];if((r8|0)==0){STACKTOP=r4;return 1}r6=HEAP32[HEAP32[r8>>2]+32>>2];r7=r1+496|0;r9=r1+512|0;FUNCTION_TABLE[r6](r8,(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]));r9=HEAP32[r5>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+12>>2]](r9,r2,r3);STACKTOP=r4;return 1}function __ZN10GuiTestAll8viewDrawEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+640|0;r4=r3;r5=r3+128;r6=r3+256;r7=r3+384;r8=r3+512;r9=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+220>>2]](r9,r1+544|0);r9=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+216>>2]](r9,r1+496|0);r9=r1+788|0;if((HEAP32[r9>>2]|0)!=0){r10=r7+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r7+80|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r7+40|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r7|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=(r7+8|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;r10=(r7+48|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;r10=(r7+88|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;r10=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+248>>2]](r10,r7);r7=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+108>>2]](r7,HEAP32[r2+198]);r7=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+156>>2]](r7,HEAP32[r2+196],0);r7=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+168>>2]](r7,0,HEAP32[r9>>2])}r9=r1+772|0;if((HEAP32[r9>>2]|0)==0){STACKTOP=r3;return}r7=r8+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r8+80|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r8+40|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r8|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=(r8+8|0)>>2;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r7+5]=0;HEAP32[r7+6]=0;HEAP32[r7+7]=0;r7=(r8+48|0)>>2;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r7+5]=0;HEAP32[r7+6]=0;HEAP32[r7+7]=0;r7=(r8+88|0)>>2;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r7+5]=0;HEAP32[r7+6]=0;HEAP32[r7+7]=0;r7=r6+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r6+80|0;r10=r6+40|0;r11=r6|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];r11=r6+48|0;r12=(r6+8|0)>>2;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r12+4]=0;HEAP32[r12+5]=0;HEAP32[r12+6]=0;HEAP32[r12+7]=0;r12=r11>>2;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r12+4]=0;HEAP32[r12+5]=0;r12=(r6+88|0)>>2;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r12+4]=0;HEAP32[r12+5]=0;HEAP32[r12+6]=0;HEAP32[r12+7]=0;HEAPF64[tempDoublePtr>>3]=.7071067811865476,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.7071067811865475,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];r11=r6+72|0;HEAPF64[tempDoublePtr>>3]=-.7071067811865475,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.7071067811865476,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r8,r6);r6=r5+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r5+80|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r5+40|0;r7=r5|0;r11=r5+8|0;r10=r11>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;r10=(r5+48|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;r10=(r5+88|0)>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;HEAP32[r10+6]=0;HEAP32[r10+7]=0;HEAPF64[tempDoublePtr>>3]=.7071067811865476,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.7071067811865475,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];r11=r5+32|0;HEAPF64[tempDoublePtr>>3]=-.7071067811865475,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.7071067811865476,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r8,r5);r5=r1+760|0;r1=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r4+80|0;r6=r4+40|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4|0;r11=(r4+8|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAP32[r11+6]=0;HEAP32[r11+7]=0;r11=(r4+48|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAP32[r11+6]=0;HEAP32[r11+7]=0;r11=(r4+88|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAP32[r11+6]=0;HEAP32[r11+7]=0;r11=r1*3.141592653589793/180;r1=Math.cos(r11);HEAPF64[tempDoublePtr>>3]=r1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=Math.sin(r11);r11=-r6;r7=r4+16|0;HEAPF64[tempDoublePtr>>3]=r11,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r4+64|0;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r1,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r8,r4);r4=(r8+96|0)>>2;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r8+104|0)>>2;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3])+1.7320508075688772;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=(r8+112|0)>>2;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r4],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r4]=HEAP32[tempDoublePtr>>2],HEAP32[r4+1]=HEAP32[tempDoublePtr+4>>2];r4=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+248>>2]](r4,r8);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+296>>2]](r8,1,1,1,1);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+268>>2]](r8,1);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+280>>2]](r8,0);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+108>>2]](r8,HEAP32[r2+195]);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+160>>2]](r8,HEAP32[r2+192],0);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+176>>2]](r8,0,HEAP32[r2+194],HEAP32[r9>>2]);STACKTOP=r3;return}function __ZN10GuiTestAll16appCreateBuffersEv(r1){var r2;r2=r1;FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+100>>2]](r1);FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+104>>2]](r1);return}function __ZN10GuiTestAll16appDeleteBuffersEv(r1){var r2,r3;r2=r1+772|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3)}HEAP32[r2>>2]=0;r2=r1+776|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3)}HEAP32[r2>>2]=0;r2=(r1+788|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);HEAP32[r2]=0;return}function __ZN10GuiTestAll10createCubeEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=STACKTOP;STACKTOP=STACKTOP+144|0;r3=r2;r4=r2+36;r5=r2+72;r6=r2+108;r7=HEAP32[1310729];r8=(r1+776|0)>>2;HEAP32[r8]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+148>>2]](r7,36,5277528,24,0);r7=HEAP32[1310729];r9=(r1+772|0)>>2;HEAP32[r9]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+152>>2]](r7,36,0,0);HEAPF32[r3+24>>2]=0;HEAPF32[r3+28>>2]=0;r7=(r3+32|0)>>2;HEAPF32[r4+24>>2]=1;HEAPF32[r4+28>>2]=0;r1=(r4+32|0)>>2;HEAPF32[r5+24>>2]=0;HEAPF32[r5+28>>2]=1;r10=(r5+32|0)>>2;HEAPF32[r6+24>>2]=1;HEAPF32[r6+28>>2]=1;r11=(r6+32|0)>>2;r12=HEAP32[r8];r13=HEAP32[r12+20>>2];HEAPF32[r11]=0;HEAPF32[r10]=0;HEAPF32[r1]=0;HEAPF32[r7]=0;r14=(r3+12|0)>>2;HEAPF32[r14]=-1;r15=(r3+16|0)>>2;HEAPF32[r15]=0;r16=(r3+20|0)>>2;HEAPF32[r16]=0;r17=(r4+12|0)>>2;HEAPF32[r17]=-1;r18=(r4+16|0)>>2;HEAPF32[r18]=0;r19=(r4+20|0)>>2;HEAPF32[r19]=0;r20=(r5+12|0)>>2;HEAPF32[r20]=-1;r21=(r5+16|0)>>2;HEAPF32[r21]=0;r22=(r5+20|0)>>2;HEAPF32[r22]=0;r23=(r6+12|0)>>2;HEAPF32[r23]=-1;r24=(r6+16|0)>>2;HEAPF32[r24]=0;r25=(r6+20|0)>>2;HEAPF32[r25]=0;r26=(r3|0)>>2;HEAPF32[r26]=-1;r27=(r3+4|0)>>2;HEAPF32[r27]=1;r28=(r3+8|0)>>2;HEAPF32[r28]=1;r29=(r4|0)>>2;HEAPF32[r29]=-1;r30=(r4+4|0)>>2;HEAPF32[r30]=1;r31=(r4+8|0)>>2;HEAPF32[r31]=-1;r32=(r5|0)>>2;HEAPF32[r32]=-1;r33=(r5+4|0)>>2;HEAPF32[r33]=-1;r34=(r5+8|0)>>2;HEAPF32[r34]=1;r35=(r6|0)>>2;HEAPF32[r35]=-1;r36=(r6+4|0)>>2;HEAPF32[r36]=-1;r37=(r6+8|0)>>2;HEAPF32[r37]=-1;r38=r3;__ZN14mgVertexBuffer9addVertexEPKv(r12,r38);r12=r4;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r12);r4=r5;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r4);r5=r6;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r5);__ZN13mgIndexBuffer12addRectIndexEi(HEAP32[r9],r13);r13=HEAP32[r8];r6=HEAP32[r13+20>>2];HEAPF32[r11]=1;HEAPF32[r10]=1;HEAPF32[r1]=1;HEAPF32[r7]=1;HEAPF32[r14]=1;HEAPF32[r15]=0;HEAPF32[r16]=0;HEAPF32[r17]=1;HEAPF32[r18]=0;HEAPF32[r19]=0;HEAPF32[r20]=1;HEAPF32[r21]=0;HEAPF32[r22]=0;HEAPF32[r23]=1;HEAPF32[r24]=0;HEAPF32[r25]=0;HEAPF32[r26]=1;HEAPF32[r27]=1;HEAPF32[r28]=-1;HEAPF32[r29]=1;HEAPF32[r30]=1;HEAPF32[r31]=1;HEAPF32[r32]=1;HEAPF32[r33]=-1;HEAPF32[r34]=-1;HEAPF32[r35]=1;HEAPF32[r36]=-1;HEAPF32[r37]=1;__ZN14mgVertexBuffer9addVertexEPKv(r13,r38);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r4);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r5);__ZN13mgIndexBuffer12addRectIndexEi(HEAP32[r9],r6);r6=HEAP32[r8];r13=HEAP32[r6+20>>2];HEAPF32[r11]=2;HEAPF32[r10]=2;HEAPF32[r1]=2;HEAPF32[r7]=2;HEAPF32[r14]=0;HEAPF32[r15]=-1;HEAPF32[r16]=0;HEAPF32[r17]=0;HEAPF32[r18]=-1;HEAPF32[r19]=0;HEAPF32[r20]=0;HEAPF32[r21]=-1;HEAPF32[r22]=0;HEAPF32[r23]=0;HEAPF32[r24]=-1;HEAPF32[r25]=0;HEAPF32[r26]=-1;HEAPF32[r27]=-1;HEAPF32[r28]=-1;HEAPF32[r29]=1;HEAPF32[r30]=-1;HEAPF32[r31]=-1;HEAPF32[r32]=-1;HEAPF32[r33]=-1;HEAPF32[r34]=1;HEAPF32[r35]=1;HEAPF32[r36]=-1;HEAPF32[r37]=1;__ZN14mgVertexBuffer9addVertexEPKv(r6,r38);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r4);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r5);__ZN13mgIndexBuffer12addRectIndexEi(HEAP32[r9],r13);r13=HEAP32[r8];r6=HEAP32[r13+20>>2];HEAPF32[r11]=3;HEAPF32[r10]=3;HEAPF32[r1]=3;HEAPF32[r7]=3;HEAPF32[r14]=0;HEAPF32[r15]=1;HEAPF32[r16]=0;HEAPF32[r17]=0;HEAPF32[r18]=1;HEAPF32[r19]=0;HEAPF32[r20]=0;HEAPF32[r21]=1;HEAPF32[r22]=0;HEAPF32[r23]=0;HEAPF32[r24]=1;HEAPF32[r25]=0;HEAPF32[r26]=-1;HEAPF32[r27]=1;HEAPF32[r28]=1;HEAPF32[r29]=1;HEAPF32[r30]=1;HEAPF32[r31]=1;HEAPF32[r32]=-1;HEAPF32[r33]=1;HEAPF32[r34]=-1;HEAPF32[r35]=1;HEAPF32[r36]=1;HEAPF32[r37]=-1;__ZN14mgVertexBuffer9addVertexEPKv(r13,r38);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r4);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r5);__ZN13mgIndexBuffer12addRectIndexEi(HEAP32[r9],r6);r6=HEAP32[r8];r13=HEAP32[r6+20>>2];HEAPF32[r11]=4;HEAPF32[r10]=4;HEAPF32[r1]=4;HEAPF32[r7]=4;HEAPF32[r14]=0;HEAPF32[r15]=0;HEAPF32[r16]=-1;HEAPF32[r17]=0;HEAPF32[r18]=0;HEAPF32[r19]=-1;HEAPF32[r20]=0;HEAPF32[r21]=0;HEAPF32[r22]=-1;HEAPF32[r23]=0;HEAPF32[r24]=0;HEAPF32[r25]=-1;HEAPF32[r26]=-1;HEAPF32[r27]=1;HEAPF32[r28]=-1;HEAPF32[r29]=1;HEAPF32[r30]=1;HEAPF32[r31]=-1;HEAPF32[r32]=-1;HEAPF32[r33]=-1;HEAPF32[r34]=-1;HEAPF32[r35]=1;HEAPF32[r36]=-1;HEAPF32[r37]=-1;__ZN14mgVertexBuffer9addVertexEPKv(r6,r38);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r4);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r5);__ZN13mgIndexBuffer12addRectIndexEi(HEAP32[r9],r13);r13=HEAP32[r8];r6=HEAP32[r13+20>>2];HEAPF32[r11]=5;HEAPF32[r10]=5;HEAPF32[r1]=5;HEAPF32[r7]=5;HEAPF32[r14]=0;HEAPF32[r15]=0;HEAPF32[r16]=1;HEAPF32[r17]=0;HEAPF32[r18]=0;HEAPF32[r19]=1;HEAPF32[r20]=0;HEAPF32[r21]=0;HEAPF32[r22]=1;HEAPF32[r23]=0;HEAPF32[r24]=0;HEAPF32[r25]=1;HEAPF32[r26]=1;HEAPF32[r27]=1;HEAPF32[r28]=1;HEAPF32[r29]=-1;HEAPF32[r30]=1;HEAPF32[r31]=1;HEAPF32[r32]=1;HEAPF32[r33]=-1;HEAPF32[r34]=1;HEAPF32[r35]=-1;HEAPF32[r36]=-1;HEAPF32[r37]=1;__ZN14mgVertexBuffer9addVertexEPKv(r13,r38);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r4);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r8],r5);__ZN13mgIndexBuffer12addRectIndexEi(HEAP32[r9],r6);STACKTOP=r2;return}function __ZN13mgIndexBuffer12addRectIndexEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=STACKTOP;r4=(r1+20|0)>>2;r5=HEAP32[r4];if((r5+6|0)>(HEAP32[r1+16>>2]|0)){r6=___cxa_allocate_exception(4);r7=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r7,5247932,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r6>>2]=r7;___cxa_throw(r6,5275304,0)}if((HEAP32[r1+28>>2]|0)==0){r6=HEAP32[r1+8>>2]>>1;HEAP16[(r5<<1>>1)+r6]=r2&65535;r7=r2+1&65535;HEAP16[(r5+1<<1>>1)+r6]=r7;r8=r2+2&65535;HEAP16[(r5+2<<1>>1)+r6]=r8;HEAP16[(r5+3<<1>>1)+r6]=r8;HEAP16[(r5+4<<1>>1)+r6]=r7;HEAP16[(r5+5<<1>>1)+r6]=r2+3&65535;r6=HEAP32[r4];r7=r6+6|0;HEAP32[r4]=r7;STACKTOP=r3;return}else{r8=HEAP32[r1+12>>2]>>2;HEAP32[(r5<<2>>2)+r8]=r2;r1=r2+1|0;HEAP32[(r5+1<<2>>2)+r8]=r1;r9=r2+2|0;HEAP32[(r5+2<<2>>2)+r8]=r9;HEAP32[(r5+3<<2>>2)+r8]=r9;HEAP32[(r5+4<<2>>2)+r8]=r1;HEAP32[(r5+5<<2>>2)+r8]=r2+3|0;r6=HEAP32[r4];r7=r6+6|0;HEAP32[r4]=r7;STACKTOP=r3;return}}function __ZN10GuiTestAll13appMouseWheelEii(r1,r2,r3){return}function __ZN10GuiTestAll11createFloorEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=STACKTOP;STACKTOP=STACKTOP+128|0;r3=r2,r4=r3>>2;r5=r2+32,r6=r5>>2;r7=r2+64,r8=r7>>2;r9=r2+96,r10=r9>>2;r11=HEAP32[1310729];r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+148>>2]](r11,32,5277576,6,0);r11=(r1+788|0)>>2;HEAP32[r11]=r12;HEAPF32[r4+6]=0;HEAPF32[r4+7]=0;HEAPF32[r6+6]=20;HEAPF32[r6+7]=0;HEAPF32[r8+6]=0;HEAPF32[r8+7]=20;HEAPF32[r10+6]=20;HEAPF32[r10+7]=20;HEAPF32[r4+3]=0;HEAPF32[r4+4]=1;HEAPF32[r4+5]=0;HEAPF32[r6+3]=0;HEAPF32[r6+4]=1;HEAPF32[r6+5]=0;HEAPF32[r8+3]=0;HEAPF32[r8+4]=1;HEAPF32[r8+5]=0;HEAPF32[r10+3]=0;HEAPF32[r10+4]=1;HEAPF32[r10+5]=0;HEAPF32[r4]=-10;HEAPF32[r4+1]=0;HEAPF32[r4+2]=10;HEAPF32[r6]=10;HEAPF32[r6+1]=0;HEAPF32[r6+2]=10;HEAPF32[r8]=-10;HEAPF32[r8+1]=0;HEAPF32[r8+2]=-10;HEAPF32[r10]=10;HEAPF32[r10+1]=0;HEAPF32[r10+2]=-10;__ZN14mgVertexBuffer9addVertexEPKv(r12,r3);r3=r5;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r11],r3);r5=r7;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r11],r5);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r11],r5);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r11],r3);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r11],r9);STACKTOP=r2;return}function __ZN10GuiTestAll12appMouseDownEii(r1,r2,r3){var r4,r5,r6,r7,r8;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r4+4;if((HEAP32[r1+488>>2]|0)==0){STACKTOP=r4;return}r7=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+44>>2]](r7,r5,r6);r7=r1+800|0;r8=HEAP32[r7>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r8,HEAP32[r5>>2],HEAP32[r6>>2])|0)!=0){r8=HEAP32[HEAP32[r7>>2]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+384>>2]](r8,HEAP32[r5>>2],HEAP32[r6>>2],r3,r2);STACKTOP=r4;return}do{if((r2|0)==32|(r2|0)==16){if((r3&48|0)!=48){break}r6=(r1+688|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r6],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+1],HEAPF64[tempDoublePtr>>3])!=-1){break}r5=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2]}}while(0);r1=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+32>>2]](r1,0);r1=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]>>2]](r1,1);STACKTOP=r4;return}function __ZN10GuiTestAll10appMouseUpEii(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r4+4;if((HEAP32[r1+488>>2]|0)==0){STACKTOP=r4;return}r7=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+44>>2]](r7,r5,r6);r7=(r1+800|0)>>2;r8=HEAP32[r7];do{if((r8|0)!=0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r8)|0)==0){r9=HEAP32[r7];if((FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,HEAP32[r5>>2],HEAP32[r6>>2])|0)==0){break}}r9=HEAP32[HEAP32[r7]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+388>>2]](r9,HEAP32[r5>>2],HEAP32[r6>>2],r3,r2);STACKTOP=r4;return}}while(0);do{if(((r3|r2)&48|0)==48){if(!((r2|0)==32|(r2|0)==16)){break}r6=r1+688|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2]}}while(0);if((r3&48|0)!=0){STACKTOP=r4;return}r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r3,1);r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]>>2]](r3,0);STACKTOP=r4;return}function __ZN10GuiTestAll12appMouseMoveEiii(r1,r2,r3,r4){var r5,r6,r7,r8;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;r7=r5+4;if((HEAP32[r1+488>>2]|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+92>>2]](r1,r2,r3);STACKTOP=r5;return}r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+52>>2]](r8,r2,r3);r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+44>>2]](r3,r6,r7);r3=(r1+800|0)>>2;r1=HEAP32[r3];if((r1|0)==0){STACKTOP=r5;return}do{if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1)|0)==0){r2=HEAP32[r3];if((FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r2,HEAP32[r6>>2],HEAP32[r7>>2])|0)!=0){break}STACKTOP=r5;return}}while(0);r1=HEAP32[HEAP32[r3]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+400>>2]](r1,HEAP32[r6>>2],HEAP32[r7>>2],r4);STACKTOP=r5;return}function __ZN10GuiTestAll12appMouseDragEiii(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;r7=r5+4;if((HEAP32[r1+488>>2]|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+92>>2]](r1,r2,r3);STACKTOP=r5;return}r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+52>>2]](r8,r2,r3);r8=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+44>>2]](r8,r6,r7);r8=r1+800|0;r9=HEAP32[r8>>2];do{if((r9|0)!=0){if((FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+24>>2]](r9)|0)==0){break}r10=HEAP32[HEAP32[r8>>2]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+396>>2]](r10,HEAP32[r6>>2],HEAP32[r7>>2],r4);STACKTOP=r5;return}}while(0);if((r4&48|0)==0){STACKTOP=r5;return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+92>>2]](r1,r2,r3);STACKTOP=r5;return}function __ZN10GuiTestAll13appMouseEnterEii(r1,r2,r3){r1=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](r1,r2,r3);r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r3,1);return}function __ZN10GuiTestAll12appMouseExitEv(r1){r1=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+32>>2]](r1,0);return}function __ZN10GuiTestAll10appKeyDownEii(r1,r2,r3){var r4,r5,r6;r4=(r1+800|0)>>2;r5=HEAP32[r4];do{if((r5|0)!=0){if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+20>>2]](r5)|0)==0){break}r6=HEAP32[HEAP32[r4]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+364>>2]](r6,r2,r3);return}}while(0);if((r2|0)==1073741825){r5=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r5);return}else if((r2|0)==1073741845|(r2|0)==32){if((r3&128|0)!=0){return}r5=(r1+720|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r6=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==68){if((r3&128|0)!=0){return}r5=(r1+712|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r6=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==1073741826){r5=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+36>>2]](r5);return}else if((r2|0)==1073741849){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+88>>2]](r1,(HEAP32[r1+488>>2]|0)==0&1);return}else if((r2|0)==87|(r2|0)==1073741839){if((r3&128|0)!=0){return}r5=(r1+688|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r4=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==83|(r2|0)==1073741840){if((r3&128|0)!=0){return}r5=(r1+696|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r4=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==65){if((r3&128|0)!=0){return}r5=(r1+704|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r4=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==1073741837){if((r3&128|0)!=0){return}r5=(r1+736|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r4=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==1073741846|(r2|0)==88){if((r3&128|0)!=0){return}r5=(r1+728|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r5],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r4=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5]=HEAP32[tempDoublePtr>>2],HEAP32[r5+1]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==1073741838){if((r3&128|0)!=0){return}r3=(r1+744|0)>>2;if((HEAP32[tempDoublePtr>>2]=HEAP32[r3],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+1],HEAPF64[tempDoublePtr>>3])!=-1){return}r1=_SDL_GetTicks()>>>0;HEAPF64[tempDoublePtr>>3]=r1,HEAP32[r3]=HEAP32[tempDoublePtr>>2],HEAP32[r3+1]=HEAP32[tempDoublePtr+4>>2];return}else{return}}function __ZN10GuiTestAll8appKeyUpEii(r1,r2,r3){var r4,r5,r6;r4=r1+800|0;r5=HEAP32[r4>>2];do{if((r5|0)!=0){if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+20>>2]](r5)|0)==0){break}r6=HEAP32[HEAP32[r4>>2]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+368>>2]](r6,r2,r3);return}}while(0);if((r2|0)==1073741837){r3=r1+736|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==83|(r2|0)==1073741840){r3=r1+696|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==88|(r2|0)==1073741846){r3=r1+728|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==87|(r2|0)==1073741839){r3=r1+688|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==1073741838){r3=r1+744|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==68){r3=r1+712|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==65){r3=r1+704|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else if((r2|0)==32|(r2|0)==1073741845){r2=r1+720|0;HEAPF64[tempDoublePtr>>3]=-1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];return}else{return}}function __ZN10GuiTestAll10appKeyCharEii(r1,r2,r3){var r4;r4=r1+800|0;r1=HEAP32[r4>>2];if((r1|0)==0){return}if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1)|0)==0){return}r1=HEAP32[HEAP32[r4>>2]+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+372>>2]](r1,r2,r3);return}function __ZN10emscripten8internal7InvokerIvJiiiEE6invokeEPFviiiEiii(r1,r2,r3,r4){FUNCTION_TABLE[r1](r2,r3,r4);return}function __ZN10emscripten8internal7InvokerIvJiiEE6invokeEPFviiEii(r1,r2,r3){FUNCTION_TABLE[r1](r2,r3);return}function __ZN10emscripten8internal7InvokerIvJEE6invokeEPFvvE(r1){FUNCTION_TABLE[r1]();return}function __GLOBAL__I_a87(){var r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=STACKTOP;STACKTOP=STACKTOP+140|0;r2=r1;r3=r1+8;r4=r1+20;r5=r1+32;r6=r1+44;r7=r1+52;r8=r1+64;r9=r1+76;r10=r1+88,r11=r10>>2;r12=r1+104,r13=r12>>2;r14=r1+120;r15=r1+132;__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r15>>2]=0;__embind_register_function(5244320,5275252,0,r15+4|0,882,1600);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r14>>2]=2;r15=r14+4|0;HEAP32[r15>>2]=__ZTIi;HEAP32[r14+8>>2]=__ZTIi;__embind_register_function(5257808,5275252,2,r15,1928,2594);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r13]=3;r15=r12+4|0;HEAP32[r15>>2]=__ZTIi;HEAP32[r13+2]=__ZTIi;HEAP32[r13+3]=__ZTIi;__embind_register_function(5251472,5275252,3,r15,942,1394);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r11]=3;r15=r10+4|0;HEAP32[r15>>2]=__ZTIi;HEAP32[r11+2]=__ZTIi;HEAP32[r11+3]=__ZTIi;__embind_register_function(5249028,5275252,3,r15,942,2058);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r9>>2]=2;r15=r9+4|0;HEAP32[r15>>2]=__ZTIi;HEAP32[r9+8>>2]=__ZTIi;__embind_register_function(5246748,5275252,2,r15,1928,1644);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r8>>2]=2;r15=r8+4|0;HEAP32[r15>>2]=__ZTIi;HEAP32[r8+8>>2]=__ZTIi;__embind_register_function(5245196,5275252,2,r15,1928,1840);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r7>>2]=2;r15=r7+4|0;HEAP32[r15>>2]=__ZTIi;HEAP32[r7+8>>2]=__ZTIi;__embind_register_function(5244692,5275252,2,r15,1928,194);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r6>>2]=0;__embind_register_function(5244116,5275252,0,r6+4|0,882,2176);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r5>>2]=2;r6=r5+4|0;HEAP32[r6>>2]=__ZTIi;HEAP32[r5+8>>2]=__ZTIi;__embind_register_function(5243600,5275252,2,r6,1928,1210);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r4>>2]=2;r6=r4+4|0;HEAP32[r6>>2]=__ZTIi;HEAP32[r4+8>>2]=__ZTIi;__embind_register_function(5242992,5275252,2,r6,1928,2258);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r3>>2]=2;r6=r3+4|0;HEAP32[r6>>2]=__ZTIi;HEAP32[r3+8>>2]=__ZTIi;__embind_register_function(5257308,5275252,2,r6,1928,2688);__ZN10emscripten8internal21registerStandardTypesEv();HEAP32[r2>>2]=0;__embind_register_function(5256580,5275252,0,r2+4|0,882,2054);STACKTOP=r1;return}function __ZN14mgVertexBuffer9addVertexEPKv(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;r4=(r1+20|0)>>2;r5=HEAP32[r4];if((r5+1|0)<=(HEAP32[r1+16>>2]|0)){r6=HEAP32[r1+4>>2];_memcpy(HEAP32[r1+12>>2]+Math.imul(r6,r5)|0,r2,r6);HEAP32[r4]=HEAP32[r4]+1|0;STACKTOP=r3;return}r3=___cxa_allocate_exception(4);r4=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r4,5247840,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r3>>2]=r4;___cxa_throw(r3,5275304,0)}function __ZN8mgXMLTag7tagOpenEP11mgXMLParser(r1,r2){return}function __ZN8mgXMLTag11tagEndAttrsEP11mgXMLParser(r1,r2){return}function __ZN8mgXMLTag10tagContentEP11mgXMLParserPKci(r1,r2,r3,r4){return}function __ZN8mgXMLTag8tagCloseEP11mgXMLParser(r1,r2){return}function __ZN12mgCursorDefnD0Ev(r1){var r2;HEAP32[r1>>2]=5270596;HEAP32[r1+460>>2]=5259300;r2=HEAP32[r1+476>>2];if(!((r2|0)==(r1+480|0)|(r2|0)==0)){__ZdlPv(r2)}__ZN11mgXMLParserD2Ev(r1|0);__ZdlPv(r1);return}function __ZN12mgCursorDefnD2Ev(r1){var r2,r3;HEAP32[r1>>2]=5270596;HEAP32[r1+460>>2]=5259300;r2=HEAP32[r1+476>>2];if((r2|0)==(r1+480|0)|(r2|0)==0){r3=r1|0;__ZN11mgXMLParserD2Ev(r3);return}__ZdlPv(r2);r3=r1|0;__ZN11mgXMLParserD2Ev(r3);return}function __ZN12mgCursorDefn9createTagEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r1=0;r3=5257336;r4=r2;while(1){r5=HEAP8[r4];r6=HEAP8[r3];r7=r5<<24>>24;if((r7&128|0)==0){r8=_tolower(r7)&255}else{r8=r5}if(r8<<24>>24>-1){r9=_tolower(r6<<24>>24)&255}else{r9=r6}if(r8<<24>>24!=r9<<24>>24){r10=0;r1=611;break}if(r8<<24>>24==0){break}else{r3=r3+1|0;r4=r4+1|0}}if(r1==611){return r10}r1=__Znwj(88),r4=r1>>2;r3=r1;HEAP32[r3>>2]=5259240;r8=r1+4|0;HEAP32[r8>>2]=5259300;HEAP32[r4+2]=63;r9=r1+24|0;HEAP32[r4+5]=r9;HEAP32[r4+3]=0;HEAP8[r9]=0;HEAP32[r4+4]=128;__ZN8mgStringaSEPKc(r8,r2);HEAP32[r3>>2]=5263528;r10=r1;return r10}function __ZN12mgCursorDefn13processTopTagEP8mgXMLTag(r1,r2){if((r2|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+4>>2]](r2);return}function __ZN15mgCursorDefnTag7tagAttrEP11mgXMLParserPKcS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r5=0;r6=5253260;r7=r3;while(1){r8=HEAP8[r7];r9=HEAP8[r6];r10=r8<<24>>24;if((r10&128|0)==0){r11=_tolower(r10)&255}else{r11=r8}if(r11<<24>>24>-1){r12=_tolower(r9<<24>>24)&255}else{r12=r9}if(r11<<24>>24!=r12<<24>>24){r13=5250780;r14=r3;break}if(r11<<24>>24==0){r5=625;break}else{r6=r6+1|0;r7=r7+1|0}}if(r5==625){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r1|0,r2,r3,r4,r2+460|0);return}while(1){r7=HEAP8[r14];r6=HEAP8[r13];r11=r7<<24>>24;if((r11&128|0)==0){r15=_tolower(r11)&255}else{r15=r7}if(r15<<24>>24>-1){r16=_tolower(r6<<24>>24)&255}else{r16=r6}if(r15<<24>>24!=r16<<24>>24){r17=5248508;r18=r3;break}if(r15<<24>>24==0){r5=632;break}else{r13=r13+1|0;r14=r14+1|0}}if(r5==632){HEAP32[r2+544>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1|0,r2,r3,r4);return}while(1){r14=HEAP8[r18];r13=HEAP8[r17];r15=r14<<24>>24;if((r15&128|0)==0){r19=_tolower(r15)&255}else{r19=r14}if(r19<<24>>24>-1){r20=_tolower(r13<<24>>24)&255}else{r20=r13}if(r19<<24>>24!=r20<<24>>24){r5=643;break}if(r19<<24>>24==0){break}else{r17=r17+1|0;r18=r18+1|0}}if(r5==643){return}HEAP32[r2+548>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1|0,r2,r3,r4);return}function __ZN15mgCursorDefnTagD1Ev(r1){var r2;HEAP32[r1>>2]=5259240;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN15mgCursorDefnTagD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5259240;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN14mgTextureImageD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5264028;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN14mgTextureImageD2Ev(r1){var r2;HEAP32[r1>>2]=5264028;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN14mgTextureArrayD0Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9;HEAP32[r1>>2]=5264060;r2=r1+28|0;r3=HEAP32[r2>>2];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r2>>2]=0;HEAP32[r1+4>>2]=5266196;r2=(r1+12|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;L647:do{if((r3|0)>0){r5=0;r6=r3;while(1){r7=HEAP32[HEAP32[r4]+(r5<<2)>>2];if((r7|0)==0){r8=r6}else{__ZdlPv(r7);HEAP32[HEAP32[r4]+(r5<<2)>>2]=0;r8=HEAP32[r2]}r7=r5+1|0;if((r7|0)<(r8|0)){r5=r7;r6=r8}else{break L647}}}}while(0);HEAP32[r2]=0;r2=HEAP32[r4];if((r2|0)==0){HEAP32[r4]=0;r9=r1;__ZdlPv(r9);return}__ZdlPv(r2);HEAP32[r4]=0;r9=r1;__ZdlPv(r9);return}function __ZN14mgTextureArrayD2Ev(r1){var r2,r3,r4,r5,r6,r7;HEAP32[r1>>2]=5264060;r2=r1+28|0;r3=HEAP32[r2>>2];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r2>>2]=0;HEAP32[r1+4>>2]=5266196;r2=(r1+12|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;L662:do{if((r3|0)>0){r1=0;r5=r3;while(1){r6=HEAP32[HEAP32[r4]+(r1<<2)>>2];if((r6|0)==0){r7=r5}else{__ZdlPv(r6);HEAP32[HEAP32[r4]+(r1<<2)>>2]=0;r7=HEAP32[r2]}r6=r1+1|0;if((r6|0)<(r7|0)){r1=r6;r5=r7}else{break L662}}}}while(0);HEAP32[r2]=0;r2=HEAP32[r4];if((r2|0)==0){HEAP32[r4]=0;return}__ZdlPv(r2);HEAP32[r4]=0;return}function __ZN13mgTextureCubeD0Ev(r1){__ZN13mgTextureCubeD2Ev(r1);__ZdlPv(r1);return}function __ZN13mgTextureCubeD2Ev(r1){var r2,r3;r2=r1>>2;HEAP32[r2]=5265900;HEAP32[r2+106]=5259300;r3=HEAP32[r2+110];if(!((r3|0)==(r1+444|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+85]=5259300;r3=HEAP32[r2+89];if(!((r3|0)==(r1+360|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+64]=5259300;r3=HEAP32[r2+68];if(!((r3|0)==(r1+276|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+43]=5259300;r3=HEAP32[r2+47];if(!((r3|0)==(r1+192|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+22]=5259300;r3=HEAP32[r2+26];if(!((r3|0)==(r1+108|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+1]=5259300;r3=HEAP32[r2+5];if((r3|0)==(r1+24|0)|(r3|0)==0){return}__ZdlPv(r3);return}function __ZN8mgShaderD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5259320;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN8mgShaderD2Ev(r1){var r2;HEAP32[r1>>2]=5259320;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN12mgCursorDefnC2EPKc(r1,r2){var r3,r4;r3=r1>>2;HEAP32[r3+1]=5259300;HEAP32[r3+2]=63;r4=r1+24|0;HEAP32[r3+5]=r4;HEAP32[r3+3]=0;HEAP8[r4]=0;HEAP32[r3+4]=128;HEAP32[r3+26]=5259300;HEAP32[r3+27]=63;r4=r1+124|0;HEAP32[r3+30]=r4;HEAP32[r3+28]=0;HEAP8[r4]=0;HEAP32[r3+29]=128;HEAP32[r3+47]=5259300;HEAP32[r3+48]=63;r4=r1+208|0;HEAP32[r3+51]=r4;HEAP32[r3+49]=0;HEAP8[r4]=0;HEAP32[r3+50]=128;HEAP32[r3+22]=1;HEAP32[r3+23]=0;HEAP32[r3+25]=0;HEAP8[r1+96|0]=0;HEAP32[r3+69]=5271244;HEAP32[r3+72]=20;HEAP32[r3+70]=r1+292|0;HEAP32[r3+71]=0;HEAP32[r3+94]=5259300;HEAP32[r3+95]=63;r4=r1+396|0;HEAP32[r3+98]=r4;HEAP32[r3+96]=0;HEAP8[r4]=0;HEAP32[r3+97]=128;HEAP32[r3+93]=0;HEAP32[r3]=5270596;HEAP32[r3+115]=5259300;HEAP32[r3+116]=63;r4=r1+480|0;HEAP32[r3+119]=r4;HEAP32[r3+117]=0;HEAP8[r4]=0;HEAP32[r3+118]=128;HEAP32[r3+136]=0;HEAP32[r3+137]=0;__ZN12mgXMLScanner9parseFileEPKc(r1|0,r2);return}function __ZN17mgDisplayServices6setDPIEi(r1,r2){if((r2|0)<=0){return}HEAP32[r1+812>>2]=r2;return}function __ZN17mgDisplayServices12cursorEnableEj(r1,r2){HEAP32[r1+468>>2]=r2;return}function __ZN17mgDisplayServices13cursorSetPosnEii(r1,r2,r3){HEAP32[r1+460>>2]=r2;HEAP32[r1+464>>2]=r3;return}function __ZN17mgDisplayServices10cursorMoveEii(r1,r2,r3){var r4,r5,r6;r4=r1+460|0;r5=HEAP32[r4>>2]+r2|0;r2=r1+464|0;r6=HEAP32[r2>>2]+r3|0;r3=(r5|0)<0?0:r5;r5=HEAP32[r1+476>>2];HEAP32[r4>>2]=(r5|0)<(r3|0)?r5:r3;r3=(r6|0)<0?0:r6;r6=HEAP32[r1+480>>2];HEAP32[r2>>2]=(r6|0)<(r3|0)?r6:r3;return}function __ZN17mgDisplayServicesC2EPKcS1_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r4=r1>>2;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+168|0;r7=r6;r8=r6+84,r9=r8>>2;HEAP32[r4]=5261236;r10=r1+4|0;HEAP32[r10>>2]=5259300;HEAP32[r4+2]=63;r11=r1+24|0;r12=(r1+20|0)>>2;HEAP32[r12]=r11;r13=r1+12|0;HEAP32[r13>>2]=0;HEAP8[r11]=0;HEAP32[r4+4]=128;r11=r1+88|0;HEAP32[r11>>2]=5266196;HEAP32[r4+25]=0;HEAP32[r4+23]=0;HEAP32[r4+24]=0;r14=(r1+108|0)>>2;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;HEAP32[r14+3]=0;HEAP32[r14+4]=0;HEAP32[r14+5]=0;r14=r1+252|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+212|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+172|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+132|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];_memset(r1+140|0,0,32);_memset(r1+180|0,0,32);_memset(r1+220|0,0,32);r14=r1+260|0;_memset(r14,0,104);HEAP32[r4+92]=5259300;HEAP32[r4+93]=63;r15=r1+388|0;HEAP32[r4+96]=r15;HEAP32[r4+94]=0;HEAP8[r15]=0;HEAP32[r4+95]=128;_memset(r1+524|0,0,288);__ZN8mgStringaSEPKc(r10,r2);r2=HEAP32[r13>>2];do{if((r2|0)<1){r5=732}else{if(HEAP8[HEAP32[r12]+(r2-1)|0]<<24>>24==47){break}if(HEAP8[HEAP32[r12]+(r2-1)|0]<<24>>24==92){break}else{r5=732;break}}}while(0);if(r5==732){__ZN8mgStringpLEPKc(r10,5256524)}r10=r7|0;HEAP32[r10>>2]=5259300;r2=(r7+4|0)>>2;HEAP32[r2]=63;r12=r7+20|0;r13=(r7+16|0)>>2;HEAP32[r13]=r12;r15=(r7+8|0)>>2;HEAP32[r15]=0;HEAP8[r12]=0;r16=r7+12|0;HEAP32[r16>>2]=128;do{if((r3|0)==0){r17=0;r5=744}else{r7=_strlen(r3);if((r7|0)>63){r18=63;while(1){r19=r18+128|0;if((r19|0)<(r7|0)){r18=r19}else{break}}HEAP32[r2]=r19;r20=r18+129|0;r21=__Znaj((r20|0)>-1?r20:-1);r20=HEAP32[r13];r22=HEAP32[r15];_memcpy(r21,r20,r22+1|0);if((r20|0)==(r12|0)|(r20|0)==0){r23=r22}else{__ZdlPv(r20);r23=HEAP32[r15]}HEAP32[r13]=r21;r24=r23;r25=r21}else{r24=0;r25=r12}_memcpy(r25+r24|0,r3,r7);r21=HEAP32[r15]+r7|0;HEAP32[r15]=r21;HEAP8[HEAP32[r13]+r21|0]=0;r21=HEAP32[r15];if((r21|0)<1){r17=r21;r5=744;break}if(HEAP8[HEAP32[r13]+(r21-1)|0]<<24>>24==47){break}if(HEAP8[HEAP32[r13]+(r21-1)|0]<<24>>24==92){break}else{r17=r21;r5=744;break}}}while(0);if(r5==744){r5=HEAP32[r2];r3=r17+1|0;if((r5|0)<(r3|0)){r24=HEAP32[r16>>2];r16=r5;while(1){r26=r16+r24|0;if((r26|0)<(r3|0)){r16=r26}else{break}}HEAP32[r2]=r26;r2=r26+1|0;r26=__Znaj((r2|0)>-1?r2:-1);r2=HEAP32[r13];r16=HEAP32[r15];_memcpy(r26,r2,r16+1|0);if((r2|0)==(r12|0)|(r2|0)==0){r27=r16}else{__ZdlPv(r2);r27=HEAP32[r15]}HEAP32[r13]=r26;r28=r27;r29=r26}else{r28=r17;r29=HEAP32[r13]}HEAP8[r29+r28|0]=47;r28=HEAP32[r15]+1|0;HEAP32[r15]=r28;HEAP8[HEAP32[r13]+r28|0]=0}r28=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+84>>2]](r28,r11);__ZN13mgStringArray3addEPKc(r11,HEAP32[r13]);r11=r8|0;HEAP32[r11>>2]=5259300;HEAP32[r9+1]=63;r28=r8+20|0;r15=(r8+16|0)>>2;HEAP32[r15]=r28;HEAP32[r9+2]=0;HEAP8[r28]=0;HEAP32[r9+3]=128;__ZN8mgString6formatEPKcz(r8,5250668,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r13],tempInt));r8=__Znwj(476);__ZN10mgFontListC2EPKc(r8,HEAP32[r15]);HEAP32[r4+26]=r8;r8=HEAP32[1310728];r9=HEAP32[HEAP32[r8>>2]+68>>2];r29=__Znwj(572);__ZN14mg3DErrorTableC2Ev(r29);FUNCTION_TABLE[r9](r8,r29);r29=r1+332|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r29>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r29+4>>2]=HEAP32[tempDoublePtr+4>>2];r29=r1+340|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r29>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r29+4>>2]=HEAP32[tempDoublePtr+4>>2];r29=r1+348|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r29>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r29+4>>2]=HEAP32[tempDoublePtr+4>>2];r29=r1+356|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r29>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r29+4>>2]=HEAP32[tempDoublePtr+4>>2];r29=r14|0;r14=r1+268|0;r8=r1+276|0;HEAPF64[tempDoublePtr>>3]=.5746957711326908,HEAP32[r29>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r29+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.7662610281769211,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=-.2873478855663454,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+284|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+292|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+300|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+308|0;HEAPF64[tempDoublePtr>>3]=.4,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+316|0;HEAPF64[tempDoublePtr>>3]=.4,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+324|0;HEAPF64[tempDoublePtr>>3]=.4,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r4+91]=1;r8=r1+492|0;HEAPF64[tempDoublePtr>>3]=.25,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+500|0;HEAPF64[tempDoublePtr>>3]=16384,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+484|0;HEAPF64[tempDoublePtr>>3]=45,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=(r1+452|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;HEAP32[r4+118]=1;HEAP32[r4+119]=0;HEAP32[r4+120]=0;HEAP32[r11>>2]=5259300;r11=HEAP32[r15];if(!((r11|0)==(r28|0)|(r11|0)==0)){__ZdlPv(r11)}HEAP32[r10>>2]=5259300;r10=HEAP32[r13];if((r10|0)==(r12|0)|(r10|0)==0){STACKTOP=r6;return}__ZdlPv(r10);STACKTOP=r6;return}function __ZN17mgDisplayServicesD0Ev(r1){__ZN17mgDisplayServicesD2Ev(r1);__ZdlPv(r1);return}function __ZN17mgDisplayServicesD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;HEAP32[r2]=5261236;r3=r1+104|0;r4=HEAP32[r3>>2];if((r4|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+4>>2]](r4)}HEAP32[r3>>2]=0;HEAP32[r2+92]=5259300;r3=HEAP32[r2+96];if(!((r3|0)==(r1+388|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+22]=5266196;r3=(r1+96|0)>>2;r4=HEAP32[r3];r5=(r1+92|0)>>2;L773:do{if((r4|0)>0){r6=0;r7=r4;while(1){r8=HEAP32[HEAP32[r5]+(r6<<2)>>2];if((r8|0)==0){r9=r7}else{__ZdlPv(r8);HEAP32[HEAP32[r5]+(r6<<2)>>2]=0;r9=HEAP32[r3]}r8=r6+1|0;if((r8|0)<(r9|0)){r6=r8;r7=r9}else{break L773}}}}while(0);HEAP32[r3]=0;r3=HEAP32[r5];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r5]=0;HEAP32[r2+1]=5259300;r5=HEAP32[r2+5];if((r5|0)==(r1+24|0)|(r5|0)==0){return}__ZdlPv(r5);return}function __ZN17mgDisplayServices6setFOVEd(r1,r2){var r3,r4;r3=r1>>2;r4=r1+484|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3]+320>>2]](r1,HEAP32[r3+119],HEAP32[r3+120]);FUNCTION_TABLE[HEAP32[HEAP32[r3]+316>>2]](r1);HEAP32[r3+91]=1;return}function __ZN17mgDisplayServices13setScreenSizeEii(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;if((r2|0)<1|(r3|0)<1){STACKTOP=r4;return}r5=r1+476|0;HEAP32[r5>>2]=r2;r6=r1+480|0;HEAP32[r6>>2]=r3;__Z7mgDebugPKcz(5253132,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r2,HEAP32[tempInt+4>>2]=r3,tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+320>>2]](r1,HEAP32[r5>>2],HEAP32[r6>>2]);STACKTOP=r4;return}function __ZN17mgDisplayServices15setFrontAndBackEdd(r1,r2,r3){var r4,r5;r4=r1>>2;r5=r1+492|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r1+500|0;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r4]+320>>2]](r1,HEAP32[r4+119],HEAP32[r4+120]);FUNCTION_TABLE[HEAP32[HEAP32[r4]+316>>2]](r1);HEAP32[r4+91]=1;return}function __ZN17mgDisplayServices8setEyePtERK8mgPoint3(r1,r2){var r3,r4;r3=r2|0;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=r1+108|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r2+8|0;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=r1+116|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r2+16|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=r1+124|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+316>>2]](r1);HEAP32[r1+364>>2]=1;return}function __ZN17mgDisplayServices12setEyeMatrixERK9mgMatrix4(r1,r2){_memcpy(r1+132|0,r2,128);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+316>>2]](r1);HEAP32[r1+364>>2]=1;return}function __ZN17mgDisplayServices11cursorTrackEj(r1,r2){var r3;r3=r1+472|0;if((HEAP32[r3>>2]|0)==(r2|0)){return}HEAP32[r3>>2]=r2;r3=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+48>>2]](r3,(r2|0)==0&1);return}function __ZN19mgWebGLTextureImage9setFilterEi(r1,r2){return}function __ZN17mgDisplayServices13withinFrustumEdddd(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r1+620|0;r7=r2-(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+628|0;r8=r3-(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+636|0;r9=r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+644|0;r10=r1+652|0;r11=r1+660|0;r12=-r5;if(r7*(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3])+r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3])+r9*(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3])<r12){r13=0;return r13}r11=r1+668|0;r9=r2-(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3]);r11=r1+676|0;r10=r3-(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3]);r11=r1+684|0;r8=r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3]);r11=r1+692|0;r6=r1+700|0;r7=r1+708|0;if(r9*(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3])+r10*(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3])+r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3])<r12){r13=0;return r13}r7=r1+716|0;r8=r2-(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+724|0;r6=r3-(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+732|0;r10=r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+740|0;r11=r1+748|0;r9=r1+756|0;if(r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3])+r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3])+r10*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])<r12){r13=0;return r13}r9=r1+764|0;r10=r2-(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+772|0;r11=r3-(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+780|0;r6=r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+788|0;r7=r1+796|0;r8=r1+804|0;if(r10*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])+r11*(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3])+r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3])<r12){r13=0;return r13}r8=r1+524|0;r6=r2-(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r1+532|0;r7=r3-(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r1+540|0;r11=r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r1+548|0;r9=r1+556|0;r10=r1+564|0;if(r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3])+r7*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])+r11*(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3])<r12){r13=0;return r13}r10=r1+572|0;r11=r2-(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+580|0;r2=r3-(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+588|0;r3=r4-(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+596|0;r4=r1+604|0;r9=r1+612|0;r13=r11*(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3])+r2*(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3])+r3*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])>=r12&1;return r13}function __ZN17mgDisplayServices9eyeVectorER8mgPoint3(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=r2|0;r4=r2+8|0;r5=r2+16|0;r2=r1+228|0;r6=-(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]);r2=r1+236|0;r7=-(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]);r2=r1+244|0;r8=1-(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]);r2=r1+132|0;r9=r1+140|0;r10=r1+148|0;r11=r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3])+r7*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])+r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r11,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r1+164|0;r11=r1+172|0;r10=r1+180|0;r9=r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3])+r7*(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3])+r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r1+196|0;r9=r1+204|0;r10=r1+212|0;r1=r6*(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3])+r7*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])+r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r1,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];return}function __ZN17mgDisplayServices6getDPIEv(r1){return HEAP32[r1+812>>2]}function __ZN17mgDisplayServices13getCursorPosnERiS0_(r1,r2,r3){HEAP32[r2>>2]=HEAP32[r1+460>>2];HEAP32[r3>>2]=HEAP32[r1+464>>2];return}function __ZN17mgDisplayServices6getFOVEv(r1){var r2;r2=r1+484|0;return HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]}function __ZN17mgDisplayServices18frustumBuildPlanesEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r2=r1+228|0;r3=(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]);r2=-r3;r4=r1+236|0;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=-r5;r6=r1+244|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=1-r7;r8=r1+132|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r2*r9;r10=r1+140|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4*r11;r12=r1+148|0;r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+4>>2],HEAPF64[tempDoublePtr>>3]);r12=r8+r10+r6*r13;r14=r1+164|0;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r14>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r14+4>>2],HEAPF64[tempDoublePtr>>3]);r14=r2*r15;r16=r1+172|0;r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]);r16=r4*r17;r18=r1+180|0;r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+4>>2],HEAPF64[tempDoublePtr>>3]);r18=r14+r16+r6*r19;r20=r1+196|0;r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r20>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r20+4>>2],HEAPF64[tempDoublePtr>>3]);r20=r2*r21;r2=r1+204|0;r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]);r2=r4*r22;r4=r1+212|0;r23=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=r20+r2+r6*r23;r6=1-r5;r5=-r7;r7=r5*r13;r13=r8+r6*r11+r7;r11=r5*r19;r19=r14+r6*r17+r11;r17=r5*r23;r23=r20+r6*r22+r17;r22=1-r3;r3=r22*r9+r10+r7;r7=r22*r15+r16+r11;r11=r22*r21+r2+r17;r17=r1+524|0;r2=r1+532|0;r21=r1+540|0;r22=r1+492|0;r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r22+4>>2],HEAPF64[tempDoublePtr>>3]);r22=r16*r12;r15=r16*r18;r10=r16*r4;r16=r1+108|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]);r16=r9+r22;HEAPF64[tempDoublePtr>>3]=r16,HEAP32[r17>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r17+4>>2]=HEAP32[tempDoublePtr+4>>2];r17=r1+116|0;r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r17+4>>2],HEAPF64[tempDoublePtr>>3]);r17=r16+r15;HEAPF64[tempDoublePtr>>3]=r17,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r1+124|0;r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3]);r2=r17+r10;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r21>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r21+4>>2]=HEAP32[tempDoublePtr+4>>2];r21=r1+548|0;HEAPF64[tempDoublePtr>>3]=r12,HEAP32[r21>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r21+4>>2]=HEAP32[tempDoublePtr+4>>2];r21=r1+556|0;HEAPF64[tempDoublePtr>>3]=r18,HEAP32[r21>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r21+4>>2]=HEAP32[tempDoublePtr+4>>2];r21=r1+564|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r21>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r21+4>>2]=HEAP32[tempDoublePtr+4>>2];r21=r1+572|0;r2=r1+580|0;r6=r1+588|0;r20=r1+500|0;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r20>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r20+4>>2],HEAPF64[tempDoublePtr>>3]);r20=r5*r18;r14=r5*r4;r8=r9+r5*r12;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r21>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r21+4>>2]=HEAP32[tempDoublePtr+4>>2];r21=r16+r20;HEAPF64[tempDoublePtr>>3]=r21,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r17+r14;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+596|0;r2=r1+604|0;r14=r1+612|0;r21=r12*-1;HEAPF64[tempDoublePtr>>3]=r21,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r18*-1;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4*-1;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+516|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r14>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r14+4>>2],HEAPF64[tempDoublePtr>>3])*.5;r14=r13*r2;r13=r19*r2;r19=r23*r2;r2=r1+508|0;r23=(HEAP32[tempDoublePtr>>2]=HEAP32[r2>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r2+4>>2],HEAPF64[tempDoublePtr>>3])*.5;r2=r3*r23;r3=r7*r23;r7=r11*r23;r23=r14+r22;r11=r13+r15;r4=r19+r10;r6=r23-r2;r18=r11-r3;r21=r4-r7;r12=Math.sqrt(r21*r21+r6*r6+r18*r18);r20=r6/r12;r6=r18/r12;r18=r21/r12;r12=r2+r23;r23=r3+r11;r11=r7+r4;r4=Math.sqrt(r11*r11+r12*r12+r23*r23);r21=r12/r4;r12=r23/r4;r23=r11/r4;r4=r22-r14;r14=r15-r13;r13=r10-r19;r19=r4-r2;r10=r14-r3;r15=r13-r7;r22=Math.sqrt(r15*r15+r19*r19+r10*r10);r11=r19/r22;r19=r10/r22;r10=r15/r22;r22=r2+r4;r4=r3+r14;r14=r7+r13;r13=Math.sqrt(r14*r14+r22*r22+r4*r4);r7=r22/r13;r22=r4/r13;r4=r14/r13;r13=r1+620|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r13>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r13+4>>2]=HEAP32[tempDoublePtr+4>>2];r13=r1+628|0;HEAPF64[tempDoublePtr>>3]=r16,HEAP32[r13>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r13+4>>2]=HEAP32[tempDoublePtr+4>>2];r13=r1+636|0;HEAPF64[tempDoublePtr>>3]=r17,HEAP32[r13>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r13+4>>2]=HEAP32[tempDoublePtr+4>>2];r13=r1+644|0;r14=r1+652|0;r3=r1+660|0;r2=r10*r6-r18*r19;r15=r18*r11-r10*r20;r8=r19*r20-r11*r6;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r13>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r13+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r15,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r1+668|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r1+676|0;HEAPF64[tempDoublePtr>>3]=r16,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r1+684|0;HEAPF64[tempDoublePtr>>3]=r17,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];r3=r1+692|0;r8=r1+700|0;r14=r1+708|0;r15=r23*r22-r12*r4;r13=r21*r4-r23*r7;r2=r12*r7-r21*r22;HEAPF64[tempDoublePtr>>3]=r15,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r13,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+716|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+724|0;HEAPF64[tempDoublePtr>>3]=r16,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+732|0;HEAPF64[tempDoublePtr>>3]=r17,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=r1+740|0;r2=r1+748|0;r8=r1+756|0;r13=r18*r12-r6*r23;r3=r20*r23-r18*r21;r18=r6*r21-r20*r12;HEAPF64[tempDoublePtr>>3]=r13,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r18,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+764|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+772|0;HEAPF64[tempDoublePtr>>3]=r16,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+780|0;HEAPF64[tempDoublePtr>>3]=r17,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r1+788|0;r17=r1+796|0;r16=r1+804|0;r1=r4*r19-r10*r22;r9=r10*r7-r4*r11;r4=r22*r11-r7*r19;HEAPF64[tempDoublePtr>>3]=r1,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r17>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r17+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r16>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r16+4>>2]=HEAP32[tempDoublePtr+4>>2];return}function __ZN17mgDisplayServices12cursorVectorER8mgPoint3(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r3=r1+228|0;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=1-r4;r5=r1+236|0;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=-r6;r7=r1+244|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=-r8;r9=r1+132|0;r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+140|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r5*r11;r12=r1+148|0;r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r12>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+4>>2],HEAPF64[tempDoublePtr>>3]);r12=r7*r13;r14=r1+164|0;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r14>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r14+4>>2],HEAPF64[tempDoublePtr>>3]);r14=r1+172|0;r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r14>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r14+4>>2],HEAPF64[tempDoublePtr>>3]);r14=r5*r16;r17=r1+180|0;r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r17+4>>2],HEAPF64[tempDoublePtr>>3]);r17=r7*r18;r19=r1+196|0;r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=r1+204|0;r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=r5*r21;r5=r1+212|0;r22=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r7*r22;r7=-r4;r4=1-r6;r6=r7*r10;r23=r7*r15;r24=r7*r20;r7=1-r8;r8=r1+508|0;r25=HEAP32[r1+476>>2];r26=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3])*(HEAP32[r1+460>>2]-((r25|0)/2&-1)|0)/(r25|0);r25=r1+516|0;r8=HEAP32[r1+480>>2];r27=(HEAP32[tempDoublePtr>>2]=HEAP32[r25>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r25+4>>2],HEAPF64[tempDoublePtr>>3])*(((r8|0)/2&-1)-HEAP32[r1+464>>2]|0)/(r8|0);r8=r1+492|0;r1=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r2|0;r25=r2+8|0;r28=r2+16|0;r2=(r6+r4*r11+r12)*r27+(r3*r10+r9+r12)*r26+(r6+r9+r7*r13)*r1;r13=(r23+r4*r16+r17)*r27+(r3*r15+r14+r17)*r26+(r23+r14+r7*r18)*r1;r18=(r24+r4*r21+r5)*r27+(r3*r20+r19+r5)*r26+(r24+r19+r7*r22)*r1;r1=Math.sqrt(r18*r18+r2*r2+r13*r13);r22=r2/r1;HEAPF64[tempDoublePtr>>3]=r22,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r13/r1;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r25>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r25+4>>2]=HEAP32[tempDoublePtr+4>>2];r25=r18/r1;HEAPF64[tempDoublePtr>>3]=r25,HEAP32[r28>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r28+4>>2]=HEAP32[tempDoublePtr+4>>2];return}function __ZN17mgDisplayServices8findFontEPKcjjR8mgString(r1,r2,r3,r4,r5){var r6;r6=HEAP32[r1+104>>2];return FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+100>>2]](r6,r1+88|0,r2,r3,r4,r5)}function __Z21mgInitDisplayServicesPKcS0_(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=r4,r6=r5>>2;r7=r5|0;HEAP32[r7>>2]=5259300;HEAP32[r6+1]=63;r8=r5+20|0;r9=(r5+16|0)>>2;HEAP32[r9]=r8;HEAP32[r6+2]=0;HEAP8[r8]=0;HEAP32[r6+3]=128;r6=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+4>>2]](r6,r5);r5=HEAP32[1310729];do{if((r5|0)==0){r6=5244328;r10=HEAP32[r9];while(1){r11=HEAP8[r10];r12=HEAP8[r6];r13=r11<<24>>24;if((r13&128|0)==0){r14=_tolower(r13)&255}else{r14=r11}if(r14<<24>>24>-1){r15=_tolower(r12<<24>>24)&255}else{r15=r12}if(r14<<24>>24!=r15<<24>>24){r3=869;break}if(r14<<24>>24==0){r3=862;break}else{r6=r6+1|0;r10=r10+1|0}}if(r3==869){r16=HEAP32[1310729]}else if(r3==862){r10=__Znwj(1464);__ZN14mgWebGLDisplayC2EPKcS1_(r10,r1,r2);r6=r10;HEAP32[1310729]=r6;r16=r6}if((r16|0)==0){break}else{r17=r16;r3=871;break}}else{r17=r5;r3=871}}while(0);if(r3==871){FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+312>>2]](r17)}HEAP32[r7>>2]=5259300;r7=HEAP32[r9];if((r7|0)==(r8|0)|(r7|0)==0){STACKTOP=r4;return}__ZdlPv(r7);STACKTOP=r4;return}function __ZN17mgDisplayServices16setMouseRelativeEj(r1,r2){r1=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](r1,r2);return}function __ZN17mgDisplayServices11swapBuffersEv(r1){r1=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+56>>2]](r1);return}function __ZN17mgDisplayServices12getDepthBitsEv(r1){r1=HEAP32[1310728];return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+80>>2]](r1)}function __ZN19mgWebGLTextureImageD0Ev(r1){var r2,r3,r4;r2=r1|0;HEAP32[r2>>2]=5259984;r3=r1+112|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteTextures(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5264028;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r4=r1;__ZdlPv(r4);return}__ZdlPv(r2);r4=r1;__ZdlPv(r4);return}function __ZN19mgWebGLTextureImageD2Ev(r1){var r2,r3;r2=r1|0;HEAP32[r2>>2]=5259984;r3=r1+112|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteTextures(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5264028;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN19mgWebGLTextureImage7setWrapEii(r1,r2,r3){var r4;r4=r1+100|0;HEAP32[r4>>2]=r2;r2=r1+104|0;HEAP32[r2>>2]=r3;_glBindTexture(3553,HEAP32[r1+112>>2]);_glTexParameteri(3553,10242,(HEAP32[r4>>2]|0)==1?33071:10497);_glTexParameteri(3553,10243,(HEAP32[r2>>2]|0)==1?33071:10497);return}function __ZN19mgWebGLTextureImage12updateMemoryEiiiiPKh(r1,r2,r3,r4,r5,r6){_glBindTexture(3553,HEAP32[r1+112>>2]);_glTexSubImage2D(3553,0,r2,r3,r4,r5,(HEAP32[r1+116>>2]|0)==2?6406:6408,5121,r6);if((HEAP32[r1+120>>2]|0)==0){return}_glGenerateMipmap(3553);return}function __ZN19mgWebGLTextureArrayD0Ev(r1){__ZN19mgWebGLTextureArrayD2Ev(r1);__ZdlPv(r1);return}function __ZN19mgWebGLTextureArray9setFilterEi(r1,r2){return}function __ZN18mgWebGLTextureCube9setFilterEi(r1,r2){return}function __ZN19mgWebGLTextureArray7setWrapEii(r1,r2,r3){HEAP32[r1+32>>2]=r2;HEAP32[r1+36>>2]=r3;return}function __ZN19mgWebGLTextureArrayD2Ev(r1){var r2,r3,r4,r5,r6,r7;r2=r1|0;HEAP32[r2>>2]=5260016;r3=r1+44|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteTextures(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5264060;r2=r1+28|0;r3=HEAP32[r2>>2];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r2>>2]=0;HEAP32[r1+4>>2]=5266196;r2=(r1+12|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;L894:do{if((r3|0)>0){r1=0;r5=r3;while(1){r6=HEAP32[HEAP32[r4]+(r1<<2)>>2];if((r6|0)==0){r7=r5}else{__ZdlPv(r6);HEAP32[HEAP32[r4]+(r1<<2)>>2]=0;r7=HEAP32[r2]}r6=r1+1|0;if((r6|0)<(r7|0)){r1=r6;r5=r7}else{break L894}}}}while(0);HEAP32[r2]=0;r2=HEAP32[r4];if((r2|0)==0){HEAP32[r4]=0;return}__ZdlPv(r2);HEAP32[r4]=0;return}function __ZN18mgWebGLTextureCubeD0Ev(r1){var r2;HEAP32[r1>>2]=5260140;r2=r1+552|0;if((HEAP32[r2>>2]|0)!=0){_glDeleteTextures(1,r2);HEAP32[r2>>2]=0}__ZN13mgTextureCubeD2Ev(r1|0);__ZdlPv(r1);return}function __ZN18mgWebGLTextureCubeD2Ev(r1){var r2;HEAP32[r1>>2]=5260140;r2=r1+552|0;if((HEAP32[r2>>2]|0)!=0){_glDeleteTextures(1,r2);HEAP32[r2>>2]=0}__ZN13mgTextureCubeD2Ev(r1|0);return}function __ZN18mgWebGLTextureCube7setWrapEii(r1,r2,r3){var r4;r4=r1+540|0;HEAP32[r4>>2]=r2;r2=r1+544|0;HEAP32[r2>>2]=r3;_glBindTexture(34067,HEAP32[r1+552>>2]);_glTexParameteri(34067,10242,(HEAP32[r4>>2]|0)==1?33071:10497);_glTexParameteri(34067,10243,(HEAP32[r2>>2]|0)==1?33071:10497);return}function __ZN13mgWebGLShaderC2EPKc(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r1>>2;r4=r1|0;HEAP32[r4>>2]=5259320;r5=r1+4|0;HEAP32[r5>>2]=5259300;HEAP32[r3+2]=63;r6=r1+24|0;HEAP32[r3+5]=r6;HEAP32[r3+3]=0;HEAP8[r6]=0;HEAP32[r3+4]=128;__ZN8mgStringaSEPKc(r5,r2);HEAP32[r4>>2]=5265880;HEAP32[r3+23]=5260632;r4=(r1+96|0)>>2;HEAP32[r4]=97;HEAP32[r3+25]=0;r3=__Znaj(776);r2=r3;r5=(r1+104|0)>>2;HEAP32[r5]=r2;r1=HEAP32[r4];if((r1|0)<=0){return}HEAP32[r3>>2]=0;HEAP32[r3+4>>2]=0;if((r1|0)>1){r7=1;r8=r2}else{return}while(1){HEAP32[r8+(r7<<3)>>2]=0;HEAP32[HEAP32[r5]+(r7<<3)+4>>2]=0;r2=r7+1|0;if((r2|0)>=(HEAP32[r4]|0)){break}r7=r2;r8=HEAP32[r5]}return}function __ZN13mgWebGLShaderD0Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r2=r1|0;HEAP32[r2>>2]=5265880;HEAP32[r1+92>>2]=5260632;r3=r1+96|0;r4=HEAP32[r3>>2];r5=r1+104|0;r6=HEAP32[r5>>2];L929:do{if((r4|0)>0){r7=r1+100|0;r8=0;r9=r6;r10=r4;while(1){r11=(r8<<3)+r9|0;r12=HEAP32[r11>>2];if((r12|0)==0){r13=r10;r14=r9}else{__ZdlPv(r12);HEAP32[r11>>2]=0;HEAP32[r9+(r8<<3)+4>>2]=0;HEAP32[r7>>2]=HEAP32[r7>>2]-1|0;r13=HEAP32[r3>>2];r14=HEAP32[r5>>2]}r11=r8+1|0;if((r11|0)<(r13|0)){r8=r11;r9=r14;r10=r13}else{r15=r14;break L929}}}else{r15=r6}}while(0);if((r15|0)!=0){__ZdlPv(r15)}HEAP32[r2>>2]=5259320;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r16=r1;__ZdlPv(r16);return}__ZdlPv(r2);r16=r1;__ZdlPv(r16);return}function __ZN13mgWebGLShaderD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1|0;HEAP32[r2>>2]=5265880;HEAP32[r1+92>>2]=5260632;r3=r1+96|0;r4=HEAP32[r3>>2];r5=r1+104|0;r6=HEAP32[r5>>2];L945:do{if((r4|0)>0){r7=r1+100|0;r8=0;r9=r6;r10=r4;while(1){r11=(r8<<3)+r9|0;r12=HEAP32[r11>>2];if((r12|0)==0){r13=r10;r14=r9}else{__ZdlPv(r12);HEAP32[r11>>2]=0;HEAP32[r9+(r8<<3)+4>>2]=0;HEAP32[r7>>2]=HEAP32[r7>>2]-1|0;r13=HEAP32[r3>>2];r14=HEAP32[r5>>2]}r11=r8+1|0;if((r11|0)<(r13|0)){r8=r11;r9=r14;r10=r13}else{r15=r14;break L945}}}else{r15=r6}}while(0);if((r15|0)!=0){__ZdlPv(r15)}HEAP32[r2>>2]=5259320;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN13mgWebGLShader12uniformIndexEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=r1+92|0;r5=HEAP8[r2];L961:do{if(r5<<24>>24==0){r6=0}else{r7=0;r8=0;r9=r5;while(1){r10=r9<<24>>24^r8;r11=r10<<8|r10>>24;r10=r7+1|0;r12=HEAP8[r2+r10|0];if(r12<<24>>24==0){r6=r11;break L961}else{r7=r10;r8=r11;r9=r12}}}}while(0);r5=HEAP32[r1+96>>2];r9=(((r6|0)>-1?r6:-r6|0)|0)%(r5|0);r6=HEAP32[r1+104>>2];r8=r9;while(1){r7=HEAP32[r6+(r8<<3)>>2];if((r7|0)==0){r3=998;break}if((_strcmp(r7,r2)|0)==0){r3=997;break}r7=r8+1|0;r12=(r7|0)<(r5|0)?r7:0;if((r12|0)==(r9|0)){r3=998;break}else{r8=r12}}if(r3==998){r9=_glGetUniformLocation(HEAP32[r1+88>>2],r2);__ZN18mgMapStringToDWord5setAtEPKcj(r4,r2,r9);r2=r9;return r2}else if(r3==997){r2=HEAP32[r6+(r8<<3)+4>>2];return r2}}function __ZN14mgWebGLDisplayD0Ev(r1){__ZN14mgWebGLDisplayD2Ev(r1);__ZdlPv(r1);return}function __ZN14mgWebGLDisplayC2EPKcS1_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=r1>>2;__ZN17mgDisplayServicesC2EPKcS1_(r1|0,r2,r3);HEAP32[r4]=5263652;HEAP32[r4+204]=5262356;r3=(r1+820|0)>>2;HEAP32[r3]=97;HEAP32[r4+206]=0;r2=__Znaj(776);r5=r2;r6=(r1+828|0)>>2;HEAP32[r6]=r5;r7=HEAP32[r3];L978:do{if((r7|0)>0){HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;if((r7|0)>1){r8=1;r9=r5}else{break}while(1){HEAP32[r9+(r8<<3)>>2]=0;HEAP32[HEAP32[r6]+(r8<<3)+4>>2]=0;r10=r8+1|0;if((r10|0)>=(HEAP32[r3]|0)){break L978}r8=r10;r9=HEAP32[r6]}}}while(0);r6=r1+956|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+916|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+876|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+836|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];_memset(r1+844|0,0,32);_memset(r1+884|0,0,32);_memset(r1+924|0,0,32);r6=r1+1084|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+1044|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+1004|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+964|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];_memset(r1+972|0,0,32);_memset(r1+1012|0,0,32);_memset(r1+1052|0,0,32);r6=r1+1212|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+1172|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+1132|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+1092|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];_memset(r1+1100|0,0,32);_memset(r1+1140|0,0,32);_memset(r1+1180|0,0,32);HEAP32[r4+308]=5262356;r6=(r1+1236|0)>>2;HEAP32[r6]=97;HEAP32[r4+310]=0;r9=__Znaj(776);r8=r9;r3=(r1+1244|0)>>2;HEAP32[r3]=r8;r5=HEAP32[r6];L985:do{if((r5|0)>0){HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;if((r5|0)>1){r11=1;r12=r8}else{break}while(1){HEAP32[r12+(r11<<3)>>2]=0;HEAP32[HEAP32[r3]+(r11<<3)+4>>2]=0;r7=r11+1|0;if((r7|0)>=(HEAP32[r6]|0)){break L985}r11=r7;r12=HEAP32[r3]}}}while(0);HEAP32[r4+312]=5271244;HEAP32[r4+315]=20;HEAP32[r4+313]=r1+1264|0;HEAP32[r4+314]=0;HEAP32[r4+336]=5271244;HEAP32[r4+339]=20;HEAP32[r4+337]=r1+1360|0;HEAP32[r4+338]=0;HEAP32[r4+305]=0;HEAP32[r4+306]=0;HEAP32[r4+307]=0;HEAP32[r4+360]=0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+324>>2]](r1);_mgCanvasInit();return}function __ZN14mgWebGLDisplay21supportsIntegerVertexEv(r1){return 0}function __ZN14mgWebGLDisplay17canRepeatTexturesEv(r1){return 0}function __ZN14mgWebGLDisplay20createOverlaySurfaceEv(r1){var r2;r1=__Znwj(8);HEAP32[r1>>2]=5260680;r2=__Znwj(216);__ZN14mgGLGenSurfaceC2Ejj(r2,0,0);HEAP32[r1+4>>2]=r2;return r1}function __ZN14mgWebGLDisplay20createTextureSurfaceEv(r1){var r2;r1=__Znwj(8);HEAP32[r1>>2]=5260680;r2=__Znwj(216);__ZN14mgGLGenSurfaceC2Ejj(r2,1,1);HEAP32[r1+4>>2]=r2;return r1}function __ZN14mgWebGLDisplay15renderToTextureEP14mgTextureImagej(r1,r2,r3){var r4,r5,r6;r3=STACKTOP;r4=r1+1440|0;r5=HEAP32[r4>>2];if((r5|0)==0){_glGenFramebuffers(1,r4);r6=HEAP32[r4>>2]}else{r6=r5}_glBindFramebuffer(36160,r6);_glFramebufferTexture2D(36160,36064,3553,HEAP32[r2+112>>2],0);if((_glCheckFramebufferStatus(36160)|0)!=36053){__Z7mgDebugPKcz(5255620,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+320>>2]](r1,HEAP32[r2+88>>2],HEAP32[r2+92>>2]);_glFrontFace(2304);_glBlendFunc(770,771);_glEnable(2929);_glDisable(2884);_glDisable(3042);_glEnable(3089);STACKTOP=r3;return}function __ZN14mgWebGLDisplay15renderToDisplayEv(r1){_glBindFramebuffer(36160,0);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+320>>2]](r1,HEAP32[r1+476>>2],HEAP32[r1+480>>2]);_glFrontFace(2304);_glBlendFunc(770,771);_glEnable(2929);_glEnable(2884);_glDisable(3042);_glDisable(3089);return}function __ZN14mgWebGLDisplay13deleteBuffersEv(r1){__ZN14mgWebGLDisplay14unloadTexturesEv(r1);return}function __ZN14mgWebGLDisplayD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=r4;HEAP32[r2]=5263652;_mgCanvasTerm();r6=r5|0;HEAP32[r6>>2]=5259300;r7=(r5+4|0)>>2;HEAP32[r7]=63;r8=r5+20|0;r9=(r5+16|0)>>2;HEAP32[r9]=r8;r10=(r5+8|0)>>2;HEAP32[r10]=0;HEAP8[r8]=0;r11=(r5+12|0)>>2;HEAP32[r11]=128;r5=(r1+1244|0)>>2;r12=(r1+1236|0)>>2;r13=HEAP32[r12];r14=0;while(1){if((r14|0)>=(r13|0)){r15=0;r16=r13;break}if((HEAP32[HEAP32[r5]+(r14<<3)>>2]|0)==0){r14=r14+1|0}else{r3=1064;break}}L1015:do{if(r3==1064){if((r14|0)==-1){r15=0;r16=r13;break}else{r17=0;r18=r14;r19=r13}while(1){r20=r19-1|0;r21=(r20|0)<(r18|0)?r20:r18;r20=(r21|0)<0?0:r21;r21=HEAP32[r5];r22=HEAP32[r21+(r20<<3)>>2];L1019:do{if((r22|0)==0){r23=r18;r24=r17;r25=r19}else{HEAP32[r10]=0;HEAP8[HEAP32[r9]]=0;r26=_strlen(r22);r27=HEAP32[r7];r28=HEAP32[r10];r29=r28+r26|0;if((r27|0)<(r29|0)){r30=HEAP32[r11];r31=r27;while(1){r32=r31+r30|0;if((r32|0)<(r29|0)){r31=r32}else{break}}HEAP32[r7]=r32;r31=r32+1|0;r29=__Znaj((r31|0)>-1?r31:-1);r31=HEAP32[r9];r30=HEAP32[r10];_memcpy(r29,r31,r30+1|0);if((r31|0)==(r8|0)|(r31|0)==0){r33=r30}else{__ZdlPv(r31);r33=HEAP32[r10]}HEAP32[r9]=r29;r34=r33;r35=r29}else{r34=r28;r35=HEAP32[r9]}_memcpy(r35+r34|0,r22,r26);r29=HEAP32[r10]+r26|0;HEAP32[r10]=r29;HEAP8[HEAP32[r9]+r29|0]=0;r29=HEAP32[r21+(r20<<3)+4>>2];r31=HEAP32[r12];r30=r20;while(1){r27=r30+1|0;if((r27|0)>=(r31|0)){r23=-1;r24=r29;r25=r31;break L1019}if((HEAP32[HEAP32[r5]+(r27<<3)>>2]|0)==0){r30=r27}else{r23=r27;r24=r29;r25=r31;break L1019}}}}while(0);if((r24|0)==0){r36=0;r37=r25}else{FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+4>>2]](r24);r36=r24;r37=HEAP32[r12]}if((r23|0)==-1){r15=r36;r16=r37;break L1015}else{r17=r36;r18=r23;r19=r37}}}}while(0);L1041:do{if((r16|0)>0){r37=r1+1240|0;r19=0;r23=r16;while(1){r18=HEAP32[r5];r36=(r19<<3)+r18|0;r17=HEAP32[r36>>2];if((r17|0)==0){r38=r23}else{__ZdlPv(r17);HEAP32[r36>>2]=0;HEAP32[r18+(r19<<3)+4>>2]=0;HEAP32[r37>>2]=HEAP32[r37>>2]-1|0;r38=HEAP32[r12]}r18=r19+1|0;if((r18|0)<(r38|0)){r19=r18;r23=r38}else{break L1041}}}}while(0);r38=(r1+1256|0)>>2;r16=HEAP32[r38];L1049:do{if((r16|0)>0){r23=r1+1252|0;r19=0;r37=r16;while(1){r18=HEAP32[HEAP32[r23>>2]+(r19<<2)>>2];if((r18|0)==0){r39=r37}else{FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+4>>2]](r18);r39=HEAP32[r38]}r18=r19+1|0;if((r18|0)<(r39|0)){r19=r18;r37=r39}else{break L1049}}}}while(0);HEAP32[r38]=0;r39=(r1+1352|0)>>2;r16=HEAP32[r39];L1058:do{if((r16|0)>0){r37=r1+1348|0;r19=0;r23=r16;while(1){r18=HEAP32[HEAP32[r37>>2]+(r19<<2)>>2];if((r18|0)==0){r40=r23}else{FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+4>>2]](r18);r40=HEAP32[r39]}r18=r19+1|0;if((r18|0)<(r40|0)){r19=r18;r23=r40}else{break L1058}}}}while(0);HEAP32[r39]=0;r40=(r1+828|0)>>2;r16=(r1+820|0)>>2;r23=HEAP32[r16];r19=0;while(1){if((r19|0)>=(r23|0)){r41=r23;break}if((HEAP32[HEAP32[r40]+(r19<<3)>>2]|0)==0){r19=r19+1|0}else{r3=1109;break}}L1070:do{if(r3==1109){if((r19|0)==-1){r41=r23;break}else{r42=r15;r43=r19;r44=r23}while(1){r37=r44-1|0;r18=(r37|0)<(r43|0)?r37:r43;r37=(r18|0)<0?0:r18;r18=HEAP32[r40];r36=HEAP32[r18+(r37<<3)>>2];L1074:do{if((r36|0)==0){r45=r43;r46=r42;r47=r44}else{HEAP32[r10]=0;HEAP8[HEAP32[r9]]=0;r17=_strlen(r36);r24=HEAP32[r7];r25=HEAP32[r10];r34=r25+r17|0;if((r24|0)<(r34|0)){r35=HEAP32[r11];r33=r24;while(1){r48=r33+r35|0;if((r48|0)<(r34|0)){r33=r48}else{break}}HEAP32[r7]=r48;r33=r48+1|0;r34=__Znaj((r33|0)>-1?r33:-1);r33=HEAP32[r9];r35=HEAP32[r10];_memcpy(r34,r33,r35+1|0);if((r33|0)==(r8|0)|(r33|0)==0){r49=r35}else{__ZdlPv(r33);r49=HEAP32[r10]}HEAP32[r9]=r34;r50=r49;r51=r34}else{r50=r25;r51=HEAP32[r9]}_memcpy(r51+r50|0,r36,r17);r34=HEAP32[r10]+r17|0;HEAP32[r10]=r34;HEAP8[HEAP32[r9]+r34|0]=0;r34=HEAP32[r18+(r37<<3)+4>>2];r33=HEAP32[r16];r35=r37;while(1){r24=r35+1|0;if((r24|0)>=(r33|0)){r45=-1;r46=r34;r47=r33;break L1074}if((HEAP32[HEAP32[r40]+(r24<<3)>>2]|0)==0){r35=r24}else{r45=r24;r46=r34;r47=r33;break L1074}}}}while(0);if((r46|0)==0){r52=0;r53=r47}else{FUNCTION_TABLE[HEAP32[HEAP32[r46>>2]+4>>2]](r46);r52=r46;r53=HEAP32[r16]}if((r45|0)==-1){r41=r53;break L1070}else{r42=r52;r43=r45;r44=r53}}}}while(0);L1096:do{if((r41|0)>0){r53=r1+824|0;r44=0;r45=r41;while(1){r43=HEAP32[r40];r52=(r44<<3)+r43|0;r42=HEAP32[r52>>2];if((r42|0)==0){r54=r45}else{__ZdlPv(r42);HEAP32[r52>>2]=0;HEAP32[r43+(r44<<3)+4>>2]=0;HEAP32[r53>>2]=HEAP32[r53>>2]-1|0;r54=HEAP32[r16]}r43=r44+1|0;if((r43|0)<(r54|0)){r44=r43;r45=r54}else{break L1096}}}}while(0);r54=r1+1440|0;if((HEAP32[r54>>2]|0)!=0){_glDeleteFramebuffers(1,r54);HEAP32[r54>>2]=0}HEAP32[r6>>2]=5259300;r6=HEAP32[r9];if(!((r6|0)==(r8|0)|(r6|0)==0)){__ZdlPv(r6)}HEAP32[r2+336]=5271244;r6=r1+1348|0;r8=HEAP32[r6>>2];r9=r1+1360|0;if(!((r8|0)==(r9|0)|(r8|0)==0)){__ZdlPv(r8)}HEAP32[r2+339]=20;HEAP32[r6>>2]=r9;HEAP32[r39]=0;HEAP32[r2+312]=5271244;r39=r1+1252|0;r9=HEAP32[r39>>2];r6=r1+1264|0;if(!((r9|0)==(r6|0)|(r9|0)==0)){__ZdlPv(r9)}HEAP32[r2+315]=20;HEAP32[r39>>2]=r6;HEAP32[r38]=0;HEAP32[r2+308]=5262356;r38=HEAP32[r12];r6=HEAP32[r5];L1117:do{if((r38|0)>0){r39=r1+1240|0;r9=0;r8=r6;r54=r38;while(1){r41=(r9<<3)+r8|0;r45=HEAP32[r41>>2];if((r45|0)==0){r55=r54;r56=r8}else{__ZdlPv(r45);HEAP32[r41>>2]=0;HEAP32[r8+(r9<<3)+4>>2]=0;HEAP32[r39>>2]=HEAP32[r39>>2]-1|0;r55=HEAP32[r12];r56=HEAP32[r5]}r41=r9+1|0;if((r41|0)<(r55|0)){r9=r41;r8=r56;r54=r55}else{r57=r56;break L1117}}}else{r57=r6}}while(0);if((r57|0)!=0){__ZdlPv(r57)}HEAP32[r2+204]=5262356;r2=HEAP32[r16];r57=HEAP32[r40];L1128:do{if((r2|0)>0){r6=r1+824|0;r56=0;r55=r57;r5=r2;while(1){r12=(r56<<3)+r55|0;r38=HEAP32[r12>>2];if((r38|0)==0){r58=r5;r59=r55}else{__ZdlPv(r38);HEAP32[r12>>2]=0;HEAP32[r55+(r56<<3)+4>>2]=0;HEAP32[r6>>2]=HEAP32[r6>>2]-1|0;r58=HEAP32[r16];r59=HEAP32[r40]}r12=r56+1|0;if((r12|0)<(r58|0)){r56=r12;r55=r59;r5=r58}else{r60=r59;break L1128}}}else{r60=r57}}while(0);if((r60|0)==0){r61=r1|0;__ZN17mgDisplayServicesD2Ev(r61);STACKTOP=r4;return}__ZdlPv(r60);r61=r1|0;__ZN17mgDisplayServicesD2Ev(r61);STACKTOP=r4;return}function __ZN14mgWebGLDisplay14unloadTexturesEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;r5=r4|0;HEAP32[r5>>2]=5259300;r6=(r4+4|0)>>2;HEAP32[r6]=63;r7=r4+20|0;r8=(r4+16|0)>>2;HEAP32[r8]=r7;r9=(r4+8|0)>>2;HEAP32[r9]=0;HEAP8[r7]=0;r10=r4+12|0;HEAP32[r10>>2]=128;r4=(r1+1244|0)>>2;r11=(r1+1236|0)>>2;r12=HEAP32[r11];r13=0;while(1){if((r13|0)>=(r12|0)){break}if((HEAP32[HEAP32[r4]+(r13<<3)>>2]|0)==0){r13=r13+1|0}else{r2=1181;break}}L1144:do{if(r2==1181){if((r13|0)==-1){break}else{r14=0;r15=r13;r16=r12}while(1){r17=r16-1|0;r18=(r17|0)<(r15|0)?r17:r15;r17=(r18|0)<0?0:r18;r18=HEAP32[r4];r19=HEAP32[r18+(r17<<3)>>2];L1148:do{if((r19|0)==0){r20=r15;r21=r14}else{HEAP32[r9]=0;HEAP8[HEAP32[r8]]=0;r22=_strlen(r19);r23=HEAP32[r6];r24=HEAP32[r9];r25=r24+r22|0;if((r23|0)<(r25|0)){r26=HEAP32[r10>>2];r27=r23;while(1){r28=r27+r26|0;if((r28|0)<(r25|0)){r27=r28}else{break}}HEAP32[r6]=r28;r27=r28+1|0;r25=__Znaj((r27|0)>-1?r27:-1);r27=HEAP32[r8];r26=HEAP32[r9];_memcpy(r25,r27,r26+1|0);if((r27|0)==(r7|0)|(r27|0)==0){r29=r26}else{__ZdlPv(r27);r29=HEAP32[r9]}HEAP32[r8]=r25;r30=r29;r31=r25}else{r30=r24;r31=HEAP32[r8]}_memcpy(r31+r30|0,r19,r22);r25=HEAP32[r9]+r22|0;HEAP32[r9]=r25;HEAP8[HEAP32[r8]+r25|0]=0;r25=HEAP32[r18+(r17<<3)+4>>2];r27=HEAP32[r11];r26=r17;while(1){r23=r26+1|0;if((r23|0)>=(r27|0)){r20=-1;r21=r25;break L1148}if((HEAP32[HEAP32[r4]+(r23<<3)>>2]|0)==0){r26=r23}else{r20=r23;r21=r25;break L1148}}}}while(0);r17=r21+112|0;if((HEAP32[r17>>2]|0)!=0){_glDeleteTextures(1,r17);HEAP32[r17>>2]=0}if((r20|0)==-1){break L1144}r14=r21;r15=r20;r16=HEAP32[r11]}}}while(0);r11=r1+1256|0;L1171:do{if((HEAP32[r11>>2]|0)>0){r16=r1+1252|0;r20=0;while(1){r15=HEAP32[HEAP32[r16>>2]+(r20<<2)>>2]+44|0;_glDeleteTextures(1,r15);HEAP32[r15>>2]=0;r15=r20+1|0;if((r15|0)<(HEAP32[r11>>2]|0)){r20=r15}else{break L1171}}}}while(0);r11=r1+1352|0;L1177:do{if((HEAP32[r11>>2]|0)>0){r20=r1+1348|0;r16=0;while(1){r15=HEAP32[HEAP32[r20>>2]+(r16<<2)>>2]+552|0;_glDeleteTextures(1,r15);HEAP32[r15>>2]=0;r15=r16+1|0;if((r15|0)<(HEAP32[r11>>2]|0)){r16=r15}else{break L1177}}}}while(0);HEAP32[r5>>2]=5259300;r5=HEAP32[r8];if((r5|0)==(r7|0)|(r5|0)==0){STACKTOP=r3;return}__ZdlPv(r5);STACKTOP=r3;return}function __ZN14mgWebGLDisplay13createBuffersEv(r1){var r2;r2=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r2]+312>>2]](r1);__ZN14mgWebGLDisplay14reloadTexturesEv(r1);FUNCTION_TABLE[HEAP32[HEAP32[r2]+40>>2]](r1,HEAP32[r2+96],HEAP32[r2+113],HEAP32[r2+114]);return}function __ZN14mgWebGLDisplay14reloadTexturesEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2;r4=r3|0;HEAP32[r4>>2]=5259300;r5=(r3+4|0)>>2;HEAP32[r5]=63;r6=r3+20|0;r7=(r3+16|0)>>2;HEAP32[r7]=r6;r8=(r3+8|0)>>2;HEAP32[r8]=0;HEAP8[r6]=0;r9=r3+12|0;HEAP32[r9>>2]=128;r3=(r1+1244|0)>>2;r10=(r1+1236|0)>>2;r11=HEAP32[r10];r12=0;while(1){if((r12|0)>=(r11|0)){r13=-1;r14=0;break}if((HEAP32[HEAP32[r3]+(r12<<3)>>2]|0)==0){r12=r12+1|0}else{r13=r12;r14=0;break}}while(1){if((r13|0)==-1){break}r12=HEAP32[r10]-1|0;r11=(r12|0)<(r13|0)?r12:r13;r12=(r11|0)<0?0:r11;r11=HEAP32[r3];r15=HEAP32[r11+(r12<<3)>>2];L1195:do{if((r15|0)==0){r16=r13;r17=r14}else{HEAP32[r8]=0;HEAP8[HEAP32[r7]]=0;r18=_strlen(r15);r19=HEAP32[r5];r20=HEAP32[r8];r21=r20+r18|0;if((r19|0)<(r21|0)){r22=HEAP32[r9>>2];r23=r19;while(1){r24=r23+r22|0;if((r24|0)<(r21|0)){r23=r24}else{break}}HEAP32[r5]=r24;r23=r24+1|0;r21=__Znaj((r23|0)>-1?r23:-1);r23=HEAP32[r7];r22=HEAP32[r8];_memcpy(r21,r23,r22+1|0);if((r23|0)==(r6|0)|(r23|0)==0){r25=r22}else{__ZdlPv(r23);r25=HEAP32[r8]}HEAP32[r7]=r21;r26=r25;r27=r21}else{r26=r20;r27=HEAP32[r7]}_memcpy(r27+r26|0,r15,r18);r21=HEAP32[r8]+r18|0;HEAP32[r8]=r21;HEAP8[HEAP32[r7]+r21|0]=0;r21=HEAP32[r11+(r12<<3)+4>>2];r23=HEAP32[r10];r22=r12;while(1){r19=r22+1|0;if((r19|0)>=(r23|0)){r16=-1;r17=r21;break L1195}if((HEAP32[HEAP32[r3]+(r19<<3)>>2]|0)==0){r22=r19}else{r16=r19;r17=r21;break L1195}}}}while(0);__ZN14mgWebGLDisplay18reloadTextureImageEP19mgWebGLTextureImage(0,r17);r13=r16;r14=r17}r17=r1+1256|0;L1213:do{if((HEAP32[r17>>2]|0)>0){r14=r1+1252|0;r16=0;while(1){__ZN14mgWebGLDisplay18reloadTextureArrayEP19mgWebGLTextureArray(0,HEAP32[HEAP32[r14>>2]+(r16<<2)>>2]);r13=r16+1|0;if((r13|0)<(HEAP32[r17>>2]|0)){r16=r13}else{break L1213}}}}while(0);r17=r1+1352|0;L1219:do{if((HEAP32[r17>>2]|0)>0){r16=r1+1348|0;r14=0;while(1){__ZN14mgWebGLDisplay17reloadTextureCubeEP18mgWebGLTextureCube(0,HEAP32[HEAP32[r16>>2]+(r14<<2)>>2]);r13=r14+1|0;if((r13|0)<(HEAP32[r17>>2]|0)){r14=r13}else{break L1219}}}}while(0);HEAP32[r4>>2]=5259300;r4=HEAP32[r7];if((r4|0)==(r6|0)|(r4|0)==0){STACKTOP=r2;return}__ZdlPv(r4);STACKTOP=r2;return}function __ZN14mgWebGLDisplay8initViewEv(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r2+8;r4=r2+12;r5=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+20>>2]](r5,r2,r2+4,r3,r4);r5=r1|0;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r5,HEAP32[r3>>2],HEAP32[r4>>2]);r4=HEAP32[HEAP32[r1>>2]+24>>2];r3=HEAP32[1310728];r6=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+76>>2]](r3);FUNCTION_TABLE[r4](r5,r6);r6=r1+476|0;r5=HEAP32[r6>>2];if((r5|0)<1){STACKTOP=r2;return}r4=r1+480|0;r3=HEAP32[r4>>2];if((r3|0)<1){STACKTOP=r2;return}__Z7mgDebugPKcz(5253132,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r3,tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+320>>2]](r1,HEAP32[r6>>2],HEAP32[r4>>2]);STACKTOP=r2;return}function __ZN14mgWebGLDisplay13setProjectionEii(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;_glViewport(0,0,r2,r3);r4=r1+484|0;r5=1/Math.tan((HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3])*3.141592653589793/180*.5);r4=r1+956|0;r6=r1+916|0;r7=r1+876|0;r8=r1+836|0;r9=r1+924|0;_memset(r1+844|0,0,32);_memset(r1+884|0,0,32);r10=r9>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;HEAP32[r10+3]=0;HEAP32[r10+4]=0;HEAP32[r10+5]=0;r10=(r3|0)*r5/(r2|0);HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=r5;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r1+500|0;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+492|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r5-r2;r3=(r5+r2)/r7;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r2*r5*-2/r7;r7=r1+948|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=0,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r2*2;r2=r4/r10;r10=r1+508|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r4/r8;r8=r1+516|0;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay10loadShaderEPKcPK14mgVertexAttrib(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+168|0;r6=r5,r7=r6>>2;r8=r5+84,r9=r8>>2;r10=r1+816|0;r11=HEAP8[r2];L1239:do{if(r11<<24>>24==0){r12=0}else{r13=0;r14=0;r15=r11;while(1){r16=r15<<24>>24^r14;r17=r16<<8|r16>>24;r16=r13+1|0;r18=HEAP8[r2+r16|0];if(r18<<24>>24==0){r12=r17;break L1239}else{r13=r16;r14=r17;r15=r18}}}}while(0);r11=HEAP32[r1+820>>2];r15=(((r12|0)>-1?r12:-r12|0)|0)%(r11|0);r12=HEAP32[r1+828>>2];r14=r15;while(1){r13=HEAP32[r12+(r14<<3)>>2];if((r13|0)==0){break}if((_strcmp(r13,r2)|0)==0){r4=1269;break}r13=r14+1|0;r18=(r13|0)<(r11|0)?r13:0;if((r18|0)==(r15|0)){break}else{r14=r18}}if(r4==1269){r19=HEAP32[r12+(r14<<3)+4>>2];r20=r19;STACKTOP=r5;return r20}r14=r6|0;HEAP32[r14>>2]=5259300;HEAP32[r7+1]=63;r12=r6+20|0;r4=(r6+16|0)>>2;HEAP32[r4]=r12;HEAP32[r7+2]=0;HEAP8[r12]=0;HEAP32[r7+3]=128;__ZN8mgString6formatEPKcz(r6,5250624,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));r6=r8|0;HEAP32[r6>>2]=5259300;HEAP32[r9+1]=63;r7=r8+20|0;r15=(r8+16|0)>>2;HEAP32[r15]=r7;HEAP32[r9+2]=0;HEAP8[r7]=0;HEAP32[r9+3]=128;__ZN8mgString6formatEPKcz(r8,5248340,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));r8=__Z21mgWebGLloadShaderPairPKcS0_S0_PK14mgVertexAttrib(HEAP32[r1+20>>2],HEAP32[r4],HEAP32[r15],r3);r3=__Znwj(108);__ZN13mgWebGLShaderC2EPKc(r3,r2);HEAP32[r3+88>>2]=r8;__ZN16mgMapStringToPtr5setAtEPKcPKv(r10,r2,r3);HEAP32[r6>>2]=5259300;r6=HEAP32[r15];if(!((r6|0)==(r7|0)|(r6|0)==0)){__ZdlPv(r6)}HEAP32[r14>>2]=5259300;r14=HEAP32[r4];if((r14|0)==(r12|0)|(r14|0)==0){r19=r3;r20=r19;STACKTOP=r5;return r20}__ZdlPv(r14);r19=r3;r20=r19;STACKTOP=r5;return r20}function __ZN14mgWebGLDisplay16loadShaderSourceEPKcS1_S1_PK14mgVertexAttrib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r6=0;r7=r1+816|0;r8=HEAP8[r2];L1265:do{if(r8<<24>>24==0){r9=0}else{r10=0;r11=0;r12=r8;while(1){r13=r12<<24>>24^r11;r14=r13<<8|r13>>24;r13=r10+1|0;r15=HEAP8[r2+r13|0];if(r15<<24>>24==0){r9=r14;break L1265}else{r10=r13;r11=r14;r12=r15}}}}while(0);r8=HEAP32[r1+820>>2];r12=(((r9|0)>-1?r9:-r9|0)|0)%(r8|0);r9=HEAP32[r1+828>>2];r1=r12;while(1){r11=HEAP32[r9+(r1<<3)>>2];if((r11|0)==0){break}if((_strcmp(r11,r2)|0)==0){r6=1298;break}r11=r1+1|0;r10=(r11|0)<(r8|0)?r11:0;if((r10|0)==(r12|0)){break}else{r1=r10}}if(r6==1298){r16=HEAP32[r9+(r1<<3)+4>>2];r17=r16;return r17}r1=__Z27mgWebGLloadShaderPairSourcePKcS0_S0_PK14mgVertexAttrib(r2,r3,r4,r5);r5=__Znwj(108);__ZN13mgWebGLShaderC2EPKc(r5,r2);HEAP32[r5+88>>2]=r1;__ZN16mgMapStringToPtr5setAtEPKcPKv(r7,r2,r5);r16=r5;r17=r16;return r17}function __ZN14mgWebGLDisplay12deleteShaderEP8mgShader(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=0;r4=HEAP32[r2+20>>2];r5=HEAP8[r4];L1280:do{if(r5<<24>>24==0){r6=0}else{r7=0;r8=0;r9=r5;while(1){r10=r9<<24>>24^r8;r11=r10<<8|r10>>24;r10=r7+1|0;r12=HEAP8[r4+r10|0];if(r12<<24>>24==0){r6=r11;break L1280}else{r7=r10;r8=r11;r9=r12}}}}while(0);r5=HEAP32[r1+820>>2];r9=(((r6|0)>-1?r6:-r6|0)|0)%(r5|0);r6=(r1+828|0)>>2;r8=HEAP32[r6];r7=r9;while(1){r13=HEAP32[r8+(r7<<3)>>2];if((r13|0)!=0){if((_strcmp(r13,r4)|0)==0){r3=1310;break}}r12=r7+1|0;r11=(r12|0)<(r5|0)?r12:0;if((r11|0)==(r9|0)){break}else{r7=r11}}if(r3==1310){__ZdlPv(r13);HEAP32[HEAP32[r6]+(r7<<3)>>2]=0;HEAP32[HEAP32[r6]+(r7<<3)+4>>2]=0;r7=r1+824|0;HEAP32[r7>>2]=HEAP32[r7>>2]-1|0}_glDeleteProgram(HEAP32[r2+88>>2]);if((r2|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+4>>2]](r2);return}function __ZN14mgWebGLDisplay9setShaderEP8mgShader(r1,r2){HEAP32[r1+1224>>2]=r2;_glUseProgram(HEAP32[r2+88>>2]);HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK9mgMatrix3(r1,r2,r3,r4){var r5,r6,r7;r1=STACKTOP;STACKTOP=STACKTOP+36|0;r5=r1,r6=r5>>2;r7=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r7|0)==-1){STACKTOP=r1;return}r3=r5|0;r5=r4|0;HEAPF32[r3>>2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+8|0;HEAPF32[r6+1]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+16|0;HEAPF32[r6+2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+24|0;HEAPF32[r6+3]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+32|0;HEAPF32[r6+4]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+40|0;HEAPF32[r6+5]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+48|0;HEAPF32[r6+6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+56|0;HEAPF32[r6+7]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+64|0;HEAPF32[r6+8]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);_glUniformMatrix3fv(r7,1,0,r3);STACKTOP=r1;return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK9mgMatrix4(r1,r2,r3,r4){var r5,r6,r7;r1=STACKTOP;STACKTOP=STACKTOP+64|0;r5=r1,r6=r5>>2;r7=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r7|0)==-1){STACKTOP=r1;return}r3=r5|0;r5=r4|0;HEAPF32[r3>>2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+8|0;HEAPF32[r6+1]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+16|0;HEAPF32[r6+2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+24|0;HEAPF32[r6+3]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+32|0;HEAPF32[r6+4]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+40|0;HEAPF32[r6+5]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+48|0;HEAPF32[r6+6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+56|0;HEAPF32[r6+7]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+64|0;HEAPF32[r6+8]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+72|0;HEAPF32[r6+9]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+80|0;HEAPF32[r6+10]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+88|0;HEAPF32[r6+11]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+96|0;HEAPF32[r6+12]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+104|0;HEAPF32[r6+13]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+112|0;HEAPF32[r6+14]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r4+120|0;HEAPF32[r6+15]=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);_glUniformMatrix4fv(r7,1,0,r3);STACKTOP=r1;return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcff(r1,r2,r3,r4,r5){r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}_glUniform2f(r1,r4,r5);return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK8mgPoint3(r1,r2,r3,r4){var r5;r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}r3=r4|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=r4+8|0;r5=r4+16|0;_glUniform3f(r1,r2,(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]));return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKciPK8mgPoint3(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}r3=_llvm_umul_with_overflow_i32(r4*3&-1,4);r2=__Znaj(tempRet0?-1:r3);r3=r2,r6=r3>>2;L1321:do{if((r4|0)>0){r7=0;while(1){r8=r5+(r7*24&-1)|0;r9=r7*3&-1;HEAPF32[(r9<<2>>2)+r6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r5+(r7*24&-1)+8|0;HEAPF32[(r9+1<<2>>2)+r6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r5+(r7*24&-1)+16|0;HEAPF32[(r9+2<<2>>2)+r6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r7+1|0;if((r8|0)==(r4|0)){break L1321}else{r7=r8}}}}while(0);_glUniform3fv(r1,r4,r3);if((r2|0)==0){return}__ZdlPv(r2);return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcRK8mgPoint4(r1,r2,r3,r4){var r5,r6;r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}r3=r4|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=r4+8|0;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]);r3=r4+16|0;r6=r4+24|0;_glUniform4f(r1,r2,r5,(HEAP32[tempDoublePtr>>2]=HEAP32[r3>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r3+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]));return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKci(r1,r2,r3,r4){r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}_glUniform1i(r1,r4);return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKcf(r1,r2,r3,r4){r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}_glUniform1f(r1,r4);return}function __ZN14mgWebGLDisplay16setShaderUniformEP8mgShaderPKciPKf(r1,r2,r3,r4,r5){r1=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r3);if((r1|0)==-1){return}_glUniform1fv(r1,r4,r5);return}function __ZN14mgWebGLDisplay20setShaderStdUniformsEP13mgWebGLShader(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=STACKTOP;STACKTOP=STACKTOP+320|0;r4=r3;r5=r3+128,r6=r5>>2;r7=r1+1092|0;_memcpy(r4,r7,128);__ZN9mgMatrix48multiplyERKS_(r4,r1+836|0);r8=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5246128);if((r8|0)!=-1){r9=r5|0;r10=r4|0;HEAPF32[r9>>2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+8|0;HEAPF32[r6+1]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+16|0;HEAPF32[r6+2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+24|0;HEAPF32[r6+3]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+32|0;HEAPF32[r6+4]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+40|0;HEAPF32[r6+5]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+48|0;HEAPF32[r6+6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+56|0;HEAPF32[r6+7]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+64|0;HEAPF32[r6+8]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+72|0;HEAPF32[r6+9]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+80|0;HEAPF32[r6+10]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+88|0;HEAPF32[r6+11]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+96|0;HEAPF32[r6+12]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+104|0;HEAPF32[r6+13]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+112|0;HEAPF32[r6+14]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r4+120|0;HEAPF32[r6+15]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);_glUniformMatrix4fv(r8,1,0,r9)}r9=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5245132);if((r9|0)!=-1){r8=r5|0;r10=r7|0;HEAPF32[r8>>2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1100|0;HEAPF32[r6+1]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1108|0;HEAPF32[r6+2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1116|0;HEAPF32[r6+3]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1124|0;HEAPF32[r6+4]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1132|0;HEAPF32[r6+5]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1140|0;HEAPF32[r6+6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1148|0;HEAPF32[r6+7]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1156|0;HEAPF32[r6+8]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1164|0;HEAPF32[r6+9]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1172|0;HEAPF32[r6+10]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1180|0;HEAPF32[r6+11]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1188|0;HEAPF32[r6+12]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1196|0;HEAPF32[r6+13]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1204|0;HEAPF32[r6+14]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1212|0;HEAPF32[r6+15]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);_glUniformMatrix4fv(r9,1,0,r8)}r8=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5244588);if((r8|0)!=-1){r9=r5|0;r10=r1+964|0;HEAPF32[r9>>2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+972|0;HEAPF32[r6+1]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+980|0;HEAPF32[r6+2]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+988|0;HEAPF32[r6+3]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+996|0;HEAPF32[r6+4]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1004|0;HEAPF32[r6+5]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1012|0;HEAPF32[r6+6]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1020|0;HEAPF32[r6+7]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1028|0;HEAPF32[r6+8]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1036|0;HEAPF32[r6+9]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1044|0;HEAPF32[r6+10]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1052|0;HEAPF32[r6+11]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1060|0;HEAPF32[r6+12]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1068|0;HEAPF32[r6+13]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1076|0;HEAPF32[r6+14]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r1+1084|0;HEAPF32[r6+15]=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);_glUniformMatrix4fv(r8,1,0,r9)}r9=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5244040);if((r9|0)!=-1){r8=r5|0;r5=r7|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r1+1100|0;r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r1+1108|0;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=Math.sqrt(r7*r7+r10*r10+r4*r4);r11=r1+1124|0;r12=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3]);r11=r1+1132|0;r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3]);r11=r1+1140|0;r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r11>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+4>>2],HEAPF64[tempDoublePtr>>3]);r11=Math.sqrt(r12*r12+r13*r13+r14*r14);r15=r1+1156|0;r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+4>>2],HEAPF64[tempDoublePtr>>3]);r15=r1+1164|0;r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+4>>2],HEAPF64[tempDoublePtr>>3]);r15=r1+1172|0;r18=(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+4>>2],HEAPF64[tempDoublePtr>>3]);r15=Math.sqrt(r16*r16+r17*r17+r18*r18);HEAPF32[r8>>2]=r7/r5;HEAPF32[r6+1]=r10/r5;HEAPF32[r6+2]=r4/r5;HEAPF32[r6+3]=r12/r11;HEAPF32[r6+4]=r13/r11;HEAPF32[r6+5]=r14/r11;HEAPF32[r6+6]=r16/r15;HEAPF32[r6+7]=r17/r15;HEAPF32[r6+8]=r18/r15;_glUniformMatrix3fv(r9,1,0,r8)}r8=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5243432);if((r8|0)!=-1){r9=r1+108|0;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+116|0;r18=r1+124|0;_glUniform3f(r8,r15,(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+4>>2],HEAPF64[tempDoublePtr>>3]))}r18=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5257748);if((r18|0)!=-1){r9=r1+132|0;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+260|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+164|0;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+268|0;r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+196|0;r16=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+276|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+228|0;r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])+r15*r8+r6*r17+r16*r11;r16=r1+140|0;r6=r1+172|0;r15=r1+204|0;r9=r1+236|0;r13=r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3])+r17*(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3])+r11*(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+4>>2],HEAPF64[tempDoublePtr>>3])+(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r1+148|0;r15=r1+180|0;r6=r1+212|0;r16=r1+244|0;_glUniform3f(r18,r14,r13,r8*(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3])+r17*(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+4>>2],HEAPF64[tempDoublePtr>>3])+r11*(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3])+(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]))}r16=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5257220);if((r16|0)!=-1){r6=r1+284|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+292|0;r15=r1+300|0;_glUniform3f(r16,r11,(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r15>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+4>>2],HEAPF64[tempDoublePtr>>3]))}r15=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5256476);if((r15|0)!=-1){r6=r1+308|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+316|0;r16=r1+324|0;_glUniform3f(r15,r11,(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]))}r16=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5256044);if((r16|0)!=-1){r6=r1+332|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+340|0;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+348|0;r17=r1+356|0;_glUniform4f(r16,r11,r15,(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]),(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r17+4>>2],HEAPF64[tempDoublePtr>>3]))}r17=r3+192|0;_sprintf(r17,5255568,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=0,tempInt));r6=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r17);L1377:do{if((r6|0)!=-1){r15=0;r11=r6;while(1){_glUniform1i(r11,r15);r16=r15+1|0;_sprintf(r17,5255568,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r16,tempInt));r9=__ZN13mgWebGLShader12uniformIndexEPKc(r2,r17);if((r9|0)==-1){break L1377}else{r15=r16;r11=r9}}}}while(0);r17=(r1+1220|0)>>2;if((HEAP32[r17]|0)==0){r19=r1+364|0,r20=r19>>2;HEAP32[r20]=0;STACKTOP=r3;return}r6=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5255132);if((r6|0)!=-1){r11=HEAP32[r17];_glUniform2f(r6,HEAP32[r11+48>>2]|0,HEAP32[r11+52>>2]|0)}r11=__ZN13mgWebGLShader12uniformIndexEPKc(r2,5254896);if((r11|0)==-1){r19=r1+364|0,r20=r19>>2;HEAP32[r20]=0;STACKTOP=r3;return}r2=HEAP32[r17];_glUniform2f(r11,HEAP32[r2+20>>2]|0,HEAP32[r2+24>>2]|0);r19=r1+364|0,r20=r19>>2;HEAP32[r20]=0;STACKTOP=r3;return}function __ZN14mgWebGLDisplay9clearViewEv(r1){_glClearColor(0,0,0,1);_glClear(16640);_glFrontFace(2304);_glBlendFunc(770,771);_glEnable(2929);_glEnable(2884);_glDisable(3042);HEAP32[r1+1220>>2]=0;return}function __ZN14mgWebGLDisplay18drawOverlayTextureEPK14mgTextureImageiiii(r1,r2,r3,r4,r5,r6){var r7,r8;r7=HEAP32[1310728];if((r7|0)==0){r8=r1+364|0;HEAP32[r8>>2]=1;return}FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+88>>2]](r7,HEAP32[r2+112>>2],r3,r4,r5,r6);r8=r1+364|0;HEAP32[r8>>2]=1;return}function __ZN14mgWebGLDisplay18drawOverlaySurfaceEPK16mgTextureSurfaceii(r1,r2,r3,r4){if((r2|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2,r3,r4);return}function __ZN14mgWebGLDisplay10drawCursorEv(r1){var r2,r3,r4,r5,r6;r2=r1>>2;if((HEAP32[r2+117]|0)==0){return}r3=r1+832|0;if((HEAP32[r3>>2]|0)==0){return}if((HEAP32[r2+118]|0)==0){r4=(HEAP32[r2+120]|0)/2&-1;r5=(HEAP32[r2+119]|0)/2&-1}else{r4=HEAP32[r2+116];r5=HEAP32[r2+115]}_glEnable(3042);_glDisable(2929);r6=HEAP32[r3>>2];FUNCTION_TABLE[HEAP32[HEAP32[r2]+204>>2]](r1,r6|0,r5-HEAP32[r2+113]|0,r4-HEAP32[r2+114]|0,HEAP32[r6+88>>2],HEAP32[r6+92>>2]);return}function __ZN14mgWebGLDisplay11clearBufferEi(r1,r2){r1=r2<<14&16384;_glClear((r2&2|0)==0?r1:r1|256);return}function __ZN14mgWebGLDisplay13setLightColorEddd(r1,r2,r3,r4){var r5;r5=r1+284|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r1+292|0;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r1+300|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay15setLightAmbientEddd(r1,r2,r3,r4){var r5;r5=r1+308|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r1+316|0;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r1+324|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay11setMatColorEdddd(r1,r2,r3,r4,r5){var r6;r6=r1+332|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+340|0;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+348|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r1+356|0;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay15newVertexBufferEiPK14mgVertexAttribij(r1,r2,r3,r4,r5){var r6,r7;r1=__Znwj(36),r6=r1>>2;r7=r1;HEAP32[r7>>2]=5263996;HEAP32[r6+1]=r2;HEAP32[r6+2]=r3;HEAP32[r6+4]=r4;r3=Math.imul(r4,r2);HEAP32[r6+3]=__Znaj((r3|0)>-1?r3:-1);HEAP32[r6+5]=0;HEAP32[r6+6]=r5;HEAP32[r7>>2]=5259952;HEAP32[r6+7]=0;HEAP32[r6+8]=1;return r1}function __ZN14mgWebGLDisplay14newIndexBufferEijj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r1=__Znwj(40),r5=r1>>2;r6=r1>>2;HEAP32[r6]=5268352;HEAP32[r5+4]=r2;HEAP32[r5+6]=r3;HEAP32[r5+7]=r4;if((r4|0)==0){r4=_llvm_umul_with_overflow_i32(r2,2);r3=__Znaj(tempRet0?-1:r4);HEAP32[r5+2]=r3;HEAP32[r5+1]=r3;HEAP32[r5+3]=0;r3=r1+20|0;r4=r3;HEAP32[r4>>2]=0;HEAP32[r6]=5260168;r7=r1+32|0;r8=r7;HEAP32[r8>>2]=0;r9=r1+36|0;r10=r9;HEAP32[r10>>2]=1;r11=r1;return r11}else{r12=_llvm_umul_with_overflow_i32(r2,4);r2=__Znaj(tempRet0?-1:r12);HEAP32[r5+3]=r2;HEAP32[r5+1]=r2;HEAP32[r5+2]=0;r3=r1+20|0;r4=r3;HEAP32[r4>>2]=0;HEAP32[r6]=5260168;r7=r1+32|0;r8=r7;HEAP32[r8>>2]=0;r9=r1+36|0;r10=r9;HEAP32[r10>>2]=1;r11=r1;return r11}}function __ZN14mgWebGLDisplay10setTextureEPK14mgTextureImagei(r1,r2,r3){_glActiveTexture(r3+33984|0);_glBindTexture(3553,HEAP32[r2+112>>2]);_glActiveTexture(33984);HEAP32[r1+1220>>2]=0;HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay10setTextureEPK14mgTextureArrayi(r1,r2,r3){_glActiveTexture(r3+33984|0);_glBindTexture(3553,HEAP32[r2+44>>2]);_glActiveTexture(33984);HEAP32[r1+1220>>2]=r2;HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay10setTextureEPK13mgTextureCubei(r1,r2,r3){_glActiveTexture(r3+33984|0);_glBindTexture(34067,HEAP32[r2+552>>2]);_glActiveTexture(33984);HEAP32[r1+1220>>2]=0;HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay15useVertexBufferEP19mgWebGLVertexBuffer(r1,r2){var r3,r4,r5,r6,r7;r3=HEAP32[r2+8>>2]>>2;r4=HEAP32[r2+4>>2];L1431:do{if((HEAP32[r3]|0)==0){r5=0}else{r2=0;while(1){_glEnableVertexAttribArray(r2);r6=HEAP32[((r2*12&-1)+4>>2)+r3];if((r6|0)==2){_glVertexAttribPointer(r2,3,5121,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==3){_glVertexAttribPointer(r2,4,5121,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==1){_glVertexAttribPointer(r2,2,5121,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==4){_glVertexAttribPointer(r2,2,5123,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==8){_glVertexAttribPointer(r2,2,5126,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==9){_glVertexAttribPointer(r2,3,5126,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==5){_glVertexAttribPointer(r2,4,5123,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==7){_glVertexAttribPointer(r2,1,5126,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==0){_glVertexAttribPointer(r2,1,5121,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==10){_glVertexAttribPointer(r2,4,5126,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}else if((r6|0)==6){_glVertexAttribPointer(r2,3,5125,0,r4,HEAP32[((r2*12&-1)+8>>2)+r3])}r6=r2+1|0;if((HEAP32[((r6*12&-1)>>2)+r3]|0)==0){r5=r6;break L1431}else{r2=r6}}}}while(0);r3=(r1+1228|0)>>2;if((r5|0)<(HEAP32[r3]|0)){r7=r5}else{HEAP32[r3]=r5;return}while(1){_glDisableVertexAttribArray(r7);r1=r7+1|0;if((r1|0)<(HEAP32[r3]|0)){r7=r1}else{break}}HEAP32[r3]=r5;return}function __ZN14mgWebGLDisplay4drawEiP14mgVertexBuffer(r1,r2,r3){var r4,r5;if((HEAP32[r1+364>>2]|0)!=0){__ZN14mgWebGLDisplay20setShaderStdUniformsEP13mgWebGLShader(r1,HEAP32[r1+1224>>2])}r4=r3;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r4);_glBindBuffer(34962,HEAP32[r3+28>>2]);__ZN14mgWebGLDisplay15useVertexBufferEP19mgWebGLVertexBuffer(r1,r4);if((r2|0)==0){r5=4}else if((r2|0)==5){r5=0}else if((r2|0)==1){r5=6}else if((r2|0)==4){r5=3}else if((r2|0)==2){r5=5}else if((r2|0)==3){r5=1}else{r5=-1}_glDrawArrays(r5,0,HEAP32[r3+20>>2]);_glBindBuffer(34962,0);return}function __ZN14mgWebGLDisplay4drawEiP14mgVertexBufferii(r1,r2,r3,r4,r5){var r6,r7;if((HEAP32[r1+364>>2]|0)!=0){__ZN14mgWebGLDisplay20setShaderStdUniformsEP13mgWebGLShader(r1,HEAP32[r1+1224>>2])}r6=r3;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r6);_glBindBuffer(34962,HEAP32[r3+28>>2]);__ZN14mgWebGLDisplay15useVertexBufferEP19mgWebGLVertexBuffer(r1,r6);if((r2|0)==1){r7=6}else if((r2|0)==2){r7=5}else if((r2|0)==0){r7=4}else if((r2|0)==3){r7=1}else if((r2|0)==5){r7=0}else if((r2|0)==4){r7=3}else{r7=-1}_glDrawArrays(r7,r4,r5-r4|0);_glBindBuffer(34962,0);return}function __ZN14mgWebGLDisplay4drawEiP14mgVertexBufferP13mgIndexBuffer(r1,r2,r3,r4){var r5,r6,r7;if((HEAP32[r1+364>>2]|0)!=0){__ZN14mgWebGLDisplay20setShaderStdUniformsEP13mgWebGLShader(r1,HEAP32[r1+1224>>2])}r5=r3;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r5);FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+12>>2]](r4);r6=(HEAP32[r4+28>>2]|0)!=0?5125:5123;_glBindBuffer(34962,HEAP32[r3+28>>2]);_glBindBuffer(34963,HEAP32[r4+32>>2]);__ZN14mgWebGLDisplay15useVertexBufferEP19mgWebGLVertexBuffer(r1,r5);if((r2|0)==0){r7=4}else if((r2|0)==5){r7=0}else if((r2|0)==1){r7=6}else if((r2|0)==4){r7=3}else if((r2|0)==3){r7=1}else if((r2|0)==2){r7=5}else{r7=-1}_glDrawElements(r7,HEAP32[r4+20>>2],r6,0);_glBindBuffer(34963,0);_glBindBuffer(34962,0);return}function __ZN14mgWebGLDisplay4drawEiP14mgVertexBufferP13mgIndexBufferii(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10;if((HEAP32[r1+364>>2]|0)!=0){__ZN14mgWebGLDisplay20setShaderStdUniformsEP13mgWebGLShader(r1,HEAP32[r1+1224>>2])}r7=r3;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r7);FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+12>>2]](r4);r8=(HEAP32[r4+28>>2]|0)!=0;r9=r8?5125:5123;_glBindBuffer(34962,HEAP32[r3+28>>2]);_glBindBuffer(34963,HEAP32[r4+32>>2]);__ZN14mgWebGLDisplay15useVertexBufferEP19mgWebGLVertexBuffer(r1,r7);r7=Math.imul(r8?4:2,r5);if((r2|0)==4){r10=3}else if((r2|0)==1){r10=6}else if((r2|0)==2){r10=5}else if((r2|0)==5){r10=0}else if((r2|0)==0){r10=4}else if((r2|0)==3){r10=1}else{r10=-1}_glDrawElements(r10,r6-r5|0,r9,r7);_glBindBuffer(34963,0);_glBindBuffer(34962,0);return}function __ZN14mgWebGLDisplay15decalBackgroundEj(r1,r2){_glEnable(2960);_glStencilFunc(519,1,1);_glStencilOpSeparate(1028,7680,0,7681);_glStencilOpSeparate(1029,0,0,0);if((r2|0)!=0){return}_glDepthFunc(515);_glColorMask(0,0,0,0);return}function __ZN14mgWebGLDisplay10decalStartEv(r1){_glDepthFunc(513);_glColorMask(1,1,1,1);_glStencilFunc(514,1,1);_glDisable(2929);return}function __ZN14mgWebGLDisplay8decalEndEv(r1){_glDisable(2960);_glEnable(2929);return}function __ZN14mgWebGLDisplay17setModelTransformERK9mgMatrix4(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+128|0;r4=r3;r5=r1+964|0;_memcpy(r5,r2,128);r2=r4+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4+80|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4+40|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=(r4+8|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r2+6]=0;HEAP32[r2+7]=0;r2=(r4+48|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r2+6]=0;HEAP32[r2+7]=0;r2=(r4+88|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;r2=r1|0;r6=r1+108|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+116|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+124|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r4+96|0;r10=-r7;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+104|0;r10=-r8;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+112|0;r10=-r9;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r4,r1+132|0);r6=r1+1092|0;_memcpy(r6,r5,128);__ZN9mgMatrix48multiplyERKS_(r6,r4);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+316>>2]](r2);HEAP32[r1+364>>2]=1;STACKTOP=r3;return}function __ZN14mgWebGLDisplay20appendModelTransformERK9mgMatrix4(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+128|0;r4=r3;r5=r1+964|0;__ZN9mgMatrix412leftMultiplyERKS_(r5,r2);r2=r4+120|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4+80|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4+40|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=r4|0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r2>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r2+4>>2]=HEAP32[tempDoublePtr+4>>2];r2=(r4+8|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r2+6]=0;HEAP32[r2+7]=0;r2=(r4+48|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;HEAP32[r2+6]=0;HEAP32[r2+7]=0;r2=(r4+88|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;r2=r1|0;r6=r1+108|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+116|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+124|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r4+96|0;r10=-r7;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+104|0;r10=-r8;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+112|0;r10=-r9;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];__ZN9mgMatrix48multiplyERKS_(r4,r1+132|0);r6=r1+1092|0;_memcpy(r6,r5,128);__ZN9mgMatrix48multiplyERKS_(r6,r4);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+316>>2]](r2);HEAP32[r1+364>>2]=1;STACKTOP=r3;return}function __ZN14mgWebGLDisplay17getModelTransformER9mgMatrix4(r1,r2){_memcpy(r2,r1+964|0,128);return}function __ZN14mgWebGLDisplay15getMVPTransformER9mgMatrix4(r1,r2){_memcpy(r2,r1+1092|0,128);__ZN9mgMatrix48multiplyERKS_(r2,r1+836|0);return}function __ZN14mgWebGLDisplay14getMVTransformER9mgMatrix4(r1,r2){_memcpy(r2,r1+1092|0,128);return}function __ZN14mgWebGLDisplay11setLightDirEddd(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r5=r1+260|0;r6=r1+268|0;r7=r1+276|0;r8=Math.sqrt(r2*r2+r3*r3+r4*r4);r9=r2/r8;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r5>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r5+4>>2]=HEAP32[tempDoublePtr+4>>2];r5=r3/r8;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4/r8;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r1+364>>2]=1;return}function __ZN14mgWebGLDisplay10setZEnableEj(r1,r2){if((r2|0)==0){_glDisable(2929);return}else{_glEnable(2929);return}}function __ZN14mgWebGLDisplay10setCullingEj(r1,r2){if((r2|0)==0){_glDisable(2884);return}else{_glEnable(2884);return}}function __ZN14mgWebGLDisplay10setFrontCWEj(r1,r2){if((r2|0)==0){_glFrontFace(2305);return}else{_glFrontFace(2304);return}}function __ZN14mgWebGLDisplay14setTransparentEj(r1,r2){if((r2|0)==0){_glDisable(3042);return}else{_glEnable(3042);return}}function __ZN14mgWebGLDisplay16setCursorTextureEPKcii(r1,r2,r3,r4){__ZN8mgStringaSEPKc(r1+368|0,r2);HEAP32[r1+452>>2]=r3;HEAP32[r1+456>>2]=r4;HEAP32[r1+832>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+60>>2]](r1,r2);return}function __ZN14mgWebGLDisplay11loadTextureEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=r1+1232|0;r5=HEAP8[r2];L1540:do{if(r5<<24>>24==0){r6=0}else{r7=0;r8=0;r9=r5;while(1){r10=r9<<24>>24^r8;r11=r10<<8|r10>>24;r10=r7+1|0;r12=HEAP8[r2+r10|0];if(r12<<24>>24==0){r6=r11;break L1540}else{r7=r10;r8=r11;r9=r12}}}}while(0);r5=HEAP32[r1+1236>>2];r9=(((r6|0)>-1?r6:-r6|0)|0)%(r5|0);r6=HEAP32[r1+1244>>2];r1=r9;while(1){r8=HEAP32[r6+(r1<<3)>>2];if((r8|0)==0){r3=1539;break}if((_strcmp(r8,r2)|0)==0){r3=1538;break}r8=r1+1|0;r7=(r8|0)<(r5|0)?r8:0;if((r7|0)==(r9|0)){r3=1539;break}else{r1=r7}}if(r3==1538){r9=HEAP32[r6+(r1<<3)+4>>2];r1=r9;return r1}else if(r3==1539){r3=__Znwj(124),r6=r3>>2;r5=r3+4|0;HEAP32[r5>>2]=5259300;HEAP32[r6+2]=63;r7=r3+24|0;HEAP32[r6+5]=r7;HEAP32[r6+3]=0;HEAP8[r7]=0;HEAP32[r6+4]=128;r7=(r3+88|0)>>2;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r6+27]=1;HEAP32[r6]=5259984;HEAP32[r6+28]=0;HEAP32[r6+29]=0;HEAP32[r6+30]=1;r6=r5;__ZN8mgStringaSEPKc(r6,r2);__Z15mgOSFixFileNameR8mgString(r6);__ZN14mgWebGLDisplay18reloadTextureImageEP19mgWebGLTextureImage(0,r3);__ZN16mgMapStringToPtr5setAtEPKcPKv(r4,r2,r3);r9=r3;r1=r9;return r1}}function __ZN14mgWebGLDisplay18reloadTextureImageEP19mgWebGLTextureImage(r1,r2){var r3,r4,r5;r1=r2>>2;r3=r2+112|0;_glGenTextures(1,r3);_glBindTexture(3553,HEAP32[r3>>2]);_glTexParameteri(3553,10241,(HEAP32[r1+30]|0)!=0?9987:9729);_glTexParameteri(3553,10240,9729);_glTexParameteri(3553,10242,(HEAP32[r1+25]|0)==1?33071:10497);_glTexParameteri(3553,10243,(HEAP32[r1+26]|0)==1?33071:10497);r3=_IMG_Load(HEAP32[r1+5]);r2=r3+8|0;HEAP32[r1+22]=HEAP32[r2>>2];r4=r3+12|0;HEAP32[r1+23]=HEAP32[r4>>2];r5=HEAP8[HEAP32[r3+4>>2]+9|0]<<24>>24==4;HEAP32[r1+24]=r5&1;_glTexImage2D(3553,0,6408,HEAP32[r2>>2],HEAP32[r4>>2],0,r5?6408:6407,5121,HEAP32[r3+20>>2]);_SDL_FreeSurface(r3);_glGenerateMipmap(3553);return}function __ZN14mgWebGLDisplay16loadTextureArrayERK13mgStringArray(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;r5=__Znwj(56),r6=r5>>2;r7=r5;r8=r5+4|0;HEAP32[r8>>2]=5266196;_memset(r5+8|0,0,32);HEAP32[r6+10]=1;HEAP32[r6]=5260016;HEAP32[r6+11]=0;r9=(r2+8|0)>>2;r10=_llvm_umul_with_overflow_i32(HEAP32[r9],4);r11=__Znaj(tempRet0?-1:r10);r10=r5;HEAP32[r6+7]=r11;r6=HEAP32[r9];_memset(r11,0,r6<<2);r11=r4|0;HEAP32[r11>>2]=5259300;r12=(r4+4|0)>>2;HEAP32[r12]=63;r13=r4+20|0;r14=(r4+16|0)>>2;HEAP32[r14]=r13;r15=(r4+8|0)>>2;HEAP32[r15]=0;HEAP8[r13]=0;r16=r4+12|0;HEAP32[r16>>2]=128;L1555:do{if((r6|0)>0){r17=r2;r18=r8;r19=0;while(1){r20=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+24>>2]](r2,r19);HEAP32[r15]=0;HEAP8[HEAP32[r14]]=0;if((r20|0)!=0){r21=_strlen(r20);r22=HEAP32[r12];r23=HEAP32[r15];r24=r23+r21|0;if((r22|0)<(r24|0)){r25=HEAP32[r16>>2];r26=r22;while(1){r27=r26+r25|0;if((r27|0)<(r24|0)){r26=r27}else{break}}HEAP32[r12]=r27;r26=r27+1|0;r24=__Znaj((r26|0)>-1?r26:-1);r26=HEAP32[r14];r25=HEAP32[r15];_memcpy(r24,r26,r25+1|0);if((r26|0)==(r13|0)|(r26|0)==0){r28=r25}else{__ZdlPv(r26);r28=HEAP32[r15]}HEAP32[r14]=r24;r29=r28;r30=r24}else{r29=r23;r30=HEAP32[r14]}_memcpy(r30+r29|0,r20,r21);r24=HEAP32[r15]+r21|0;HEAP32[r15]=r24;HEAP8[HEAP32[r14]+r24|0]=0}__Z15mgOSFixFileNameR8mgString(r4);__ZN13mgStringArray3addEPKc(r18,HEAP32[r14]);r24=r19+1|0;if((r24|0)<(HEAP32[r9]|0)){r19=r24}else{break L1555}}}}while(0);__ZN14mgWebGLDisplay18reloadTextureArrayEP19mgWebGLTextureArray(0,r7);r7=(r1+1256|0)>>2;r9=HEAP32[r7];r4=r1+1260|0;if((HEAP32[r4>>2]|0)<(r9+1|0)){r15=r9+101|0;HEAP32[r4>>2]=r15;r4=_llvm_umul_with_overflow_i32(r15,4);r15=__Znaj(tempRet0?-1:r4);r4=r15;r29=r1+1252|0;r30=HEAP32[r29>>2];r28=r30;r27=HEAP32[r7];_memmove(r15,r28,r27<<2,4,0);if((r30|0)==(r1+1264|0)|(r30|0)==0){r31=r27}else{__ZdlPv(r28);r31=HEAP32[r7]}HEAP32[r29>>2]=r4;r32=r31;r33=r4}else{r32=r9;r33=HEAP32[r1+1252>>2]}HEAP32[r7]=r32+1|0;HEAP32[r33+(r32<<2)>>2]=r5;HEAP32[r11>>2]=5259300;r11=HEAP32[r14];if((r11|0)==(r13|0)|(r11|0)==0){STACKTOP=r3;return r10}__ZdlPv(r11);STACKTOP=r3;return r10}function __ZN14mgWebGLDisplay15loadTextureCubeEPKcS1_S1_S1_S1_S1_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r8=__Znwj(556),r9=r8>>2;r10=r8+4|0;HEAP32[r10>>2]=5259300;HEAP32[r9+2]=63;r11=r8+24|0;HEAP32[r9+5]=r11;HEAP32[r9+3]=0;HEAP8[r11]=0;HEAP32[r9+4]=128;r11=r8+88|0;HEAP32[r11>>2]=5259300;HEAP32[r9+23]=63;r12=r8+108|0;HEAP32[r9+26]=r12;HEAP32[r9+24]=0;HEAP8[r12]=0;HEAP32[r9+25]=128;r12=r8+172|0;HEAP32[r12>>2]=5259300;HEAP32[r9+44]=63;r13=r8+192|0;HEAP32[r9+47]=r13;HEAP32[r9+45]=0;HEAP8[r13]=0;HEAP32[r9+46]=128;r13=r8+256|0;HEAP32[r13>>2]=5259300;HEAP32[r9+65]=63;r14=r8+276|0;HEAP32[r9+68]=r14;HEAP32[r9+66]=0;HEAP8[r14]=0;HEAP32[r9+67]=128;r14=r8+340|0;HEAP32[r14>>2]=5259300;HEAP32[r9+86]=63;r15=r8+360|0;HEAP32[r9+89]=r15;HEAP32[r9+87]=0;HEAP8[r15]=0;HEAP32[r9+88]=128;r15=r8+424|0;HEAP32[r15>>2]=5259300;HEAP32[r9+107]=63;r16=r8+444|0;HEAP32[r9+110]=r16;HEAP32[r9+108]=0;HEAP8[r16]=0;HEAP32[r9+109]=128;r16=r8+508|0;HEAP32[r16>>2]=0;HEAP32[r16+4>>2]=0;HEAP32[r9+135]=1;HEAP32[r9+136]=1;HEAP32[r9+137]=1;HEAP32[r9]=5260140;HEAP32[r9+138]=0;r9=r8;r16=(r8+516|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;HEAP32[r16+5]=0;r16=r10;__ZN8mgStringaSEPKc(r16,r2);__Z15mgOSFixFileNameR8mgString(r16);__ZN8mgStringaSEPKc(r11,r3);__Z15mgOSFixFileNameR8mgString(r16);r16=r12;__ZN8mgStringaSEPKc(r16,r4);__Z15mgOSFixFileNameR8mgString(r16);r16=r13;__ZN8mgStringaSEPKc(r16,r5);__Z15mgOSFixFileNameR8mgString(r16);r16=r14;__ZN8mgStringaSEPKc(r16,r6);__Z15mgOSFixFileNameR8mgString(r16);r16=r15;__ZN8mgStringaSEPKc(r16,r7);__Z15mgOSFixFileNameR8mgString(r16);__ZN14mgWebGLDisplay17reloadTextureCubeEP18mgWebGLTextureCube(0,r8);r16=(r1+1352|0)>>2;r7=HEAP32[r16];r15=r1+1356|0;if((HEAP32[r15>>2]|0)>=(r7+1|0)){r17=r7;r18=HEAP32[r1+1348>>2];r19=r17+1|0;HEAP32[r16]=r19;r20=(r17<<2)+r18|0;HEAP32[r20>>2]=r8;return r9}r6=r7+101|0;HEAP32[r15>>2]=r6;r15=_llvm_umul_with_overflow_i32(r6,4);r6=__Znaj(tempRet0?-1:r15);r15=r6;r7=r1+1348|0;r14=HEAP32[r7>>2];r5=r14;r13=HEAP32[r16];_memmove(r6,r5,r13<<2,4,0);if((r14|0)==(r1+1360|0)|(r14|0)==0){r21=r13}else{__ZdlPv(r5);r21=HEAP32[r16]}HEAP32[r7>>2]=r15;r17=r21;r18=r15;r19=r17+1|0;HEAP32[r16]=r19;r20=(r17<<2)+r18|0;HEAP32[r20>>2]=r8;return r9}function __ZN14mgWebGLDisplay18reloadTextureArrayEP19mgWebGLTextureArray(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r1=r2>>2;r3=STACKTOP;STACKTOP=STACKTOP+168|0;r4=r3;r5=r3+84;r6=r2+4|0;r7=r6;r8=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+24>>2]](r6,0);r9=r4|0;HEAP32[r9>>2]=5259300;r10=r4+4|0;HEAP32[r10>>2]=63;r11=r4+20|0;r12=(r4+16|0)>>2;HEAP32[r12]=r11;r13=(r4+8|0)>>2;HEAP32[r13]=0;HEAP8[r11]=0;HEAP32[r4+12>>2]=128;if((r8|0)==0){r14=r11}else{r4=_strlen(r8);if((r4|0)>63){r15=63;while(1){r16=r15+128|0;if((r16|0)<(r4|0)){r15=r16}else{break}}HEAP32[r10>>2]=r16;r16=r15+129|0;r15=__Znaj((r16|0)>-1?r16:-1);r16=HEAP32[r12];r10=HEAP32[r13];_memcpy(r15,r16,r10+1|0);if((r16|0)==(r11|0)|(r16|0)==0){r17=r10}else{__ZdlPv(r16);r17=HEAP32[r13]}HEAP32[r12]=r15;r18=r17;r19=r15}else{r18=0;r19=r11}_memcpy(r19+r18|0,r8,r4);r8=HEAP32[r13]+r4|0;HEAP32[r13]=r8;HEAP8[HEAP32[r12]+r8|0]=0;r14=HEAP32[r12]}r8=_IMG_Load(r14),r14=r8>>2;r13=HEAP32[r14+2];r4=HEAP32[r14+3];r18=HEAP8[HEAP32[r14+1]+9|0]<<24>>24==4;r14=(r2+12|0)>>2;r19=HEAP32[r14];r15=Math.sqrt(r19|0)+.5&-1;r17=2048/(r13|0)&-1;r16=Math.imul((r15|0)<(r17|0)?r15:r17,r13);r17=1;while(1){if((r17|0)<(r16|0)){r17=r17<<1}else{break}}r16=r18&1;r18=(r17|0)/(r13|0)&-1;r15=Math.imul((r18-1+r19|0)/(r18|0)&-1,r4);r18=1;while(1){if((r18|0)<(r15|0)){r18=r18<<1}else{break}}HEAP32[r1+5]=r13;HEAP32[r1+6]=r4;HEAP32[r1+12]=r17;HEAP32[r1+13]=r18;r15=r2+44|0;_glGenTextures(1,r15);_glBindTexture(3553,HEAP32[r15>>2]);_glTexParameteri(3553,10241,9984);_glTexParameteri(3553,10240,9728);_glTexParameteri(3553,10242,(HEAP32[r1+8]|0)==1?33071:10497);_glTexParameteri(3553,10243,(HEAP32[r1+9]|0)==1?33071:10497);_glTexImage2D(3553,0,6408,r17,r18,0,6408,5121,0);L1625:do{if((HEAP32[r14]|0)>0){r18=r5|0;r1=r5+4|0;r15=r5+20|0;r19=(r5+16|0)>>2;r10=(r5+8|0)>>2;r20=r5+12|0;r21=r2+28|0;r22=r8;r23=r16;r24=0;r25=0;r26=0;while(1){r27=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+24>>2]](r6,r26);HEAP32[r18>>2]=5259300;HEAP32[r1>>2]=63;HEAP32[r19]=r15;HEAP32[r10]=0;HEAP8[r15]=0;HEAP32[r20>>2]=128;if((r27|0)!=0){r28=_strlen(r27);if((r28|0)>63){r29=63;while(1){r30=r29+128|0;if((r30|0)<(r28|0)){r29=r30}else{break}}HEAP32[r1>>2]=r30;r31=r29+129|0;r32=__Znaj((r31|0)>-1?r31:-1);r31=HEAP32[r19];r33=HEAP32[r10];_memcpy(r32,r31,r33+1|0);if((r31|0)==(r15|0)|(r31|0)==0){r34=r33}else{__ZdlPv(r31);r34=HEAP32[r10]}HEAP32[r19]=r32;r35=r34;r36=r32}else{r35=0;r36=r15}_memcpy(r36+r35|0,r27,r28);r32=HEAP32[r10]+r28|0;HEAP32[r10]=r32;HEAP8[HEAP32[r19]+r32|0]=0}if((r26|0)==0){r37=r13;r38=r4;r39=r23;r40=r22}else{r32=_IMG_Load(HEAP32[r19]),r31=r32>>2;r37=HEAP32[r31+2];r38=HEAP32[r31+3];r39=HEAP8[HEAP32[r31+1]+9|0]<<24>>24==4&1;r40=r32}if(!((r37|0)==(r13|0)&(r38|0)==(r4|0))){break}HEAP32[HEAP32[r21>>2]+(r26<<2)>>2]=r39;_glTexSubImage2D(3553,0,r24,r25,r13,r4,6408,5121,HEAP32[r40+20>>2]);r32=r24+r13|0;r31=(r32|0)<(r17|0);HEAP32[r18>>2]=5259300;r33=HEAP32[r19];if(!((r33|0)==(r15|0)|(r33|0)==0)){__ZdlPv(r33)}r33=r26+1|0;if((r33|0)<(HEAP32[r14]|0)){r22=r40;r23=r39;r24=r31?r32:0;r25=(r31?0:r4)+r25|0;r26=r33}else{break L1625}}r26=___cxa_allocate_exception(4);r25=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r25,5254592,5254224,HEAP32[r19],(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r37,HEAP32[tempInt+4>>2]=r38,HEAP32[tempInt+8>>2]=r13,HEAP32[tempInt+12>>2]=r4,tempInt));HEAP32[r26>>2]=r25;___cxa_throw(r26,5275304,0)}}while(0);_glGenerateMipmap(3553);HEAP32[r9>>2]=5259300;r9=HEAP32[r12];if((r9|0)==(r11|0)|(r9|0)==0){STACKTOP=r3;return}__ZdlPv(r9);STACKTOP=r3;return}function __ZN14mgWebGLDisplay19createTextureMemoryEiiij(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r1=STACKTOP;STACKTOP=STACKTOP+4|0;r6=r1;_glGenTextures(1,r6);_glBindTexture(3553,HEAP32[r6>>2]);_glTexParameteri(3553,10241,(r5|0)!=0?9987:9728);_glTexParameteri(3553,10240,9728);_glTexParameteri(3553,10242,10497);_glTexParameteri(3553,10243,10497);r7=(r4|0)==2?6406:6408;_glTexImage2D(3553,0,r7,r2,r3,0,r7,5121,0);r7=__Znwj(124),r8=r7>>2;HEAP32[r8+1]=5259300;HEAP32[r8+2]=63;r9=r7+24|0;HEAP32[r8+5]=r9;HEAP32[r8+3]=0;HEAP8[r9]=0;HEAP32[r8+4]=128;r9=(r7+88|0)>>2;HEAP32[r9]=0;HEAP32[r9+1]=0;HEAP32[r9+2]=0;HEAP32[r9+3]=0;HEAP32[r9+4]=0;HEAP32[r8+27]=1;HEAP32[r8]=5259984;HEAP32[r9]=r2;HEAP32[r8+23]=r3;HEAP32[r8+29]=r4;HEAP32[r8+30]=r5;HEAP32[r8+28]=HEAP32[r6>>2];STACKTOP=r1;return r7}function __ZN14mgWebGLDisplay17reloadTextureCubeEP18mgWebGLTextureCube(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r1=r2>>2;r3=STACKTOP;r4=r2+552|0;_glGenTextures(1,r4);_glBindTexture(34067,HEAP32[r4>>2]);_glTexParameteri(34067,10241,9987);_glTexParameteri(34067,10240,9729);_glTexParameteri(34067,10242,(HEAP32[r1+135]|0)==1?33071:10497);_glTexParameteri(34067,10243,(HEAP32[r1+136]|0)==1?33071:10497);r4=_IMG_Load(HEAP32[r1+5]),r5=r4>>2;r6=HEAP32[r5+2];r7=HEAP32[r5+3];r8=HEAP8[HEAP32[r5+1]+9|0]<<24>>24==4;HEAP32[r1+129]=r8&1;_glTexImage2D(34070,0,6408,r6,r7,0,r8?6408:6407,5121,HEAP32[r5+5]);_SDL_FreeSurface(r4);r4=r2+104|0;r5=_IMG_Load(HEAP32[r4>>2]),r8=r5>>2;r9=HEAP32[r8+2];r10=HEAP32[r8+3];r11=HEAP8[HEAP32[r8+1]+9|0]<<24>>24==4;if(!((r9|0)==(r6|0)&(r10|0)==(r7|0))){r12=___cxa_allocate_exception(4);r13=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r13,5254592,5254224,HEAP32[r4>>2],(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r9,HEAP32[tempInt+4>>2]=r10,HEAP32[tempInt+8>>2]=r6,HEAP32[tempInt+12>>2]=r7,tempInt));HEAP32[r12>>2]=r13;___cxa_throw(r12,5275304,0)}HEAP32[r1+130]=r11&1;_glTexImage2D(34069,0,6408,r6,r7,0,r11?6408:6407,5121,HEAP32[r8+5]);_SDL_FreeSurface(r5);r5=r2+188|0;r8=_IMG_Load(HEAP32[r5>>2]),r11=r8>>2;r12=HEAP32[r11+2];r13=HEAP32[r11+3];r10=HEAP8[HEAP32[r11+1]+9|0]<<24>>24==4;if(!((r12|0)==(r6|0)&(r13|0)==(r7|0))){r9=___cxa_allocate_exception(4);r4=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r4,5254592,5254224,HEAP32[r5>>2],(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r12,HEAP32[tempInt+4>>2]=r13,HEAP32[tempInt+8>>2]=r6,HEAP32[tempInt+12>>2]=r7,tempInt));HEAP32[r9>>2]=r4;___cxa_throw(r9,5275304,0)}HEAP32[r1+131]=r10&1;_glTexImage2D(34072,0,6408,r6,r7,0,r10?6408:6407,5121,HEAP32[r11+5]);_SDL_FreeSurface(r8);r8=r2+272|0;r11=_IMG_Load(HEAP32[r8>>2]),r10=r11>>2;r9=HEAP32[r10+2];r4=HEAP32[r10+3];r13=HEAP8[HEAP32[r10+1]+9|0]<<24>>24==4;if(!((r9|0)==(r6|0)&(r4|0)==(r7|0))){r12=___cxa_allocate_exception(4);r5=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r5,5254592,5254224,HEAP32[r8>>2],(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r9,HEAP32[tempInt+4>>2]=r4,HEAP32[tempInt+8>>2]=r6,HEAP32[tempInt+12>>2]=r7,tempInt));HEAP32[r12>>2]=r5;___cxa_throw(r12,5275304,0)}HEAP32[r1+132]=r13&1;_glTexImage2D(34071,0,6408,r6,r7,0,r13?6408:6407,5121,HEAP32[r10+5]);_SDL_FreeSurface(r11);r11=r2+356|0;r10=_IMG_Load(HEAP32[r11>>2]),r13=r10>>2;r12=HEAP32[r13+2];r5=HEAP32[r13+3];r4=HEAP8[HEAP32[r13+1]+9|0]<<24>>24==4;if(!((r12|0)==(r6|0)&(r5|0)==(r7|0))){r9=___cxa_allocate_exception(4);r8=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r8,5254592,5254224,HEAP32[r11>>2],(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r12,HEAP32[tempInt+4>>2]=r5,HEAP32[tempInt+8>>2]=r6,HEAP32[tempInt+12>>2]=r7,tempInt));HEAP32[r9>>2]=r8;___cxa_throw(r9,5275304,0)}HEAP32[r1+133]=r4&1;_glTexImage2D(34074,0,6408,r6,r7,0,r4?6408:6407,5121,HEAP32[r13+5]);_SDL_FreeSurface(r10);r10=r2+440|0;r2=_IMG_Load(HEAP32[r10>>2]),r13=r2>>2;r4=HEAP32[r13+2];r9=HEAP32[r13+3];r8=HEAP8[HEAP32[r13+1]+9|0]<<24>>24==4;if((r4|0)==(r6|0)&(r9|0)==(r7|0)){HEAP32[r1+134]=r8&1;_glTexImage2D(34073,0,6408,r6,r7,0,r8?6408:6407,5121,HEAP32[r13+5]);_SDL_FreeSurface(r2);_glGenerateMipmap(34067);HEAP32[r1+127]=r6;HEAP32[r1+128]=r7;STACKTOP=r3;return}r3=___cxa_allocate_exception(4);r1=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r1,5254592,5254224,HEAP32[r10>>2],(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r4,HEAP32[tempInt+4>>2]=r9,HEAP32[tempInt+8>>2]=r6,HEAP32[tempInt+12>>2]=r7,tempInt));HEAP32[r3>>2]=r1;___cxa_throw(r3,5275304,0)}function __ZN14mgWebGLDisplay18loadOverlayShadersEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258,r259,r260,r261,r262,r263,r264,r265,r266,r267,r268,r269,r270,r271,r272,r273,r274,r275,r276,r277,r278,r279,r280,r281,r282,r283,r284,r285,r286,r287,r288,r289,r290,r291,r292,r293,r294,r295,r296,r297,r298,r299,r300,r301,r302,r303,r304,r305,r306,r307,r308,r309,r310,r311,r312,r313,r314,r315,r316,r317,r318,r319,r320,r321,r322,r323,r324,r325,r326,r327,r328,r329,r330,r331,r332,r333,r334,r335,r336,r337,r338,r339,r340,r341,r342,r343,r344,r345,r346,r347,r348,r349,r350,r351,r352,r353,r354,r355,r356,r357,r358,r359,r360,r361,r362,r363,r364,r365,r366,r367,r368,r369,r370,r371,r372,r373,r374,r375,r376,r377,r378,r379,r380,r381,r382,r383,r384,r385,r386,r387,r388,r389,r390,r391,r392,r393,r394,r395,r396,r397,r398,r399,r400,r401,r402,r403,r404,r405,r406,r407,r408,r409,r410,r411,r412,r413,r414,r415,r416,r417,r418,r419,r420,r421,r422,r423,r424,r425,r426,r427,r428,r429,r430,r431,r432,r433,r434,r435,r436,r437,r438,r439,r440,r441,r442,r443,r444,r445,r446,r447,r448,r449,r450,r451,r452,r453,r454,r455,r456,r457,r458,r459,r460,r461,r462,r463,r464,r465,r466,r467,r468,r469,r470,r471;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+168|0;r4=r3;r5=r3+84;r6=r4|0;HEAP32[r6>>2]=5259300;r7=(r4+4|0)>>2;HEAP32[r7]=63;r8=r4+20|0;r9=(r4+16|0)>>2;HEAP32[r9]=r8;r10=(r4+8|0)>>2;HEAP32[r10]=0;r11=(r4+12|0)>>2;HEAP32[r11]=128;_memcpy(r8,5251496,25);r4=HEAP32[r10]+25|0;HEAP32[r10]=r4;HEAP8[HEAP32[r9]+r4|0]=0;r4=HEAP32[r7];r12=HEAP32[r10];r13=r12+21|0;if((r4|0)<(r13|0)){r14=HEAP32[r11];r15=r4;while(1){r16=r15+r14|0;if((r16|0)<(r13|0)){r15=r16}else{break}}HEAP32[r7]=r16;r15=r16+1|0;r16=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r9];r13=HEAP32[r10];_memcpy(r16,r15,r13+1|0);if((r15|0)==(r8|0)|(r15|0)==0){r17=r13}else{__ZdlPv(r15);r17=HEAP32[r10]}HEAP32[r9]=r16;r18=r17;r19=r16}else{r18=r12;r19=HEAP32[r9]}_memcpy(r19+r18|0,5251296,21);r18=HEAP32[r10]+21|0;HEAP32[r10]=r18;HEAP8[HEAP32[r9]+r18|0]=0;r18=HEAP32[r7];r19=HEAP32[r10];r12=r19+23|0;if((r18|0)<(r12|0)){r16=HEAP32[r11];r17=r18;while(1){r20=r17+r16|0;if((r20|0)<(r12|0)){r17=r20}else{break}}HEAP32[r7]=r20;r17=r20+1|0;r20=__Znaj((r17|0)>-1?r17:-1);r17=HEAP32[r9];r12=HEAP32[r10];_memcpy(r20,r17,r12+1|0);if((r17|0)==(r8|0)|(r17|0)==0){r21=r12}else{__ZdlPv(r17);r21=HEAP32[r10]}HEAP32[r9]=r20;r22=r21;r23=r20}else{r22=r19;r23=HEAP32[r9]}_memcpy(r23+r22|0,5251060,23);r22=HEAP32[r10]+23|0;HEAP32[r10]=r22;HEAP8[HEAP32[r9]+r22|0]=0;r22=HEAP32[r7];r23=HEAP32[r10];r19=r23+26|0;if((r22|0)<(r19|0)){r20=HEAP32[r11];r21=r22;while(1){r24=r21+r20|0;if((r24|0)<(r19|0)){r21=r24}else{break}}HEAP32[r7]=r24;r21=r24+1|0;r24=__Znaj((r21|0)>-1?r21:-1);r21=HEAP32[r9];r19=HEAP32[r10];_memcpy(r24,r21,r19+1|0);if((r21|0)==(r8|0)|(r21|0)==0){r25=r19}else{__ZdlPv(r21);r25=HEAP32[r10]}HEAP32[r9]=r24;r26=r25;r27=r24}else{r26=r23;r27=HEAP32[r9]}_memcpy(r27+r26|0,5250816,26);r26=HEAP32[r10]+26|0;HEAP32[r10]=r26;HEAP8[HEAP32[r9]+r26|0]=0;r26=HEAP32[r7];r27=HEAP32[r10];r23=r27+26|0;if((r26|0)<(r23|0)){r24=HEAP32[r11];r25=r26;while(1){r28=r25+r24|0;if((r28|0)<(r23|0)){r25=r28}else{break}}HEAP32[r7]=r28;r25=r28+1|0;r28=__Znaj((r25|0)>-1?r25:-1);r25=HEAP32[r9];r23=HEAP32[r10];_memcpy(r28,r25,r23+1|0);if((r25|0)==(r8|0)|(r25|0)==0){r29=r23}else{__ZdlPv(r25);r29=HEAP32[r10]}HEAP32[r9]=r28;r30=r29;r31=r28}else{r30=r27;r31=HEAP32[r9]}_memcpy(r31+r30|0,5252584,26);r30=HEAP32[r10]+26|0;HEAP32[r10]=r30;HEAP8[HEAP32[r9]+r30|0]=0;r30=HEAP32[r7];r31=HEAP32[r10];r27=r31+21|0;if((r30|0)<(r27|0)){r28=HEAP32[r11];r29=r30;while(1){r32=r29+r28|0;if((r32|0)<(r27|0)){r29=r32}else{break}}HEAP32[r7]=r32;r29=r32+1|0;r32=__Znaj((r29|0)>-1?r29:-1);r29=HEAP32[r9];r27=HEAP32[r10];_memcpy(r32,r29,r27+1|0);if((r29|0)==(r8|0)|(r29|0)==0){r33=r27}else{__ZdlPv(r29);r33=HEAP32[r10]}HEAP32[r9]=r32;r34=r33;r35=r32}else{r34=r31;r35=HEAP32[r9]}_memcpy(r35+r34|0,5252392,21);r34=HEAP32[r10]+21|0;HEAP32[r10]=r34;HEAP8[HEAP32[r9]+r34|0]=0;r34=HEAP32[r7];r35=HEAP32[r10];r31=r35+17|0;if((r34|0)<(r31|0)){r32=HEAP32[r11];r33=r34;while(1){r36=r33+r32|0;if((r36|0)<(r31|0)){r33=r36}else{break}}HEAP32[r7]=r36;r33=r36+1|0;r36=__Znaj((r33|0)>-1?r33:-1);r33=HEAP32[r9];r31=HEAP32[r10];_memcpy(r36,r33,r31+1|0);if((r33|0)==(r8|0)|(r33|0)==0){r37=r31}else{__ZdlPv(r33);r37=HEAP32[r10]}HEAP32[r9]=r36;r38=r37;r39=r36}else{r38=r35;r39=HEAP32[r9]}_memcpy(r39+r38|0,5249912,17);r38=HEAP32[r10]+17|0;HEAP32[r10]=r38;HEAP8[HEAP32[r9]+r38|0]=0;r38=HEAP32[r7];r39=HEAP32[r10];r35=r39+3|0;if((r38|0)<(r35|0)){r36=HEAP32[r11];r37=r38;while(1){r40=r37+r36|0;if((r40|0)<(r35|0)){r37=r40}else{break}}HEAP32[r7]=r40;r37=r40+1|0;r40=__Znaj((r37|0)>-1?r37:-1);r37=HEAP32[r9];r35=HEAP32[r10];_memcpy(r40,r37,r35+1|0);if((r37|0)==(r8|0)|(r37|0)==0){r41=r35}else{__ZdlPv(r37);r41=HEAP32[r10]}HEAP32[r9]=r40;r42=r41;r43=r40}else{r42=r39;r43=HEAP32[r9]}r39=r43+r42|0;HEAP8[r39]=HEAP8[5249688];HEAP8[r39+1|0]=HEAP8[5249689|0];HEAP8[r39+2|0]=HEAP8[5249690|0];r39=HEAP32[r10]+3|0;HEAP32[r10]=r39;HEAP8[HEAP32[r9]+r39|0]=0;r39=HEAP32[r7];r42=HEAP32[r10];r43=r42+22|0;if((r39|0)<(r43|0)){r40=HEAP32[r11];r41=r39;while(1){r44=r41+r40|0;if((r44|0)<(r43|0)){r41=r44}else{break}}HEAP32[r7]=r44;r41=r44+1|0;r44=__Znaj((r41|0)>-1?r41:-1);r41=HEAP32[r9];r43=HEAP32[r10];_memcpy(r44,r41,r43+1|0);if((r41|0)==(r8|0)|(r41|0)==0){r45=r43}else{__ZdlPv(r41);r45=HEAP32[r10]}HEAP32[r9]=r44;r46=r45;r47=r44}else{r46=r42;r47=HEAP32[r9]}_memcpy(r47+r46|0,5251576,22);r46=HEAP32[r10]+22|0;HEAP32[r10]=r46;HEAP8[HEAP32[r9]+r46|0]=0;r46=HEAP32[r7];r47=HEAP32[r10];r42=r47+69|0;if((r46|0)<(r42|0)){r44=HEAP32[r11];r45=r46;while(1){r48=r45+r44|0;if((r48|0)<(r42|0)){r45=r48}else{break}}HEAP32[r7]=r48;r45=r48+1|0;r48=__Znaj((r45|0)>-1?r45:-1);r45=HEAP32[r9];r42=HEAP32[r10];_memcpy(r48,r45,r42+1|0);if((r45|0)==(r8|0)|(r45|0)==0){r49=r42}else{__ZdlPv(r45);r49=HEAP32[r10]}HEAP32[r9]=r48;r50=r49;r51=r48}else{r50=r47;r51=HEAP32[r9]}_memcpy(r51+r50|0,5249244,69);r50=HEAP32[r10]+69|0;HEAP32[r10]=r50;HEAP8[HEAP32[r9]+r50|0]=0;r50=HEAP32[r7];r51=HEAP32[r10];r47=r51+69|0;if((r50|0)<(r47|0)){r48=HEAP32[r11];r49=r50;while(1){r52=r49+r48|0;if((r52|0)<(r47|0)){r49=r52}else{break}}HEAP32[r7]=r52;r49=r52+1|0;r52=__Znaj((r49|0)>-1?r49:-1);r49=HEAP32[r9];r47=HEAP32[r10];_memcpy(r52,r49,r47+1|0);if((r49|0)==(r8|0)|(r49|0)==0){r53=r47}else{__ZdlPv(r49);r53=HEAP32[r10]}HEAP32[r9]=r52;r54=r53;r55=r52}else{r54=r51;r55=HEAP32[r9]}_memcpy(r55+r54|0,5251152,69);r54=HEAP32[r10]+69|0;HEAP32[r10]=r54;HEAP8[HEAP32[r9]+r54|0]=0;r54=HEAP32[r7];r55=HEAP32[r10];r51=r55+23|0;if((r54|0)<(r51|0)){r52=HEAP32[r11];r53=r54;while(1){r56=r53+r52|0;if((r56|0)<(r51|0)){r53=r56}else{break}}HEAP32[r7]=r56;r53=r56+1|0;r56=__Znaj((r53|0)>-1?r53:-1);r53=HEAP32[r9];r51=HEAP32[r10];_memcpy(r56,r53,r51+1|0);if((r53|0)==(r8|0)|(r53|0)==0){r57=r51}else{__ZdlPv(r53);r57=HEAP32[r10]}HEAP32[r9]=r56;r58=r57;r59=r56}else{r58=r55;r59=HEAP32[r9]}_memcpy(r59+r58|0,5248856,23);r58=HEAP32[r10]+23|0;HEAP32[r10]=r58;HEAP8[HEAP32[r9]+r58|0]=0;r58=HEAP32[r7];r59=HEAP32[r10];r55=r59+23|0;if((r58|0)<(r55|0)){r56=HEAP32[r11];r57=r58;while(1){r60=r57+r56|0;if((r60|0)<(r55|0)){r57=r60}else{break}}HEAP32[r7]=r60;r57=r60+1|0;r60=__Znaj((r57|0)>-1?r57:-1);r57=HEAP32[r9];r55=HEAP32[r10];_memcpy(r60,r57,r55+1|0);if((r57|0)==(r8|0)|(r57|0)==0){r61=r55}else{__ZdlPv(r57);r61=HEAP32[r10]}HEAP32[r9]=r60;r62=r61;r63=r60}else{r62=r59;r63=HEAP32[r9]}_memcpy(r63+r62|0,5248728,23);r62=HEAP32[r10]+23|0;HEAP32[r10]=r62;HEAP8[HEAP32[r9]+r62|0]=0;r62=HEAP32[r7];r63=HEAP32[r10];r59=r63+2|0;if((r62|0)<(r59|0)){r60=HEAP32[r11];r61=r62;while(1){r64=r61+r60|0;if((r64|0)<(r59|0)){r61=r64}else{break}}HEAP32[r7]=r64;r61=r64+1|0;r64=__Znaj((r61|0)>-1?r61:-1);r61=HEAP32[r9];r59=HEAP32[r10];_memcpy(r64,r61,r59+1|0);if((r61|0)==(r8|0)|(r61|0)==0){r65=r59}else{__ZdlPv(r61);r65=HEAP32[r10]}HEAP32[r9]=r64;r66=r65;r67=r64}else{r66=r63;r67=HEAP32[r9]}r63=r67+r66|0;tempBigInt=2685;HEAP8[r63]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r63+1|0]=tempBigInt&255;r63=HEAP32[r10]+2|0;HEAP32[r10]=r63;HEAP8[HEAP32[r9]+r63|0]=0;r63=r5|0;HEAP32[r63>>2]=5259300;r66=(r5+4|0)>>2;HEAP32[r66]=63;r67=r5+20|0;r64=(r5+16|0)>>2;HEAP32[r64]=r67;r65=(r5+8|0)>>2;HEAP32[r65]=0;r61=(r5+12|0)>>2;HEAP32[r61]=128;_memcpy(r67,5251496,25);r5=HEAP32[r65]+25|0;HEAP32[r65]=r5;HEAP8[HEAP32[r64]+r5|0]=0;r5=HEAP32[r66];r59=HEAP32[r65];r60=r59+21|0;if((r5|0)<(r60|0)){r62=HEAP32[r61];r57=r5;while(1){r68=r57+r62|0;if((r68|0)<(r60|0)){r57=r68}else{break}}HEAP32[r66]=r68;r57=r68+1|0;r68=__Znaj((r57|0)>-1?r57:-1);r57=HEAP32[r64];r60=HEAP32[r65];_memcpy(r68,r57,r60+1|0);if((r57|0)==(r67|0)|(r57|0)==0){r69=r60}else{__ZdlPv(r57);r69=HEAP32[r65]}HEAP32[r64]=r68;r70=r69;r71=r68}else{r70=r59;r71=HEAP32[r64]}_memcpy(r71+r70|0,5252392,21);r70=HEAP32[r65]+21|0;HEAP32[r65]=r70;HEAP8[HEAP32[r64]+r70|0]=0;r70=HEAP32[r66];r71=HEAP32[r65];r59=r71+17|0;if((r70|0)<(r59|0)){r68=HEAP32[r61];r69=r70;while(1){r72=r69+r68|0;if((r72|0)<(r59|0)){r69=r72}else{break}}HEAP32[r66]=r72;r69=r72+1|0;r72=__Znaj((r69|0)>-1?r69:-1);r69=HEAP32[r64];r59=HEAP32[r65];_memcpy(r72,r69,r59+1|0);if((r69|0)==(r67|0)|(r69|0)==0){r73=r59}else{__ZdlPv(r69);r73=HEAP32[r65]}HEAP32[r64]=r72;r74=r73;r75=r72}else{r74=r71;r75=HEAP32[r64]}_memcpy(r75+r74|0,5249912,17);r74=HEAP32[r65]+17|0;HEAP32[r65]=r74;HEAP8[HEAP32[r64]+r74|0]=0;r74=HEAP32[r66];r75=HEAP32[r65];r71=r75+3|0;if((r74|0)<(r71|0)){r72=HEAP32[r61];r73=r74;while(1){r76=r73+r72|0;if((r76|0)<(r71|0)){r73=r76}else{break}}HEAP32[r66]=r76;r73=r76+1|0;r76=__Znaj((r73|0)>-1?r73:-1);r73=HEAP32[r64];r71=HEAP32[r65];_memcpy(r76,r73,r71+1|0);if((r73|0)==(r67|0)|(r73|0)==0){r77=r71}else{__ZdlPv(r73);r77=HEAP32[r65]}HEAP32[r64]=r76;r78=r77;r79=r76}else{r78=r75;r79=HEAP32[r64]}r75=r79+r78|0;HEAP8[r75]=HEAP8[5249688];HEAP8[r75+1|0]=HEAP8[5249689|0];HEAP8[r75+2|0]=HEAP8[5249690|0];r75=HEAP32[r65]+3|0;HEAP32[r65]=r75;HEAP8[HEAP32[r64]+r75|0]=0;r75=HEAP32[r66];r78=HEAP32[r65];r79=r78+25|0;if((r75|0)<(r79|0)){r76=HEAP32[r61];r77=r75;while(1){r80=r77+r76|0;if((r80|0)<(r79|0)){r77=r80}else{break}}HEAP32[r66]=r80;r77=r80+1|0;r80=__Znaj((r77|0)>-1?r77:-1);r77=HEAP32[r64];r79=HEAP32[r65];_memcpy(r80,r77,r79+1|0);if((r77|0)==(r67|0)|(r77|0)==0){r81=r79}else{__ZdlPv(r77);r81=HEAP32[r65]}HEAP32[r64]=r80;r82=r81;r83=r80}else{r82=r78;r83=HEAP32[r64]}_memcpy(r83+r82|0,5250016,25);r82=HEAP32[r65]+25|0;HEAP32[r65]=r82;HEAP8[HEAP32[r64]+r82|0]=0;r82=HEAP32[r66];r83=HEAP32[r65];r78=r83+2|0;if((r82|0)<(r78|0)){r80=HEAP32[r61];r81=r82;while(1){r84=r81+r80|0;if((r84|0)<(r78|0)){r81=r84}else{break}}HEAP32[r66]=r84;r81=r84+1|0;r84=__Znaj((r81|0)>-1?r81:-1);r81=HEAP32[r64];r78=HEAP32[r65];_memcpy(r84,r81,r78+1|0);if((r81|0)==(r67|0)|(r81|0)==0){r85=r78}else{__ZdlPv(r81);r85=HEAP32[r65]}HEAP32[r64]=r84;r86=r85;r87=r84}else{r86=r83;r87=HEAP32[r64]}r83=r87+r86|0;tempBigInt=2685;HEAP8[r83]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r83+1|0]=tempBigInt&255;r83=HEAP32[r65]+2|0;HEAP32[r65]=r83;HEAP8[HEAP32[r64]+r83|0]=0;r83=r1>>2;HEAP32[r2+361]=FUNCTION_TABLE[HEAP32[HEAP32[r83]+328>>2]](r1,5249808,HEAP32[r9],HEAP32[r64],5277348);HEAP32[r10]=0;HEAP8[HEAP32[r9]]=0;r86=HEAP32[r7];r87=HEAP32[r10];r84=r87+25|0;if((r86|0)<(r84|0)){r85=HEAP32[r11];r81=r86;while(1){r88=r81+r85|0;if((r88|0)<(r84|0)){r81=r88}else{break}}HEAP32[r7]=r88;r81=r88+1|0;r88=__Znaj((r81|0)>-1?r81:-1);r81=HEAP32[r9];r84=HEAP32[r10];_memcpy(r88,r81,r84+1|0);if((r81|0)==(r8|0)|(r81|0)==0){r89=r84}else{__ZdlPv(r81);r89=HEAP32[r10]}HEAP32[r9]=r88;r90=r89;r91=r88}else{r90=r87;r91=HEAP32[r9]}_memcpy(r91+r90|0,5251496,25);r90=HEAP32[r10]+25|0;HEAP32[r10]=r90;HEAP8[HEAP32[r9]+r90|0]=0;r90=HEAP32[r7];r91=HEAP32[r10];r87=r91+21|0;if((r90|0)<(r87|0)){r88=HEAP32[r11];r89=r90;while(1){r92=r89+r88|0;if((r92|0)<(r87|0)){r89=r92}else{break}}HEAP32[r7]=r92;r89=r92+1|0;r92=__Znaj((r89|0)>-1?r89:-1);r89=HEAP32[r9];r87=HEAP32[r10];_memcpy(r92,r89,r87+1|0);if((r89|0)==(r8|0)|(r89|0)==0){r93=r87}else{__ZdlPv(r89);r93=HEAP32[r10]}HEAP32[r9]=r92;r94=r93;r95=r92}else{r94=r91;r95=HEAP32[r9]}_memcpy(r95+r94|0,5251296,21);r94=HEAP32[r10]+21|0;HEAP32[r10]=r94;HEAP8[HEAP32[r9]+r94|0]=0;r94=HEAP32[r7];r95=HEAP32[r10];r91=r95+23|0;if((r94|0)<(r91|0)){r92=HEAP32[r11];r93=r94;while(1){r96=r93+r92|0;if((r96|0)<(r91|0)){r93=r96}else{break}}HEAP32[r7]=r96;r93=r96+1|0;r96=__Znaj((r93|0)>-1?r93:-1);r93=HEAP32[r9];r91=HEAP32[r10];_memcpy(r96,r93,r91+1|0);if((r93|0)==(r8|0)|(r93|0)==0){r97=r91}else{__ZdlPv(r93);r97=HEAP32[r10]}HEAP32[r9]=r96;r98=r97;r99=r96}else{r98=r95;r99=HEAP32[r9]}_memcpy(r99+r98|0,5251060,23);r98=HEAP32[r10]+23|0;HEAP32[r10]=r98;HEAP8[HEAP32[r9]+r98|0]=0;r98=HEAP32[r7];r99=HEAP32[r10];r95=r99+26|0;if((r98|0)<(r95|0)){r96=HEAP32[r11];r97=r98;while(1){r100=r97+r96|0;if((r100|0)<(r95|0)){r97=r100}else{break}}HEAP32[r7]=r100;r97=r100+1|0;r100=__Znaj((r97|0)>-1?r97:-1);r97=HEAP32[r9];r95=HEAP32[r10];_memcpy(r100,r97,r95+1|0);if((r97|0)==(r8|0)|(r97|0)==0){r101=r95}else{__ZdlPv(r97);r101=HEAP32[r10]}HEAP32[r9]=r100;r102=r101;r103=r100}else{r102=r99;r103=HEAP32[r9]}_memcpy(r103+r102|0,5250816,26);r102=HEAP32[r10]+26|0;HEAP32[r10]=r102;HEAP8[HEAP32[r9]+r102|0]=0;r102=HEAP32[r7];r103=HEAP32[r10];r99=r103+30|0;if((r102|0)<(r99|0)){r100=HEAP32[r11];r101=r102;while(1){r104=r101+r100|0;if((r104|0)<(r99|0)){r101=r104}else{break}}HEAP32[r7]=r104;r101=r104+1|0;r104=__Znaj((r101|0)>-1?r101:-1);r101=HEAP32[r9];r99=HEAP32[r10];_memcpy(r104,r101,r99+1|0);if((r101|0)==(r8|0)|(r101|0)==0){r105=r99}else{__ZdlPv(r101);r105=HEAP32[r10]}HEAP32[r9]=r104;r106=r105;r107=r104}else{r106=r103;r107=HEAP32[r9]}_memcpy(r107+r106|0,5250560,30);r106=HEAP32[r10]+30|0;HEAP32[r10]=r106;HEAP8[HEAP32[r9]+r106|0]=0;r106=HEAP32[r7];r107=HEAP32[r10];r103=r107+19|0;if((r106|0)<(r103|0)){r104=HEAP32[r11];r105=r106;while(1){r108=r105+r104|0;if((r108|0)<(r103|0)){r105=r108}else{break}}HEAP32[r7]=r108;r105=r108+1|0;r108=__Znaj((r105|0)>-1?r105:-1);r105=HEAP32[r9];r103=HEAP32[r10];_memcpy(r108,r105,r103+1|0);if((r105|0)==(r8|0)|(r105|0)==0){r109=r103}else{__ZdlPv(r105);r109=HEAP32[r10]}HEAP32[r9]=r108;r110=r109;r111=r108}else{r110=r107;r111=HEAP32[r9]}_memcpy(r111+r110|0,5250184,19);r110=HEAP32[r10]+19|0;HEAP32[r10]=r110;HEAP8[HEAP32[r9]+r110|0]=0;r110=HEAP32[r7];r111=HEAP32[r10];r107=r111+17|0;if((r110|0)<(r107|0)){r108=HEAP32[r11];r109=r110;while(1){r112=r109+r108|0;if((r112|0)<(r107|0)){r109=r112}else{break}}HEAP32[r7]=r112;r109=r112+1|0;r112=__Znaj((r109|0)>-1?r109:-1);r109=HEAP32[r9];r107=HEAP32[r10];_memcpy(r112,r109,r107+1|0);if((r109|0)==(r8|0)|(r109|0)==0){r113=r107}else{__ZdlPv(r109);r113=HEAP32[r10]}HEAP32[r9]=r112;r114=r113;r115=r112}else{r114=r111;r115=HEAP32[r9]}_memcpy(r115+r114|0,5249912,17);r114=HEAP32[r10]+17|0;HEAP32[r10]=r114;HEAP8[HEAP32[r9]+r114|0]=0;r114=HEAP32[r7];r115=HEAP32[r10];r111=r115+3|0;if((r114|0)<(r111|0)){r112=HEAP32[r11];r113=r114;while(1){r116=r113+r112|0;if((r116|0)<(r111|0)){r113=r116}else{break}}HEAP32[r7]=r116;r113=r116+1|0;r116=__Znaj((r113|0)>-1?r113:-1);r113=HEAP32[r9];r111=HEAP32[r10];_memcpy(r116,r113,r111+1|0);if((r113|0)==(r8|0)|(r113|0)==0){r117=r111}else{__ZdlPv(r113);r117=HEAP32[r10]}HEAP32[r9]=r116;r118=r117;r119=r116}else{r118=r115;r119=HEAP32[r9]}r115=r119+r118|0;HEAP8[r115]=HEAP8[5249688];HEAP8[r115+1|0]=HEAP8[5249689|0];HEAP8[r115+2|0]=HEAP8[5249690|0];r115=HEAP32[r10]+3|0;HEAP32[r10]=r115;HEAP8[HEAP32[r9]+r115|0]=0;r115=HEAP32[r7];r118=HEAP32[r10];r119=r118+24|0;if((r115|0)<(r119|0)){r116=HEAP32[r11];r117=r115;while(1){r120=r117+r116|0;if((r120|0)<(r119|0)){r117=r120}else{break}}HEAP32[r7]=r120;r117=r120+1|0;r120=__Znaj((r117|0)>-1?r117:-1);r117=HEAP32[r9];r119=HEAP32[r10];_memcpy(r120,r117,r119+1|0);if((r117|0)==(r8|0)|(r117|0)==0){r121=r119}else{__ZdlPv(r117);r121=HEAP32[r10]}HEAP32[r9]=r120;r122=r121;r123=r120}else{r122=r118;r123=HEAP32[r9]}_memcpy(r123+r122|0,5249476,24);r122=HEAP32[r10]+24|0;HEAP32[r10]=r122;HEAP8[HEAP32[r9]+r122|0]=0;r122=HEAP32[r7];r123=HEAP32[r10];r118=r123+69|0;if((r122|0)<(r118|0)){r120=HEAP32[r11];r121=r122;while(1){r124=r121+r120|0;if((r124|0)<(r118|0)){r121=r124}else{break}}HEAP32[r7]=r124;r121=r124+1|0;r124=__Znaj((r121|0)>-1?r121:-1);r121=HEAP32[r9];r118=HEAP32[r10];_memcpy(r124,r121,r118+1|0);if((r121|0)==(r8|0)|(r121|0)==0){r125=r118}else{__ZdlPv(r121);r125=HEAP32[r10]}HEAP32[r9]=r124;r126=r125;r127=r124}else{r126=r123;r127=HEAP32[r9]}_memcpy(r127+r126|0,5249244,69);r126=HEAP32[r10]+69|0;HEAP32[r10]=r126;HEAP8[HEAP32[r9]+r126|0]=0;r126=HEAP32[r7];r127=HEAP32[r10];r123=r127+69|0;if((r126|0)<(r123|0)){r124=HEAP32[r11];r125=r126;while(1){r128=r125+r124|0;if((r128|0)<(r123|0)){r125=r128}else{break}}HEAP32[r7]=r128;r125=r128+1|0;r128=__Znaj((r125|0)>-1?r125:-1);r125=HEAP32[r9];r123=HEAP32[r10];_memcpy(r128,r125,r123+1|0);if((r125|0)==(r8|0)|(r125|0)==0){r129=r123}else{__ZdlPv(r125);r129=HEAP32[r10]}HEAP32[r9]=r128;r130=r129;r131=r128}else{r130=r127;r131=HEAP32[r9]}_memcpy(r131+r130|0,5251152,69);r130=HEAP32[r10]+69|0;HEAP32[r10]=r130;HEAP8[HEAP32[r9]+r130|0]=0;r130=HEAP32[r7];r131=HEAP32[r10];r127=r131+23|0;if((r130|0)<(r127|0)){r128=HEAP32[r11];r129=r130;while(1){r132=r129+r128|0;if((r132|0)<(r127|0)){r129=r132}else{break}}HEAP32[r7]=r132;r129=r132+1|0;r132=__Znaj((r129|0)>-1?r129:-1);r129=HEAP32[r9];r127=HEAP32[r10];_memcpy(r132,r129,r127+1|0);if((r129|0)==(r8|0)|(r129|0)==0){r133=r127}else{__ZdlPv(r129);r133=HEAP32[r10]}HEAP32[r9]=r132;r134=r133;r135=r132}else{r134=r131;r135=HEAP32[r9]}_memcpy(r135+r134|0,5248856,23);r134=HEAP32[r10]+23|0;HEAP32[r10]=r134;HEAP8[HEAP32[r9]+r134|0]=0;r134=HEAP32[r7];r135=HEAP32[r10];r131=r135+23|0;if((r134|0)<(r131|0)){r132=HEAP32[r11];r133=r134;while(1){r136=r133+r132|0;if((r136|0)<(r131|0)){r133=r136}else{break}}HEAP32[r7]=r136;r133=r136+1|0;r136=__Znaj((r133|0)>-1?r133:-1);r133=HEAP32[r9];r131=HEAP32[r10];_memcpy(r136,r133,r131+1|0);if((r133|0)==(r8|0)|(r133|0)==0){r137=r131}else{__ZdlPv(r133);r137=HEAP32[r10]}HEAP32[r9]=r136;r138=r137;r139=r136}else{r138=r135;r139=HEAP32[r9]}_memcpy(r139+r138|0,5248728,23);r138=HEAP32[r10]+23|0;HEAP32[r10]=r138;HEAP8[HEAP32[r9]+r138|0]=0;r138=HEAP32[r7];r139=HEAP32[r10];r135=r139+2|0;if((r138|0)<(r135|0)){r136=HEAP32[r11];r137=r138;while(1){r140=r137+r136|0;if((r140|0)<(r135|0)){r137=r140}else{break}}HEAP32[r7]=r140;r137=r140+1|0;r140=__Znaj((r137|0)>-1?r137:-1);r137=HEAP32[r9];r135=HEAP32[r10];_memcpy(r140,r137,r135+1|0);if((r137|0)==(r8|0)|(r137|0)==0){r141=r135}else{__ZdlPv(r137);r141=HEAP32[r10]}HEAP32[r9]=r140;r142=r141;r143=r140}else{r142=r139;r143=HEAP32[r9]}r139=r143+r142|0;tempBigInt=2685;HEAP8[r139]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r139+1|0]=tempBigInt&255;r139=HEAP32[r10]+2|0;HEAP32[r10]=r139;HEAP8[HEAP32[r9]+r139|0]=0;HEAP32[r65]=0;HEAP8[HEAP32[r64]]=0;r139=HEAP32[r66];r142=HEAP32[r65];r143=r142+25|0;if((r139|0)<(r143|0)){r140=HEAP32[r61];r141=r139;while(1){r144=r141+r140|0;if((r144|0)<(r143|0)){r141=r144}else{break}}HEAP32[r66]=r144;r141=r144+1|0;r144=__Znaj((r141|0)>-1?r141:-1);r141=HEAP32[r64];r143=HEAP32[r65];_memcpy(r144,r141,r143+1|0);if((r141|0)==(r67|0)|(r141|0)==0){r145=r143}else{__ZdlPv(r141);r145=HEAP32[r65]}HEAP32[r64]=r144;r146=r145;r147=r144}else{r146=r142;r147=HEAP32[r64]}_memcpy(r147+r146|0,5251496,25);r146=HEAP32[r65]+25|0;HEAP32[r65]=r146;HEAP8[HEAP32[r64]+r146|0]=0;r146=HEAP32[r66];r147=HEAP32[r65];r142=r147+34|0;if((r146|0)<(r142|0)){r144=HEAP32[r61];r145=r146;while(1){r148=r145+r144|0;if((r148|0)<(r142|0)){r145=r148}else{break}}HEAP32[r66]=r148;r145=r148+1|0;r148=__Znaj((r145|0)>-1?r145:-1);r145=HEAP32[r64];r142=HEAP32[r65];_memcpy(r148,r145,r142+1|0);if((r145|0)==(r67|0)|(r145|0)==0){r149=r142}else{__ZdlPv(r145);r149=HEAP32[r65]}HEAP32[r64]=r148;r150=r149;r151=r148}else{r150=r147;r151=HEAP32[r64]}_memcpy(r151+r150|0,5248288,34);r150=HEAP32[r65]+34|0;HEAP32[r65]=r150;HEAP8[HEAP32[r64]+r150|0]=0;r150=HEAP32[r66];r151=HEAP32[r65];r147=r151+19|0;if((r150|0)<(r147|0)){r148=HEAP32[r61];r149=r150;while(1){r152=r149+r148|0;if((r152|0)<(r147|0)){r149=r152}else{break}}HEAP32[r66]=r152;r149=r152+1|0;r152=__Znaj((r149|0)>-1?r149:-1);r149=HEAP32[r64];r147=HEAP32[r65];_memcpy(r152,r149,r147+1|0);if((r149|0)==(r67|0)|(r149|0)==0){r153=r147}else{__ZdlPv(r149);r153=HEAP32[r65]}HEAP32[r64]=r152;r154=r153;r155=r152}else{r154=r151;r155=HEAP32[r64]}_memcpy(r155+r154|0,5250184,19);r154=HEAP32[r65]+19|0;HEAP32[r65]=r154;HEAP8[HEAP32[r64]+r154|0]=0;r154=HEAP32[r66];r155=HEAP32[r65];r151=r155+17|0;if((r154|0)<(r151|0)){r152=HEAP32[r61];r153=r154;while(1){r156=r153+r152|0;if((r156|0)<(r151|0)){r153=r156}else{break}}HEAP32[r66]=r156;r153=r156+1|0;r156=__Znaj((r153|0)>-1?r153:-1);r153=HEAP32[r64];r151=HEAP32[r65];_memcpy(r156,r153,r151+1|0);if((r153|0)==(r67|0)|(r153|0)==0){r157=r151}else{__ZdlPv(r153);r157=HEAP32[r65]}HEAP32[r64]=r156;r158=r157;r159=r156}else{r158=r155;r159=HEAP32[r64]}_memcpy(r159+r158|0,5249912,17);r158=HEAP32[r65]+17|0;HEAP32[r65]=r158;HEAP8[HEAP32[r64]+r158|0]=0;r158=HEAP32[r66];r159=HEAP32[r65];r155=r159+3|0;if((r158|0)<(r155|0)){r156=HEAP32[r61];r157=r158;while(1){r160=r157+r156|0;if((r160|0)<(r155|0)){r157=r160}else{break}}HEAP32[r66]=r160;r157=r160+1|0;r160=__Znaj((r157|0)>-1?r157:-1);r157=HEAP32[r64];r155=HEAP32[r65];_memcpy(r160,r157,r155+1|0);if((r157|0)==(r67|0)|(r157|0)==0){r161=r155}else{__ZdlPv(r157);r161=HEAP32[r65]}HEAP32[r64]=r160;r162=r161;r163=r160}else{r162=r159;r163=HEAP32[r64]}r159=r163+r162|0;HEAP8[r159]=HEAP8[5249688];HEAP8[r159+1|0]=HEAP8[5249689|0];HEAP8[r159+2|0]=HEAP8[5249690|0];r159=HEAP32[r65]+3|0;HEAP32[r65]=r159;HEAP8[HEAP32[r64]+r159|0]=0;r159=HEAP32[r66];r162=HEAP32[r65];r163=r162+50|0;if((r159|0)<(r163|0)){r160=HEAP32[r61];r161=r159;while(1){r164=r161+r160|0;if((r164|0)<(r163|0)){r161=r164}else{break}}HEAP32[r66]=r164;r161=r164+1|0;r164=__Znaj((r161|0)>-1?r161:-1);r161=HEAP32[r64];r163=HEAP32[r65];_memcpy(r164,r161,r163+1|0);if((r161|0)==(r67|0)|(r161|0)==0){r165=r163}else{__ZdlPv(r161);r165=HEAP32[r65]}HEAP32[r64]=r164;r166=r165;r167=r164}else{r166=r162;r167=HEAP32[r64]}_memcpy(r167+r166|0,5247660,50);r166=HEAP32[r65]+50|0;HEAP32[r65]=r166;HEAP8[HEAP32[r64]+r166|0]=0;r166=HEAP32[r66];r167=HEAP32[r65];r162=r167+2|0;if((r166|0)<(r162|0)){r164=HEAP32[r61];r165=r166;while(1){r168=r165+r164|0;if((r168|0)<(r162|0)){r165=r168}else{break}}HEAP32[r66]=r168;r165=r168+1|0;r168=__Znaj((r165|0)>-1?r165:-1);r165=HEAP32[r64];r162=HEAP32[r65];_memcpy(r168,r165,r162+1|0);if((r165|0)==(r67|0)|(r165|0)==0){r169=r162}else{__ZdlPv(r165);r169=HEAP32[r65]}HEAP32[r64]=r168;r170=r169;r171=r168}else{r170=r167;r171=HEAP32[r64]}r167=r171+r170|0;tempBigInt=2685;HEAP8[r167]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r167+1|0]=tempBigInt&255;r167=HEAP32[r65]+2|0;HEAP32[r65]=r167;HEAP8[HEAP32[r64]+r167|0]=0;HEAP32[r2+362]=FUNCTION_TABLE[HEAP32[HEAP32[r83]+328>>2]](r1,5248696,HEAP32[r9],HEAP32[r64],5277420);HEAP32[r10]=0;HEAP8[HEAP32[r9]]=0;r167=HEAP32[r7];r170=HEAP32[r10];r171=r170+25|0;if((r167|0)<(r171|0)){r168=HEAP32[r11];r169=r167;while(1){r172=r169+r168|0;if((r172|0)<(r171|0)){r169=r172}else{break}}HEAP32[r7]=r172;r169=r172+1|0;r172=__Znaj((r169|0)>-1?r169:-1);r169=HEAP32[r9];r171=HEAP32[r10];_memcpy(r172,r169,r171+1|0);if((r169|0)==(r8|0)|(r169|0)==0){r173=r171}else{__ZdlPv(r169);r173=HEAP32[r10]}HEAP32[r9]=r172;r174=r173;r175=r172}else{r174=r170;r175=HEAP32[r9]}_memcpy(r175+r174|0,5251496,25);r174=HEAP32[r10]+25|0;HEAP32[r10]=r174;HEAP8[HEAP32[r9]+r174|0]=0;r174=HEAP32[r7];r175=HEAP32[r10];r170=r175+21|0;if((r174|0)<(r170|0)){r172=HEAP32[r11];r173=r174;while(1){r176=r173+r172|0;if((r176|0)<(r170|0)){r173=r176}else{break}}HEAP32[r7]=r176;r173=r176+1|0;r176=__Znaj((r173|0)>-1?r173:-1);r173=HEAP32[r9];r170=HEAP32[r10];_memcpy(r176,r173,r170+1|0);if((r173|0)==(r8|0)|(r173|0)==0){r177=r170}else{__ZdlPv(r173);r177=HEAP32[r10]}HEAP32[r9]=r176;r178=r177;r179=r176}else{r178=r175;r179=HEAP32[r9]}_memcpy(r179+r178|0,5251296,21);r178=HEAP32[r10]+21|0;HEAP32[r10]=r178;HEAP8[HEAP32[r9]+r178|0]=0;r178=HEAP32[r7];r179=HEAP32[r10];r175=r179+23|0;if((r178|0)<(r175|0)){r176=HEAP32[r11];r177=r178;while(1){r180=r177+r176|0;if((r180|0)<(r175|0)){r177=r180}else{break}}HEAP32[r7]=r180;r177=r180+1|0;r180=__Znaj((r177|0)>-1?r177:-1);r177=HEAP32[r9];r175=HEAP32[r10];_memcpy(r180,r177,r175+1|0);if((r177|0)==(r8|0)|(r177|0)==0){r181=r175}else{__ZdlPv(r177);r181=HEAP32[r10]}HEAP32[r9]=r180;r182=r181;r183=r180}else{r182=r179;r183=HEAP32[r9]}_memcpy(r183+r182|0,5251060,23);r182=HEAP32[r10]+23|0;HEAP32[r10]=r182;HEAP8[HEAP32[r9]+r182|0]=0;r182=HEAP32[r7];r183=HEAP32[r10];r179=r183+26|0;if((r182|0)<(r179|0)){r180=HEAP32[r11];r181=r182;while(1){r184=r181+r180|0;if((r184|0)<(r179|0)){r181=r184}else{break}}HEAP32[r7]=r184;r181=r184+1|0;r184=__Znaj((r181|0)>-1?r181:-1);r181=HEAP32[r9];r179=HEAP32[r10];_memcpy(r184,r181,r179+1|0);if((r181|0)==(r8|0)|(r181|0)==0){r185=r179}else{__ZdlPv(r181);r185=HEAP32[r10]}HEAP32[r9]=r184;r186=r185;r187=r184}else{r186=r183;r187=HEAP32[r9]}_memcpy(r187+r186|0,5250816,26);r186=HEAP32[r10]+26|0;HEAP32[r10]=r186;HEAP8[HEAP32[r9]+r186|0]=0;r186=HEAP32[r7];r187=HEAP32[r10];r183=r187+30|0;if((r186|0)<(r183|0)){r184=HEAP32[r11];r185=r186;while(1){r188=r185+r184|0;if((r188|0)<(r183|0)){r185=r188}else{break}}HEAP32[r7]=r188;r185=r188+1|0;r188=__Znaj((r185|0)>-1?r185:-1);r185=HEAP32[r9];r183=HEAP32[r10];_memcpy(r188,r185,r183+1|0);if((r185|0)==(r8|0)|(r185|0)==0){r189=r183}else{__ZdlPv(r185);r189=HEAP32[r10]}HEAP32[r9]=r188;r190=r189;r191=r188}else{r190=r187;r191=HEAP32[r9]}_memcpy(r191+r190|0,5250560,30);r190=HEAP32[r10]+30|0;HEAP32[r10]=r190;HEAP8[HEAP32[r9]+r190|0]=0;r190=HEAP32[r7];r191=HEAP32[r10];r187=r191+19|0;if((r190|0)<(r187|0)){r188=HEAP32[r11];r189=r190;while(1){r192=r189+r188|0;if((r192|0)<(r187|0)){r189=r192}else{break}}HEAP32[r7]=r192;r189=r192+1|0;r192=__Znaj((r189|0)>-1?r189:-1);r189=HEAP32[r9];r187=HEAP32[r10];_memcpy(r192,r189,r187+1|0);if((r189|0)==(r8|0)|(r189|0)==0){r193=r187}else{__ZdlPv(r189);r193=HEAP32[r10]}HEAP32[r9]=r192;r194=r193;r195=r192}else{r194=r191;r195=HEAP32[r9]}_memcpy(r195+r194|0,5250184,19);r194=HEAP32[r10]+19|0;HEAP32[r10]=r194;HEAP8[HEAP32[r9]+r194|0]=0;r194=HEAP32[r7];r195=HEAP32[r10];r191=r195+17|0;if((r194|0)<(r191|0)){r192=HEAP32[r11];r193=r194;while(1){r196=r193+r192|0;if((r196|0)<(r191|0)){r193=r196}else{break}}HEAP32[r7]=r196;r193=r196+1|0;r196=__Znaj((r193|0)>-1?r193:-1);r193=HEAP32[r9];r191=HEAP32[r10];_memcpy(r196,r193,r191+1|0);if((r193|0)==(r8|0)|(r193|0)==0){r197=r191}else{__ZdlPv(r193);r197=HEAP32[r10]}HEAP32[r9]=r196;r198=r197;r199=r196}else{r198=r195;r199=HEAP32[r9]}_memcpy(r199+r198|0,5249912,17);r198=HEAP32[r10]+17|0;HEAP32[r10]=r198;HEAP8[HEAP32[r9]+r198|0]=0;r198=HEAP32[r7];r199=HEAP32[r10];r195=r199+3|0;if((r198|0)<(r195|0)){r196=HEAP32[r11];r197=r198;while(1){r200=r197+r196|0;if((r200|0)<(r195|0)){r197=r200}else{break}}HEAP32[r7]=r200;r197=r200+1|0;r200=__Znaj((r197|0)>-1?r197:-1);r197=HEAP32[r9];r195=HEAP32[r10];_memcpy(r200,r197,r195+1|0);if((r197|0)==(r8|0)|(r197|0)==0){r201=r195}else{__ZdlPv(r197);r201=HEAP32[r10]}HEAP32[r9]=r200;r202=r201;r203=r200}else{r202=r199;r203=HEAP32[r9]}r199=r203+r202|0;HEAP8[r199]=HEAP8[5249688];HEAP8[r199+1|0]=HEAP8[5249689|0];HEAP8[r199+2|0]=HEAP8[5249690|0];r199=HEAP32[r10]+3|0;HEAP32[r10]=r199;HEAP8[HEAP32[r9]+r199|0]=0;r199=HEAP32[r7];r202=HEAP32[r10];r203=r202+24|0;if((r199|0)<(r203|0)){r200=HEAP32[r11];r201=r199;while(1){r204=r201+r200|0;if((r204|0)<(r203|0)){r201=r204}else{break}}HEAP32[r7]=r204;r201=r204+1|0;r204=__Znaj((r201|0)>-1?r201:-1);r201=HEAP32[r9];r203=HEAP32[r10];_memcpy(r204,r201,r203+1|0);if((r201|0)==(r8|0)|(r201|0)==0){r205=r203}else{__ZdlPv(r201);r205=HEAP32[r10]}HEAP32[r9]=r204;r206=r205;r207=r204}else{r206=r202;r207=HEAP32[r9]}_memcpy(r207+r206|0,5249476,24);r206=HEAP32[r10]+24|0;HEAP32[r10]=r206;HEAP8[HEAP32[r9]+r206|0]=0;r206=HEAP32[r7];r207=HEAP32[r10];r202=r207+69|0;if((r206|0)<(r202|0)){r204=HEAP32[r11];r205=r206;while(1){r208=r205+r204|0;if((r208|0)<(r202|0)){r205=r208}else{break}}HEAP32[r7]=r208;r205=r208+1|0;r208=__Znaj((r205|0)>-1?r205:-1);r205=HEAP32[r9];r202=HEAP32[r10];_memcpy(r208,r205,r202+1|0);if((r205|0)==(r8|0)|(r205|0)==0){r209=r202}else{__ZdlPv(r205);r209=HEAP32[r10]}HEAP32[r9]=r208;r210=r209;r211=r208}else{r210=r207;r211=HEAP32[r9]}_memcpy(r211+r210|0,5249244,69);r210=HEAP32[r10]+69|0;HEAP32[r10]=r210;HEAP8[HEAP32[r9]+r210|0]=0;r210=HEAP32[r7];r211=HEAP32[r10];r207=r211+69|0;if((r210|0)<(r207|0)){r208=HEAP32[r11];r209=r210;while(1){r212=r209+r208|0;if((r212|0)<(r207|0)){r209=r212}else{break}}HEAP32[r7]=r212;r209=r212+1|0;r212=__Znaj((r209|0)>-1?r209:-1);r209=HEAP32[r9];r207=HEAP32[r10];_memcpy(r212,r209,r207+1|0);if((r209|0)==(r8|0)|(r209|0)==0){r213=r207}else{__ZdlPv(r209);r213=HEAP32[r10]}HEAP32[r9]=r212;r214=r213;r215=r212}else{r214=r211;r215=HEAP32[r9]}_memcpy(r215+r214|0,5251152,69);r214=HEAP32[r10]+69|0;HEAP32[r10]=r214;HEAP8[HEAP32[r9]+r214|0]=0;r214=HEAP32[r7];r215=HEAP32[r10];r211=r215+23|0;if((r214|0)<(r211|0)){r212=HEAP32[r11];r213=r214;while(1){r216=r213+r212|0;if((r216|0)<(r211|0)){r213=r216}else{break}}HEAP32[r7]=r216;r213=r216+1|0;r216=__Znaj((r213|0)>-1?r213:-1);r213=HEAP32[r9];r211=HEAP32[r10];_memcpy(r216,r213,r211+1|0);if((r213|0)==(r8|0)|(r213|0)==0){r217=r211}else{__ZdlPv(r213);r217=HEAP32[r10]}HEAP32[r9]=r216;r218=r217;r219=r216}else{r218=r215;r219=HEAP32[r9]}_memcpy(r219+r218|0,5248856,23);r218=HEAP32[r10]+23|0;HEAP32[r10]=r218;HEAP8[HEAP32[r9]+r218|0]=0;r218=HEAP32[r7];r219=HEAP32[r10];r215=r219+23|0;if((r218|0)<(r215|0)){r216=HEAP32[r11];r217=r218;while(1){r220=r217+r216|0;if((r220|0)<(r215|0)){r217=r220}else{break}}HEAP32[r7]=r220;r217=r220+1|0;r220=__Znaj((r217|0)>-1?r217:-1);r217=HEAP32[r9];r215=HEAP32[r10];_memcpy(r220,r217,r215+1|0);if((r217|0)==(r8|0)|(r217|0)==0){r221=r215}else{__ZdlPv(r217);r221=HEAP32[r10]}HEAP32[r9]=r220;r222=r221;r223=r220}else{r222=r219;r223=HEAP32[r9]}_memcpy(r223+r222|0,5248728,23);r222=HEAP32[r10]+23|0;HEAP32[r10]=r222;HEAP8[HEAP32[r9]+r222|0]=0;r222=HEAP32[r7];r223=HEAP32[r10];r219=r223+2|0;if((r222|0)<(r219|0)){r220=HEAP32[r11];r221=r222;while(1){r224=r221+r220|0;if((r224|0)<(r219|0)){r221=r224}else{break}}HEAP32[r7]=r224;r221=r224+1|0;r224=__Znaj((r221|0)>-1?r221:-1);r221=HEAP32[r9];r219=HEAP32[r10];_memcpy(r224,r221,r219+1|0);if((r221|0)==(r8|0)|(r221|0)==0){r225=r219}else{__ZdlPv(r221);r225=HEAP32[r10]}HEAP32[r9]=r224;r226=r225;r227=r224}else{r226=r223;r227=HEAP32[r9]}r223=r227+r226|0;tempBigInt=2685;HEAP8[r223]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r223+1|0]=tempBigInt&255;r223=HEAP32[r10]+2|0;HEAP32[r10]=r223;HEAP8[HEAP32[r9]+r223|0]=0;HEAP32[r65]=0;HEAP8[HEAP32[r64]]=0;r223=HEAP32[r66];r226=HEAP32[r65];r227=r226+25|0;if((r223|0)<(r227|0)){r224=HEAP32[r61];r225=r223;while(1){r228=r225+r224|0;if((r228|0)<(r227|0)){r225=r228}else{break}}HEAP32[r66]=r228;r225=r228+1|0;r228=__Znaj((r225|0)>-1?r225:-1);r225=HEAP32[r64];r227=HEAP32[r65];_memcpy(r228,r225,r227+1|0);if((r225|0)==(r67|0)|(r225|0)==0){r229=r227}else{__ZdlPv(r225);r229=HEAP32[r65]}HEAP32[r64]=r228;r230=r229;r231=r228}else{r230=r226;r231=HEAP32[r64]}_memcpy(r231+r230|0,5251496,25);r230=HEAP32[r65]+25|0;HEAP32[r65]=r230;HEAP8[HEAP32[r64]+r230|0]=0;r230=HEAP32[r66];r231=HEAP32[r65];r226=r231+34|0;if((r230|0)<(r226|0)){r228=HEAP32[r61];r229=r230;while(1){r232=r229+r228|0;if((r232|0)<(r226|0)){r229=r232}else{break}}HEAP32[r66]=r232;r229=r232+1|0;r232=__Znaj((r229|0)>-1?r229:-1);r229=HEAP32[r64];r226=HEAP32[r65];_memcpy(r232,r229,r226+1|0);if((r229|0)==(r67|0)|(r229|0)==0){r233=r226}else{__ZdlPv(r229);r233=HEAP32[r65]}HEAP32[r64]=r232;r234=r233;r235=r232}else{r234=r231;r235=HEAP32[r64]}_memcpy(r235+r234|0,5248288,34);r234=HEAP32[r65]+34|0;HEAP32[r65]=r234;HEAP8[HEAP32[r64]+r234|0]=0;r234=HEAP32[r66];r235=HEAP32[r65];r231=r235+24|0;if((r234|0)<(r231|0)){r232=HEAP32[r61];r233=r234;while(1){r236=r233+r232|0;if((r236|0)<(r231|0)){r233=r236}else{break}}HEAP32[r66]=r236;r233=r236+1|0;r236=__Znaj((r233|0)>-1?r233:-1);r233=HEAP32[r64];r231=HEAP32[r65];_memcpy(r236,r233,r231+1|0);if((r233|0)==(r67|0)|(r233|0)==0){r237=r231}else{__ZdlPv(r233);r237=HEAP32[r65]}HEAP32[r64]=r236;r238=r237;r239=r236}else{r238=r235;r239=HEAP32[r64]}_memcpy(r239+r238|0,5248480,24);r238=HEAP32[r65]+24|0;HEAP32[r65]=r238;HEAP8[HEAP32[r64]+r238|0]=0;r238=HEAP32[r66];r239=HEAP32[r65];r235=r239+19|0;if((r238|0)<(r235|0)){r236=HEAP32[r61];r237=r238;while(1){r240=r237+r236|0;if((r240|0)<(r235|0)){r237=r240}else{break}}HEAP32[r66]=r240;r237=r240+1|0;r240=__Znaj((r237|0)>-1?r237:-1);r237=HEAP32[r64];r235=HEAP32[r65];_memcpy(r240,r237,r235+1|0);if((r237|0)==(r67|0)|(r237|0)==0){r241=r235}else{__ZdlPv(r237);r241=HEAP32[r65]}HEAP32[r64]=r240;r242=r241;r243=r240}else{r242=r239;r243=HEAP32[r64]}_memcpy(r243+r242|0,5250184,19);r242=HEAP32[r65]+19|0;HEAP32[r65]=r242;HEAP8[HEAP32[r64]+r242|0]=0;r242=HEAP32[r66];r243=HEAP32[r65];r239=r243+17|0;if((r242|0)<(r239|0)){r240=HEAP32[r61];r241=r242;while(1){r244=r241+r240|0;if((r244|0)<(r239|0)){r241=r244}else{break}}HEAP32[r66]=r244;r241=r244+1|0;r244=__Znaj((r241|0)>-1?r241:-1);r241=HEAP32[r64];r239=HEAP32[r65];_memcpy(r244,r241,r239+1|0);if((r241|0)==(r67|0)|(r241|0)==0){r245=r239}else{__ZdlPv(r241);r245=HEAP32[r65]}HEAP32[r64]=r244;r246=r245;r247=r244}else{r246=r243;r247=HEAP32[r64]}_memcpy(r247+r246|0,5249912,17);r246=HEAP32[r65]+17|0;HEAP32[r65]=r246;HEAP8[HEAP32[r64]+r246|0]=0;r246=HEAP32[r66];r247=HEAP32[r65];r243=r247+3|0;if((r246|0)<(r243|0)){r244=HEAP32[r61];r245=r246;while(1){r248=r245+r244|0;if((r248|0)<(r243|0)){r245=r248}else{break}}HEAP32[r66]=r248;r245=r248+1|0;r248=__Znaj((r245|0)>-1?r245:-1);r245=HEAP32[r64];r243=HEAP32[r65];_memcpy(r248,r245,r243+1|0);if((r245|0)==(r67|0)|(r245|0)==0){r249=r243}else{__ZdlPv(r245);r249=HEAP32[r65]}HEAP32[r64]=r248;r250=r249;r251=r248}else{r250=r247;r251=HEAP32[r64]}r247=r251+r250|0;HEAP8[r247]=HEAP8[5249688];HEAP8[r247+1|0]=HEAP8[5249689|0];HEAP8[r247+2|0]=HEAP8[5249690|0];r247=HEAP32[r65]+3|0;HEAP32[r65]=r247;HEAP8[HEAP32[r64]+r247|0]=0;r247=HEAP32[r66];r250=HEAP32[r65];r251=r250+48|0;if((r247|0)<(r251|0)){r248=HEAP32[r61];r249=r247;while(1){r252=r249+r248|0;if((r252|0)<(r251|0)){r249=r252}else{break}}HEAP32[r66]=r252;r249=r252+1|0;r252=__Znaj((r249|0)>-1?r249:-1);r249=HEAP32[r64];r251=HEAP32[r65];_memcpy(r252,r249,r251+1|0);if((r249|0)==(r67|0)|(r249|0)==0){r253=r251}else{__ZdlPv(r249);r253=HEAP32[r65]}HEAP32[r64]=r252;r254=r253;r255=r252}else{r254=r250;r255=HEAP32[r64]}_memcpy(r255+r254|0,5248048,48);r254=HEAP32[r65]+48|0;HEAP32[r65]=r254;HEAP8[HEAP32[r64]+r254|0]=0;r254=HEAP32[r66];r255=HEAP32[r65];r250=r255+22|0;if((r254|0)<(r250|0)){r252=HEAP32[r61];r253=r254;while(1){r256=r253+r252|0;if((r256|0)<(r250|0)){r253=r256}else{break}}HEAP32[r66]=r256;r253=r256+1|0;r256=__Znaj((r253|0)>-1?r253:-1);r253=HEAP32[r64];r250=HEAP32[r65];_memcpy(r256,r253,r250+1|0);if((r253|0)==(r67|0)|(r253|0)==0){r257=r250}else{__ZdlPv(r253);r257=HEAP32[r65]}HEAP32[r64]=r256;r258=r257;r259=r256}else{r258=r255;r259=HEAP32[r64]}_memcpy(r259+r258|0,5247816,22);r258=HEAP32[r65]+22|0;HEAP32[r65]=r258;HEAP8[HEAP32[r64]+r258|0]=0;r258=HEAP32[r66];r259=HEAP32[r65];r255=r259+13|0;if((r258|0)<(r255|0)){r256=HEAP32[r61];r257=r258;while(1){r260=r257+r256|0;if((r260|0)<(r255|0)){r257=r260}else{break}}HEAP32[r66]=r260;r257=r260+1|0;r260=__Znaj((r257|0)>-1?r257:-1);r257=HEAP32[r64];r255=HEAP32[r65];_memcpy(r260,r257,r255+1|0);if((r257|0)==(r67|0)|(r257|0)==0){r261=r255}else{__ZdlPv(r257);r261=HEAP32[r65]}HEAP32[r64]=r260;r262=r261;r263=r260}else{r262=r259;r263=HEAP32[r64]}_memcpy(r263+r262|0,5247604,13);r262=HEAP32[r65]+13|0;HEAP32[r65]=r262;HEAP8[HEAP32[r64]+r262|0]=0;r262=HEAP32[r66];r263=HEAP32[r65];r259=r263+85|0;if((r262|0)<(r259|0)){r260=HEAP32[r61];r261=r262;while(1){r264=r261+r260|0;if((r264|0)<(r259|0)){r261=r264}else{break}}HEAP32[r66]=r264;r261=r264+1|0;r264=__Znaj((r261|0)>-1?r261:-1);r261=HEAP32[r64];r259=HEAP32[r65];_memcpy(r264,r261,r259+1|0);if((r261|0)==(r67|0)|(r261|0)==0){r265=r259}else{__ZdlPv(r261);r265=HEAP32[r65]}HEAP32[r64]=r264;r266=r265;r267=r264}else{r266=r263;r267=HEAP32[r64]}_memcpy(r267+r266|0,5247304,85);r263=r266+85|0;HEAP32[r65]=r263;HEAP8[r267+r263|0]=0;r263=HEAP32[r66];r267=HEAP32[r65];r266=r267+2|0;if((r263|0)<(r266|0)){r264=HEAP32[r61];r265=r263;while(1){r268=r265+r264|0;if((r268|0)<(r266|0)){r265=r268}else{break}}HEAP32[r66]=r268;r265=r268+1|0;r268=__Znaj((r265|0)>-1?r265:-1);r265=HEAP32[r64];r266=HEAP32[r65];_memcpy(r268,r265,r266+1|0);if((r265|0)==(r67|0)|(r265|0)==0){r269=r266}else{__ZdlPv(r265);r269=HEAP32[r65]}HEAP32[r64]=r268;r270=r269;r271=r268}else{r270=r267;r271=HEAP32[r64]}r267=r271+r270|0;tempBigInt=2685;HEAP8[r267]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r267+1|0]=tempBigInt&255;r267=HEAP32[r65]+2|0;HEAP32[r65]=r267;HEAP8[HEAP32[r64]+r267|0]=0;HEAP32[r2+363]=FUNCTION_TABLE[HEAP32[HEAP32[r83]+328>>2]](r1,5247184,HEAP32[r9],HEAP32[r64],5277492);HEAP32[r10]=0;HEAP8[HEAP32[r9]]=0;r267=HEAP32[r7];r270=HEAP32[r10];r271=r270+25|0;if((r267|0)<(r271|0)){r268=HEAP32[r11];r269=r267;while(1){r272=r269+r268|0;if((r272|0)<(r271|0)){r269=r272}else{break}}HEAP32[r7]=r272;r269=r272+1|0;r272=__Znaj((r269|0)>-1?r269:-1);r269=HEAP32[r9];r271=HEAP32[r10];_memcpy(r272,r269,r271+1|0);if((r269|0)==(r8|0)|(r269|0)==0){r273=r271}else{__ZdlPv(r269);r273=HEAP32[r10]}HEAP32[r9]=r272;r274=r273;r275=r272}else{r274=r270;r275=HEAP32[r9]}_memcpy(r275+r274|0,5251496,25);r274=HEAP32[r10]+25|0;HEAP32[r10]=r274;HEAP8[HEAP32[r9]+r274|0]=0;r274=HEAP32[r7];r275=HEAP32[r10];r270=r275+21|0;if((r274|0)<(r270|0)){r272=HEAP32[r11];r273=r274;while(1){r276=r273+r272|0;if((r276|0)<(r270|0)){r273=r276}else{break}}HEAP32[r7]=r276;r273=r276+1|0;r276=__Znaj((r273|0)>-1?r273:-1);r273=HEAP32[r9];r270=HEAP32[r10];_memcpy(r276,r273,r270+1|0);if((r273|0)==(r8|0)|(r273|0)==0){r277=r270}else{__ZdlPv(r273);r277=HEAP32[r10]}HEAP32[r9]=r276;r278=r277;r279=r276}else{r278=r275;r279=HEAP32[r9]}_memcpy(r279+r278|0,5251296,21);r278=HEAP32[r10]+21|0;HEAP32[r10]=r278;HEAP8[HEAP32[r9]+r278|0]=0;r278=HEAP32[r7];r279=HEAP32[r10];r275=r279+23|0;if((r278|0)<(r275|0)){r276=HEAP32[r11];r277=r278;while(1){r280=r277+r276|0;if((r280|0)<(r275|0)){r277=r280}else{break}}HEAP32[r7]=r280;r277=r280+1|0;r280=__Znaj((r277|0)>-1?r277:-1);r277=HEAP32[r9];r275=HEAP32[r10];_memcpy(r280,r277,r275+1|0);if((r277|0)==(r8|0)|(r277|0)==0){r281=r275}else{__ZdlPv(r277);r281=HEAP32[r10]}HEAP32[r9]=r280;r282=r281;r283=r280}else{r282=r279;r283=HEAP32[r9]}_memcpy(r283+r282|0,5251060,23);r282=HEAP32[r10]+23|0;HEAP32[r10]=r282;HEAP8[HEAP32[r9]+r282|0]=0;r282=HEAP32[r7];r283=HEAP32[r10];r279=r283+26|0;if((r282|0)<(r279|0)){r280=HEAP32[r11];r281=r282;while(1){r284=r281+r280|0;if((r284|0)<(r279|0)){r281=r284}else{break}}HEAP32[r7]=r284;r281=r284+1|0;r284=__Znaj((r281|0)>-1?r281:-1);r281=HEAP32[r9];r279=HEAP32[r10];_memcpy(r284,r281,r279+1|0);if((r281|0)==(r8|0)|(r281|0)==0){r285=r279}else{__ZdlPv(r281);r285=HEAP32[r10]}HEAP32[r9]=r284;r286=r285;r287=r284}else{r286=r283;r287=HEAP32[r9]}_memcpy(r287+r286|0,5250816,26);r286=HEAP32[r10]+26|0;HEAP32[r10]=r286;HEAP8[HEAP32[r9]+r286|0]=0;r286=HEAP32[r7];r287=HEAP32[r10];r283=r287+30|0;if((r286|0)<(r283|0)){r284=HEAP32[r11];r285=r286;while(1){r288=r285+r284|0;if((r288|0)<(r283|0)){r285=r288}else{break}}HEAP32[r7]=r288;r285=r288+1|0;r288=__Znaj((r285|0)>-1?r285:-1);r285=HEAP32[r9];r283=HEAP32[r10];_memcpy(r288,r285,r283+1|0);if((r285|0)==(r8|0)|(r285|0)==0){r289=r283}else{__ZdlPv(r285);r289=HEAP32[r10]}HEAP32[r9]=r288;r290=r289;r291=r288}else{r290=r287;r291=HEAP32[r9]}_memcpy(r291+r290|0,5250560,30);r290=HEAP32[r10]+30|0;HEAP32[r10]=r290;HEAP8[HEAP32[r9]+r290|0]=0;r290=HEAP32[r7];r291=HEAP32[r10];r287=r291+19|0;if((r290|0)<(r287|0)){r288=HEAP32[r11];r289=r290;while(1){r292=r289+r288|0;if((r292|0)<(r287|0)){r289=r292}else{break}}HEAP32[r7]=r292;r289=r292+1|0;r292=__Znaj((r289|0)>-1?r289:-1);r289=HEAP32[r9];r287=HEAP32[r10];_memcpy(r292,r289,r287+1|0);if((r289|0)==(r8|0)|(r289|0)==0){r293=r287}else{__ZdlPv(r289);r293=HEAP32[r10]}HEAP32[r9]=r292;r294=r293;r295=r292}else{r294=r291;r295=HEAP32[r9]}_memcpy(r295+r294|0,5250184,19);r294=HEAP32[r10]+19|0;HEAP32[r10]=r294;HEAP8[HEAP32[r9]+r294|0]=0;r294=HEAP32[r7];r295=HEAP32[r10];r291=r295+17|0;if((r294|0)<(r291|0)){r292=HEAP32[r11];r293=r294;while(1){r296=r293+r292|0;if((r296|0)<(r291|0)){r293=r296}else{break}}HEAP32[r7]=r296;r293=r296+1|0;r296=__Znaj((r293|0)>-1?r293:-1);r293=HEAP32[r9];r291=HEAP32[r10];_memcpy(r296,r293,r291+1|0);if((r293|0)==(r8|0)|(r293|0)==0){r297=r291}else{__ZdlPv(r293);r297=HEAP32[r10]}HEAP32[r9]=r296;r298=r297;r299=r296}else{r298=r295;r299=HEAP32[r9]}_memcpy(r299+r298|0,5249912,17);r298=HEAP32[r10]+17|0;HEAP32[r10]=r298;HEAP8[HEAP32[r9]+r298|0]=0;r298=HEAP32[r7];r299=HEAP32[r10];r295=r299+3|0;if((r298|0)<(r295|0)){r296=HEAP32[r11];r297=r298;while(1){r300=r297+r296|0;if((r300|0)<(r295|0)){r297=r300}else{break}}HEAP32[r7]=r300;r297=r300+1|0;r300=__Znaj((r297|0)>-1?r297:-1);r297=HEAP32[r9];r295=HEAP32[r10];_memcpy(r300,r297,r295+1|0);if((r297|0)==(r8|0)|(r297|0)==0){r301=r295}else{__ZdlPv(r297);r301=HEAP32[r10]}HEAP32[r9]=r300;r302=r301;r303=r300}else{r302=r299;r303=HEAP32[r9]}r299=r303+r302|0;HEAP8[r299]=HEAP8[5249688];HEAP8[r299+1|0]=HEAP8[5249689|0];HEAP8[r299+2|0]=HEAP8[5249690|0];r299=HEAP32[r10]+3|0;HEAP32[r10]=r299;HEAP8[HEAP32[r9]+r299|0]=0;r299=HEAP32[r7];r302=HEAP32[r10];r303=r302+24|0;if((r299|0)<(r303|0)){r300=HEAP32[r11];r301=r299;while(1){r304=r301+r300|0;if((r304|0)<(r303|0)){r301=r304}else{break}}HEAP32[r7]=r304;r301=r304+1|0;r304=__Znaj((r301|0)>-1?r301:-1);r301=HEAP32[r9];r303=HEAP32[r10];_memcpy(r304,r301,r303+1|0);if((r301|0)==(r8|0)|(r301|0)==0){r305=r303}else{__ZdlPv(r301);r305=HEAP32[r10]}HEAP32[r9]=r304;r306=r305;r307=r304}else{r306=r302;r307=HEAP32[r9]}_memcpy(r307+r306|0,5249476,24);r306=HEAP32[r10]+24|0;HEAP32[r10]=r306;HEAP8[HEAP32[r9]+r306|0]=0;r306=HEAP32[r7];r307=HEAP32[r10];r302=r307+69|0;if((r306|0)<(r302|0)){r304=HEAP32[r11];r305=r306;while(1){r308=r305+r304|0;if((r308|0)<(r302|0)){r305=r308}else{break}}HEAP32[r7]=r308;r305=r308+1|0;r308=__Znaj((r305|0)>-1?r305:-1);r305=HEAP32[r9];r302=HEAP32[r10];_memcpy(r308,r305,r302+1|0);if((r305|0)==(r8|0)|(r305|0)==0){r309=r302}else{__ZdlPv(r305);r309=HEAP32[r10]}HEAP32[r9]=r308;r310=r309;r311=r308}else{r310=r307;r311=HEAP32[r9]}_memcpy(r311+r310|0,5249244,69);r310=HEAP32[r10]+69|0;HEAP32[r10]=r310;HEAP8[HEAP32[r9]+r310|0]=0;r310=HEAP32[r7];r311=HEAP32[r10];r307=r311+69|0;if((r310|0)<(r307|0)){r308=HEAP32[r11];r309=r310;while(1){r312=r309+r308|0;if((r312|0)<(r307|0)){r309=r312}else{break}}HEAP32[r7]=r312;r309=r312+1|0;r312=__Znaj((r309|0)>-1?r309:-1);r309=HEAP32[r9];r307=HEAP32[r10];_memcpy(r312,r309,r307+1|0);if((r309|0)==(r8|0)|(r309|0)==0){r313=r307}else{__ZdlPv(r309);r313=HEAP32[r10]}HEAP32[r9]=r312;r314=r313;r315=r312}else{r314=r311;r315=HEAP32[r9]}_memcpy(r315+r314|0,5251152,69);r314=HEAP32[r10]+69|0;HEAP32[r10]=r314;HEAP8[HEAP32[r9]+r314|0]=0;r314=HEAP32[r7];r315=HEAP32[r10];r311=r315+23|0;if((r314|0)<(r311|0)){r312=HEAP32[r11];r313=r314;while(1){r316=r313+r312|0;if((r316|0)<(r311|0)){r313=r316}else{break}}HEAP32[r7]=r316;r313=r316+1|0;r316=__Znaj((r313|0)>-1?r313:-1);r313=HEAP32[r9];r311=HEAP32[r10];_memcpy(r316,r313,r311+1|0);if((r313|0)==(r8|0)|(r313|0)==0){r317=r311}else{__ZdlPv(r313);r317=HEAP32[r10]}HEAP32[r9]=r316;r318=r317;r319=r316}else{r318=r315;r319=HEAP32[r9]}_memcpy(r319+r318|0,5248856,23);r318=HEAP32[r10]+23|0;HEAP32[r10]=r318;HEAP8[HEAP32[r9]+r318|0]=0;r318=HEAP32[r7];r319=HEAP32[r10];r315=r319+23|0;if((r318|0)<(r315|0)){r316=HEAP32[r11];r317=r318;while(1){r320=r317+r316|0;if((r320|0)<(r315|0)){r317=r320}else{break}}HEAP32[r7]=r320;r317=r320+1|0;r320=__Znaj((r317|0)>-1?r317:-1);r317=HEAP32[r9];r315=HEAP32[r10];_memcpy(r320,r317,r315+1|0);if((r317|0)==(r8|0)|(r317|0)==0){r321=r315}else{__ZdlPv(r317);r321=HEAP32[r10]}HEAP32[r9]=r320;r322=r321;r323=r320}else{r322=r319;r323=HEAP32[r9]}_memcpy(r323+r322|0,5248728,23);r322=HEAP32[r10]+23|0;HEAP32[r10]=r322;HEAP8[HEAP32[r9]+r322|0]=0;r322=HEAP32[r7];r323=HEAP32[r10];r319=r323+2|0;if((r322|0)<(r319|0)){r320=HEAP32[r11];r321=r322;while(1){r324=r321+r320|0;if((r324|0)<(r319|0)){r321=r324}else{break}}HEAP32[r7]=r324;r321=r324+1|0;r324=__Znaj((r321|0)>-1?r321:-1);r321=HEAP32[r9];r319=HEAP32[r10];_memcpy(r324,r321,r319+1|0);if((r321|0)==(r8|0)|(r321|0)==0){r325=r319}else{__ZdlPv(r321);r325=HEAP32[r10]}HEAP32[r9]=r324;r326=r325;r327=r324}else{r326=r323;r327=HEAP32[r9]}r323=r327+r326|0;tempBigInt=2685;HEAP8[r323]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r323+1|0]=tempBigInt&255;r323=HEAP32[r10]+2|0;HEAP32[r10]=r323;HEAP8[HEAP32[r9]+r323|0]=0;HEAP32[r65]=0;HEAP8[HEAP32[r64]]=0;r323=HEAP32[r66];r326=HEAP32[r65];r327=r326+25|0;if((r323|0)<(r327|0)){r324=HEAP32[r61];r325=r323;while(1){r328=r325+r324|0;if((r328|0)<(r327|0)){r325=r328}else{break}}HEAP32[r66]=r328;r325=r328+1|0;r328=__Znaj((r325|0)>-1?r325:-1);r325=HEAP32[r64];r327=HEAP32[r65];_memcpy(r328,r325,r327+1|0);if((r325|0)==(r67|0)|(r325|0)==0){r329=r327}else{__ZdlPv(r325);r329=HEAP32[r65]}HEAP32[r64]=r328;r330=r329;r331=r328}else{r330=r326;r331=HEAP32[r64]}_memcpy(r331+r330|0,5251496,25);r330=HEAP32[r65]+25|0;HEAP32[r65]=r330;HEAP8[HEAP32[r64]+r330|0]=0;r330=HEAP32[r66];r331=HEAP32[r65];r326=r331+34|0;if((r330|0)<(r326|0)){r328=HEAP32[r61];r329=r330;while(1){r332=r329+r328|0;if((r332|0)<(r326|0)){r329=r332}else{break}}HEAP32[r66]=r332;r329=r332+1|0;r332=__Znaj((r329|0)>-1?r329:-1);r329=HEAP32[r64];r326=HEAP32[r65];_memcpy(r332,r329,r326+1|0);if((r329|0)==(r67|0)|(r329|0)==0){r333=r326}else{__ZdlPv(r329);r333=HEAP32[r65]}HEAP32[r64]=r332;r334=r333;r335=r332}else{r334=r331;r335=HEAP32[r64]}_memcpy(r335+r334|0,5248288,34);r334=HEAP32[r65]+34|0;HEAP32[r65]=r334;HEAP8[HEAP32[r64]+r334|0]=0;r334=HEAP32[r66];r335=HEAP32[r65];r331=r335+24|0;if((r334|0)<(r331|0)){r332=HEAP32[r61];r333=r334;while(1){r336=r333+r332|0;if((r336|0)<(r331|0)){r333=r336}else{break}}HEAP32[r66]=r336;r333=r336+1|0;r336=__Znaj((r333|0)>-1?r333:-1);r333=HEAP32[r64];r331=HEAP32[r65];_memcpy(r336,r333,r331+1|0);if((r333|0)==(r67|0)|(r333|0)==0){r337=r331}else{__ZdlPv(r333);r337=HEAP32[r65]}HEAP32[r64]=r336;r338=r337;r339=r336}else{r338=r335;r339=HEAP32[r64]}_memcpy(r339+r338|0,5248480,24);r338=HEAP32[r65]+24|0;HEAP32[r65]=r338;HEAP8[HEAP32[r64]+r338|0]=0;r338=HEAP32[r66];r339=HEAP32[r65];r335=r339+19|0;if((r338|0)<(r335|0)){r336=HEAP32[r61];r337=r338;while(1){r340=r337+r336|0;if((r340|0)<(r335|0)){r337=r340}else{break}}HEAP32[r66]=r340;r337=r340+1|0;r340=__Znaj((r337|0)>-1?r337:-1);r337=HEAP32[r64];r335=HEAP32[r65];_memcpy(r340,r337,r335+1|0);if((r337|0)==(r67|0)|(r337|0)==0){r341=r335}else{__ZdlPv(r337);r341=HEAP32[r65]}HEAP32[r64]=r340;r342=r341;r343=r340}else{r342=r339;r343=HEAP32[r64]}_memcpy(r343+r342|0,5250184,19);r342=HEAP32[r65]+19|0;HEAP32[r65]=r342;HEAP8[HEAP32[r64]+r342|0]=0;r342=HEAP32[r66];r343=HEAP32[r65];r339=r343+17|0;if((r342|0)<(r339|0)){r340=HEAP32[r61];r341=r342;while(1){r344=r341+r340|0;if((r344|0)<(r339|0)){r341=r344}else{break}}HEAP32[r66]=r344;r341=r344+1|0;r344=__Znaj((r341|0)>-1?r341:-1);r341=HEAP32[r64];r339=HEAP32[r65];_memcpy(r344,r341,r339+1|0);if((r341|0)==(r67|0)|(r341|0)==0){r345=r339}else{__ZdlPv(r341);r345=HEAP32[r65]}HEAP32[r64]=r344;r346=r345;r347=r344}else{r346=r343;r347=HEAP32[r64]}_memcpy(r347+r346|0,5249912,17);r346=HEAP32[r65]+17|0;HEAP32[r65]=r346;HEAP8[HEAP32[r64]+r346|0]=0;r346=HEAP32[r66];r347=HEAP32[r65];r343=r347+3|0;if((r346|0)<(r343|0)){r344=HEAP32[r61];r345=r346;while(1){r348=r345+r344|0;if((r348|0)<(r343|0)){r345=r348}else{break}}HEAP32[r66]=r348;r345=r348+1|0;r348=__Znaj((r345|0)>-1?r345:-1);r345=HEAP32[r64];r343=HEAP32[r65];_memcpy(r348,r345,r343+1|0);if((r345|0)==(r67|0)|(r345|0)==0){r349=r343}else{__ZdlPv(r345);r349=HEAP32[r65]}HEAP32[r64]=r348;r350=r349;r351=r348}else{r350=r347;r351=HEAP32[r64]}r347=r351+r350|0;HEAP8[r347]=HEAP8[5249688];HEAP8[r347+1|0]=HEAP8[5249689|0];HEAP8[r347+2|0]=HEAP8[5249690|0];r347=HEAP32[r65]+3|0;HEAP32[r65]=r347;HEAP8[HEAP32[r64]+r347|0]=0;r347=HEAP32[r66];r350=HEAP32[r65];r351=r350+48|0;if((r347|0)<(r351|0)){r348=HEAP32[r61];r349=r347;while(1){r352=r349+r348|0;if((r352|0)<(r351|0)){r349=r352}else{break}}HEAP32[r66]=r352;r349=r352+1|0;r352=__Znaj((r349|0)>-1?r349:-1);r349=HEAP32[r64];r351=HEAP32[r65];_memcpy(r352,r349,r351+1|0);if((r349|0)==(r67|0)|(r349|0)==0){r353=r351}else{__ZdlPv(r349);r353=HEAP32[r65]}HEAP32[r64]=r352;r354=r353;r355=r352}else{r354=r350;r355=HEAP32[r64]}_memcpy(r355+r354|0,5248048,48);r354=HEAP32[r65]+48|0;HEAP32[r65]=r354;HEAP8[HEAP32[r64]+r354|0]=0;r354=HEAP32[r66];r355=HEAP32[r65];r350=r355+22|0;if((r354|0)<(r350|0)){r352=HEAP32[r61];r353=r354;while(1){r356=r353+r352|0;if((r356|0)<(r350|0)){r353=r356}else{break}}HEAP32[r66]=r356;r353=r356+1|0;r356=__Znaj((r353|0)>-1?r353:-1);r353=HEAP32[r64];r350=HEAP32[r65];_memcpy(r356,r353,r350+1|0);if((r353|0)==(r67|0)|(r353|0)==0){r357=r350}else{__ZdlPv(r353);r357=HEAP32[r65]}HEAP32[r64]=r356;r358=r357;r359=r356}else{r358=r355;r359=HEAP32[r64]}_memcpy(r359+r358|0,5247816,22);r358=HEAP32[r65]+22|0;HEAP32[r65]=r358;HEAP8[HEAP32[r64]+r358|0]=0;r358=HEAP32[r66];r359=HEAP32[r65];r355=r359+13|0;if((r358|0)<(r355|0)){r356=HEAP32[r61];r357=r358;while(1){r360=r357+r356|0;if((r360|0)<(r355|0)){r357=r360}else{break}}HEAP32[r66]=r360;r357=r360+1|0;r360=__Znaj((r357|0)>-1?r357:-1);r357=HEAP32[r64];r355=HEAP32[r65];_memcpy(r360,r357,r355+1|0);if((r357|0)==(r67|0)|(r357|0)==0){r361=r355}else{__ZdlPv(r357);r361=HEAP32[r65]}HEAP32[r64]=r360;r362=r361;r363=r360}else{r362=r359;r363=HEAP32[r64]}_memcpy(r363+r362|0,5247604,13);r362=HEAP32[r65]+13|0;HEAP32[r65]=r362;HEAP8[HEAP32[r64]+r362|0]=0;r362=HEAP32[r66];r363=HEAP32[r65];r359=r363+71|0;if((r362|0)<(r359|0)){r360=HEAP32[r61];r361=r362;while(1){r364=r361+r360|0;if((r364|0)<(r359|0)){r361=r364}else{break}}HEAP32[r66]=r364;r361=r364+1|0;r364=__Znaj((r361|0)>-1?r361:-1);r361=HEAP32[r64];r359=HEAP32[r65];_memcpy(r364,r361,r359+1|0);if((r361|0)==(r67|0)|(r361|0)==0){r365=r359}else{__ZdlPv(r361);r365=HEAP32[r65]}HEAP32[r64]=r364;r366=r365;r367=r364}else{r366=r363;r367=HEAP32[r64]}_memcpy(r367+r366|0,5246968,71);r366=HEAP32[r65]+71|0;HEAP32[r65]=r366;HEAP8[HEAP32[r64]+r366|0]=0;r366=HEAP32[r66];r367=HEAP32[r65];r363=r367+2|0;if((r366|0)<(r363|0)){r364=HEAP32[r61];r365=r366;while(1){r368=r365+r364|0;if((r368|0)<(r363|0)){r365=r368}else{break}}HEAP32[r66]=r368;r365=r368+1|0;r368=__Znaj((r365|0)>-1?r365:-1);r365=HEAP32[r64];r363=HEAP32[r65];_memcpy(r368,r365,r363+1|0);if((r365|0)==(r67|0)|(r365|0)==0){r369=r363}else{__ZdlPv(r365);r369=HEAP32[r65]}HEAP32[r64]=r368;r370=r369;r371=r368}else{r370=r367;r371=HEAP32[r64]}r367=r371+r370|0;tempBigInt=2685;HEAP8[r367]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r367+1|0]=tempBigInt&255;r367=HEAP32[r65]+2|0;HEAP32[r65]=r367;HEAP8[HEAP32[r64]+r367|0]=0;HEAP32[r2+364]=FUNCTION_TABLE[HEAP32[HEAP32[r83]+328>>2]](r1,5246728,HEAP32[r9],HEAP32[r64],5277492);HEAP32[r10]=0;HEAP8[HEAP32[r9]]=0;r367=HEAP32[r7];r370=HEAP32[r10];r371=r370+25|0;if((r367|0)<(r371|0)){r368=HEAP32[r11];r369=r367;while(1){r372=r369+r368|0;if((r372|0)<(r371|0)){r369=r372}else{break}}HEAP32[r7]=r372;r369=r372+1|0;r372=__Znaj((r369|0)>-1?r369:-1);r369=HEAP32[r9];r371=HEAP32[r10];_memcpy(r372,r369,r371+1|0);if((r369|0)==(r8|0)|(r369|0)==0){r373=r371}else{__ZdlPv(r369);r373=HEAP32[r10]}HEAP32[r9]=r372;r374=r373;r375=r372}else{r374=r370;r375=HEAP32[r9]}_memcpy(r375+r374|0,5251496,25);r374=HEAP32[r10]+25|0;HEAP32[r10]=r374;HEAP8[HEAP32[r9]+r374|0]=0;r374=HEAP32[r7];r375=HEAP32[r10];r370=r375+21|0;if((r374|0)<(r370|0)){r372=HEAP32[r11];r373=r374;while(1){r376=r373+r372|0;if((r376|0)<(r370|0)){r373=r376}else{break}}HEAP32[r7]=r376;r373=r376+1|0;r376=__Znaj((r373|0)>-1?r373:-1);r373=HEAP32[r9];r370=HEAP32[r10];_memcpy(r376,r373,r370+1|0);if((r373|0)==(r8|0)|(r373|0)==0){r377=r370}else{__ZdlPv(r373);r377=HEAP32[r10]}HEAP32[r9]=r376;r378=r377;r379=r376}else{r378=r375;r379=HEAP32[r9]}_memcpy(r379+r378|0,5251296,21);r378=HEAP32[r10]+21|0;HEAP32[r10]=r378;HEAP8[HEAP32[r9]+r378|0]=0;r378=HEAP32[r7];r379=HEAP32[r10];r375=r379+23|0;if((r378|0)<(r375|0)){r376=HEAP32[r11];r377=r378;while(1){r380=r377+r376|0;if((r380|0)<(r375|0)){r377=r380}else{break}}HEAP32[r7]=r380;r377=r380+1|0;r380=__Znaj((r377|0)>-1?r377:-1);r377=HEAP32[r9];r375=HEAP32[r10];_memcpy(r380,r377,r375+1|0);if((r377|0)==(r8|0)|(r377|0)==0){r381=r375}else{__ZdlPv(r377);r381=HEAP32[r10]}HEAP32[r9]=r380;r382=r381;r383=r380}else{r382=r379;r383=HEAP32[r9]}_memcpy(r383+r382|0,5251060,23);r382=HEAP32[r10]+23|0;HEAP32[r10]=r382;HEAP8[HEAP32[r9]+r382|0]=0;r382=HEAP32[r7];r383=HEAP32[r10];r379=r383+26|0;if((r382|0)<(r379|0)){r380=HEAP32[r11];r381=r382;while(1){r384=r381+r380|0;if((r384|0)<(r379|0)){r381=r384}else{break}}HEAP32[r7]=r384;r381=r384+1|0;r384=__Znaj((r381|0)>-1?r381:-1);r381=HEAP32[r9];r379=HEAP32[r10];_memcpy(r384,r381,r379+1|0);if((r381|0)==(r8|0)|(r381|0)==0){r385=r379}else{__ZdlPv(r381);r385=HEAP32[r10]}HEAP32[r9]=r384;r386=r385;r387=r384}else{r386=r383;r387=HEAP32[r9]}_memcpy(r387+r386|0,5250816,26);r386=HEAP32[r10]+26|0;HEAP32[r10]=r386;HEAP8[HEAP32[r9]+r386|0]=0;r386=HEAP32[r7];r387=HEAP32[r10];r383=r387+30|0;if((r386|0)<(r383|0)){r384=HEAP32[r11];r385=r386;while(1){r388=r385+r384|0;if((r388|0)<(r383|0)){r385=r388}else{break}}HEAP32[r7]=r388;r385=r388+1|0;r388=__Znaj((r385|0)>-1?r385:-1);r385=HEAP32[r9];r383=HEAP32[r10];_memcpy(r388,r385,r383+1|0);if((r385|0)==(r8|0)|(r385|0)==0){r389=r383}else{__ZdlPv(r385);r389=HEAP32[r10]}HEAP32[r9]=r388;r390=r389;r391=r388}else{r390=r387;r391=HEAP32[r9]}_memcpy(r391+r390|0,5250560,30);r390=HEAP32[r10]+30|0;HEAP32[r10]=r390;HEAP8[HEAP32[r9]+r390|0]=0;r390=HEAP32[r7];r391=HEAP32[r10];r387=r391+19|0;if((r390|0)<(r387|0)){r388=HEAP32[r11];r389=r390;while(1){r392=r389+r388|0;if((r392|0)<(r387|0)){r389=r392}else{break}}HEAP32[r7]=r392;r389=r392+1|0;r392=__Znaj((r389|0)>-1?r389:-1);r389=HEAP32[r9];r387=HEAP32[r10];_memcpy(r392,r389,r387+1|0);if((r389|0)==(r8|0)|(r389|0)==0){r393=r387}else{__ZdlPv(r389);r393=HEAP32[r10]}HEAP32[r9]=r392;r394=r393;r395=r392}else{r394=r391;r395=HEAP32[r9]}_memcpy(r395+r394|0,5250184,19);r394=HEAP32[r10]+19|0;HEAP32[r10]=r394;HEAP8[HEAP32[r9]+r394|0]=0;r394=HEAP32[r7];r395=HEAP32[r10];r391=r395+17|0;if((r394|0)<(r391|0)){r392=HEAP32[r11];r393=r394;while(1){r396=r393+r392|0;if((r396|0)<(r391|0)){r393=r396}else{break}}HEAP32[r7]=r396;r393=r396+1|0;r396=__Znaj((r393|0)>-1?r393:-1);r393=HEAP32[r9];r391=HEAP32[r10];_memcpy(r396,r393,r391+1|0);if((r393|0)==(r8|0)|(r393|0)==0){r397=r391}else{__ZdlPv(r393);r397=HEAP32[r10]}HEAP32[r9]=r396;r398=r397;r399=r396}else{r398=r395;r399=HEAP32[r9]}_memcpy(r399+r398|0,5249912,17);r398=HEAP32[r10]+17|0;HEAP32[r10]=r398;HEAP8[HEAP32[r9]+r398|0]=0;r398=HEAP32[r7];r399=HEAP32[r10];r395=r399+3|0;if((r398|0)<(r395|0)){r396=HEAP32[r11];r397=r398;while(1){r400=r397+r396|0;if((r400|0)<(r395|0)){r397=r400}else{break}}HEAP32[r7]=r400;r397=r400+1|0;r400=__Znaj((r397|0)>-1?r397:-1);r397=HEAP32[r9];r395=HEAP32[r10];_memcpy(r400,r397,r395+1|0);if((r397|0)==(r8|0)|(r397|0)==0){r401=r395}else{__ZdlPv(r397);r401=HEAP32[r10]}HEAP32[r9]=r400;r402=r401;r403=r400}else{r402=r399;r403=HEAP32[r9]}r399=r403+r402|0;HEAP8[r399]=HEAP8[5249688];HEAP8[r399+1|0]=HEAP8[5249689|0];HEAP8[r399+2|0]=HEAP8[5249690|0];r399=HEAP32[r10]+3|0;HEAP32[r10]=r399;HEAP8[HEAP32[r9]+r399|0]=0;r399=HEAP32[r7];r402=HEAP32[r10];r403=r402+24|0;if((r399|0)<(r403|0)){r400=HEAP32[r11];r401=r399;while(1){r404=r401+r400|0;if((r404|0)<(r403|0)){r401=r404}else{break}}HEAP32[r7]=r404;r401=r404+1|0;r404=__Znaj((r401|0)>-1?r401:-1);r401=HEAP32[r9];r403=HEAP32[r10];_memcpy(r404,r401,r403+1|0);if((r401|0)==(r8|0)|(r401|0)==0){r405=r403}else{__ZdlPv(r401);r405=HEAP32[r10]}HEAP32[r9]=r404;r406=r405;r407=r404}else{r406=r402;r407=HEAP32[r9]}_memcpy(r407+r406|0,5249476,24);r406=HEAP32[r10]+24|0;HEAP32[r10]=r406;HEAP8[HEAP32[r9]+r406|0]=0;r406=HEAP32[r7];r407=HEAP32[r10];r402=r407+69|0;if((r406|0)<(r402|0)){r404=HEAP32[r11];r405=r406;while(1){r408=r405+r404|0;if((r408|0)<(r402|0)){r405=r408}else{break}}HEAP32[r7]=r408;r405=r408+1|0;r408=__Znaj((r405|0)>-1?r405:-1);r405=HEAP32[r9];r402=HEAP32[r10];_memcpy(r408,r405,r402+1|0);if((r405|0)==(r8|0)|(r405|0)==0){r409=r402}else{__ZdlPv(r405);r409=HEAP32[r10]}HEAP32[r9]=r408;r410=r409;r411=r408}else{r410=r407;r411=HEAP32[r9]}_memcpy(r411+r410|0,5249244,69);r410=HEAP32[r10]+69|0;HEAP32[r10]=r410;HEAP8[HEAP32[r9]+r410|0]=0;r410=HEAP32[r7];r411=HEAP32[r10];r407=r411+69|0;if((r410|0)<(r407|0)){r408=HEAP32[r11];r409=r410;while(1){r412=r409+r408|0;if((r412|0)<(r407|0)){r409=r412}else{break}}HEAP32[r7]=r412;r409=r412+1|0;r412=__Znaj((r409|0)>-1?r409:-1);r409=HEAP32[r9];r407=HEAP32[r10];_memcpy(r412,r409,r407+1|0);if((r409|0)==(r8|0)|(r409|0)==0){r413=r407}else{__ZdlPv(r409);r413=HEAP32[r10]}HEAP32[r9]=r412;r414=r413;r415=r412}else{r414=r411;r415=HEAP32[r9]}_memcpy(r415+r414|0,5251152,69);r414=HEAP32[r10]+69|0;HEAP32[r10]=r414;HEAP8[HEAP32[r9]+r414|0]=0;r414=HEAP32[r7];r415=HEAP32[r10];r411=r415+23|0;if((r414|0)<(r411|0)){r412=HEAP32[r11];r413=r414;while(1){r416=r413+r412|0;if((r416|0)<(r411|0)){r413=r416}else{break}}HEAP32[r7]=r416;r413=r416+1|0;r416=__Znaj((r413|0)>-1?r413:-1);r413=HEAP32[r9];r411=HEAP32[r10];_memcpy(r416,r413,r411+1|0);if((r413|0)==(r8|0)|(r413|0)==0){r417=r411}else{__ZdlPv(r413);r417=HEAP32[r10]}HEAP32[r9]=r416;r418=r417;r419=r416}else{r418=r415;r419=HEAP32[r9]}_memcpy(r419+r418|0,5248856,23);r418=HEAP32[r10]+23|0;HEAP32[r10]=r418;HEAP8[HEAP32[r9]+r418|0]=0;r418=HEAP32[r7];r419=HEAP32[r10];r415=r419+23|0;if((r418|0)<(r415|0)){r416=HEAP32[r11];r417=r418;while(1){r420=r417+r416|0;if((r420|0)<(r415|0)){r417=r420}else{break}}HEAP32[r7]=r420;r417=r420+1|0;r420=__Znaj((r417|0)>-1?r417:-1);r417=HEAP32[r9];r415=HEAP32[r10];_memcpy(r420,r417,r415+1|0);if((r417|0)==(r8|0)|(r417|0)==0){r421=r415}else{__ZdlPv(r417);r421=HEAP32[r10]}HEAP32[r9]=r420;r422=r421;r423=r420}else{r422=r419;r423=HEAP32[r9]}_memcpy(r423+r422|0,5248728,23);r422=HEAP32[r10]+23|0;HEAP32[r10]=r422;HEAP8[HEAP32[r9]+r422|0]=0;r422=HEAP32[r7];r423=HEAP32[r10];r419=r423+2|0;if((r422|0)<(r419|0)){r420=HEAP32[r11];r11=r422;while(1){r424=r11+r420|0;if((r424|0)<(r419|0)){r11=r424}else{break}}HEAP32[r7]=r424;r7=r424+1|0;r424=__Znaj((r7|0)>-1?r7:-1);r7=HEAP32[r9];r11=HEAP32[r10];_memcpy(r424,r7,r11+1|0);if((r7|0)==(r8|0)|(r7|0)==0){r425=r11}else{__ZdlPv(r7);r425=HEAP32[r10]}HEAP32[r9]=r424;r426=r425;r427=r424}else{r426=r423;r427=HEAP32[r9]}r423=r427+r426|0;tempBigInt=2685;HEAP8[r423]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r423+1|0]=tempBigInt&255;r423=HEAP32[r10]+2|0;HEAP32[r10]=r423;HEAP8[HEAP32[r9]+r423|0]=0;HEAP32[r65]=0;HEAP8[HEAP32[r64]]=0;r423=HEAP32[r66];r10=HEAP32[r65];r426=r10+25|0;if((r423|0)<(r426|0)){r427=HEAP32[r61];r424=r423;while(1){r428=r424+r427|0;if((r428|0)<(r426|0)){r424=r428}else{break}}HEAP32[r66]=r428;r424=r428+1|0;r428=__Znaj((r424|0)>-1?r424:-1);r424=HEAP32[r64];r426=HEAP32[r65];_memcpy(r428,r424,r426+1|0);if((r424|0)==(r67|0)|(r424|0)==0){r429=r426}else{__ZdlPv(r424);r429=HEAP32[r65]}HEAP32[r64]=r428;r430=r429;r431=r428}else{r430=r10;r431=HEAP32[r64]}_memcpy(r431+r430|0,5251496,25);r430=HEAP32[r65]+25|0;HEAP32[r65]=r430;HEAP8[HEAP32[r64]+r430|0]=0;r430=HEAP32[r66];r431=HEAP32[r65];r10=r431+34|0;if((r430|0)<(r10|0)){r428=HEAP32[r61];r429=r430;while(1){r432=r429+r428|0;if((r432|0)<(r10|0)){r429=r432}else{break}}HEAP32[r66]=r432;r429=r432+1|0;r432=__Znaj((r429|0)>-1?r429:-1);r429=HEAP32[r64];r10=HEAP32[r65];_memcpy(r432,r429,r10+1|0);if((r429|0)==(r67|0)|(r429|0)==0){r433=r10}else{__ZdlPv(r429);r433=HEAP32[r65]}HEAP32[r64]=r432;r434=r433;r435=r432}else{r434=r431;r435=HEAP32[r64]}_memcpy(r435+r434|0,5248288,34);r434=HEAP32[r65]+34|0;HEAP32[r65]=r434;HEAP8[HEAP32[r64]+r434|0]=0;r434=HEAP32[r66];r435=HEAP32[r65];r431=r435+24|0;if((r434|0)<(r431|0)){r432=HEAP32[r61];r433=r434;while(1){r436=r433+r432|0;if((r436|0)<(r431|0)){r433=r436}else{break}}HEAP32[r66]=r436;r433=r436+1|0;r436=__Znaj((r433|0)>-1?r433:-1);r433=HEAP32[r64];r431=HEAP32[r65];_memcpy(r436,r433,r431+1|0);if((r433|0)==(r67|0)|(r433|0)==0){r437=r431}else{__ZdlPv(r433);r437=HEAP32[r65]}HEAP32[r64]=r436;r438=r437;r439=r436}else{r438=r435;r439=HEAP32[r64]}_memcpy(r439+r438|0,5248480,24);r438=HEAP32[r65]+24|0;HEAP32[r65]=r438;HEAP8[HEAP32[r64]+r438|0]=0;r438=HEAP32[r66];r439=HEAP32[r65];r435=r439+19|0;if((r438|0)<(r435|0)){r436=HEAP32[r61];r437=r438;while(1){r440=r437+r436|0;if((r440|0)<(r435|0)){r437=r440}else{break}}HEAP32[r66]=r440;r437=r440+1|0;r440=__Znaj((r437|0)>-1?r437:-1);r437=HEAP32[r64];r435=HEAP32[r65];_memcpy(r440,r437,r435+1|0);if((r437|0)==(r67|0)|(r437|0)==0){r441=r435}else{__ZdlPv(r437);r441=HEAP32[r65]}HEAP32[r64]=r440;r442=r441;r443=r440}else{r442=r439;r443=HEAP32[r64]}_memcpy(r443+r442|0,5250184,19);r442=HEAP32[r65]+19|0;HEAP32[r65]=r442;HEAP8[HEAP32[r64]+r442|0]=0;r442=HEAP32[r66];r443=HEAP32[r65];r439=r443+17|0;if((r442|0)<(r439|0)){r440=HEAP32[r61];r441=r442;while(1){r444=r441+r440|0;if((r444|0)<(r439|0)){r441=r444}else{break}}HEAP32[r66]=r444;r441=r444+1|0;r444=__Znaj((r441|0)>-1?r441:-1);r441=HEAP32[r64];r439=HEAP32[r65];_memcpy(r444,r441,r439+1|0);if((r441|0)==(r67|0)|(r441|0)==0){r445=r439}else{__ZdlPv(r441);r445=HEAP32[r65]}HEAP32[r64]=r444;r446=r445;r447=r444}else{r446=r443;r447=HEAP32[r64]}_memcpy(r447+r446|0,5249912,17);r446=HEAP32[r65]+17|0;HEAP32[r65]=r446;HEAP8[HEAP32[r64]+r446|0]=0;r446=HEAP32[r66];r447=HEAP32[r65];r443=r447+3|0;if((r446|0)<(r443|0)){r444=HEAP32[r61];r445=r446;while(1){r448=r445+r444|0;if((r448|0)<(r443|0)){r445=r448}else{break}}HEAP32[r66]=r448;r445=r448+1|0;r448=__Znaj((r445|0)>-1?r445:-1);r445=HEAP32[r64];r443=HEAP32[r65];_memcpy(r448,r445,r443+1|0);if((r445|0)==(r67|0)|(r445|0)==0){r449=r443}else{__ZdlPv(r445);r449=HEAP32[r65]}HEAP32[r64]=r448;r450=r449;r451=r448}else{r450=r447;r451=HEAP32[r64]}r447=r451+r450|0;HEAP8[r447]=HEAP8[5249688];HEAP8[r447+1|0]=HEAP8[5249689|0];HEAP8[r447+2|0]=HEAP8[5249690|0];r447=HEAP32[r65]+3|0;HEAP32[r65]=r447;HEAP8[HEAP32[r64]+r447|0]=0;r447=HEAP32[r66];r450=HEAP32[r65];r451=r450+48|0;if((r447|0)<(r451|0)){r448=HEAP32[r61];r449=r447;while(1){r452=r449+r448|0;if((r452|0)<(r451|0)){r449=r452}else{break}}HEAP32[r66]=r452;r449=r452+1|0;r452=__Znaj((r449|0)>-1?r449:-1);r449=HEAP32[r64];r451=HEAP32[r65];_memcpy(r452,r449,r451+1|0);if((r449|0)==(r67|0)|(r449|0)==0){r453=r451}else{__ZdlPv(r449);r453=HEAP32[r65]}HEAP32[r64]=r452;r454=r453;r455=r452}else{r454=r450;r455=HEAP32[r64]}_memcpy(r455+r454|0,5248048,48);r454=HEAP32[r65]+48|0;HEAP32[r65]=r454;HEAP8[HEAP32[r64]+r454|0]=0;r454=HEAP32[r66];r455=HEAP32[r65];r450=r455+22|0;if((r454|0)<(r450|0)){r452=HEAP32[r61];r453=r454;while(1){r456=r453+r452|0;if((r456|0)<(r450|0)){r453=r456}else{break}}HEAP32[r66]=r456;r453=r456+1|0;r456=__Znaj((r453|0)>-1?r453:-1);r453=HEAP32[r64];r450=HEAP32[r65];_memcpy(r456,r453,r450+1|0);if((r453|0)==(r67|0)|(r453|0)==0){r457=r450}else{__ZdlPv(r453);r457=HEAP32[r65]}HEAP32[r64]=r456;r458=r457;r459=r456}else{r458=r455;r459=HEAP32[r64]}_memcpy(r459+r458|0,5247816,22);r458=HEAP32[r65]+22|0;HEAP32[r65]=r458;HEAP8[HEAP32[r64]+r458|0]=0;r458=HEAP32[r66];r459=HEAP32[r65];r455=r459+13|0;if((r458|0)<(r455|0)){r456=HEAP32[r61];r457=r458;while(1){r460=r457+r456|0;if((r460|0)<(r455|0)){r457=r460}else{break}}HEAP32[r66]=r460;r457=r460+1|0;r460=__Znaj((r457|0)>-1?r457:-1);r457=HEAP32[r64];r455=HEAP32[r65];_memcpy(r460,r457,r455+1|0);if((r457|0)==(r67|0)|(r457|0)==0){r461=r455}else{__ZdlPv(r457);r461=HEAP32[r65]}HEAP32[r64]=r460;r462=r461;r463=r460}else{r462=r459;r463=HEAP32[r64]}_memcpy(r463+r462|0,5247604,13);r462=HEAP32[r65]+13|0;HEAP32[r65]=r462;HEAP8[HEAP32[r64]+r462|0]=0;r462=HEAP32[r66];r463=HEAP32[r65];r459=r463+61|0;if((r462|0)<(r459|0)){r460=HEAP32[r61];r461=r462;while(1){r464=r461+r460|0;if((r464|0)<(r459|0)){r461=r464}else{break}}HEAP32[r66]=r464;r461=r464+1|0;r464=__Znaj((r461|0)>-1?r461:-1);r461=HEAP32[r64];r459=HEAP32[r65];_memcpy(r464,r461,r459+1|0);if((r461|0)==(r67|0)|(r461|0)==0){r465=r459}else{__ZdlPv(r461);r465=HEAP32[r65]}HEAP32[r64]=r464;r466=r465;r467=r464}else{r466=r463;r467=HEAP32[r64]}_memcpy(r467+r466|0,5246536,61);r466=HEAP32[r65]+61|0;HEAP32[r65]=r466;HEAP8[HEAP32[r64]+r466|0]=0;r466=HEAP32[r66];r467=HEAP32[r65];r463=r467+2|0;if((r466|0)<(r463|0)){r464=HEAP32[r61];r61=r466;while(1){r468=r61+r464|0;if((r468|0)<(r463|0)){r61=r468}else{break}}HEAP32[r66]=r468;r66=r468+1|0;r468=__Znaj((r66|0)>-1?r66:-1);r66=HEAP32[r64];r61=HEAP32[r65];_memcpy(r468,r66,r61+1|0);if((r66|0)==(r67|0)|(r66|0)==0){r469=r61}else{__ZdlPv(r66);r469=HEAP32[r65]}HEAP32[r64]=r468;r470=r469;r471=r468}else{r470=r467;r471=HEAP32[r64]}r467=r471+r470|0;tempBigInt=2685;HEAP8[r467]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r467+1|0]=tempBigInt&255;r467=HEAP32[r65]+2|0;HEAP32[r65]=r467;HEAP8[HEAP32[r64]+r467|0]=0;HEAP32[r2+365]=FUNCTION_TABLE[HEAP32[HEAP32[r83]+328>>2]](r1,5246368,HEAP32[r9],HEAP32[r64],5277492);HEAP32[r63>>2]=5259300;r63=HEAP32[r64];if(!((r63|0)==(r67|0)|(r63|0)==0)){__ZdlPv(r63)}HEAP32[r6>>2]=5259300;r6=HEAP32[r9];if((r6|0)==(r8|0)|(r6|0)==0){STACKTOP=r3;return}__ZdlPv(r6);STACKTOP=r3;return}function __ZN14mgWebGLDisplay17getOverlayShadersERP8mgShaderS2_S2_S2_S2_(r1,r2,r3,r4,r5,r6){var r7;r7=r1>>2;HEAP32[r2>>2]=HEAP32[r7+361];HEAP32[r3>>2]=HEAP32[r7+362];HEAP32[r4>>2]=HEAP32[r7+363];HEAP32[r5>>2]=HEAP32[r7+364];HEAP32[r6>>2]=HEAP32[r7+365];return}function __ZN18mgWebGLIndexBufferD0Ev(r1){var r2,r3,r4;r2=r1|0;HEAP32[r2>>2]=5260168;r3=r1+32|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteBuffers(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5268352;r2=(r1+4|0)>>2;r3=HEAP32[r2];if((r3|0)==0){HEAP32[r2]=0;r4=r1;__ZdlPv(r4);return}__ZdlPv(r3);HEAP32[r2]=0;r4=r1;__ZdlPv(r4);return}function __ZN18mgWebGLIndexBufferD2Ev(r1){var r2,r3;r2=r1|0;HEAP32[r2>>2]=5260168;r3=r1+32|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteBuffers(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5268352;r2=(r1+4|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}__ZdlPv(r1);HEAP32[r2]=0;return}function __ZN18mgWebGLIndexBuffer13unloadDisplayEv(r1){var r2;r2=r1+32|0;if((HEAP32[r2>>2]|0)==0){return}_glDeleteBuffers(1,r2);HEAP32[r2>>2]=0;return}function __Z17WebGLgetShaderLogjR8mgString(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;_glGetShaderiv(r1,35716,r4);r6=HEAP32[r4>>2];r7=__Znaj((r6|0)>-1?r6:-1);_glGetShaderInfoLog(r1,HEAP32[r4>>2],r5,r7);r4=(r2+8|0)>>2;HEAP32[r4]=0;r1=(r2+16|0)>>2;HEAP8[HEAP32[r1]]=0;r6=HEAP32[r5>>2];r5=r2+4|0;r8=HEAP32[r5>>2];r9=HEAP32[r4];r10=r9+r6|0;if((r8|0)<(r10|0)){r11=HEAP32[r2+12>>2];r12=r8;while(1){r13=r12+r11|0;if((r13|0)<(r10|0)){r12=r13}else{break}}HEAP32[r5>>2]=r13;r5=r13+1|0;r13=__Znaj((r5|0)>-1?r5:-1);r5=HEAP32[r1];r12=HEAP32[r4];_memcpy(r13,r5,r12+1|0);if((r5|0)==(r2+20|0)|(r5|0)==0){r14=r12}else{__ZdlPv(r5);r14=HEAP32[r4]}HEAP32[r1]=r13;r15=r14;r16=r13}else{r15=r9;r16=HEAP32[r1]}_memcpy(r16+r15|0,r7,r6);r15=HEAP32[r4]+r6|0;HEAP32[r4]=r15;HEAP8[HEAP32[r1]+r15|0]=0;if((r7|0)==0){STACKTOP=r3;return}__ZdlPv(r7);STACKTOP=r3;return}function __Z19WebGLloadShaderFilePKcj(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=_fopen(r1,5253228);if((r4|0)==0){r5=0;STACKTOP=r3;return r5}_fseek(r4,0,2);r1=_ftell(r4);_fseek(r4,0,0);r6=r1+1|0;r7=__Znaj((r6|0)>-1?r6:-1);HEAP8[r7+_fread(r7,1,r1,r4)|0]=0;_fclose(r4);r4=r3|0;HEAP32[r4>>2]=r7;_glShaderSource(r2,1,r4,0);if((r7|0)==0){r5=1;STACKTOP=r3;return r5}__ZdlPv(r7);r5=1;STACKTOP=r3;return r5}function __Z22WebGLcompileShaderPairPKcjS0_jS0_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r6=STACKTOP;STACKTOP=STACKTOP+172|0;r7=r6;r8=r6+4,r9=r8>>2;r10=r6+88;r11=r8|0;HEAP32[r11>>2]=5259300;HEAP32[r9+1]=63;r12=r8+20|0;r13=(r8+16|0)>>2;HEAP32[r13]=r12;HEAP32[r9+2]=0;HEAP8[r12]=0;HEAP32[r9+3]=128;__ZN8mgString6formatEPKcz(r8,5245840,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r1,HEAP32[tempInt+4>>2]=r3,tempInt));__Z15mgOSFixFileNameR8mgString(r8);do{if((__Z19WebGLloadShaderFilePKcj(HEAP32[r13],r2)|0)==0){__Z7mgDebugPKcz(5257572,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r13],tempInt));r14=0}else{r3=r10|0;HEAP32[r3>>2]=5259300;HEAP32[r10+4>>2]=63;r9=r10+20|0;r15=(r10+16|0)>>2;HEAP32[r15]=r9;r16=(r10+8|0)>>2;HEAP32[r16]=0;HEAP8[r9]=0;HEAP32[r10+12>>2]=128;_glCompileShader(r2);__Z17WebGLgetShaderLogjR8mgString(r2,r10);r17=HEAP32[r16];while(1){r18=r17-1|0;if((r17|0)<=0){break}r19=HEAP8[HEAP32[r15]+r18|0]<<24>>24;if((r19&128|0)!=0){break}if((_isspace(r19)|0)==0){break}else{r17=r18}}HEAP32[r16]=r17;HEAP8[HEAP32[r15]+r17|0]=0;r18=0;while(1){if((r18|0)>=(HEAP32[r16]|0)){break}r19=HEAP8[HEAP32[r15]+r18|0]<<24>>24;if((r19&128|0)!=0){break}if((_isspace(r19)|0)==0){break}else{r18=r18+1|0}}if((r18|0)>0){r17=HEAP32[r15];_memmove(r17,r17+r18|0,HEAP32[r16]-r18|0,1,0);r17=HEAP32[r16]-r18|0;HEAP32[r16]=r17;HEAP8[HEAP32[r15]+r17|0]=0}r17=HEAP32[r13];if((HEAP32[r16]|0)==0){__Z7mgDebugPKcz(5257064,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r17,tempInt))}else{r19=HEAP32[r15];__Z7mgDebugPKcz(5256320,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r17,HEAP32[tempInt+4>>2]=r19,tempInt))}_glGetShaderiv(r2,35713,r7);do{if((HEAP32[r7>>2]|0)==0){__Z7mgDebugPKcz(5255896,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r13],tempInt));r20=0}else{__ZN8mgString6formatEPKcz(r8,5245840,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r1,HEAP32[tempInt+4>>2]=r5,tempInt));__Z15mgOSFixFileNameR8mgString(r8);if((__Z19WebGLloadShaderFilePKcj(HEAP32[r13],r4)|0)==0){__Z7mgDebugPKcz(5257572,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r13],tempInt));r20=0;break}_glCompileShader(r4);__Z17WebGLgetShaderLogjR8mgString(r4,r10);r19=HEAP32[r16];while(1){r17=r19-1|0;if((r19|0)<=0){break}r21=HEAP8[HEAP32[r15]+r17|0]<<24>>24;if((r21&128|0)!=0){break}if((_isspace(r21)|0)==0){break}else{r19=r17}}HEAP32[r16]=r19;HEAP8[HEAP32[r15]+r19|0]=0;r17=0;while(1){if((r17|0)>=(HEAP32[r16]|0)){break}r21=HEAP8[HEAP32[r15]+r17|0]<<24>>24;if((r21&128|0)!=0){break}if((_isspace(r21)|0)==0){break}else{r17=r17+1|0}}if((r17|0)>0){r19=HEAP32[r15];_memmove(r19,r19+r17|0,HEAP32[r16]-r17|0,1,0);r19=HEAP32[r16]-r17|0;HEAP32[r16]=r19;HEAP8[HEAP32[r15]+r19|0]=0}r19=HEAP32[r13];if((HEAP32[r16]|0)==0){__Z7mgDebugPKcz(5257064,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r19,tempInt))}else{r21=HEAP32[r15];__Z7mgDebugPKcz(5256320,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r19,HEAP32[tempInt+4>>2]=r21,tempInt))}_glGetShaderiv(r4,35713,r7);if((HEAP32[r7>>2]|0)!=0){r20=1;break}__Z7mgDebugPKcz(5255896,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r13],tempInt));r20=0}}while(0);HEAP32[r3>>2]=5259300;r16=HEAP32[r15];if((r16|0)==(r9|0)|(r16|0)==0){r14=r20;break}__ZdlPv(r16);r14=r20}}while(0);HEAP32[r11>>2]=5259300;r11=HEAP32[r13];if((r11|0)==(r12|0)|(r11|0)==0){STACKTOP=r6;return r14}__ZdlPv(r11);STACKTOP=r6;return r14}function __ZN8mgString4trimEv(r1){var r2,r3,r4,r5;r2=(r1+8|0)>>2;r3=(r1+16|0)>>2;r1=HEAP32[r2];while(1){r4=r1-1|0;if((r1|0)<=0){break}r5=HEAP8[HEAP32[r3]+r4|0]<<24>>24;if((r5&128|0)!=0){break}if((_isspace(r5)|0)==0){break}else{r1=r4}}HEAP32[r2]=r1;HEAP8[HEAP32[r3]+r1|0]=0;r1=0;while(1){if((r1|0)>=(HEAP32[r2]|0)){break}r4=HEAP8[HEAP32[r3]+r1|0]<<24>>24;if((r4&128|0)!=0){break}if((_isspace(r4)|0)==0){break}else{r1=r1+1|0}}if((r1|0)<=0){return}r4=HEAP32[r3];_memmove(r4,r4+r1|0,HEAP32[r2]-r1|0,1,0);r4=HEAP32[r2]-r1|0;HEAP32[r2]=r4;HEAP8[HEAP32[r3]+r4|0]=0;return}function __ZN18mgWebGLIndexBuffer5resetEv(r1){var r2;if((HEAP32[r1+24>>2]|0)!=0){HEAP32[r1+20>>2]=0;HEAP32[r1+36>>2]=1;STACKTOP=STACKTOP;return}r1=___cxa_allocate_exception(4);r2=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r2,5252224,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r1>>2]=r2;___cxa_throw(r1,5275304,0)}function __ZN18mgWebGLIndexBuffer11loadDisplayEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=r1>>2;r3=STACKTOP;r4=r1+32|0;r5=HEAP32[r4>>2];r6=(r5|0)==0;do{if(!r6){if((HEAP32[r2+9]|0)!=0){break}STACKTOP=r3;return}}while(0);r7=(r1+4|0)>>2;if((HEAP32[r7]|0)==0){r8=___cxa_allocate_exception(4);r9=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r9,5253904,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r8>>2]=r9;___cxa_throw(r8,5275304,0)}if(r6){_glGenBuffers(1,r4);r10=HEAP32[r4>>2]}else{r10=r5}_glBindBuffer(34963,r10);r10=r1+24|0;_glBufferData(34963,Math.imul((HEAP32[r2+7]|0)!=0?4:2,HEAP32[r2+5]),HEAP32[r7],(HEAP32[r10>>2]|0)!=0?35048:35044);if((HEAP32[r10>>2]|0)==0){r10=HEAP32[r7];if((r10|0)!=0){__ZdlPv(r10)}HEAP32[r7]=0;HEAP32[r2+4]=0}HEAP32[r2+9]=0;_glBindBuffer(34963,0);STACKTOP=r3;return}function __Z28WebGLcompileShaderPairSourcePKcjS0_jS0_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r6=STACKTOP;STACKTOP=STACKTOP+92|0;r7=r6;r8=r6+8;r9=r6+4|0;HEAP32[r9>>2]=r3;_glShaderSource(r2,1,r9,0);r3=r8|0;HEAP32[r3>>2]=5259300;HEAP32[r8+4>>2]=63;r10=r8+20|0;r11=(r8+16|0)>>2;HEAP32[r11]=r10;r12=(r8+8|0)>>2;HEAP32[r12]=0;HEAP8[r10]=0;HEAP32[r8+12>>2]=128;_glCompileShader(r2);__Z17WebGLgetShaderLogjR8mgString(r2,r8);r13=HEAP32[r12];while(1){r14=r13-1|0;if((r13|0)<=0){break}r15=HEAP8[HEAP32[r11]+r14|0]<<24>>24;if((r15&128|0)!=0){break}if((_isspace(r15)|0)==0){break}else{r13=r14}}HEAP32[r12]=r13;HEAP8[HEAP32[r11]+r13|0]=0;r13=0;while(1){if((r13|0)>=(HEAP32[r12]|0)){break}r14=HEAP8[HEAP32[r11]+r13|0]<<24>>24;if((r14&128|0)!=0){break}if((_isspace(r14)|0)==0){break}else{r13=r13+1|0}}if((r13|0)>0){r14=HEAP32[r11];_memmove(r14,r14+r13|0,HEAP32[r12]-r13|0,1,0);r14=HEAP32[r12]-r13|0;HEAP32[r12]=r14;HEAP8[HEAP32[r11]+r14|0]=0}if((HEAP32[r12]|0)==0){__Z7mgDebugPKcz(5253184,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt))}else{r14=HEAP32[r11];__Z7mgDebugPKcz(5252768,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r1,HEAP32[tempInt+4>>2]=r14,tempInt))}_glGetShaderiv(r2,35713,r7);do{if((HEAP32[r7>>2]|0)==0){__Z7mgDebugPKcz(5252496,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt));r16=0}else{HEAP32[r9>>2]=r5;_glShaderSource(r4,1,r9,0);_glCompileShader(r4);__Z17WebGLgetShaderLogjR8mgString(r4,r8);r2=HEAP32[r12];while(1){r14=r2-1|0;if((r2|0)<=0){break}r13=HEAP8[HEAP32[r11]+r14|0]<<24>>24;if((r13&128|0)!=0){break}if((_isspace(r13)|0)==0){break}else{r2=r14}}HEAP32[r12]=r2;HEAP8[HEAP32[r11]+r2|0]=0;r14=0;while(1){if((r14|0)>=(HEAP32[r12]|0)){break}r13=HEAP8[HEAP32[r11]+r14|0]<<24>>24;if((r13&128|0)!=0){break}if((_isspace(r13)|0)==0){break}else{r14=r14+1|0}}if((r14|0)>0){r2=HEAP32[r11];_memmove(r2,r2+r14|0,HEAP32[r12]-r14|0,1,0);r2=HEAP32[r12]-r14|0;HEAP32[r12]=r2;HEAP8[HEAP32[r11]+r2|0]=0}if((HEAP32[r12]|0)==0){__Z7mgDebugPKcz(5252256,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt))}else{r2=HEAP32[r11];__Z7mgDebugPKcz(5252012,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r1,HEAP32[tempInt+4>>2]=r2,tempInt))}_glGetShaderiv(r4,35713,r7);if((HEAP32[r7>>2]|0)!=0){r16=1;break}__Z7mgDebugPKcz(5251752,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt));r16=0}}while(0);HEAP32[r3>>2]=5259300;r3=HEAP32[r11];if((r3|0)==(r10|0)|(r3|0)==0){STACKTOP=r6;return r16}__ZdlPv(r3);STACKTOP=r6;return r16}function __ZN19mgWebGLVertexBufferD0Ev(r1){var r2,r3,r4;r2=r1|0;HEAP32[r2>>2]=5259952;r3=r1+28|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteBuffers(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5263996;r2=(r1+12|0)>>2;r3=HEAP32[r2];if((r3|0)==0){HEAP32[r2]=0;r4=r1;__ZdlPv(r4);return}__ZdlPv(r3);HEAP32[r2]=0;r4=r1;__ZdlPv(r4);return}function __ZN19mgWebGLVertexBufferD2Ev(r1){var r2,r3;r2=r1|0;HEAP32[r2>>2]=5259952;r3=r1+28|0;if((HEAP32[r3>>2]|0)!=0){_glDeleteBuffers(1,r3);HEAP32[r3>>2]=0}HEAP32[r2>>2]=5263996;r2=(r1+12|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}__ZdlPv(r1);HEAP32[r2]=0;return}function __ZN19mgWebGLVertexBuffer13unloadDisplayEv(r1){var r2;r2=r1+28|0;if((HEAP32[r2>>2]|0)==0){return}_glDeleteBuffers(1,r2);HEAP32[r2>>2]=0;return}function __ZN13mgIndexBufferD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5268352;r2=r1+4|0;r3=HEAP32[r2>>2];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r2>>2]=0;__ZdlPv(r1);return}function __ZN13mgIndexBufferD2Ev(r1){var r2;HEAP32[r1>>2]=5268352;r2=(r1+4|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}__ZdlPv(r1);HEAP32[r2]=0;return}function __Z21mgWebGLloadShaderPairPKcS0_S0_PK14mgVertexAttrib(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r5=STACKTOP;STACKTOP=STACKTOP+96|0;r6=r5,r7=r6>>2;r8=r5+84;r9=r5+88;r10=r5+92;r11=r6|0;HEAP32[r11>>2]=5259300;HEAP32[r7+1]=63;r12=r6+20|0;r13=(r6+16|0)>>2;HEAP32[r13]=r12;HEAP32[r7+2]=0;HEAP8[r12]=0;HEAP32[r7+3]=128;__ZN8mgString6formatEPKcz(r6,5255408,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt));r1=_glCreateShader(35633);r6=_glCreateShader(35632);if((__Z22WebGLcompileShaderPairPKcjS0_jS0_(HEAP32[r13],r1,r2,r6,r3)|0)==0){r7=___cxa_allocate_exception(4);r14=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r14,5255032,5254792,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r2,HEAP32[tempInt+4>>2]=r3,tempInt));HEAP32[r7>>2]=r14;___cxa_throw(r7,5275304,0)}r7=_glCreateProgram();_glAttachShader(r7,r1);_glAttachShader(r7,r6);r14=HEAP32[r4>>2];L3212:do{if((r14|0)!=0){r15=0;r16=r14;while(1){_glBindAttribLocation(r7,r15,r16);r17=r15+1|0;r18=HEAP32[r4+(r17*12&-1)>>2];if((r18|0)==0){break L3212}else{r15=r17;r16=r18}}}}while(0);_glLinkProgram(r7);_glDeleteShader(r1);_glDeleteShader(r6);_glGetProgramiv(r7,35714,r8);if((HEAP32[r8>>2]|0)!=0){HEAP32[r11>>2]=5259300;r11=HEAP32[r13];if((r11|0)==(r12|0)|(r11|0)==0){STACKTOP=r5;return r7}__ZdlPv(r11);STACKTOP=r5;return r7}_glGetProgramiv(r7,35716,r9);r5=HEAP32[r9>>2];r11=__Znaj((r5|0)>-1?r5:-1);_glGetProgramInfoLog(r7,HEAP32[r9>>2],r10,r11);__Z7mgDebugPKcz(5254088,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r11,tempInt));if((r11|0)!=0){__ZdlPv(r11)}_glDeleteProgram(r7);r7=___cxa_allocate_exception(4);r11=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r11,5253796,5254792,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r2,HEAP32[tempInt+4>>2]=r3,tempInt));HEAP32[r7>>2]=r11;___cxa_throw(r7,5275304,0)}function __Z27mgWebGLloadShaderPairSourcePKcS0_S0_PK14mgVertexAttrib(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+12|0;r6=r5;r7=r5+4;r8=r5+8;r9=_glCreateShader(35633);r10=_glCreateShader(35632);if((__Z28WebGLcompileShaderPairSourcePKcjS0_jS0_(r1,r9,r2,r10,r3)|0)==0){r3=___cxa_allocate_exception(4);r2=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r2,5255032,5254792,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r1,HEAP32[tempInt+4>>2]=r1,tempInt));HEAP32[r3>>2]=r2;___cxa_throw(r3,5275304,0)}r3=_glCreateProgram();_glAttachShader(r3,r9);_glAttachShader(r3,r10);r2=HEAP32[r4>>2];L3245:do{if((r2|0)!=0){r11=0;r12=r2;while(1){_glBindAttribLocation(r3,r11,r12);r13=r11+1|0;r14=HEAP32[r4+(r13*12&-1)>>2];if((r14|0)==0){break L3245}else{r11=r13;r12=r14}}}}while(0);_glLinkProgram(r3);_glDeleteShader(r9);_glDeleteShader(r10);_glGetProgramiv(r3,35714,r6);if((HEAP32[r6>>2]|0)!=0){STACKTOP=r5;return r3}_glGetProgramiv(r3,35716,r7);r5=HEAP32[r7>>2];r6=__Znaj((r5|0)>-1?r5:-1);_glGetProgramInfoLog(r3,HEAP32[r7>>2],r8,r6);__Z7mgDebugPKcz(5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r6,tempInt));if((r6|0)!=0){__ZdlPv(r6)}_glDeleteProgram(r3);r3=___cxa_allocate_exception(4);r6=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r6,5253796,5254792,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r1,HEAP32[tempInt+4>>2]=r1,tempInt));HEAP32[r3>>2]=r6;___cxa_throw(r3,5275304,0)}function __ZN19mgWebGLVertexBuffer5resetEv(r1){var r2;if((HEAP32[r1+24>>2]|0)!=0){HEAP32[r1+20>>2]=0;HEAP32[r1+32>>2]=1;STACKTOP=STACKTOP;return}r1=___cxa_allocate_exception(4);r2=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r2,5251792,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r1>>2]=r2;___cxa_throw(r1,5275304,0)}function __ZN19mgWebGLVertexBuffer11loadDisplayEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=r1>>2;r3=STACKTOP;r4=r1+28|0;r5=HEAP32[r4>>2];r6=(r5|0)==0;do{if(!r6){if((HEAP32[r2+8]|0)!=0){break}STACKTOP=r3;return}}while(0);r7=(r1+12|0)>>2;if((HEAP32[r7]|0)==0){r8=___cxa_allocate_exception(4);r9=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r9,5252464,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r8>>2]=r9;___cxa_throw(r8,5275304,0)}if(r6){_glGenBuffers(1,r4);r10=HEAP32[r4>>2]}else{r10=r5}_glBindBuffer(34962,r10);r10=r1+24|0;_glBufferData(34962,Math.imul(HEAP32[r2+5],HEAP32[r2+1]),HEAP32[r7],(HEAP32[r10>>2]|0)!=0?35048:35044);if((HEAP32[r10>>2]|0)==0){r10=HEAP32[r7];if((r10|0)!=0){__ZdlPv(r10)}HEAP32[r7]=0;HEAP32[r2+4]=0}HEAP32[r2+8]=0;_glBindBuffer(34962,0);STACKTOP=r3;return}function __ZN14mgVertexBufferD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5263996;r2=r1+12|0;r3=HEAP32[r2>>2];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r2>>2]=0;__ZdlPv(r1);return}function __ZN14mgVertexBufferD2Ev(r1){var r2;HEAP32[r1>>2]=5263996;r2=(r1+12|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}__ZdlPv(r1);HEAP32[r2]=0;return}function __ZN13mgIndexBuffer5resetEv(r1){var r2;if((HEAP32[r1+24>>2]|0)!=0){HEAP32[r1+20>>2]=0;STACKTOP=STACKTOP;return}r1=___cxa_allocate_exception(4);r2=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r2,5252224,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r1>>2]=r2;___cxa_throw(r1,5275304,0)}function __ZN14mgVertexBuffer5resetEv(r1){var r2;if((HEAP32[r1+24>>2]|0)!=0){HEAP32[r1+20>>2]=0;STACKTOP=STACKTOP;return}r1=___cxa_allocate_exception(4);r2=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r2,5251792,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r1>>2]=r2;___cxa_throw(r1,5275304,0)}function __ZN14mg3DErrorTableD1Ev(r1){__ZN12mgErrorTableD2Ev(r1|0);return}function __ZN14mg3DErrorTableD0Ev(r1){__ZN12mgErrorTableD2Ev(r1|0);__ZdlPv(r1);return}function __ZN14mg3DErrorTableC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2;__ZN20mgPlatformErrorTableC2Ev(r1|0);HEAP32[r1>>2]=5265748;r4=r3|0;HEAP32[r4>>2]=5259300;r5=(r3+4|0)>>2;HEAP32[r5]=63;r6=r3+20|0;r7=(r3+16|0)>>2;HEAP32[r7]=r6;r8=(r3+8|0)>>2;HEAP32[r8]=0;r9=(r3+12|0)>>2;HEAP32[r9]=128;_memcpy(r6,5254256,12);r3=HEAP32[r8]+12|0;HEAP32[r8]=r3;HEAP8[HEAP32[r7]+r3|0]=0;r3=HEAP32[r5];r10=HEAP32[r8];r11=r10+84|0;if((r3|0)<(r11|0)){r12=HEAP32[r9];r13=r3;while(1){r14=r13+r12|0;if((r14|0)<(r11|0)){r13=r14}else{break}}HEAP32[r5]=r14;r13=r14+1|0;r14=__Znaj((r13|0)>-1?r13:-1);r13=HEAP32[r7];r11=HEAP32[r8];_memcpy(r14,r13,r11+1|0);if((r13|0)==(r6|0)|(r13|0)==0){r15=r11}else{__ZdlPv(r13);r15=HEAP32[r8]}HEAP32[r7]=r14;r16=r15;r17=r14}else{r16=r10;r17=HEAP32[r7]}_memcpy(r17+r16|0,5252612,84);r16=HEAP32[r8]+84|0;HEAP32[r8]=r16;HEAP8[HEAP32[r7]+r16|0]=0;r16=HEAP32[r5];r17=HEAP32[r8];r10=r17+86|0;if((r16|0)<(r10|0)){r14=HEAP32[r9];r15=r16;while(1){r18=r15+r14|0;if((r18|0)<(r10|0)){r15=r18}else{break}}HEAP32[r5]=r18;r15=r18+1|0;r18=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r7];r10=HEAP32[r8];_memcpy(r18,r15,r10+1|0);if((r15|0)==(r6|0)|(r15|0)==0){r19=r10}else{__ZdlPv(r15);r19=HEAP32[r8]}HEAP32[r7]=r18;r20=r19;r21=r18}else{r20=r17;r21=HEAP32[r7]}_memcpy(r21+r20|0,5250080,86);r17=r20+86|0;HEAP32[r8]=r17;HEAP8[r21+r17|0]=0;r17=HEAP32[r5];r21=HEAP32[r8];r20=r21+74|0;if((r17|0)<(r20|0)){r18=HEAP32[r9];r19=r17;while(1){r22=r19+r18|0;if((r22|0)<(r20|0)){r19=r22}else{break}}HEAP32[r5]=r22;r19=r22+1|0;r22=__Znaj((r19|0)>-1?r19:-1);r19=HEAP32[r7];r20=HEAP32[r8];_memcpy(r22,r19,r20+1|0);if((r19|0)==(r6|0)|(r19|0)==0){r23=r20}else{__ZdlPv(r19);r23=HEAP32[r8]}HEAP32[r7]=r22;r24=r23;r25=r22}else{r24=r21;r25=HEAP32[r7]}_memcpy(r25+r24|0,5247856,74);r24=HEAP32[r8]+74|0;HEAP32[r8]=r24;HEAP8[HEAP32[r7]+r24|0]=0;r24=HEAP32[r5];r25=HEAP32[r8];r21=r25+54|0;if((r24|0)<(r21|0)){r22=HEAP32[r9];r23=r24;while(1){r26=r23+r22|0;if((r26|0)<(r21|0)){r23=r26}else{break}}HEAP32[r5]=r26;r23=r26+1|0;r26=__Znaj((r23|0)>-1?r23:-1);r23=HEAP32[r7];r21=HEAP32[r8];_memcpy(r26,r23,r21+1|0);if((r23|0)==(r6|0)|(r23|0)==0){r27=r21}else{__ZdlPv(r23);r27=HEAP32[r8]}HEAP32[r7]=r26;r28=r27;r29=r26}else{r28=r25;r29=HEAP32[r7]}_memcpy(r29+r28|0,5245848,54);r28=HEAP32[r8]+54|0;HEAP32[r8]=r28;HEAP8[HEAP32[r7]+r28|0]=0;r28=HEAP32[r5];r29=HEAP32[r8];r25=r29+65|0;if((r28|0)<(r25|0)){r26=HEAP32[r9];r27=r28;while(1){r30=r27+r26|0;if((r30|0)<(r25|0)){r27=r30}else{break}}HEAP32[r5]=r30;r27=r30+1|0;r30=__Znaj((r27|0)>-1?r27:-1);r27=HEAP32[r7];r25=HEAP32[r8];_memcpy(r30,r27,r25+1|0);if((r27|0)==(r6|0)|(r27|0)==0){r31=r25}else{__ZdlPv(r27);r31=HEAP32[r8]}HEAP32[r7]=r30;r32=r31;r33=r30}else{r32=r29;r33=HEAP32[r7]}_memcpy(r33+r32|0,5244904,65);r32=HEAP32[r8]+65|0;HEAP32[r8]=r32;HEAP8[HEAP32[r7]+r32|0]=0;r32=HEAP32[r5];r33=HEAP32[r8];r29=r33+54|0;if((r32|0)<(r29|0)){r30=HEAP32[r9];r31=r32;while(1){r34=r31+r30|0;if((r34|0)<(r29|0)){r31=r34}else{break}}HEAP32[r5]=r34;r31=r34+1|0;r34=__Znaj((r31|0)>-1?r31:-1);r31=HEAP32[r7];r29=HEAP32[r8];_memcpy(r34,r31,r29+1|0);if((r31|0)==(r6|0)|(r31|0)==0){r35=r29}else{__ZdlPv(r31);r35=HEAP32[r8]}HEAP32[r7]=r34;r36=r35;r37=r34}else{r36=r33;r37=HEAP32[r7]}_memcpy(r37+r36|0,5245848,54);r36=HEAP32[r8]+54|0;HEAP32[r8]=r36;HEAP8[HEAP32[r7]+r36|0]=0;r36=HEAP32[r5];r37=HEAP32[r8];r33=r37+85|0;if((r36|0)<(r33|0)){r34=HEAP32[r9];r35=r36;while(1){r38=r35+r34|0;if((r38|0)<(r33|0)){r35=r38}else{break}}HEAP32[r5]=r38;r35=r38+1|0;r38=__Znaj((r35|0)>-1?r35:-1);r35=HEAP32[r7];r33=HEAP32[r8];_memcpy(r38,r35,r33+1|0);if((r35|0)==(r6|0)|(r35|0)==0){r39=r33}else{__ZdlPv(r35);r39=HEAP32[r8]}HEAP32[r7]=r38;r40=r39;r41=r38}else{r40=r37;r41=HEAP32[r7]}_memcpy(r41+r40|0,5244348,85);r37=r40+85|0;HEAP32[r8]=r37;HEAP8[r41+r37|0]=0;r37=HEAP32[r5];r41=HEAP32[r8];r40=r41+79|0;if((r37|0)<(r40|0)){r38=HEAP32[r9];r39=r37;while(1){r42=r39+r38|0;if((r42|0)<(r40|0)){r39=r42}else{break}}HEAP32[r5]=r42;r39=r42+1|0;r42=__Znaj((r39|0)>-1?r39:-1);r39=HEAP32[r7];r40=HEAP32[r8];_memcpy(r42,r39,r40+1|0);if((r39|0)==(r6|0)|(r39|0)==0){r43=r40}else{__ZdlPv(r39);r43=HEAP32[r8]}HEAP32[r7]=r42;r44=r43;r45=r42}else{r44=r41;r45=HEAP32[r7]}_memcpy(r45+r44|0,5243808,79);r44=HEAP32[r8]+79|0;HEAP32[r8]=r44;HEAP8[HEAP32[r7]+r44|0]=0;r44=HEAP32[r5];r45=HEAP32[r8];r41=r45+79|0;if((r44|0)<(r41|0)){r42=HEAP32[r9];r43=r44;while(1){r46=r43+r42|0;if((r46|0)<(r41|0)){r43=r46}else{break}}HEAP32[r5]=r46;r43=r46+1|0;r46=__Znaj((r43|0)>-1?r43:-1);r43=HEAP32[r7];r41=HEAP32[r8];_memcpy(r46,r43,r41+1|0);if((r43|0)==(r6|0)|(r43|0)==0){r47=r41}else{__ZdlPv(r43);r47=HEAP32[r8]}HEAP32[r7]=r46;r48=r47;r49=r46}else{r48=r45;r49=HEAP32[r7]}_memcpy(r49+r48|0,5243240,79);r48=HEAP32[r8]+79|0;HEAP32[r8]=r48;HEAP8[HEAP32[r7]+r48|0]=0;r48=HEAP32[r5];r49=HEAP32[r8];r45=r49+81|0;if((r48|0)<(r45|0)){r46=HEAP32[r9];r47=r48;while(1){r50=r47+r46|0;if((r50|0)<(r45|0)){r47=r50}else{break}}HEAP32[r5]=r50;r47=r50+1|0;r50=__Znaj((r47|0)>-1?r47:-1);r47=HEAP32[r7];r45=HEAP32[r8];_memcpy(r50,r47,r45+1|0);if((r47|0)==(r6|0)|(r47|0)==0){r51=r45}else{__ZdlPv(r47);r51=HEAP32[r8]}HEAP32[r7]=r50;r52=r51;r53=r50}else{r52=r49;r53=HEAP32[r7]}_memcpy(r53+r52|0,5257488,81);r52=HEAP32[r8]+81|0;HEAP32[r8]=r52;HEAP8[HEAP32[r7]+r52|0]=0;r52=HEAP32[r5];r53=HEAP32[r8];r49=r53+68|0;if((r52|0)<(r49|0)){r50=HEAP32[r9];r51=r52;while(1){r54=r51+r50|0;if((r54|0)<(r49|0)){r51=r54}else{break}}HEAP32[r5]=r54;r51=r54+1|0;r54=__Znaj((r51|0)>-1?r51:-1);r51=HEAP32[r7];r49=HEAP32[r8];_memcpy(r54,r51,r49+1|0);if((r51|0)==(r6|0)|(r51|0)==0){r55=r49}else{__ZdlPv(r51);r55=HEAP32[r8]}HEAP32[r7]=r54;r56=r55;r57=r54}else{r56=r53;r57=HEAP32[r7]}_memcpy(r57+r56|0,5256964,68);r56=HEAP32[r8]+68|0;HEAP32[r8]=r56;HEAP8[HEAP32[r7]+r56|0]=0;r56=HEAP32[r5];r57=HEAP32[r8];r53=r57+70|0;if((r56|0)<(r53|0)){r54=HEAP32[r9];r55=r56;while(1){r58=r55+r54|0;if((r58|0)<(r53|0)){r55=r58}else{break}}HEAP32[r5]=r58;r55=r58+1|0;r58=__Znaj((r55|0)>-1?r55:-1);r55=HEAP32[r7];r53=HEAP32[r8];_memcpy(r58,r55,r53+1|0);if((r55|0)==(r6|0)|(r55|0)==0){r59=r53}else{__ZdlPv(r55);r59=HEAP32[r8]}HEAP32[r7]=r58;r60=r59;r61=r58}else{r60=r57;r61=HEAP32[r7]}_memcpy(r61+r60|0,5256248,70);r60=HEAP32[r8]+70|0;HEAP32[r8]=r60;HEAP8[HEAP32[r7]+r60|0]=0;r60=HEAP32[r5];r61=HEAP32[r8];r57=r61+86|0;if((r60|0)<(r57|0)){r58=HEAP32[r9];r59=r60;while(1){r62=r59+r58|0;if((r62|0)<(r57|0)){r59=r62}else{break}}HEAP32[r5]=r62;r59=r62+1|0;r62=__Znaj((r59|0)>-1?r59:-1);r59=HEAP32[r7];r57=HEAP32[r8];_memcpy(r62,r59,r57+1|0);if((r59|0)==(r6|0)|(r59|0)==0){r63=r57}else{__ZdlPv(r59);r63=HEAP32[r8]}HEAP32[r7]=r62;r64=r63;r65=r62}else{r64=r61;r65=HEAP32[r7]}_memcpy(r65+r64|0,5255808,86);r61=r64+86|0;HEAP32[r8]=r61;HEAP8[r65+r61|0]=0;r61=HEAP32[r5];r65=HEAP32[r8];r64=r65+13|0;if((r61|0)<(r64|0)){r62=HEAP32[r9];r9=r61;while(1){r66=r9+r62|0;if((r66|0)<(r64|0)){r9=r66}else{break}}HEAP32[r5]=r66;r5=r66+1|0;r66=__Znaj((r5|0)>-1?r5:-1);r5=HEAP32[r7];r9=HEAP32[r8];_memcpy(r66,r5,r9+1|0);if((r5|0)==(r6|0)|(r5|0)==0){r67=r9}else{__ZdlPv(r5);r67=HEAP32[r8]}HEAP32[r7]=r66;r68=r67;r69=r66}else{r68=r65;r69=HEAP32[r7]}_memcpy(r69+r68|0,5245208,13);r68=HEAP32[r8]+13|0;HEAP32[r8]=r68;HEAP8[HEAP32[r7]+r68|0]=0;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1|0,HEAP32[r8],HEAP32[r7]);HEAP32[r4>>2]=5259300;r4=HEAP32[r7];if((r4|0)==(r6|0)|(r4|0)==0){STACKTOP=r2;return}__ZdlPv(r4);STACKTOP=r2;return}function __ZN10mgFontListD0Ev(r1){__ZN10mgFontListD2Ev(r1);__ZdlPv(r1);return}function __ZN10mgFontListC2EPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=r1>>2;HEAP32[r3+1]=5259300;HEAP32[r3+2]=63;r4=r1+24|0;HEAP32[r3+5]=r4;HEAP32[r3+3]=0;HEAP8[r4]=0;HEAP32[r3+4]=128;HEAP32[r3+26]=5259300;HEAP32[r3+27]=63;r4=r1+124|0;HEAP32[r3+30]=r4;HEAP32[r3+28]=0;HEAP8[r4]=0;HEAP32[r3+29]=128;HEAP32[r3+47]=5259300;HEAP32[r3+48]=63;r4=r1+208|0;HEAP32[r3+51]=r4;HEAP32[r3+49]=0;HEAP8[r4]=0;HEAP32[r3+50]=128;HEAP32[r3+22]=1;HEAP32[r3+23]=0;HEAP32[r3+25]=0;HEAP8[r1+96|0]=0;HEAP32[r3+69]=5271244;HEAP32[r3+72]=20;HEAP32[r3+70]=r1+292|0;HEAP32[r3+71]=0;HEAP32[r3+94]=5259300;HEAP32[r3+95]=63;r4=r1+396|0;HEAP32[r3+98]=r4;HEAP32[r3+96]=0;HEAP8[r4]=0;HEAP32[r3+97]=128;HEAP32[r3+93]=0;HEAP32[r3]=5271908;HEAP32[r3+115]=5262356;r4=(r1+464|0)>>2;HEAP32[r4]=97;HEAP32[r3+117]=0;r5=__Znaj(776);r6=r5;r7=(r1+472|0)>>2;HEAP32[r7]=r6;r8=HEAP32[r4];L3471:do{if((r8|0)>0){HEAP32[r5>>2]=0;HEAP32[r5+4>>2]=0;if((r8|0)>1){r9=1;r10=r6}else{break}while(1){HEAP32[r10+(r9<<3)>>2]=0;HEAP32[HEAP32[r7]+(r9<<3)+4>>2]=0;r11=r9+1|0;if((r11|0)>=(HEAP32[r4]|0)){break L3471}r9=r11;r10=HEAP32[r7]}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3]+20>>2]](r1|0,r2);return}function __ZN10mgFontListD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;HEAP32[r1>>2]=5271908;r5=r1+460|0;r6=(r1+472|0)>>2;r7=(r1+464|0)>>2;r8=HEAP32[r7];r9=0;while(1){if((r9|0)>=(r8|0)){r10=r8;break}if((HEAP32[HEAP32[r6]+(r9<<3)>>2]|0)==0){r9=r9+1|0}else{r2=3129;break}}L3482:do{if(r2==3129){if((r9|0)==-1){r10=r8;break}r11=r4|0;r12=r4+4|0;r13=r4+20|0;r14=(r4+16|0)>>2;r15=(r4+8|0)>>2;r16=r4+12|0;r17=r9;r18=0;r19=r8;while(1){HEAP32[r11>>2]=5259300;HEAP32[r12>>2]=63;HEAP32[r14]=r13;HEAP32[r15]=0;HEAP8[r13]=0;HEAP32[r16>>2]=128;r20=r19-1|0;r21=(r20|0)<(r17|0)?r20:r17;r20=(r21|0)<0?0:r21;r21=HEAP32[r6];r22=HEAP32[r21+(r20<<3)>>2];L3487:do{if((r22|0)==0){r23=r18;r24=r17}else{HEAP32[r15]=0;HEAP8[r13]=0;r25=_strlen(r22);if((r25|0)>63){r26=63;while(1){r27=r26+128|0;if((r27|0)<(r25|0)){r26=r27}else{break}}HEAP32[r12>>2]=r27;r28=r26+129|0;r29=__Znaj((r28|0)>-1?r28:-1);r28=HEAP32[r14];r30=HEAP32[r15];_memcpy(r29,r28,r30+1|0);if((r28|0)==(r13|0)|(r28|0)==0){r31=r30}else{__ZdlPv(r28);r31=HEAP32[r15]}HEAP32[r14]=r29;r32=r31;r33=r29}else{r32=0;r33=r13}_memcpy(r33+r32|0,r22,r25);r29=HEAP32[r15]+r25|0;HEAP32[r15]=r29;HEAP8[HEAP32[r14]+r29|0]=0;r29=HEAP32[r21+(r20<<3)+4>>2];r28=HEAP32[r7];r30=r20;while(1){r34=r30+1|0;if((r34|0)>=(r28|0)){r23=r29;r24=-1;break L3487}if((HEAP32[HEAP32[r6]+(r34<<3)>>2]|0)==0){r30=r34}else{r23=r29;r24=r34;break L3487}}}}while(0);if((r23|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+4>>2]](r23)}HEAP32[r11>>2]=5259300;r20=HEAP32[r14];if(!((r20|0)==(r13|0)|(r20|0)==0)){__ZdlPv(r20)}r20=HEAP32[r7];if((r24|0)==-1){r10=r20;break L3482}else{r17=r24;r18=r23;r19=r20}}}}while(0);L3509:do{if((r10|0)>0){r23=r1+468|0;r24=0;r32=r10;while(1){r33=HEAP32[r6];r31=(r24<<3)+r33|0;r27=HEAP32[r31>>2];if((r27|0)==0){r35=r32}else{__ZdlPv(r27);HEAP32[r31>>2]=0;HEAP32[r33+(r24<<3)+4>>2]=0;HEAP32[r23>>2]=HEAP32[r23>>2]-1|0;r35=HEAP32[r7]}r33=r24+1|0;if((r33|0)<(r35|0)){r24=r33;r32=r35}else{break}}HEAP32[r5>>2]=5262356;r32=HEAP32[r6];if((r35|0)<=0){r36=r32;break}r24=r1+468|0;r23=0;r33=r32;r32=r35;while(1){r31=(r23<<3)+r33|0;r27=HEAP32[r31>>2];if((r27|0)==0){r37=r32;r38=r33}else{__ZdlPv(r27);HEAP32[r31>>2]=0;HEAP32[r33+(r23<<3)+4>>2]=0;HEAP32[r24>>2]=HEAP32[r24>>2]-1|0;r37=HEAP32[r7];r38=HEAP32[r6]}r31=r23+1|0;if((r31|0)<(r37|0)){r23=r31;r33=r38;r32=r37}else{r36=r38;break L3509}}}else{HEAP32[r5>>2]=5262356;r36=HEAP32[r6]}}while(0);if((r36|0)==0){r39=r1|0;__ZN11mgXMLParserD2Ev(r39);STACKTOP=r3;return}__ZdlPv(r36);r39=r1|0;__ZN11mgXMLParserD2Ev(r39);STACKTOP=r3;return}function __ZN10mgFontList8findFontERK13mgStringArrayPKcjjR8mgString(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+156|0;r9=r8;r10=r8+84;r11=r9|0;HEAP32[r11>>2]=5259300;r12=(r9+4|0)>>2;HEAP32[r12]=63;r13=r9+20|0;r14=(r9+16|0)>>2;HEAP32[r14]=r13;r15=(r9+8|0)>>2;HEAP32[r15]=0;HEAP8[r13]=0;r16=(r9+12|0)>>2;HEAP32[r16]=128;L3530:do{if((r3|0)==0){r17=0}else{r9=_strlen(r3);if((r9|0)>63){r18=63;while(1){r19=r18+128|0;if((r19|0)<(r9|0)){r18=r19}else{break}}HEAP32[r12]=r19;r20=r18+129|0;r21=__Znaj((r20|0)>-1?r20:-1);r20=HEAP32[r14];r22=HEAP32[r15];_memcpy(r21,r20,r22+1|0);if((r20|0)==(r13|0)|(r20|0)==0){r23=r22}else{__ZdlPv(r20);r23=HEAP32[r15]}HEAP32[r14]=r21;r24=r23;r25=r21}else{r24=0;r25=r13}_memcpy(r25+r24|0,r3,r9);r21=HEAP32[r15]+r9|0;HEAP32[r15]=r21;HEAP8[HEAP32[r14]+r21|0]=0;r21=HEAP32[r15];if((r21|0)>0){r26=0;r27=r21}else{r17=r21;break}while(1){r21=HEAP8[HEAP32[r14]+r26|0]<<24>>24;if((r21&128|0)==0){r20=_tolower(r21)&255;HEAP8[HEAP32[r14]+r26|0]=r20;r28=HEAP32[r15]}else{r28=r27}r20=r26+1|0;if((r20|0)<(r28|0)){r26=r20;r27=r28}else{r17=r28;break L3530}}}}while(0);r28=(r4|0)!=0;if(r28){r4=HEAP32[r12];r27=r17+2|0;if((r4|0)<(r27|0)){r26=HEAP32[r16];r3=r4;while(1){r29=r3+r26|0;if((r29|0)<(r27|0)){r3=r29}else{break}}HEAP32[r12]=r29;r3=r29+1|0;r29=__Znaj((r3|0)>-1?r3:-1);r3=HEAP32[r14];r27=HEAP32[r15];_memcpy(r29,r3,r27+1|0);if((r3|0)==(r13|0)|(r3|0)==0){r30=r27}else{__ZdlPv(r3);r30=HEAP32[r15]}HEAP32[r14]=r29;r31=r30;r32=r29}else{r31=r17;r32=HEAP32[r14]}r17=r32+r31|0;tempBigInt=25133;HEAP8[r17]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r17+1|0]=tempBigInt&255;r17=HEAP32[r15]+2|0;HEAP32[r15]=r17;HEAP8[HEAP32[r14]+r17|0]=0}r17=(r5|0)!=0;if(r17){r5=HEAP32[r12];r31=HEAP32[r15];r32=r31+2|0;if((r5|0)<(r32|0)){r29=HEAP32[r16];r30=r5;while(1){r33=r30+r29|0;if((r33|0)<(r32|0)){r30=r33}else{break}}HEAP32[r12]=r33;r30=r33+1|0;r33=__Znaj((r30|0)>-1?r30:-1);r30=HEAP32[r14];r32=HEAP32[r15];_memcpy(r33,r30,r32+1|0);if((r30|0)==(r13|0)|(r30|0)==0){r34=r32}else{__ZdlPv(r30);r34=HEAP32[r15]}HEAP32[r14]=r33;r35=r34;r36=r33}else{r35=r31;r36=HEAP32[r14]}r31=r36+r35|0;tempBigInt=26925;HEAP8[r31]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+1|0]=tempBigInt&255;r31=HEAP32[r15]+2|0;HEAP32[r15]=r31;HEAP8[HEAP32[r14]+r31|0]=0}r31=HEAP32[r14];r35=HEAP8[r31];L3575:do{if(r35<<24>>24==0){r37=0}else{r36=0;r33=0;r34=r35;while(1){r30=r34<<24>>24^r33;r32=r30<<8|r30>>24;r30=r36+1|0;r29=HEAP8[r31+r30|0];if(r29<<24>>24==0){r37=r32;break L3575}else{r36=r30;r33=r32;r34=r29}}}}while(0);r35=r1+464|0;r34=HEAP32[r35>>2];r33=(((r37|0)>-1?r37:-r37|0)|0)%(r34|0);r37=r1+472|0;r1=HEAP32[r37>>2];r36=r33;while(1){r29=HEAP32[r1+(r36<<3)>>2];if((r29|0)==0){r7=3219;break}if((_strcmp(r29,r31)|0)==0){r7=3218;break}r29=r36+1|0;r32=(r29|0)<(r34|0)?r29:0;if((r32|0)==(r33|0)){r7=3219;break}else{r36=r32}}L3583:do{if(r7==3218){r38=(r36<<3)+r1+4|0;r39=r31;r7=3260;break}else if(r7==3219){__Z7mgDebugPKcz(5250044,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r31,tempInt));HEAP32[r15]=0;HEAP8[HEAP32[r14]]=0;r33=HEAP32[r12];r34=HEAP32[r15];r32=r34+7|0;if((r33|0)<(r32|0)){r29=HEAP32[r16];r30=r33;while(1){r40=r30+r29|0;if((r40|0)<(r32|0)){r30=r40}else{break}}HEAP32[r12]=r40;r30=r40+1|0;r32=__Znaj((r30|0)>-1?r30:-1);r30=HEAP32[r14];r29=HEAP32[r15];_memcpy(r32,r30,r29+1|0);if((r30|0)==(r13|0)|(r30|0)==0){r41=r29}else{__ZdlPv(r30);r41=HEAP32[r15]}HEAP32[r14]=r32;r42=r41;r43=r32}else{r42=r34;r43=HEAP32[r14]}r32=r43+r42|0;HEAP8[r32]=HEAP8[5256676];HEAP8[r32+1|0]=HEAP8[5256677|0];HEAP8[r32+2|0]=HEAP8[5256678|0];HEAP8[r32+3|0]=HEAP8[5256679|0];HEAP8[r32+4|0]=HEAP8[5256680|0];HEAP8[r32+5|0]=HEAP8[5256681|0];HEAP8[r32+6|0]=HEAP8[5256682|0];r32=HEAP32[r15]+7|0;HEAP32[r15]=r32;HEAP8[HEAP32[r14]+r32|0]=0;r32=HEAP32[r15];L3598:do{if((r32|0)>0){r30=0;r29=r32;while(1){r33=HEAP8[HEAP32[r14]+r30|0]<<24>>24;if((r33&128|0)==0){r5=_tolower(r33)&255;HEAP8[HEAP32[r14]+r30|0]=r5;r44=HEAP32[r15]}else{r44=r29}r5=r30+1|0;if((r5|0)<(r44|0)){r30=r5;r29=r44}else{r45=r44;break L3598}}}else{r45=r32}}while(0);if(r28){r32=HEAP32[r12];r34=r45+2|0;if((r32|0)<(r34|0)){r29=HEAP32[r16];r30=r32;while(1){r46=r30+r29|0;if((r46|0)<(r34|0)){r30=r46}else{break}}HEAP32[r12]=r46;r30=r46+1|0;r34=__Znaj((r30|0)>-1?r30:-1);r30=HEAP32[r14];r29=HEAP32[r15];_memcpy(r34,r30,r29+1|0);if((r30|0)==(r13|0)|(r30|0)==0){r47=r29}else{__ZdlPv(r30);r47=HEAP32[r15]}HEAP32[r14]=r34;r48=r47;r49=r34}else{r48=r45;r49=HEAP32[r14]}r34=r49+r48|0;tempBigInt=25133;HEAP8[r34]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+1|0]=tempBigInt&255;r34=HEAP32[r15]+2|0;HEAP32[r15]=r34;HEAP8[HEAP32[r14]+r34|0]=0}if(r17){r34=HEAP32[r12];r30=HEAP32[r15];r29=r30+2|0;if((r34|0)<(r29|0)){r32=HEAP32[r16];r5=r34;while(1){r50=r5+r32|0;if((r50|0)<(r29|0)){r5=r50}else{break}}HEAP32[r12]=r50;r5=r50+1|0;r29=__Znaj((r5|0)>-1?r5:-1);r5=HEAP32[r14];r32=HEAP32[r15];_memcpy(r29,r5,r32+1|0);if((r5|0)==(r13|0)|(r5|0)==0){r51=r32}else{__ZdlPv(r5);r51=HEAP32[r15]}HEAP32[r14]=r29;r52=r51;r53=r29}else{r52=r30;r53=HEAP32[r14]}r29=r53+r52|0;tempBigInt=26925;HEAP8[r29]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r29+1|0]=tempBigInt&255;r29=HEAP32[r15]+2|0;HEAP32[r15]=r29;HEAP8[HEAP32[r14]+r29|0]=0}r29=HEAP32[r14];r5=HEAP8[r29];L3634:do{if(r5<<24>>24==0){r54=0}else{r32=0;r34=0;r33=r5;while(1){r3=r33<<24>>24^r34;r27=r3<<8|r3>>24;r3=r32+1|0;r26=HEAP8[r29+r3|0];if(r26<<24>>24==0){r54=r27;break L3634}else{r32=r3;r34=r27;r33=r26}}}}while(0);r5=HEAP32[r35>>2];r30=(((r54|0)>-1?r54:-r54|0)|0)%(r5|0);r33=HEAP32[r37>>2];r34=r30;while(1){r32=HEAP32[r33+(r34<<3)>>2];if((r32|0)==0){r55=0;break L3583}if((_strcmp(r32,r29)|0)==0){break}r32=r34+1|0;r26=(r32|0)<(r5|0)?r32:0;if((r26|0)==(r30|0)){r55=0;break L3583}else{r34=r26}}r38=(r34<<3)+r33+4|0;r39=r29;r7=3260;break}}while(0);L3643:do{if(r7==3260){r37=HEAP32[r38>>2];r54=r37+180|0;r35=r54;r15=r37+188|0;if((HEAP32[r15>>2]|0)>0){r37=r2+8|0;r52=r2;r53=r54;r54=r6+16|0;r51=0;while(1){r50=HEAP32[r37>>2];while(1){r12=r50-1|0;if((r50|0)<=0){break}r16=FUNCTION_TABLE[HEAP32[HEAP32[r52>>2]+24>>2]](r2,r12);r17=FUNCTION_TABLE[HEAP32[HEAP32[r53>>2]+24>>2]](r35,r51);__ZN8mgString6formatEPKcz(r6,5245840,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r16,HEAP32[tempInt+4>>2]=r17,tempInt));__Z15mgOSFixFileNameR8mgString(r6);if((_stat(HEAP32[r54>>2],r10)|0)==0){r55=1;break L3643}else{r50=r12}}r50=r51+1|0;if((r50|0)<(HEAP32[r15>>2]|0)){r51=r50}else{break}}r56=HEAP32[r14]}else{r56=r39}__Z7mgDebugPKcz(5244884,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r56,tempInt));r55=0}}while(0);HEAP32[r11>>2]=5259300;r11=HEAP32[r14];if((r11|0)==(r13|0)|(r11|0)==0){STACKTOP=r8;return r55}__ZdlPv(r11);STACKTOP=r8;return r55}function __ZN10mgFontList9createTagEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r1=0;r3=5244336;r4=r2;while(1){r5=HEAP8[r4];r6=HEAP8[r3];r7=r5<<24>>24;if((r7&128|0)==0){r8=_tolower(r7)&255}else{r8=r5}if(r8<<24>>24>-1){r9=_tolower(r6<<24>>24)&255}else{r9=r6}if(r8<<24>>24!=r9<<24>>24){r10=5255356;r11=r2;break}if(r8<<24>>24==0){r1=3284;break}else{r3=r3+1|0;r4=r4+1|0}}if(r1==3284){r4=__Znwj(88),r3=r4>>2;r8=r4;HEAP32[r8>>2]=5259240;r9=r4+4|0;HEAP32[r9>>2]=5259300;HEAP32[r3+2]=63;r6=r4+24|0;HEAP32[r3+5]=r6;HEAP32[r3+3]=0;HEAP8[r6]=0;HEAP32[r3+4]=128;__ZN8mgStringaSEPKc(r9,r2);HEAP32[r8>>2]=5268384;r12=r4;return r12}while(1){r4=HEAP8[r11];r8=HEAP8[r10];r9=r4<<24>>24;if((r9&128|0)==0){r13=_tolower(r9)&255}else{r13=r4}if(r13<<24>>24>-1){r14=_tolower(r8<<24>>24)&255}else{r14=r8}if(r13<<24>>24!=r14<<24>>24){r12=0;r1=3303;break}if(r13<<24>>24==0){break}else{r10=r10+1|0;r11=r11+1|0}}if(r1==3303){return r12}r1=__Znwj(196),r11=r1>>2;r10=r1;HEAP32[r10>>2]=5259240;r13=r1+4|0;HEAP32[r13>>2]=5259300;HEAP32[r11+2]=63;r14=r1+24|0;HEAP32[r11+5]=r14;HEAP32[r11+3]=0;HEAP8[r14]=0;HEAP32[r11+4]=128;__ZN8mgStringaSEPKc(r13,r2);HEAP32[r10>>2]=5258812;HEAP32[r11+22]=5259300;HEAP32[r11+23]=63;r10=r1+108|0;HEAP32[r11+26]=r10;HEAP32[r11+24]=0;HEAP8[r10]=0;HEAP32[r11+25]=128;HEAP32[r11+45]=5266196;HEAP32[r11+48]=0;HEAP32[r11+46]=0;HEAP32[r11+47]=0;r12=r1;return r12}function __ZN10mgFontList13processTopTagEP8mgXMLTag(r1,r2){if((r2|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+4>>2]](r2);return}function __ZN13mgFontListTagD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5259240;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN13mgFontListTagD2Ev(r1){var r2;HEAP32[r1>>2]=5259240;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN18mgGLTextureSurface10getSurfaceEv(r1){return HEAP32[r1+4>>2]|0}function __ZN13mgFontListTag8tagChildEP11mgXMLParserP8mgXMLTag(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r1=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r1;r5=r4|0;HEAP32[r5>>2]=5259300;r6=(r4+4|0)>>2;HEAP32[r6]=63;r7=r4+20|0;r8=(r4+16|0)>>2;HEAP32[r8]=r7;r9=(r4+8|0)>>2;HEAP32[r9]=0;HEAP8[r7]=0;r10=(r4+12|0)>>2;HEAP32[r10]=128;r4=HEAP32[r3+104>>2];r11=HEAP32[r3+96>>2];if((r11|0)>63){r12=63;while(1){r13=r12+128|0;if((r13|0)<(r11|0)){r12=r13}else{break}}HEAP32[r6]=r13;r13=r12+129|0;r12=__Znaj((r13|0)>-1?r13:-1);r13=HEAP32[r8];r14=HEAP32[r9];_memcpy(r12,r13,r14+1|0);if((r13|0)==(r7|0)|(r13|0)==0){r15=r14}else{__ZdlPv(r13);r15=HEAP32[r9]}HEAP32[r8]=r12;r16=r15;r17=r12}else{r16=0;r17=r7}_memcpy(r17+r16|0,r4,r11);r4=HEAP32[r9]+r11|0;HEAP32[r9]=r4;HEAP8[HEAP32[r8]+r4|0]=0;r4=HEAP32[r9];L3717:do{if((r4|0)>0){r11=0;r16=r4;while(1){r17=HEAP8[HEAP32[r8]+r11|0]<<24>>24;if((r17&128|0)==0){r12=_tolower(r17)&255;HEAP8[HEAP32[r8]+r11|0]=r12;r18=HEAP32[r9]}else{r18=r16}r12=r11+1|0;if((r12|0)<(r18|0)){r11=r12;r16=r18}else{r19=r18;break L3717}}}else{r19=r4}}while(0);if((HEAP32[r3+172>>2]|0)!=0){r4=HEAP32[r6];r18=r19+2|0;if((r4|0)<(r18|0)){r16=HEAP32[r10];r11=r4;while(1){r20=r11+r16|0;if((r20|0)<(r18|0)){r11=r20}else{break}}HEAP32[r6]=r20;r11=r20+1|0;r20=__Znaj((r11|0)>-1?r11:-1);r11=HEAP32[r8];r18=HEAP32[r9];_memcpy(r20,r11,r18+1|0);if((r11|0)==(r7|0)|(r11|0)==0){r21=r18}else{__ZdlPv(r11);r21=HEAP32[r9]}HEAP32[r8]=r20;r22=r21;r23=r20}else{r22=r19;r23=HEAP32[r8]}r19=r23+r22|0;tempBigInt=25133;HEAP8[r19]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+1|0]=tempBigInt&255;r19=HEAP32[r9]+2|0;HEAP32[r9]=r19;HEAP8[HEAP32[r8]+r19|0]=0}if((HEAP32[r3+176>>2]|0)!=0){r19=HEAP32[r6];r22=HEAP32[r9];r23=r22+2|0;if((r19|0)<(r23|0)){r20=HEAP32[r10];r10=r19;while(1){r24=r10+r20|0;if((r24|0)<(r23|0)){r10=r24}else{break}}HEAP32[r6]=r24;r6=r24+1|0;r24=__Znaj((r6|0)>-1?r6:-1);r6=HEAP32[r8];r10=HEAP32[r9];_memcpy(r24,r6,r10+1|0);if((r6|0)==(r7|0)|(r6|0)==0){r25=r10}else{__ZdlPv(r6);r25=HEAP32[r9]}HEAP32[r8]=r24;r26=r25;r27=r24}else{r26=r22;r27=HEAP32[r8]}r22=r27+r26|0;tempBigInt=26925;HEAP8[r22]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+1|0]=tempBigInt&255;r22=HEAP32[r9]+2|0;HEAP32[r9]=r22;HEAP8[HEAP32[r8]+r22|0]=0}__ZN16mgMapStringToPtr5setAtEPKcPKv(r2+460|0,HEAP32[r8],r3);HEAP32[r5>>2]=5259300;r5=HEAP32[r8];if((r5|0)==(r7|0)|(r5|0)==0){STACKTOP=r1;return}__ZdlPv(r5);STACKTOP=r1;return}function __ZN9mgFontTagD0Ev(r1){__ZN9mgFontTagD2Ev(r1);__ZdlPv(r1);return}function __ZN9mgFontTagD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=r1>>2;r3=r1|0;HEAP32[r3>>2]=5258812;HEAP32[r2+45]=5266196;r4=(r1+188|0)>>2;r5=HEAP32[r4];r6=(r1+184|0)>>2;L3761:do{if((r5|0)>0){r7=0;r8=r5;while(1){r9=HEAP32[HEAP32[r6]+(r7<<2)>>2];if((r9|0)==0){r10=r8}else{__ZdlPv(r9);HEAP32[HEAP32[r6]+(r7<<2)>>2]=0;r10=HEAP32[r4]}r9=r7+1|0;if((r9|0)<(r10|0)){r7=r9;r8=r10}else{break L3761}}}}while(0);HEAP32[r4]=0;r4=HEAP32[r6];if((r4|0)!=0){__ZdlPv(r4)}HEAP32[r6]=0;HEAP32[r2+22]=5259300;r6=HEAP32[r2+26];if(!((r6|0)==(r1+108|0)|(r6|0)==0)){__ZdlPv(r6)}HEAP32[r3>>2]=5259240;HEAP32[r2+1]=5259300;r3=HEAP32[r2+5];if((r3|0)==(r1+24|0)|(r3|0)==0){return}__ZdlPv(r3);return}function __ZN9mgFontTag7tagAttrEP11mgXMLParserPKcS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+168|0;r7=r6;r8=r6+84;r9=5244128;r10=r3;while(1){r11=HEAP8[r10];r12=HEAP8[r9];r13=r11<<24>>24;if((r13&128|0)==0){r14=_tolower(r13)&255}else{r14=r11}if(r14<<24>>24>-1){r15=_tolower(r12<<24>>24)&255}else{r15=r12}if(r14<<24>>24!=r15<<24>>24){r16=5257480;r17=r3;break}if(r14<<24>>24==0){r5=3385;break}else{r9=r9+1|0;r10=r10+1|0}}if(r5==3385){r10=r1+88|0;__ZN8mgStringaSEPKc(r10,r4);__ZN8mgString4trimEv(r10);STACKTOP=r6;return}while(1){r10=HEAP8[r17];r9=HEAP8[r16];r14=r10<<24>>24;if((r14&128|0)==0){r18=_tolower(r14)&255}else{r18=r10}if(r18<<24>>24>-1){r19=_tolower(r9<<24>>24)&255}else{r19=r9}if(r18<<24>>24!=r19<<24>>24){r20=5256956;r21=r3;break}if(r18<<24>>24==0){r5=3392;break}else{r16=r16+1|0;r17=r17+1|0}}if(r5==3392){HEAP32[r1+172>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+32>>2]](r1|0,r2,r3,r4);STACKTOP=r6;return}while(1){r17=HEAP8[r21];r16=HEAP8[r20];r18=r17<<24>>24;if((r18&128|0)==0){r22=_tolower(r18)&255}else{r22=r17}if(r22<<24>>24>-1){r23=_tolower(r16<<24>>24)&255}else{r23=r16}if(r22<<24>>24!=r23<<24>>24){r24=5256240;r25=r3;break}if(r22<<24>>24==0){r5=3399;break}else{r20=r20+1|0;r21=r21+1|0}}if(r5==3399){HEAP32[r1+176>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+32>>2]](r1|0,r2,r3,r4);STACKTOP=r6;return}while(1){r3=HEAP8[r25];r2=HEAP8[r24];r21=r3<<24>>24;if((r21&128|0)==0){r26=_tolower(r21)&255}else{r26=r3}if(r26<<24>>24>-1){r27=_tolower(r2<<24>>24)&255}else{r27=r2}if(r26<<24>>24!=r27<<24>>24){r5=3430;break}if(r26<<24>>24==0){break}else{r24=r24+1|0;r25=r25+1|0}}if(r5==3430){STACKTOP=r6;return}r5=r7|0;HEAP32[r5>>2]=5259300;r25=r7+4|0;HEAP32[r25>>2]=63;r24=r7+20|0;r26=(r7+16|0)>>2;HEAP32[r26]=r24;r27=(r7+8|0)>>2;HEAP32[r27]=0;HEAP8[r24]=0;HEAP32[r7+12>>2]=128;if((r4|0)!=0){r2=_strlen(r4);if((r2|0)>63){r3=63;while(1){r28=r3+128|0;if((r28|0)<(r2|0)){r3=r28}else{break}}HEAP32[r25>>2]=r28;r28=r3+129|0;r3=__Znaj((r28|0)>-1?r28:-1);r28=HEAP32[r26];r25=HEAP32[r27];_memcpy(r3,r28,r25+1|0);if((r28|0)==(r24|0)|(r28|0)==0){r29=r25}else{__ZdlPv(r28);r29=HEAP32[r27]}HEAP32[r26]=r3;r30=r29;r31=r3}else{r30=0;r31=r24}_memcpy(r31+r30|0,r4,r2);r4=HEAP32[r27]+r2|0;HEAP32[r27]=r4;HEAP8[HEAP32[r26]+r4|0]=0}r4=r8|0;HEAP32[r4>>2]=5259300;HEAP32[r8+4>>2]=63;r27=r8+20|0;r2=(r8+16|0)>>2;HEAP32[r2]=r27;r30=r8+8|0;HEAP32[r30>>2]=0;HEAP8[r27]=0;HEAP32[r8+12>>2]=128;r31=r1+180|0;r1=0;while(1){r3=__ZNK8mgString8getTokenEiPKcRS_(r7,r1,5255804,r8);if((HEAP32[r30>>2]|0)<=0){break}__ZN13mgStringArray3addEPKc(r31,HEAP32[r2]);r1=r3}HEAP32[r4>>2]=5259300;r4=HEAP32[r2];if(!((r4|0)==(r27|0)|(r4|0)==0)){__ZdlPv(r4)}HEAP32[r5>>2]=5259300;r5=HEAP32[r26];if((r5|0)==(r24|0)|(r5|0)==0){STACKTOP=r6;return}__ZdlPv(r5);STACKTOP=r6;return}function __ZN18mgGLTextureSurfaceD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5260680;r2=r1+4|0;r3=HEAP32[r2>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+92>>2]](r3)}HEAP32[r2>>2]=0;__ZdlPv(r1);return}function __ZN18mgGLTextureSurfaceD2Ev(r1){var r2;HEAP32[r1>>2]=5260680;r2=(r1+4|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+92>>2]](r1);HEAP32[r2]=0;return}function __ZN18mgGLTextureSurface13createBuffersEv(r1){var r2;r2=HEAP32[r1+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+164>>2]](r2);return}function __ZNK18mgGLTextureSurface11drawOverlayEii(r1,r2,r3){var r4;r4=HEAP32[r1+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+172>>2]](r4,r2,r3);return}function __ZN18mgGLTextureSurface13deleteBuffersEv(r1){var r2;r2=HEAP32[r1+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+168>>2]](r2);return}function __ZN18mgGLTextureSurface10getTextureEv(r1){var r2;r2=HEAP32[r1+4>>2];if((HEAP32[r2+48>>2]|0)!=0){STACKTOP=STACKTOP;return HEAP32[HEAP32[r2+64>>2]>>2]}r2=___cxa_allocate_exception(4);r1=__Znwj(84);__ZN11mgExceptionC2EPKcz(r1,5250332,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r2>>2]=r1;___cxa_throw(r2,5275288,0)}function __ZN14mgGLGenSurface9loadImageEP10mgGenImage(r1,r2){return 0}function __ZN14mgGLGenSurface11deleteImageEP10mgGenImage(r1,r2){return}function __ZN14mgGLGenSurface8loadIconEP9mgGenIcon(r1,r2){return 0}function __ZN14mgGLGenSurface10deleteIconEP9mgGenIcon(r1,r2){return}function __ZN14mgGLGenSurfaceD0Ev(r1){__ZN14mgGLGenSurfaceD2Ev(r1);__ZdlPv(r1);return}function __ZN14mgGLGenSurface12resetCharMapEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r2=0;r3=(r1+196|0)>>2;r4=(r1+188|0)>>2;r5=HEAP32[r4];r6=0;while(1){if((r6|0)>=(r5|0)){r7=r5;break}if((HEAP32[HEAP32[r3]+(r6*12&-1)+8>>2]|0)==0){r2=3463;break}else{r6=r6+1|0}}L3878:do{if(r2==3463){if((r6|0)==-1){r7=r5;break}else{r8=r6;r9=0;r10=r5}while(1){r11=r10-1|0;r12=(r11|0)<(r8|0)?r11:r8;r11=(r12|0)<0?0:r12;r12=HEAP32[r3]>>2;L3882:do{if((HEAP32[((r11*12&-1)+8>>2)+r12]|0)==0){r13=HEAP32[((r11*12&-1)+4>>2)+r12];r14=r11;while(1){r15=r14+1|0;if((r15|0)>=(r10|0)){r16=r13;r17=-1;break L3882}if((HEAP32[((r15*12&-1)+8>>2)+r12]|0)==0){r16=r13;r17=r15;break L3882}else{r14=r15}}}else{r16=r9;r17=r8}}while(0);if((r16|0)==0){r18=0;r19=r10}else{__ZdlPv(r16);r18=r16;r19=HEAP32[r4]}if((r17|0)==-1){r7=r19;break L3878}else{r8=r17;r9=r18;r10=r19}}}}while(0);if((r7|0)<=0){return}r19=r1+192|0;r1=0;r10=r7;while(1){r7=HEAP32[r3];r18=r7+(r1*12&-1)+8|0;if((HEAP32[r18>>2]|0)==0){HEAP32[r7+(r1*12&-1)>>2]=0;HEAP32[r7+(r1*12&-1)+4>>2]=0;HEAP32[r18>>2]=1;HEAP32[r19>>2]=HEAP32[r19>>2]-1|0;r20=HEAP32[r4]}else{r20=r10}r18=r1+1|0;if((r18|0)<(r20|0)){r1=r18;r10=r20}else{break}}return}function __ZNK14mgGLGenSurface10displayDPIEv(r1){r1=HEAP32[1310729];return FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1)}function __ZN14mgGLGenSurface8loadFontEP9mgGenFont(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=r2>>2;r2=STACKTOP;STACKTOP=STACKTOP+24|0;r4=r2;r5=r2+8;r6=r2+16;r7=HEAP32[r3+27];r8=HEAP32[r3+44]|0;r9=HEAP32[1310729];HEAP32[r3+22]=_mgCanvasLoadFont(r7,r8,FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9),HEAP32[r3+45],HEAP32[r3+46],r4,r5,r6);HEAP32[r3+48]=Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]))&-1;HEAP32[r3+47]=Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]))&-1;HEAP32[r3+49]=Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]))&-1;r6=r1+180|0;r1=HEAP32[r6>>2];HEAP32[r6>>2]=r1+1|0;HEAP32[r3+51]=r1;STACKTOP=r2;return}function __ZN14mgGLGenSurface10deleteFontEP9mgGenFont(r1,r2){_mgCanvasDeleteFont(HEAP32[r2+88>>2]);return}function __ZN14mgGLGenSurfaceC2Ejj(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r4=r1>>2;r5=r1|0;HEAP32[r5>>2]=5270008;HEAP32[r4+8]=5262356;r6=(r1+36|0)>>2;HEAP32[r6]=97;HEAP32[r4+10]=0;r7=__Znaj(776),r8=r7>>2;r9=r7;r7=(r1+44|0)>>2;HEAP32[r7]=r9;r10=HEAP32[r6];L3905:do{if((r10|0)>0){HEAP32[r8]=0;HEAP32[r8+1]=0;if((r10|0)<=1){break}HEAP32[r8+2]=0;HEAP32[r8+3]=0;if((r10|0)>2){r11=2;r12=r9}else{break}while(1){HEAP32[r12+(r11<<3)>>2]=0;HEAP32[HEAP32[r7]+(r11<<3)+4>>2]=0;r13=r11+1|0;if((r13|0)>=(HEAP32[r6]|0)){break L3905}r11=r13;r12=HEAP32[r7]}}}while(0);HEAP32[r4+3]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r5>>2]=5265492;r5=(r1+108|0)>>2;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;r7=r1+128|0;r12=(r1+152|0)>>2;r11=r7>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r12]=HEAP32[tempDoublePtr>>2],HEAP32[r12+1]=HEAP32[tempDoublePtr+4>>2];r11=(r1+164|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r4+46]=5263372;r11=(r1+188|0)>>2;HEAP32[r11]=97;HEAP32[r4+48]=0;r6=__Znaj(1164),r9=r6>>2;r10=r6;r6=(r1+196|0)>>2;HEAP32[r6]=r10;r8=HEAP32[r11];L3913:do{if((r8|0)>0){HEAP32[r9]=0;HEAP32[r9+1]=0;HEAP32[r9+2]=1;if((r8|0)>1){r14=1;r15=r10}else{break}while(1){HEAP32[r15+(r14*12&-1)>>2]=0;HEAP32[HEAP32[r6]+(r14*12&-1)+4>>2]=0;HEAP32[HEAP32[r6]+(r14*12&-1)+8>>2]=1;r13=r14+1|0;if((r13|0)>=(HEAP32[r11]|0)){break L3913}r14=r13;r15=HEAP32[r6]}}}while(0);HEAP32[r4+12]=r2;HEAP32[r4+13]=r3;HEAP32[r4+16]=0;HEAP32[r4+15]=0;HEAP32[r4+14]=0;r3=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+212>>2]](r3,r1+72|0,r1+80|0,r1+88|0,r1+92|0,r1+96|0);r1=HEAP32[1310729];HEAP32[r4+17]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+148>>2]](r1,24,5277312,3072,1);r1=HEAP32[1310729];HEAP32[r4+19]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+148>>2]](r1,16,5277384,3072,1);r1=HEAP32[1310729];HEAP32[r4+21]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+148>>2]](r1,16,5277456,3072,1);r1=HEAP32[1310729];HEAP32[r4+50]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+72>>2]](r1,256,256,2,0);HEAP32[r4+51]=0;HEAP32[r4+52]=0;HEAP32[r4+53]=0;HEAP32[r4+45]=0;HEAP32[r4+25]=-1;HEAP32[r4+26]=-1;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;r5=r7>>2;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAP32[r5+4]=0;HEAP32[r5+5]=0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r12]=HEAP32[tempDoublePtr>>2],HEAP32[r12+1]=HEAP32[tempDoublePtr+4>>2];HEAP32[r4+40]=0;return}function __ZN14mgGLGenSurfaceD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r2=0;HEAP32[r1>>2]=5265492;r3=(r1+64|0)>>2;r4=HEAP32[r3];if((r4|0)!=0){r5=r1+60|0;r6=r1+56|0;do{if((Math.imul(HEAP32[r6>>2],HEAP32[r5>>2])|0)>0){r7=0;r8=r4;while(1){r9=HEAP32[r8+(r7<<2)>>2];if((r9|0)==0){r10=r8}else{FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+4>>2]](r9);r10=HEAP32[r3]}HEAP32[r10+(r7<<2)>>2]=0;r9=r7+1|0;r11=(r9|0)<(Math.imul(HEAP32[r6>>2],HEAP32[r5>>2])|0);r12=HEAP32[r3];if(r11){r7=r9;r8=r12}else{break}}if((r12|0)==0){break}else{r13=r12;r2=3515;break}}else{r13=r4;r2=3515}}while(0);if(r2==3515){__ZdlPv(r13)}HEAP32[r3]=0}r3=r1+68|0;r13=HEAP32[r3>>2];if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+4>>2]](r13)}HEAP32[r3>>2]=0;r3=r1+76|0;r13=HEAP32[r3>>2];if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+4>>2]](r13)}HEAP32[r3>>2]=0;r3=r1+84|0;r13=HEAP32[r3>>2];if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+4>>2]](r13)}HEAP32[r3>>2]=0;r3=r1+200|0;r13=HEAP32[r3>>2];if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+4>>2]](r13)}HEAP32[r3>>2]=0;__ZN14mgGLGenSurface12resetCharMapEv(r1);r3=r1|0;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+160>>2]](r3);HEAP32[r1+184>>2]=5263372;r13=r1+188|0;r2=HEAP32[r13>>2];r4=r1+196|0;r12=HEAP32[r4>>2];L3952:do{if((r2|0)>0){r5=r1+192|0;r6=0;r10=r12;r8=r2;while(1){r7=r10+(r6*12&-1)+8|0;if((HEAP32[r7>>2]|0)==0){HEAP32[r10+(r6*12&-1)>>2]=0;HEAP32[r10+(r6*12&-1)+4>>2]=0;HEAP32[r7>>2]=1;HEAP32[r5>>2]=HEAP32[r5>>2]-1|0;r14=HEAP32[r13>>2];r15=HEAP32[r4>>2]}else{r14=r8;r15=r10}r7=r6+1|0;if((r7|0)<(r14|0)){r6=r7;r10=r15;r8=r14}else{r16=r15;break L3952}}}else{r16=r12}}while(0);if((r16|0)==0){__ZN12mgGenSurfaceD2Ev(r3);return}__ZdlPv(r16);__ZN12mgGenSurfaceD2Ev(r3);return}function __ZN14mgGLGenSurface17fillImageTriangleEP17mgGenContextStatePvdddddd(r1,r2,r3,r4,r5,r6,r7,r8,r9){return}function __ZN14mgGLGenSurface18fillImageRectangleEP17mgGenContextStatePvdddddddd(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){return}function __ZN14mgGLGenSurface12drawGraphicsEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r3=r2;r4=r1+128|0;r5=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=r1+136|0;r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=r1+144|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=r1+152|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r4>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r4+4>>2],HEAPF64[tempDoublePtr>>3]);r4=r3|0;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r3+8|0;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r3+16|0;HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r3+24|0;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r4+4>>2]=HEAP32[tempDoublePtr+4>>2];r4=r1+60|0;r8=HEAP32[r4>>2];if((r8|0)<=0){r9=r1+68|0;r10=r1+76|0;r11=r1+84|0;r12=HEAP32[r9>>2];r13=r12;r14=HEAP32[r13>>2];r15=r14+8|0;r16=HEAP32[r15>>2];FUNCTION_TABLE[r16](r12);r17=HEAP32[r10>>2];r18=r17;r19=HEAP32[r18>>2];r20=r19+8|0;r21=HEAP32[r20>>2];FUNCTION_TABLE[r21](r17);r22=HEAP32[r11>>2];r23=r22;r24=HEAP32[r23>>2];r25=r24+8|0;r26=HEAP32[r25>>2];FUNCTION_TABLE[r26](r22);r27=HEAP32[1310729];r28=r27;r29=HEAP32[r28>>2];r30=r29+80|0;r31=HEAP32[r30>>2];FUNCTION_TABLE[r31](r27);r32=r1+160|0;HEAP32[r32>>2]=0;STACKTOP=r2;return}r7=(r1+56|0)>>2;r6=r1+64|0;r5=r1+164|0;r33=r1+168|0;r34=r1+172|0;r35=r1+176|0;r36=r1+52|0;r37=r1+100|0;r38=r1+68|0;r39=(r1+72|0)>>2;r40=r1+76|0;r41=(r1+80|0)>>2;r42=r1+124|0;r43=r1+84|0,r44=r43>>2;r45=r1+200|0;r46=(r1+92|0)>>2;r47=(r1+96|0)>>2;r48=(r1+88|0)>>2;r49=0;r50=HEAP32[r7];r51=r8;while(1){if((r50|0)>0){r8=r49<<8;r52=r8+256|0;r53=-r8|0;r54=0;r55=r50;while(1){r56=Math.imul(r55,r49)+r54|0;r57=HEAP32[HEAP32[r6>>2]+(r56<<2)>>2];r56=r54<<8;r58=HEAP32[r5>>2];r59=HEAP32[r33>>2];r60=(r58|0)>(r56|0)?r58:r56;r61=(r59|0)>(r8|0)?r59:r8;r62=HEAP32[r34>>2]+r58|0;r58=r56+256|0;r63=HEAP32[r35>>2]+r59|0;r59=((r62|0)<(r58|0)?r62:r58)-r60|0;r58=(r59|0)<0?0:r59;r59=((r63|0)<(r52|0)?r63:r52)-r61|0;r63=(r59|0)<0?0:r59;do{if(!((r58|0)<1|(r63|0)<1)){if((r57|0)==0){r59=HEAP32[1310729];r62=FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+72>>2]](r59,256,256,0,HEAP32[r36>>2]);r59=Math.imul(HEAP32[r7],r49)+r54|0;HEAP32[HEAP32[r6>>2]+(r59<<2)>>2]=r62;r64=r62,r65=r64>>2}else{r64=r57,r65=r64>>2}r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+76>>2]](r62,r64,0);_glScissor(r60-r56|0,r61-r8|0,r58,r63);r62=HEAP32[r37>>2];if((r62|0)==3){_glBlendFuncSeparate(770,771,0,1);r59=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+280>>2]](r59,1)}else if((r62|0)==2){_glBlendFunc(1,0);r59=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+280>>2]](r59,0)}else if((r62|0)==1){_glBlendFunc(1,0);r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+280>>2]](r62,0)}_glDisable(2884);if((HEAP32[HEAP32[r38>>2]+20>>2]|0)>0){r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+108>>2]](r62,HEAP32[r39]);r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+120>>2]](r62,HEAP32[r39],5246384,HEAP32[r65+22]|0,HEAP32[r65+23]|0);r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+120>>2]](r62,HEAP32[r39],5246288,-r56|0,r53);r62=HEAP32[1310729];r59=HEAP32[r38>>2];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+172>>2]](r62,0,r59,0,HEAP32[r59+20>>2]);break}if((HEAP32[HEAP32[r40>>2]+20>>2]|0)>0){r59=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+108>>2]](r59,HEAP32[r41]);r59=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+156>>2]](r59,HEAP32[r42>>2],0);r59=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+120>>2]](r59,HEAP32[r41],5246384,HEAP32[r65+22]|0,HEAP32[r65+23]|0);r59=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+120>>2]](r59,HEAP32[r41],5246288,-r56|0,r53);r59=HEAP32[1310729];r62=HEAP32[r40>>2];FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+172>>2]](r59,0,r62,0,HEAP32[r62+20>>2]);break}if((HEAP32[HEAP32[r44]+20>>2]|0)<=0){break}r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+156>>2]](r62,HEAP32[r45>>2],0);r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+280>>2]](r62,1);if((HEAP32[r37>>2]|0)==2){_glBlendFuncSeparate(770,771,0,771);r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+108>>2]](r62,HEAP32[r46]);r62=HEAP32[1310729];r59=r64+88|0;r66=r64+92|0;FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+120>>2]](r62,HEAP32[r46],5246384,HEAP32[r59>>2]|0,HEAP32[r66>>2]|0);r62=HEAP32[1310729];r67=-r56|0;FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+120>>2]](r62,HEAP32[r46],5246288,r67,r53);r62=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+128>>2]](r62,HEAP32[r46],5256924,r3);r62=HEAP32[1310729];r68=HEAP32[r44];FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+172>>2]](r62,0,r68,0,HEAP32[r68+20>>2]);_glBlendFuncSeparate(0,1,1,1);r68=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r68>>2]+108>>2]](r68,HEAP32[r47]);r68=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r68>>2]+120>>2]](r68,HEAP32[r47],5246384,HEAP32[r59>>2]|0,HEAP32[r66>>2]|0);r66=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+120>>2]](r66,HEAP32[r47],5246288,r67,r53);r67=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r67>>2]+128>>2]](r67,HEAP32[r47],5256924,r3);r67=HEAP32[1310729];r66=HEAP32[r44];FUNCTION_TABLE[HEAP32[HEAP32[r67>>2]+172>>2]](r67,0,r66,0,HEAP32[r66+20>>2]);break}else{r66=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+108>>2]](r66,HEAP32[r48]);r66=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+120>>2]](r66,HEAP32[r48],5246384,HEAP32[r65+22]|0,HEAP32[r65+23]|0);r66=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+120>>2]](r66,HEAP32[r48],5246288,-r56|0,r53);r66=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+128>>2]](r66,HEAP32[r48],5256924,r3);r66=HEAP32[1310729];r67=HEAP32[r44];FUNCTION_TABLE[HEAP32[HEAP32[r66>>2]+172>>2]](r66,0,r67,0,HEAP32[r67+20>>2]);break}}}while(0);r56=r54+1|0;r69=HEAP32[r7];if((r56|0)<(r69|0)){r54=r56;r55=r69}else{break}}r70=r69;r71=HEAP32[r4>>2]}else{r70=r50;r71=r51}r55=r49+1|0;if((r55|0)<(r71|0)){r49=r55;r50=r70;r51=r71}else{r9=r38;r10=r40;r11=r43;break}}r12=HEAP32[r9>>2];r13=r12;r14=HEAP32[r13>>2];r15=r14+8|0;r16=HEAP32[r15>>2];FUNCTION_TABLE[r16](r12);r17=HEAP32[r10>>2];r18=r17;r19=HEAP32[r18>>2];r20=r19+8|0;r21=HEAP32[r20>>2];FUNCTION_TABLE[r21](r17);r22=HEAP32[r11>>2];r23=r22;r24=HEAP32[r23>>2];r25=r24+8|0;r26=HEAP32[r25>>2];FUNCTION_TABLE[r26](r22);r27=HEAP32[1310729];r28=r27;r29=HEAP32[r28>>2];r30=r29+80|0;r31=HEAP32[r30>>2];FUNCTION_TABLE[r31](r27);r32=r1+160|0;HEAP32[r32>>2]=0;STACKTOP=r2;return}function __ZN14mgGLGenSurface17fillSolidTriangleEP17mgGenContextStateRK7mgColordddddd(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r10=r2>>2;r11=r1>>2;r12=STACKTOP;STACKTOP=STACKTOP+72|0;r13=r12,r14=r13>>2;r15=r12+24,r16=r15>>2;r17=r12+48,r18=r17>>2;r19=r1+160|0;L4002:do{if((HEAP32[r19>>2]|0)==0){r20=r2+36|0;r21=r1+100|0}else{r22=r1+100|0;r23=r2+36|0;do{if((HEAP32[r22>>2]|0)==(HEAP32[r23>>2]|0)){if((HEAP32[r11+26]|0)!=0){break}if((HEAP32[r11+41]|0)!=(HEAP32[r10]|0)){break}if((HEAP32[r11+42]|0)!=(HEAP32[r10+1]|0)){break}if((HEAP32[r11+43]|0)!=(HEAP32[r10+2]|0)){break}if((HEAP32[r11+44]|0)!=(HEAP32[r10+3]|0)){break}if((HEAP32[HEAP32[r11+17]+20>>2]+3|0)<=3072){r20=r23;r21=r22;break L4002}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r11]+176>>2]](r1);r20=r23;r21=r22}}while(0);HEAP32[r11+26]=0;HEAP32[r21>>2]=HEAP32[r20>>2];HEAP32[r11+41]=HEAP32[r10];HEAP32[r11+42]=HEAP32[r10+1];HEAP32[r11+43]=HEAP32[r10+2];HEAP32[r11+44]=HEAP32[r10+3];HEAP32[r19>>2]=1;r19=r2+16|0;r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=r2+24|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=r3|0;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r14+2]=r11;r19=r3+8|0;r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r14+3]=r20;r19=r3+16|0;r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r14+4]=r21;r19=r3+24|0;r3=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r14+5]=r3;HEAPF32[r16+2]=r11;HEAPF32[r16+3]=r20;HEAPF32[r16+4]=r21;HEAPF32[r16+5]=r3;HEAPF32[r18+2]=r11;HEAPF32[r18+3]=r20;HEAPF32[r18+4]=r21;HEAPF32[r18+5]=r3;HEAPF32[r14]=r10+r4;HEAPF32[r14+1]=r2+r5;HEAPF32[r16]=r10+r6;HEAPF32[r16+1]=r2+r7;HEAPF32[r18]=r10+r8;HEAPF32[r18+1]=r2+r9;r9=(r1+68|0)>>2;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r9],r13);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r9],r15);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r9],r17);STACKTOP=r12;return}function __ZN14mgGLGenSurface18fillSolidRectangleEP17mgGenContextStateRK7mgColordddd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r8=r2>>2;r9=r1>>2;r10=STACKTOP;STACKTOP=STACKTOP+96|0;r11=r10,r12=r11>>2;r13=r10+24,r14=r13>>2;r15=r10+48,r16=r15>>2;r17=r10+72,r18=r17>>2;r19=r1+160|0;L4015:do{if((HEAP32[r19>>2]|0)==0){r20=r2+36|0;r21=r1+100|0}else{r22=r1+100|0;r23=r2+36|0;do{if((HEAP32[r22>>2]|0)==(HEAP32[r23>>2]|0)){if((HEAP32[r9+26]|0)!=0){break}if((HEAP32[r9+41]|0)!=(HEAP32[r8]|0)){break}if((HEAP32[r9+42]|0)!=(HEAP32[r8+1]|0)){break}if((HEAP32[r9+43]|0)!=(HEAP32[r8+2]|0)){break}if((HEAP32[r9+44]|0)!=(HEAP32[r8+3]|0)){break}if((HEAP32[HEAP32[r9+17]+20>>2]+6|0)<=3072){r20=r23;r21=r22;break L4015}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r9]+176>>2]](r1);r20=r23;r21=r22}}while(0);HEAP32[r9+26]=0;HEAP32[r21>>2]=HEAP32[r20>>2];HEAP32[r9+41]=HEAP32[r8];HEAP32[r9+42]=HEAP32[r8+1];HEAP32[r9+43]=HEAP32[r8+2];HEAP32[r9+44]=HEAP32[r8+3];HEAP32[r19>>2]=1;r19=r2+16|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=r2+24|0;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);r19=r3|0;r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r12+2]=r9;r19=r3+8|0;r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r12+3]=r20;r19=r3+16|0;r21=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r12+4]=r21;r19=r3+24|0;r3=(HEAP32[tempDoublePtr>>2]=HEAP32[r19>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r19+4>>2],HEAPF64[tempDoublePtr>>3]);HEAPF32[r12+5]=r3;HEAPF32[r14+2]=r9;HEAPF32[r14+3]=r20;HEAPF32[r14+4]=r21;HEAPF32[r14+5]=r3;HEAPF32[r16+2]=r9;HEAPF32[r16+3]=r20;HEAPF32[r16+4]=r21;HEAPF32[r16+5]=r3;HEAPF32[r18+2]=r9;HEAPF32[r18+3]=r20;HEAPF32[r18+4]=r21;HEAPF32[r18+5]=r3;r3=r8+r4;HEAPF32[r12]=r3;r4=r2+r5;HEAPF32[r12+1]=r4;r12=r8+r6;HEAPF32[r14]=r12;HEAPF32[r14+1]=r4;HEAPF32[r16]=r3;r3=r2+r7;HEAPF32[r16+1]=r3;HEAPF32[r18]=r12;HEAPF32[r18+1]=r3;r3=(r1+68|0)>>2;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r3],r11);r11=r13;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r3],r11);r13=r15;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r3],r13);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r3],r13);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r3],r11);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r3],r17);STACKTOP=r10;return}function __ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+44|0;r7=r6;r8=r6+8;r9=r6+16;r10=r6+24;r11=r6+32;r12=r6+36,r13=r12>>2;r14=r6+40;HEAP32[r4>>2]=0;r15=HEAP32[r2+204>>2]<<20|r3;r16=r1+184|0;r17=HEAP32[r1+188>>2];r18=(((r15|0)>-1?r15:-r15|0)|0)%(r17|0);r19=HEAP32[r1+196>>2]>>2;r20=r18;while(1){if((HEAP32[((r20*12&-1)+8>>2)+r19]|0)!=0){break}if((HEAP32[((r20*12&-1)>>2)+r19]|0)==(r15|0)){r5=3602;break}r21=r20+1|0;r22=(r21|0)<(r17|0)?r21:0;if((r22|0)==(r18|0)){break}else{r20=r22}}if(r5==3602){r23=HEAP32[((r20*12&-1)+4>>2)+r19];STACKTOP=r6;return r23}HEAP32[r14>>2]=0;_mgCanvasGetChar(HEAP32[r2+88>>2],r3,r7,r8,r9,r10,r11,r12,r14);r12=HEAP32[r11>>2];r3=((r12+3|0)/4&-1)<<2;r2=r1+212|0;r19=HEAP32[r2>>2];r20=(r1+208|0)>>2;r5=HEAP32[r20];r18=r3|1;r17=HEAP32[r1+200>>2];r22=r17+88|0;r21=r1+204|0;r24=HEAP32[r21>>2];do{if((r18+r5|0)>(HEAP32[r22>>2]|0)){r25=r24+r19|0;HEAP32[r2>>2]=r25;HEAP32[r21>>2]=0;HEAP32[r20]=0;if((r18|0)<=(HEAP32[r22>>2]|0)){r26=HEAP32[r13];if((r26+(r25+1)|0)<=(HEAP32[r17+92>>2]|0)){r27=0;r28=r25;r29=0;r30=r26;break}}HEAP32[r4>>2]=1;r23=0;STACKTOP=r6;return r23}else{r27=r5;r28=r19;r29=r24;r30=HEAP32[r13]}}while(0);r24=r27+1|0;r19=r28+1|0;r28=r30+2|0;HEAP32[r1+204>>2]=(r29|0)>(r28|0)?r29:r28;HEAP32[r20]=r27+(r12+2)|0;r12=HEAP32[r14>>2];if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+16>>2]](r17,r24,r19,r3,r30,r12)}r12=__Znwj(48),r30=r12>>2;r3=r12;r17=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r12+32|0;HEAPF64[tempDoublePtr>>3]=r17,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r8>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+4>>2],HEAPF64[tempDoublePtr>>3]);r8=r12+40|0;HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r9>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+4>>2],HEAPF64[tempDoublePtr>>3]);r9=r12+16|0;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r10>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+4>>2],HEAPF64[tempDoublePtr>>3]);r10=r12+24|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r30]=r24;HEAP32[r30+1]=r19;HEAP32[r30+2]=HEAP32[r11>>2];HEAP32[r30+3]=HEAP32[r13];__ZN15mgMapDWordToPtr5setAtEjPKv(r16,r15,r12);r23=r3;STACKTOP=r6;return r23}function __ZN14mgGLGenSurface10drawStringEP17mgGenContextStatePKcidd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r7=r2>>2;r8=r1>>2;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+68|0;r11=r10;r12=r10+16;r13=r10+32;r14=r10+48;r15=r10+64;r16=(r1+160|0)>>2;L4049:do{if((HEAP32[r16]|0)==0){r17=r2+36|0;r18=r1+100|0}else{r19=r1+100|0;r20=r2+36|0;do{if((HEAP32[r19>>2]|0)==(HEAP32[r20>>2]|0)){if((HEAP32[r8+26]|0)!=2){break}r21=r2+52|0;r22=r1+128|0;if((HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3])!=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r22+4>>2],HEAPF64[tempDoublePtr>>3])){break}r22=r2+60|0;r21=r1+136|0;if((HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r22+4>>2],HEAPF64[tempDoublePtr>>3])!=(HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3])){break}r21=r2+68|0;r22=r1+144|0;if((HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3])!=(HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r22+4>>2],HEAPF64[tempDoublePtr>>3])){break}r22=r2+76|0;r21=r1+152|0;if((HEAP32[tempDoublePtr>>2]=HEAP32[r22>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r22+4>>2],HEAPF64[tempDoublePtr>>3])!=(HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3])){break}if((HEAP32[r8+41]|0)!=(HEAP32[r7]|0)){break}if((HEAP32[r8+42]|0)!=(HEAP32[r7+1]|0)){break}if((HEAP32[r8+43]|0)!=(HEAP32[r7+2]|0)){break}if((HEAP32[r8+44]|0)!=(HEAP32[r7+3]|0)){break}if((HEAP32[HEAP32[r8+21]+20>>2]+(r4*6&-1)|0)<=3072){r17=r20;r18=r19;break L4049}}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r8]+176>>2]](r1);r17=r20;r18=r19}}while(0);HEAP32[r8+26]=2;HEAP32[r18>>2]=HEAP32[r17>>2];HEAP32[r8+41]=HEAP32[r7];HEAP32[r8+42]=HEAP32[r7+1];HEAP32[r8+43]=HEAP32[r7+2];HEAP32[r8+44]=HEAP32[r7+3];r7=r2+52|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+128|0;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r2+60|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+136|0;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r2+68|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+144|0;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=r2+76|0;r8=(HEAP32[tempDoublePtr>>2]=HEAP32[r7>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r7+4>>2],HEAPF64[tempDoublePtr>>3]);r7=r1+152|0;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r16]=1;r7=(r1+200|0)>>2;r8=HEAP32[r7];if((r4|0)<=0){STACKTOP=r10;return}r17=r2+24|0;r18=r2+16|0;r21=r2+40|0;r2=r1;r22=r1+212|0;r23=r1+208|0;r24=r1+204|0;r25=r11|0;r26=r11+4|0;r27=r11+8|0;r28=r11+12|0;r29=r12|0;r30=r12+4|0;r31=r12+8|0;r32=r12+12|0;r33=r13|0;r34=r13+4|0;r35=r13+8|0;r36=r13+12|0;r37=r14|0;r38=r14+4|0;r39=r14+8|0;r40=r14+12|0;r41=(r1+84|0)>>2;r42=r11;r11=r12;r12=r13;r13=r14;r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r17>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r17+4>>2],HEAPF64[tempDoublePtr>>3])+r6;r6=HEAP32[r8+88>>2]|0;r17=HEAP32[r8+92>>2]|0;r8=0;r43=(HEAP32[tempDoublePtr>>2]=HEAP32[r18>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r18+4>>2],HEAPF64[tempDoublePtr>>3])+r5;L4068:while(1){r5=r6;r18=r17;r44=r8;while(1){r45=HEAP8[r3+r44|0];L4072:do{if(r45<<24>>24==0){r46=0;r47=1}else{r48=0;r49=0;r50=r45;r51=1;while(1){r52=r50&255;if((r52&128|0)==0){r46=r52;r47=r51;break L4072}do{if((r52&192|0)==128){r53=r48<<6|r52&63;r54=r49-1|0;if((r54|0)<0){r46=r52;r47=r51;break L4072}if((r54|0)==0){r46=r53;r47=r51;break L4072}else{r55=r54;r56=r53}}else{if((r52&224|0)==192){r55=1;r56=r52&31;break}if((r52&240|0)==224){r55=2;r56=r52&15;break}if((r52&248|0)==240){r55=3;r56=r52&7;break}if((r52&252|0)==248){r55=4;r56=r52&3;break}if((r52&254|0)!=252){r46=r52;r47=r51;break L4072}r55=5;r56=r52&1}}while(0);r52=HEAP8[r3+r51+r44|0];r53=r51+1|0;if(r52<<24>>24==0){r46=0;r47=r53;break L4072}else{r48=r56;r49=r55;r50=r52;r51=r53}}}}while(0);r57=r47+r44|0;r45=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,HEAP32[r21>>2],r46,r15);do{if((HEAP32[r15>>2]|0)==0){r58=r45,r59=r58>>2;r60=r18;r61=r5;r9=3657}else{FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+176>>2]](r1);HEAP32[r16]=1;__ZN14mgGLGenSurface12resetCharMapEv(r1);r51=HEAP32[r7],r50=r51>>2;r49=HEAP32[r50+22];r48=HEAP32[r50+23];do{if((r49|0)<1024){r62=r48;r63=r49<<1;r9=3653;break}else{if((r48|0)>=1024){r64=r49;r65=r48;break}r62=r48<<1;r63=r49;r9=3653;break}}while(0);if(r9==3653){r9=0;if((r51|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r50]+4>>2]](r51)}HEAP32[r22>>2]=0;HEAP32[r23>>2]=0;HEAP32[r24>>2]=0;r49=HEAP32[1310729];HEAP32[r7]=FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+72>>2]](r49,r63,r62,2,0);__Z7mgDebugPKcz(5245696,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r63,HEAP32[tempInt+4>>2]=r62,tempInt));r49=HEAP32[r7];r64=HEAP32[r49+88>>2];r65=HEAP32[r49+92>>2]}r49=r64|0;r48=r65|0;r53=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,HEAP32[r21>>2],r46,r15);if((HEAP32[r15>>2]|0)==0){r58=r53,r59=r58>>2;r60=r48;r61=r49;r9=3657;break}else{r66=r48;r67=r49;break}}}while(0);if(r9==3657){r9=0;if((r58|0)==0){r66=r60;r67=r61}else{break}}if((r57|0)<(r4|0)){r5=r67;r18=r66;r44=r57}else{r9=3662;break L4068}}r44=r58+16|0;r18=r43+(HEAP32[tempDoublePtr>>2]=HEAP32[r44>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r44+4>>2],HEAPF64[tempDoublePtr>>3]);r44=r18;HEAPF32[r25>>2]=r44;r5=r58+24|0;r19=r14-(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);r5=r19;HEAPF32[r26>>2]=r5;r20=HEAP32[r59];r45=(r20|0)/r61;HEAPF32[r27>>2]=r45;r49=HEAP32[r59+1];r48=(r49|0)/r60;HEAPF32[r28>>2]=r48;r53=HEAP32[r59+2];r52=r18+(r53|0);HEAPF32[r29>>2]=r52;HEAPF32[r30>>2]=r5;r5=(r53+r20|0)/r61;HEAPF32[r31>>2]=r5;HEAPF32[r32>>2]=r48;HEAPF32[r33>>2]=r44;r44=HEAP32[r59+3];r48=r19+(r44|0);HEAPF32[r34>>2]=r48;HEAPF32[r35>>2]=r45;r45=(r44+r49|0)/r60;HEAPF32[r36>>2]=r45;HEAPF32[r37>>2]=r52;HEAPF32[r38>>2]=r48;HEAPF32[r39>>2]=r5;HEAPF32[r40>>2]=r45;__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r41],r42);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r41],r11);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r41],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r41],r12);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r41],r11);__ZN14mgVertexBuffer9addVertexEPKv(HEAP32[r41],r13);r45=r58+32|0;r5=r43+Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r45>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r45+4>>2],HEAPF64[tempDoublePtr>>3]));r45=r58+40|0;r48=r14+Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r45>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r45+4>>2],HEAPF64[tempDoublePtr>>3]));if((r57|0)<(r4|0)){r14=r48;r6=r61;r17=r60;r8=r57;r43=r5}else{r9=3663;break}}if(r9==3662){STACKTOP=r10;return}else if(r9==3663){STACKTOP=r10;return}}function __ZN14mgGLGenSurface5flushEv(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+176>>2]](r1);return}function __ZN14mgGLGenSurface12stringExtentEPK9mgGenFontPKciR7mgPointR11mgRectangle(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+4|0;r9=r8;L4116:do{if((r4|0)>0){r10=r1+200|0;r11=r1+212|0;r12=r1+208|0;r13=r1+204|0;r14=0;r15=2147483647;r16=2147483647;r17=0;r18=0;r19=0;r20=0;while(1){r21=r19;while(1){r22=HEAP8[r3+r21|0];L4122:do{if(r22<<24>>24==0){r23=0;r24=1}else{r25=0;r26=0;r27=r22;r28=1;while(1){r29=r27&255;if((r29&128|0)==0){r23=r29;r24=r28;break L4122}do{if((r29&192|0)==128){r30=r25<<6|r29&63;r31=r26-1|0;if((r31|0)<0){r23=r29;r24=r28;break L4122}if((r31|0)==0){r23=r30;r24=r28;break L4122}else{r32=r31;r33=r30}}else{if((r29&224|0)==192){r32=1;r33=r29&31;break}if((r29&240|0)==224){r32=2;r33=r29&15;break}if((r29&248|0)==240){r32=3;r33=r29&7;break}if((r29&252|0)==248){r32=4;r33=r29&3;break}if((r29&254|0)!=252){r23=r29;r24=r28;break L4122}r32=5;r33=r29&1}}while(0);r29=HEAP8[r3+r28+r21|0];r30=r28+1|0;if(r29<<24>>24==0){r23=0;r24=r30;break L4122}else{r25=r33;r26=r32;r27=r29;r28=r30}}}}while(0);r34=r24+r21|0;r22=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r23,r9);do{if((HEAP32[r9>>2]|0)==0){r35=r22;r7=3693}else{__ZN14mgGLGenSurface12resetCharMapEv(r1);r28=HEAP32[r10>>2],r27=r28>>2;r26=HEAP32[r27+22];r25=HEAP32[r27+23];do{if((r26|0)<1024){r36=r25;r37=r26<<1;r7=3689;break}else{if((r25|0)>=1024){break}r36=r25<<1;r37=r26;r7=3689;break}}while(0);if(r7==3689){r7=0;if((r28|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r27]+4>>2]](r28)}HEAP32[r11>>2]=0;HEAP32[r12>>2]=0;HEAP32[r13>>2]=0;r26=HEAP32[1310729];HEAP32[r10>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+72>>2]](r26,r37,r36,2,0);__Z7mgDebugPKcz(5245696,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r37,HEAP32[tempInt+4>>2]=r36,tempInt))}r26=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r23,r9);if((HEAP32[r9>>2]|0)==0){r35=r26;r7=3693;break}else{break}}}while(0);if(r7==3693){r7=0;if((r35|0)!=0){break}}if((r34|0)<(r4|0)){r21=r34}else{r38=r14;r39=r15;r40=r16;r41=r17;r42=r18;r43=r20;break L4116}}r21=r35+32|0;r22=r20+Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3]));r21=r35+40|0;r26=r14+Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3]));r21=r35+16|0;r25=r22+(HEAP32[tempDoublePtr>>2]=HEAP32[r21>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r21+4>>2],HEAPF64[tempDoublePtr>>3]);r21=r15<r25?r15:r25;r30=r35+24|0;r29=r26-(HEAP32[tempDoublePtr>>2]=HEAP32[r30>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r30+4>>2],HEAPF64[tempDoublePtr>>3]);r30=r16<r29?r16:r29;r31=r25+(HEAP32[r35+8>>2]|0);r25=r17>r31?r17:r31;r31=r29+(HEAP32[r35+12>>2]|0);r29=r18>r31?r18:r31;if((r34|0)<(r4|0)){r14=r26;r15=r21;r16=r30;r17=r25;r18=r29;r19=r34;r20=r22}else{r38=r26;r39=r21;r40=r30;r41=r25;r42=r29;r43=r22;break L4116}}}else{r38=0;r39=2147483647;r40=2147483647;r41=0;r42=0;r43=0}}while(0);HEAP32[r5>>2]=r43&-1;HEAP32[r5+4>>2]=r38&-1;r38=r39&-1;HEAP32[r6>>2]=r38;r39=r40&-1;HEAP32[r6+4>>2]=r39;HEAP32[r6+8>>2]=(Math.ceil(r41)&-1)-r38|0;HEAP32[r6+12>>2]=(Math.ceil(r42)&-1)-r39|0;STACKTOP=r8;return}function __ZN14mgGLGenSurface11stringWidthEPK9mgGenFontPKci(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+4|0;r7=r6;if((r4|0)<=0){r8=0;r9=r8&-1;STACKTOP=r6;return r9}r10=r1+200|0;r11=r1+212|0;r12=r1+208|0;r13=r1+204|0;r14=0;r15=0;L4166:while(1){r16=r14;while(1){r17=HEAP8[r3+r16|0];L4170:do{if(r17<<24>>24==0){r18=0;r19=1}else{r20=0;r21=0;r22=r17;r23=1;while(1){r24=r22&255;if((r24&128|0)==0){r18=r24;r19=r23;break L4170}do{if((r24&192|0)==128){r25=r20<<6|r24&63;r26=r21-1|0;if((r26|0)<0){r18=r24;r19=r23;break L4170}if((r26|0)==0){r18=r25;r19=r23;break L4170}else{r27=r26;r28=r25}}else{if((r24&224|0)==192){r27=1;r28=r24&31;break}if((r24&240|0)==224){r27=2;r28=r24&15;break}if((r24&248|0)==240){r27=3;r28=r24&7;break}if((r24&252|0)==248){r27=4;r28=r24&3;break}if((r24&254|0)!=252){r18=r24;r19=r23;break L4170}r27=5;r28=r24&1}}while(0);r24=HEAP8[r3+r23+r16|0];r25=r23+1|0;if(r24<<24>>24==0){r18=0;r19=r25;break L4170}else{r20=r28;r21=r27;r22=r24;r23=r25}}}}while(0);r29=r19+r16|0;r17=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r18,r7);do{if((HEAP32[r7>>2]|0)==0){r30=r17;r5=3725}else{__ZN14mgGLGenSurface12resetCharMapEv(r1);r23=HEAP32[r10>>2],r22=r23>>2;r21=HEAP32[r22+22];r20=HEAP32[r22+23];do{if((r21|0)<1024){r31=r20;r32=r21<<1;r5=3721;break}else{if((r20|0)>=1024){break}r31=r20<<1;r32=r21;r5=3721;break}}while(0);if(r5==3721){r5=0;if((r23|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+4>>2]](r23)}HEAP32[r11>>2]=0;HEAP32[r12>>2]=0;HEAP32[r13>>2]=0;r21=HEAP32[1310729];HEAP32[r10>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r21>>2]+72>>2]](r21,r32,r31,2,0);__Z7mgDebugPKcz(5245696,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r32,HEAP32[tempInt+4>>2]=r31,tempInt))}r21=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r18,r7);if((HEAP32[r7>>2]|0)==0){r30=r21;r5=3725;break}else{break}}}while(0);if(r5==3725){r5=0;if((r30|0)!=0){break}}if((r29|0)<(r4|0)){r16=r29}else{r8=r15;r5=3730;break L4166}}r16=r30+32|0;r17=r15+Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]));if((r29|0)<(r4|0)){r14=r29;r15=r17}else{r8=r17;r5=3731;break}}if(r5==3731){r9=r8&-1;STACKTOP=r6;return r9}else if(r5==3730){r9=r8&-1;STACKTOP=r6;return r9}}function __ZN14mgGLGenSurface9stringFitEPK9mgGenFontPKcii(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r6=0;r7=STACKTOP;STACKTOP=STACKTOP+4|0;r8=r7;r9=r5|0;if(!((r5|0)>0&(r4|0)>0)){r10=0;STACKTOP=r7;return r10}r5=r1+200|0;r11=r1+212|0;r12=r1+208|0;r13=r1+204|0;r14=0;r15=0;L4216:while(1){r16=r14;while(1){r17=HEAP8[r3+r16|0];L4220:do{if(r17<<24>>24==0){r18=0;r19=1}else{r20=0;r21=0;r22=r17;r23=1;while(1){r24=r22&255;if((r24&128|0)==0){r18=r24;r19=r23;break L4220}do{if((r24&192|0)==128){r25=r20<<6|r24&63;r26=r21-1|0;if((r26|0)<0){r18=r24;r19=r23;break L4220}if((r26|0)==0){r18=r25;r19=r23;break L4220}else{r27=r26;r28=r25}}else{if((r24&224|0)==192){r27=1;r28=r24&31;break}if((r24&240|0)==224){r27=2;r28=r24&15;break}if((r24&248|0)==240){r27=3;r28=r24&7;break}if((r24&252|0)==248){r27=4;r28=r24&3;break}if((r24&254|0)!=252){r18=r24;r19=r23;break L4220}r27=5;r28=r24&1}}while(0);r24=HEAP8[r3+r23+r16|0];r25=r23+1|0;if(r24<<24>>24==0){r18=0;r19=r25;break L4220}else{r20=r28;r21=r27;r22=r24;r23=r25}}}}while(0);r29=r19+r16|0;r17=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r18,r8);do{if((HEAP32[r8>>2]|0)==0){r30=r17;r6=3760}else{__ZN14mgGLGenSurface12resetCharMapEv(r1);r23=HEAP32[r5>>2],r22=r23>>2;r21=HEAP32[r22+22];r20=HEAP32[r22+23];do{if((r21|0)<1024){r31=r20;r32=r21<<1;r6=3756;break}else{if((r20|0)>=1024){break}r31=r20<<1;r32=r21;r6=3756;break}}while(0);if(r6==3756){r6=0;if((r23|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+4>>2]](r23)}HEAP32[r11>>2]=0;HEAP32[r12>>2]=0;HEAP32[r13>>2]=0;r21=HEAP32[1310729];HEAP32[r5>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r21>>2]+72>>2]](r21,r32,r31,2,0);__Z7mgDebugPKcz(5245696,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r32,HEAP32[tempInt+4>>2]=r31,tempInt))}r21=__ZN14mgGLGenSurface7getCharEPK9mgGenFontiRj(r1,r2,r18,r8);if((HEAP32[r8>>2]|0)==0){r30=r21;r6=3760;break}else{break}}}while(0);if(r6==3760){r6=0;if((r30|0)!=0){break}}if((r29|0)<(r4|0)){r16=r29}else{r10=r29;r6=3765;break L4216}}r16=r30+32|0;r17=r15+Math.ceil((HEAP32[tempDoublePtr>>2]=HEAP32[r16>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+4>>2],HEAPF64[tempDoublePtr>>3]));if(r17<r9&(r29|0)<(r4|0)){r14=r29;r15=r17}else{r10=r29;r6=3766;break}}if(r6==3765){STACKTOP=r7;return r10}else if(r6==3766){STACKTOP=r7;return r10}}function __ZN14mgGLGenSurface14setSurfaceSizeEii(r1,r2,r3){var r4,r5,r6,r7;r4=0;r5=r1|0;r6=r1+4|0;r7=r1+8|0;do{if((HEAP32[r6>>2]|0)==(r2|0)){if((HEAP32[r7>>2]|0)==(r3|0)){break}else{r4=3769;break}}else{r4=3769}}while(0);if(r4==3769){HEAP32[r6>>2]=r2;HEAP32[r7>>2]=r3}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+64>>2]](r5,0,0,r2,r3);r5=HEAP32[r1>>2];if((HEAP32[r1+48>>2]|0)==0){FUNCTION_TABLE[HEAP32[r5+184>>2]](r1,r2,r3);return}else{FUNCTION_TABLE[HEAP32[r5+180>>2]](r1,r2,r3);return}}function __ZN14mgGLGenSurface17resizeSingleImageEii(r1,r2,r3){var r4,r5,r6;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+188>>2]](r1);HEAP32[r1+56>>2]=1;HEAP32[r1+60>>2]=1;r4=(r1+64|0)>>2;HEAP32[r4]=__Znaj(4);r5=HEAP32[1310729];r6=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+72>>2]](r5,r2,r3,0,HEAP32[r1+52>>2]);HEAP32[HEAP32[r4]>>2]=r6;r6=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+76>>2]](r6,HEAP32[HEAP32[r4]>>2],0);_glScissor(0,0,r2,r3);_glClearColor(0,0,0,0);_glClear(16384);return}function __ZN14mgGLGenSurface16resizeTiledImageEii(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=(r2+255|0)/256&-1;r2=(r3+255|0)/256&-1;r3=(r1+56|0)>>2;r5=(r1+60|0)>>2;r6=Math.imul(HEAP32[r5],HEAP32[r3]);r7=Math.imul(r2,r4);if((r6|0)==(r7|0)){HEAP32[r3]=r4;HEAP32[r5]=r2;return}r8=_llvm_umul_with_overflow_i32(r7,4);r9=__Znaj(tempRet0?-1:r8);r8=(r7|0)<(r6|0);L4279:do{if(((r8?r7:r6)|0)>0){r10=r6^-1;r11=r7^-1;r12=((r10|0)>(r11|0)?r10:r11)^-1;r11=HEAP32[r1+64>>2];r10=0;while(1){HEAP32[r9+(r10<<2)>>2]=HEAP32[r11+(r10<<2)>>2];r13=r10+1|0;if((r13|0)==(r12|0)){break L4279}else{r10=r13}}}}while(0);L4284:do{if((r6|0)<(r7|0)){r10=r1+52|0;r12=r6;while(1){r11=HEAP32[1310729];HEAP32[r9+(r12<<2)>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+72>>2]](r11,256,256,0,HEAP32[r10>>2]);r11=r12+1|0;if((r11|0)==(r7|0)){break L4284}else{r12=r11}}}}while(0);r12=(r1+64|0)>>2;r1=HEAP32[r12];L4289:do{if(r8){r10=r7;r11=r1;while(1){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){r14=r11}else{FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+4>>2]](r13);r14=HEAP32[r12]}r13=r10+1|0;if((r13|0)==(r6|0)){r15=r14;break L4289}else{r10=r13;r11=r14}}}else{r15=r1}}while(0);if((r15|0)!=0){__ZdlPv(r15)}HEAP32[r12]=r9;HEAP32[r3]=r4;HEAP32[r5]=r2;if((r7|0)>0){r16=0;r17=r9}else{return}while(1){r9=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+76>>2]](r9,HEAP32[r17+(r16<<2)>>2],0);_glScissor(0,0,256,256);_glClearColor(0,0,0,0);_glClear(16384);r9=r16+1|0;if((r9|0)>=(Math.imul(HEAP32[r3],HEAP32[r5])|0)){break}r16=r9;r17=HEAP32[r12]}return}function __ZN14mgGLGenSurface11deleteTilesEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=(r1+64|0)>>2;r4=HEAP32[r3];if((r4|0)==0){return}r5=r1+60|0;r6=r1+56|0;do{if((Math.imul(HEAP32[r6>>2],HEAP32[r5>>2])|0)>0){r1=0;r7=r4;while(1){r8=HEAP32[r7+(r1<<2)>>2];if((r8|0)==0){r9=r7}else{FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+4>>2]](r8);r9=HEAP32[r3]}HEAP32[r9+(r1<<2)>>2]=0;r8=r1+1|0;r10=(r8|0)<(Math.imul(HEAP32[r6>>2],HEAP32[r5>>2])|0);r11=HEAP32[r3];if(r10){r1=r8;r7=r11}else{break}}if((r11|0)==0){break}else{r12=r11;r2=3804;break}}else{r12=r4;r2=3804}}while(0);if(r2==3804){__ZdlPv(r12)}HEAP32[r3]=0;return}function __ZN14mgGLGenSurface13createBuffersEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=(r1+64|0)>>2;r3=HEAP32[r2];if((r3|0)==0){return}if((HEAP32[r1+48>>2]|0)!=0){if((HEAP32[r3>>2]|0)!=0){return}r4=HEAP32[1310729];r5=r1+4|0;r6=r1+8|0;r7=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+72>>2]](r4,HEAP32[r5>>2],HEAP32[r6>>2],0,HEAP32[r1+52>>2]);HEAP32[HEAP32[r2]>>2]=r7;r7=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+76>>2]](r7,HEAP32[HEAP32[r2]>>2],0);_glScissor(0,0,HEAP32[r5>>2],HEAP32[r6>>2]);_glClearColor(0,0,0,0);_glClear(16384);return}r6=(r1+60|0)>>2;r5=HEAP32[r6];r7=(r1+56|0)>>2;r4=HEAP32[r7];L4331:do{if((Math.imul(r4,r5)|0)>0){r8=r1+52|0;r9=0;r10=r5;r11=r4;r12=r3;while(1){if((HEAP32[r12+(r9<<2)>>2]|0)==0){r13=HEAP32[1310729];r14=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+72>>2]](r13,256,256,0,HEAP32[r8>>2]);HEAP32[HEAP32[r2]+(r9<<2)>>2]=r14;r15=HEAP32[r6];r16=HEAP32[r7]}else{r15=r10;r16=r11}r14=r9+1|0;if((r14|0)>=(Math.imul(r16,r15)|0)){r17=r15;r18=r16;break L4331}r9=r14;r10=r15;r11=r16;r12=HEAP32[r2]}}else{r17=r5;r18=r4}}while(0);if((Math.imul(r18,r17)|0)>0){r19=0}else{return}while(1){r17=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+76>>2]](r17,HEAP32[HEAP32[r2]+(r19<<2)>>2],0);_glScissor(0,0,256,256);_glClearColor(0,0,0,0);_glClear(16384);r17=r19+1|0;if((r17|0)<(Math.imul(HEAP32[r7],HEAP32[r6])|0)){r19=r17}else{break}}return}function __ZN14mgGLGenSurface13deleteBuffersEv(r1){var r2,r3,r4,r5,r6,r7,r8;r2=(r1+64|0)>>2;r3=HEAP32[r2];if((r3|0)==0){return}r4=r1+60|0;r5=r1+56|0;if((Math.imul(HEAP32[r5>>2],HEAP32[r4>>2])|0)>0){r6=0;r7=r3}else{return}while(1){r3=HEAP32[r7+(r6<<2)>>2];if((r3|0)==0){r8=r7}else{FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3);r8=HEAP32[r2]}HEAP32[r8+(r6<<2)>>2]=0;r3=r6+1|0;if((r3|0)>=(Math.imul(HEAP32[r5>>2],HEAP32[r4>>2])|0)){break}r6=r3;r7=HEAP32[r2]}return}function __ZNK14mgGLGenSurface11drawOverlayEii(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;if((HEAP32[r1+48>>2]|0)!=0){r4=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+204>>2]](r4,HEAP32[HEAP32[r1+64>>2]>>2],r2,r3,HEAP32[r1+4>>2],HEAP32[r1+8>>2]);return}r4=r1+60|0;r5=HEAP32[r4>>2];if((r5|0)<=0){return}r6=r1+56|0;r7=r1+64|0;r1=0;r8=HEAP32[r6>>2];r9=r5;while(1){if((r8|0)>0){r5=(r1<<8)+r3|0;r10=0;r11=r8;while(1){r12=Math.imul(r11,r1)+r10|0;r13=HEAP32[HEAP32[r7>>2]+(r12<<2)>>2];r12=HEAP32[1310729];FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+204>>2]](r12,r13,(r10<<8)+r2|0,r5,HEAP32[r13+88>>2],HEAP32[r13+92>>2]);r13=r10+1|0;r14=HEAP32[r6>>2];if((r13|0)<(r14|0)){r10=r13;r11=r14}else{break}}r15=r14;r16=HEAP32[r4>>2]}else{r15=r8;r16=r9}r11=r1+1|0;if((r11|0)<(r16|0)){r1=r11;r8=r15;r9=r16}else{break}}return}function __ZN14mgGLGenSurface6repairER11mgRectangle(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;if((HEAP32[r1+160>>2]|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+176>>2]](r1)}r3=r1+12|0;if((HEAP32[r3>>2]|0)==0){r4=HEAP32[1310729];r5=r4;r6=HEAP32[r5>>2];r7=r6+80|0;r8=HEAP32[r7>>2];FUNCTION_TABLE[r8](r4);return}r9=r1+16|0;HEAP32[r2>>2]=HEAP32[r9>>2];r10=r1+20|0;HEAP32[r2+4>>2]=HEAP32[r10>>2];HEAP32[r2+8>>2]=HEAP32[r1+24>>2]-HEAP32[r9>>2]|0;HEAP32[r2+12>>2]=HEAP32[r1+28>>2]-HEAP32[r10>>2]|0;HEAP32[r3>>2]=0;r4=HEAP32[1310729];r5=r4;r6=HEAP32[r5>>2];r7=r6+80|0;r8=HEAP32[r7>>2];FUNCTION_TABLE[r8](r4);return}function __ZN16mgScriptPlatform18getFontDirectoriesER13mgStringArray(r1,r2){return}function __ZN16mgScriptPlatform6getDPIEv(r1){return HEAP32[r1+120>>2]}function __ZN16mgScriptPlatform12getDepthBitsEv(r1){var r2,r3;r2=HEAP32[r1+12>>2];if((r2|0)==0){r3=0;return r3}r3=HEAP32[r2+16>>2];return r3}function __ZN16mgScriptPlatformC2Ev(r1){var r2,r3,r4,r5;r2=r1>>2;HEAP32[r2]=5262160;r3=r1+16|0;HEAP32[r3>>2]=5259300;HEAP32[r2+5]=63;r4=r1+36|0;HEAP32[r2+8]=r4;HEAP32[r2+6]=0;HEAP8[r4]=0;HEAP32[r2+7]=128;r4=r1+124|0;HEAP32[r4>>2]=5259300;HEAP32[r2+32]=63;r5=r1+144|0;HEAP32[r2+35]=r5;HEAP32[r2+33]=0;HEAP8[r5]=0;HEAP32[r2+34]=128;HEAP32[1310728]=r1|0;__ZN8mgStringaSEPKc(r4,5249692);HEAP32[r2+52]=800;HEAP32[r2+53]=600;HEAP32[r2+54]=100;HEAP32[r2+55]=100;HEAP32[r2+26]=0;HEAP32[r2+27]=0;HEAP32[r2+28]=0;__ZN8mgStringaSEPKc(r3,5254808);HEAP32[r2+25]=0;HEAP32[r2+61]=0;r3=(r1+256|0)>>2;HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+4]=0;r3=__Znwj(572);__ZN20mgPlatformErrorTableC2Ev(r3);HEAP32[r2+2]=r3;HEAP32[r2+62]=0;HEAP32[r2+63]=0;FUNCTION_TABLE[HEAP32[HEAP32[r2]+108>>2]](r1);return}function __ZN16mgScriptPlatformD0Ev(r1){__ZN16mgScriptPlatformD2Ev(r1);__ZdlPv(r1);return}function __ZN16mgScriptPlatformD2Ev(r1){var r2,r3,r4;r2=r1>>2;HEAP32[r2]=5262160;r3=r1+8|0;r4=HEAP32[r3>>2];if((r4|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+4>>2]](r4)}HEAP32[r3>>2]=0;HEAP32[1310728]=0;HEAP32[r2+31]=5259300;r3=HEAP32[r2+35];if(!((r3|0)==(r1+144|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2+4]=5259300;r3=HEAP32[r2+8];if((r3|0)==(r1+36|0)|(r3|0)==0){return}__ZdlPv(r3);return}function __ZN16mgScriptPlatform13setErrorTableEP12mgErrorTable(r1,r2){var r3;r3=(r1+8|0)>>2;r1=HEAP32[r3];if((r1|0)==0){HEAP32[r3]=r2;return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);HEAP32[r3]=r2;return}function __ZN16mgScriptPlatform11scanFontDirER13mgStringArrayPKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+168|0;r6=r5;r7=r5+84;r8=_opendir(r3);if((r8|0)==0){STACKTOP=r5;return}r9=_readdir(r8);L4418:do{if((r9|0)!=0){r10=(r6|0)>>2;r11=r6+4|0;r12=r6+20|0;r13=(r6+16|0)>>2;r14=r6+8|0;r15=r6+12|0;r16=r1;r17=r7|0;r18=(r7+4|0)>>2;r19=r7+20|0;r20=(r7+16|0)>>2;r21=(r7+8|0)>>2;r22=r7+12|0;r23=(r3|0)==0;r24=r2;r25=0;r26=r9;while(1){if((r25|0)==0){r27=r26}else{r28=r26;break}while(1){if(HEAP8[r27+1036|0]<<24>>24!=4){break}HEAP32[r10]=5259300;HEAP32[r11>>2]=63;HEAP32[r13]=r12;HEAP32[r14>>2]=0;HEAP8[r12]=0;HEAP32[r15>>2]=128;r29=r27+4|0;__ZN8mgString6formatEPKcz(r6,5252448,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=r29,tempInt));if(HEAP8[r29]<<24>>24!=46){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+104>>2]](r1,r2,HEAP32[r13])}HEAP32[r10]=5259300;r29=HEAP32[r13];if(!((r29|0)==(r12|0)|(r29|0)==0)){__ZdlPv(r29)}r29=_readdir(r8);if((r29|0)==0){break L4418}else{r27=r29}}r29=_strrchr(r27+4|0,46);do{if((r29|0)==0){r30=0}else{if((_strcmp(r29,5249904)|0)!=0){r30=0;break}HEAP32[r17>>2]=5259300;HEAP32[r18]=63;HEAP32[r20]=r19;HEAP32[r21]=0;HEAP8[r19]=0;HEAP32[r22>>2]=128;do{if(r23){r31=0;r4=3932}else{r32=_strlen(r3);if((r32|0)>63){r33=63;while(1){r34=r33+128|0;if((r34|0)<(r32|0)){r33=r34}else{break}}HEAP32[r18]=r34;r35=r33+129|0;r36=__Znaj((r35|0)>-1?r35:-1);r35=HEAP32[r20];r37=HEAP32[r21];_memcpy(r36,r35,r37+1|0);if((r35|0)==(r19|0)|(r35|0)==0){r38=r37}else{__ZdlPv(r35);r38=HEAP32[r21]}HEAP32[r20]=r36;r39=r38;r40=r36}else{r39=0;r40=r19}_memcpy(r40+r39|0,r3,r32);r36=HEAP32[r21]+r32|0;HEAP32[r21]=r36;HEAP8[HEAP32[r20]+r36|0]=0;r36=HEAP32[r21];if((r36|0)<1){r31=r36;r4=3932;break}r35=HEAP32[r20];if(HEAP8[r35+(r36-1)|0]<<24>>24==47){r41=r35;break}else{r31=r36;r4=3932;break}}}while(0);if(r4==3932){r4=0;r36=HEAP32[r18];r35=r31+1|0;if((r36|0)<(r35|0)){r37=HEAP32[r22>>2];r42=r36;while(1){r43=r42+r37|0;if((r43|0)<(r35|0)){r42=r43}else{break}}HEAP32[r18]=r43;r42=r43+1|0;r35=__Znaj((r42|0)>-1?r42:-1);r42=HEAP32[r20];r37=HEAP32[r21];_memcpy(r35,r42,r37+1|0);if((r42|0)==(r19|0)|(r42|0)==0){r44=r37}else{__ZdlPv(r42);r44=HEAP32[r21]}HEAP32[r20]=r35;r45=r44;r46=r35}else{r45=r31;r46=HEAP32[r20]}HEAP8[r46+r45|0]=47;r35=HEAP32[r21]+1|0;HEAP32[r21]=r35;HEAP8[HEAP32[r20]+r35|0]=0;r41=HEAP32[r20]}FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+8>>2]](r2,r41);HEAP32[r17>>2]=5259300;r35=HEAP32[r20];if((r35|0)==(r19|0)|(r35|0)==0){r30=1;break}__ZdlPv(r35);r30=1}}while(0);r29=_readdir(r8);if((r29|0)==0){break L4418}else{r25=r30;r26=r29}}while(1){do{if(HEAP8[r28+1036|0]<<24>>24==4){HEAP32[r10]=5259300;HEAP32[r11>>2]=63;HEAP32[r13]=r12;HEAP32[r14>>2]=0;HEAP8[r12]=0;HEAP32[r15>>2]=128;r26=r28+4|0;__ZN8mgString6formatEPKcz(r6,5252448,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=r26,tempInt));if(HEAP8[r26]<<24>>24!=46){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+104>>2]](r1,r2,HEAP32[r13])}HEAP32[r10]=5259300;r26=HEAP32[r13];if((r26|0)==(r12|0)|(r26|0)==0){break}__ZdlPv(r26)}}while(0);r26=_readdir(r8);if((r26|0)==0){break L4418}else{r28=r26}}}}while(0);_closedir(r8);STACKTOP=r5;return}function __ZN16mgScriptPlatform17setDisplayLibraryEPKc(r1,r2){__ZN8mgStringaSEPKc(r1+16|0,r2);return}function __ZN16mgScriptPlatform17getDisplayLibraryER8mgString(r1,r2){var r3;r3=HEAP32[r1+100>>2];if((r3|0)==3){__ZN8mgStringaSEPKc(r2,5244328);return}else if((r3|0)==2){__ZN8mgStringaSEPKc(r2,5245664);return}else if((r3|0)==1){__ZN8mgStringaSEPKc(r2,5244872);return}else{__ZN8mgStringaSEPKc(r2,5254808);return}}function __ZN16mgScriptPlatform12createWindowEv(r1){var r2,r3;r2=STACKTOP;r3=_SDL_SetVideoMode(HEAP32[r1+208>>2],HEAP32[r1+212>>2],32,83886080);HEAP32[1319327]=r3;if((r3|0)!=0){STACKTOP=r2;return}r2=___cxa_allocate_exception(4);r3=__Znwj(84);__ZN11mgExceptionC2EPKcz(r3,5243780,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));HEAP32[r2>>2]=r3;___cxa_throw(r2,5275288,0)}function __ZN16mgScriptPlatform10screenShotEPKc(r1,r2){return}function __ZN16mgScriptPlatform8initViewEv(r1){return}function __ZN16mgScriptPlatform8termViewEv(r1){return}function __ZN16mgScriptPlatform13setFullscreenEj(r1,r2){HEAP32[r1+104>>2]=r2;return}function __ZN16mgScriptPlatform13getFullscreenEv(r1){return HEAP32[r1+104>>2]}function __ZN16mgScriptPlatform15setWindowBoundsEiiii(r1,r2,r3,r4,r5){HEAP32[r1+216>>2]=r2;HEAP32[r1+220>>2]=r3;HEAP32[r1+208>>2]=r4;HEAP32[r1+212>>2]=r5;return}function __ZN16mgScriptPlatform15getWindowBoundsERiS0_S0_S0_(r1,r2,r3,r4,r5){HEAP32[r2>>2]=HEAP32[r1+216>>2];HEAP32[r3>>2]=HEAP32[r1+220>>2];HEAP32[r4>>2]=HEAP32[r1+208>>2];HEAP32[r5>>2]=HEAP32[r1+212>>2];return}function __ZN16mgScriptPlatform16setSwapImmediateEj(r1,r2){HEAP32[r1+112>>2]=r2;return}function __ZN16mgScriptPlatform16getSwapImmediateEv(r1){return HEAP32[r1+112>>2]}function __ZN16mgScriptPlatform14setMultiSampleEj(r1,r2){HEAP32[r1+108>>2]=r2;return}function __ZN16mgScriptPlatform14getMultiSampleEv(r1){return HEAP32[r1+108>>2]}function __ZN16mgScriptPlatform16setMouseRelativeEj(r1,r2){var r3;r3=r1+244|0;if((HEAP32[r3>>2]|0)==(r2|0)){return}HEAP32[r3>>2]=r2;return}function __ZN16mgScriptPlatform16getMouseRelativeEv(r1){return HEAP32[r1+244>>2]}function __ZN16mgScriptPlatform7exitAppEv(r1){HEAP32[r1+268>>2]=1;return}function __ZN16mgScriptPlatform11termDisplayEv(r1){var r2;r2=(r1+12|0)>>2;r1=HEAP32[r2];if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+16>>2]](r1);r1=HEAP32[r2];if((r1|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1)}HEAP32[r2]=0;return}function __ZN16mgScriptPlatform11swapBuffersEv(r1){var r2,r3;r2=HEAP32[r1+12>>2];if((r2|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+20>>2]](r2);r2=r1+240|0;r3=HEAP32[r2>>2]+1|0;HEAP32[r2>>2]=r3;if((r3|0)<=60){return}if((HEAP32[r1+112>>2]|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+112>>2]](r1,0);return}function __ZN16mgScriptPlatform11resetTimingEv(r1){var r2,r3;HEAP32[r1+240>>2]=0;r2=_SDL_GetTicks()>>>0;r3=r1+232|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r3>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r3+4>>2]=HEAP32[tempDoublePtr+4>>2];return}function __ZN16mgScriptPlatform9logTimingEj(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;r4=r1+240|0;if((HEAP32[r4>>2]|0)==0){STACKTOP=r3;return}r5=r1+232|0;r6=(_SDL_GetTicks()>>>0)-(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);if((r2|0)==0&r6<3e4){STACKTOP=r3;return}r2=HEAP32[r4>>2];r4=r6/(r2|0);__Z7mgDebugPKcz(5253728,(tempInt=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[tempInt>>2]=1e3/r4&-1,HEAPF64[tempDoublePtr>>3]=r4,HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr+4>>2],HEAP32[tempInt+12>>2]=r2,HEAPF64[tempDoublePtr>>3]=r6/1e3,HEAP32[tempInt+16>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+20>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+108>>2]](r1);STACKTOP=r3;return}function __ZN16mgScriptPlatform19compileGLShaderPairEPKcS1_iPS1_PKj(r1,r2,r3,r4,r5,r6){var r7,r8;r7=HEAP32[r1+12>>2];if((r7|0)==0){r8=0;return r8}r8=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+36>>2]](r7,r2,r3,r4,r5,r6);return r8}function __ZN16mgScriptPlatform14setWindowTitleEPKc(r1,r2){__ZN8mgStringaSEPKc(r1+124|0,r2);return}function __ZN16mgScriptPlatform14getWindowTitleER8mgString(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=(r1+132|0)>>2;r4=HEAP32[r3];r5=r2+4|0;r6=HEAP32[r5>>2];if((r4|0)<=(r6|0)){r7=r4;r8=HEAP32[r2+16>>2];r9=r2+8|0;r10=r1+140|0;r11=HEAP32[r10>>2];r12=r7+1|0;_memcpy(r8,r11,r12);r13=HEAP32[r3];HEAP32[r9>>2]=r13;return}r14=HEAP32[r2+12>>2];r15=r6;while(1){r16=r15+r14|0;if((r16|0)<(r4|0)){r15=r16}else{break}}HEAP32[r5>>2]=r16;r5=r16+1|0;r16=__Znaj((r5|0)>-1?r5:-1);r5=r2+16|0;r15=HEAP32[r5>>2];r4=r2+8|0;_memcpy(r16,r15,HEAP32[r4>>2]+1|0);if(!((r15|0)==(r2+20|0)|(r15|0)==0)){__ZdlPv(r15)}HEAP32[r5>>2]=r16;r7=HEAP32[r3];r8=r16;r9=r4;r10=r1+140|0;r11=HEAP32[r10>>2];r12=r7+1|0;_memcpy(r8,r11,r12);r13=HEAP32[r3];HEAP32[r9>>2]=r13;return}function __ZN16mgScriptPlatform11checkErrorsEv(r1){var r2,r3;r2=HEAP32[r1+12>>2];if((r2|0)==0){r3=0;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2);return r3}function __ZN16mgScriptPlatform18drawOverlayTextureEjiiii(r1,r2,r3,r4,r5,r6){var r7;r7=HEAP32[r1+12>>2];if((r7|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](r7,r2,r3,r4,r5,r6);return}function __ZN16mgScriptPlatform13windowResizedEii(r1,r2,r3){var r4;r4=r1>>2;if((HEAP32[r4+26]|0)==0){HEAP32[r4+52]=r2;HEAP32[r4+53]=r3}r1=HEAP32[r4+3];if((r1|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,r2,r3)}r1=HEAP32[r4+1];if((r1|0)==0){return}if((HEAP32[r4+63]|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,r2,r3);return}function __ZN16mgScriptPlatform4idleEv(r1){var r2;r2=HEAP32[r1+4>>2];if((r2|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+32>>2]](r2);return}function __ZN16mgScriptPlatform12mouseMoveAbsEiii(r1,r2,r3,r4){var r5,r6,r7,r8;if((HEAP32[r1+264>>2]|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+164>>2]](r1,r2,r3)}r5=r1+256|0;r6=r2-HEAP32[r5>>2]|0;r7=r1+260|0;r8=r3-HEAP32[r7>>2]|0;HEAP32[r5>>2]=r2;HEAP32[r7>>2]=r3;r3=HEAP32[r1+4>>2];if((r3|0)==0){return}r1=HEAP32[r3>>2];if((r4&112|0)==0){FUNCTION_TABLE[HEAP32[r1+56>>2]](r3,r6,r8,r4);return}else{FUNCTION_TABLE[HEAP32[r1+60>>2]](r3,r6,r8,r4);return}}function __ZN16mgScriptPlatform12mouseMoveRelEiii(r1,r2,r3,r4){var r5;r5=r1>>2;if((HEAP32[r5+66]|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+164>>2]](r1,HEAP32[r5+64],HEAP32[r5+65])}r1=HEAP32[r5+1];if((r1|0)==0){return}r5=HEAP32[r1>>2];if((r4&112|0)==0){FUNCTION_TABLE[HEAP32[r5+56>>2]](r1,r2,r3,r4);return}else{FUNCTION_TABLE[HEAP32[r5+60>>2]](r1,r2,r3,r4);return}}function __ZN16mgScriptPlatform9mouseDownEii(r1,r2,r3){var r4;r4=HEAP32[r1+4>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+48>>2]](r4,r2,r3);return}function __ZN16mgScriptPlatform7mouseUpEii(r1,r2,r3){var r4;r4=HEAP32[r1+4>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+52>>2]](r4,r2,r3);return}function __ZN16mgScriptPlatform10mouseEnterEii(r1,r2,r3){var r4,r5;HEAP32[r1+256>>2]=r2;HEAP32[r1+260>>2]=r3;r4=HEAP32[r1+4>>2];if((r4|0)==0){r5=r1+264|0;HEAP32[r5>>2]=1;return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+68>>2]](r4,r2,r3);r5=r1+264|0;HEAP32[r5>>2]=1;return}function __ZN16mgScriptPlatform9mouseExitEv(r1){var r2;r2=HEAP32[r1+4>>2];if((r2|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+72>>2]](r2)}HEAP32[r1+264>>2]=0;return}function __ZN16mgScriptPlatform7keyDownEii(r1,r2,r3){var r4;r4=HEAP32[r1+4>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+36>>2]](r4,r2,r3);return}function __ZN16mgScriptPlatform5keyUpEii(r1,r2,r3){var r4;r4=HEAP32[r1+4>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+40>>2]](r4,r2,r3);return}function __ZN16mgScriptPlatform7keyCharEii(r1,r2,r3){var r4;r4=HEAP32[r1+4>>2];if((r4|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+44>>2]](r4,r2,r3);return}function __ZN16mgScriptPlatform11initDisplayEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=r4,r6=r5>>2;FUNCTION_TABLE[HEAP32[HEAP32[r2]+140>>2]](r1);r7=r5|0;HEAP32[r7>>2]=5259300;HEAP32[r6+1]=63;r8=r5+20|0;r9=(r5+16|0)>>2;HEAP32[r9]=r8;HEAP32[r6+3]=128;r10=(r1+12|0)>>2;HEAP32[r10]=0;r11=r8;HEAP32[r11>>2]=1650808610;HEAP32[r11+4>>2]=539118663;HEAP32[r6+2]=8;HEAP8[r5+28|0]=0;r5=(r1+32|0)>>2;r1=5244328;r6=HEAP32[r5];while(1){r11=HEAP8[r6];r12=HEAP8[r1];r13=r11<<24>>24;if((r13&128|0)==0){r14=_tolower(r13)&255}else{r14=r11}if(r14<<24>>24>-1){r15=_tolower(r12<<24>>24)&255}else{r15=r12}if(r14<<24>>24!=r15<<24>>24){r3=4116;break}if(r14<<24>>24==0){r3=4117;break}else{r1=r1+1|0;r6=r6+1|0}}do{if(r3==4116){if((HEAP32[r2+6]|0)==0){r3=4117;break}else{r16=0;r3=4126;break}}}while(0);do{if(r3==4117){r6=__Znwj(52),r1=r6>>2;r14=r6;HEAP32[r1]=5263588;HEAP32[r1+8]=0;HEAP32[r1+9]=0;r15=r6;HEAP32[r1+1]=HEAP32[r2+26];HEAP32[r1+2]=HEAP32[r2+27];HEAP32[r1+3]=HEAP32[r2+28];if((__ZN14mgWebGLSupport11initDisplayEv(r14)|0)!=0){HEAP32[r2+25]=3;HEAP32[r10]=r15;r17=1;r18=r15,r19=r18>>2;break}if((r6|0)==0){r16=1;r3=4126;break}FUNCTION_TABLE[HEAP32[HEAP32[r1]+4>>2]](r14);r16=1;r3=4126;break}}while(0);if(r3==4126){r17=r16;r18=HEAP32[r10],r19=r18>>2}if((r18|0)!=0){HEAP32[r2+29]=HEAP32[r19+4];HEAP32[r2+26]=HEAP32[r19+1];HEAP32[r2+27]=HEAP32[r19+2];HEAP32[r2+28]=HEAP32[r19+3];HEAP32[r2+30]=110;__Z7mgDebugPKcz(5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));__Z7mgDebugPKcz(5254040,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+35],tempInt));HEAP32[r7>>2]=5259300;r7=HEAP32[r9];if((r7|0)==(r8|0)|(r7|0)==0){STACKTOP=r4;return}__ZdlPv(r7);STACKTOP=r4;return}if((HEAP32[r2+6]|0)==0){r2=___cxa_allocate_exception(4);r4=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r4,5257452,5256936,5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r9],tempInt));HEAP32[r2>>2]=r4;___cxa_throw(r2,5275304,0)}r2=___cxa_allocate_exception(4);r4=r2;if((r17|0)==0){r17=__Znwj(256);r7=HEAP32[r9];__ZN10mgErrorMsgC2EPKcS1_S1_z(r17,5255016,5254772,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[r5],HEAP32[tempInt+4>>2]=r7,tempInt));HEAP32[r4>>2]=r17;___cxa_throw(r2,5275304,0)}else{r17=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r17,5255788,5255400,5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r5],tempInt));HEAP32[r4>>2]=r17;___cxa_throw(r2,5275304,0)}}function _main(r1,r2){var r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+88|0;if((HEAP32[1310730]|0)==0){HEAP32[1310730]=1;HEAP32[1310731]=1}_fclose(_fopen(5255160,5256752));if((_SDL_Init(65535)|0)!=0){__Z7mgDebugPKcz(5252240,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r3=0;STACKTOP=r2;return r3}r1=_SDL_GetTicks()>>>0;_time(r2);_srand(12123123);r4=HEAP32[1310727];__Z7mgDebugPKcz(5253384,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=(r4|0)!=0?r4:5253156,tempInt));r4=HEAP32[1310726];__Z7mgDebugPKcz(5252744,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=(r4|0)!=0?r4:5253156,tempInt));__Z7mgDebugPKcz(5252480,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r4=__Znwj(276),r5=r4>>2;r6=r4;__ZN16mgScriptPlatformC2Ev(r6);r7=r4+224|0;HEAPF64[tempDoublePtr>>3]=r1,HEAP32[r7>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r7+4>>2]=HEAP32[tempDoublePtr+4>>2];r7=__Z19mgCreateApplicationv();r1=(r4+4|0)>>2;HEAP32[r1]=r7;FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+8>>2]](r7);r7=r4;FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+116>>2]](r6);r4=HEAP32[r1];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+12>>2]](r4);r4=HEAP32[r1];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+24>>2]](r4);FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+124>>2]](r6);r6=HEAP32[r1];FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r6,HEAP32[r5+52],HEAP32[r5+53]);HEAP32[r5+62]=1;HEAP32[r5+63]=1;r3=0;STACKTOP=r2;return r3}function __Z10mgShutdownv(){var r1,r2,r3,r4,r5,r6,r7;r1=STACKTOP;STACKTOP=STACKTOP+84|0;r2=HEAP32[1310728];r3=r2;__Z7mgDebugPKcz(5251084,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+112>>2]](r3,1);r4=r2>>2;FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](r3);r5=r2+4|0;r6=r5>>2;r7=HEAP32[r6];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+20>>2]](r7);r7=HEAP32[r6];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+16>>2]](r7);r7=HEAP32[r6];if((r7|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+4>>2]](r7)}HEAP32[r5>>2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+120>>2]](r3);FUNCTION_TABLE[HEAP32[HEAP32[r4]+144>>2]](r3);if((r2|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r4]+100>>2]](r3)}r3=_SDL_GetTicks()>>>0;throw"fault on read from 224";r4=(r3-$53)/1e3;__Z7mgDebugPKcz(5251984,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempDoublePtr>>3]=r4,HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));__Z7mgDebugPKcz(5250844,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r1;return}function __Z6mgIdlev(){var r1,r2;r1=STACKTOP;STACKTOP=STACKTOP+84|0;r2=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+132>>2]](r2);STACKTOP=r1;return}function __Z13mgViewResizedii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+136>>2]](r4,r1,r2);STACKTOP=r3;return}function __Z14mgMouseMoveReliii(r1,r2,r3){var r4,r5;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+152>>2]](r5,r1,r2,r3);STACKTOP=r4;return}function __Z14mgMouseMoveAbsiii(r1,r2,r3){var r4,r5;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+148>>2]](r5,r1,r2,r3);STACKTOP=r4;return}function __Z11mgMouseDownii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+156>>2]](r4,r1,r2);STACKTOP=r3;return}function __Z9mgMouseUpii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+160>>2]](r4,r1,r2);STACKTOP=r3;return}function __Z12mgMouseEnterii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+164>>2]](r4,r1,r2);STACKTOP=r3;return}function __Z11mgMouseExitv(){var r1,r2;r1=STACKTOP;STACKTOP=STACKTOP+84|0;r2=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+168>>2]](r2);STACKTOP=r1;return}function __Z9mgKeyDownii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+172>>2]](r4,r1,r2);STACKTOP=r3;return}function __Z7mgKeyUpii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+176>>2]](r4,r1,r2);STACKTOP=r3;return}function __ZN14mgWebGLSupport11termDisplayEv(r1){return}function __ZN14mgWebGLSupport11swapBuffersEv(r1){return}function __ZN14mgWebGLSupportD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=5263588;r2=r1+36|0;if((HEAP32[r2>>2]|0)!=0){_glDeleteBuffers(1,r2);HEAP32[r2>>2]=0}r2=r1+32|0;r3=HEAP32[r2>>2];if((r3|0)==0){r4=r1;__ZdlPv(r4);return}_glDeleteProgram(r3);HEAP32[r2>>2]=0;r4=r1;__ZdlPv(r4);return}function __ZN14mgWebGLSupportD2Ev(r1){var r2;HEAP32[r1>>2]=5263588;r2=r1+36|0;if((HEAP32[r2>>2]|0)!=0){_glDeleteBuffers(1,r2);HEAP32[r2>>2]=0}r2=r1+32|0;r1=HEAP32[r2>>2];if((r1|0)==0){return}_glDeleteProgram(r1);HEAP32[r2>>2]=0;return}function __ZN14mgWebGLSupport11initDisplayEv(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=(HEAP32[r2+2]|0)!=0?5246012:5244988;__Z7mgDebugPKcz(5248524,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(HEAP32[r2+1]|0)!=0?5246012:5244988,HEAP32[tempInt+4>>2]=r6,tempInt));HEAP32[r2+4]=16;if((FUNCTION_TABLE[HEAP32[HEAP32[r2]+40>>2]](r1)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r2]+16>>2]](r1);r7=0;STACKTOP=r3;return r7}r1=_glGetString(7936);if((r1|0)!=0){__Z7mgDebugPKcz(5249824,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt))}r1=_glGetString(7937);if((r1|0)!=0){__Z7mgDebugPKcz(5247620,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt))}r1=_glGetString(7938);if((r1|0)!=0){__Z7mgDebugPKcz(5245608,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt))}r1=_glGetString(35724);if((r1|0)!=0){__Z7mgDebugPKcz(5244836,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(35661,r4);r1=HEAP32[r5];if((r1|0)!=2147483647){__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5243744,HEAP32[tempInt+4>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(34076,r4);r1=HEAP32[r5];if((r1|0)!=2147483647){__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5243208,HEAP32[tempInt+4>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(34930,r4);r1=HEAP32[r5];if((r1|0)!=2147483647){__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5257424,HEAP32[tempInt+4>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(3379,r4);r1=HEAP32[r5];if((r1|0)!=2147483647){__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5256880,HEAP32[tempInt+4>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(34024,r4);r1=HEAP32[r5];if((r1|0)!=2147483647){__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5256204,HEAP32[tempInt+4>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(34921,r4);r1=HEAP32[r5];if((r1|0)!=2147483647){__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5255764,HEAP32[tempInt+4>>2]=r1,tempInt))}HEAP32[r5]=2147483647;_glGetIntegerv(35660,r4);r4=HEAP32[r5];if((r4|0)==2147483647){r7=1;STACKTOP=r3;return r7}__Z7mgDebugPKcz(5244304,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=5255364,HEAP32[tempInt+4>>2]=r4,tempInt));r7=1;STACKTOP=r3;return r7}function __ZN14mgWebGLSupport10checkErrorEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r1=0;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2;r4=r3|0;HEAP32[r4>>2]=5259300;r5=(r3+4|0)>>2;HEAP32[r5]=63;r6=r3+20|0;r7=(r3+16|0)>>2;HEAP32[r7]=r6;r8=(r3+8|0)>>2;HEAP32[r8]=0;HEAP8[r6]=0;r9=(r3+12|0)>>2;HEAP32[r9]=128;r3=0;r10=0;while(1){r11=_glGetError();if((r11|0)==0){r1=294;break}else if((r11|0)==1280){r12=HEAP32[r5];r13=HEAP32[r8];r14=r13+18|0;if((r12|0)<(r14|0)){r15=HEAP32[r9];r16=r12;while(1){r17=r16+r15|0;if((r17|0)<(r14|0)){r16=r17}else{break}}HEAP32[r5]=r17;r16=r17+1|0;r14=__Znaj((r16|0)>-1?r16:-1);r16=HEAP32[r7];r15=HEAP32[r8];_memcpy(r14,r16,r15+1|0);if((r16|0)==(r6|0)|(r16|0)==0){r18=r15}else{__ZdlPv(r16);r18=HEAP32[r8]}HEAP32[r7]=r14;r19=r18;r20=r14}else{r19=r13;r20=HEAP32[r7]}_memcpy(r20+r19|0,5254752,18);r14=HEAP32[r8]+18|0;HEAP32[r8]=r14;HEAP8[HEAP32[r7]+r14|0]=0;r21=1}else if((r11|0)==1282){r14=HEAP32[r5];r16=HEAP32[r8];r15=r16+23|0;if((r14|0)<(r15|0)){r12=HEAP32[r9];r22=r14;while(1){r23=r22+r12|0;if((r23|0)<(r15|0)){r22=r23}else{break}}HEAP32[r5]=r23;r22=r23+1|0;r15=__Znaj((r22|0)>-1?r22:-1);r22=HEAP32[r7];r12=HEAP32[r8];_memcpy(r15,r22,r12+1|0);if((r22|0)==(r6|0)|(r22|0)==0){r24=r12}else{__ZdlPv(r22);r24=HEAP32[r8]}HEAP32[r7]=r15;r25=r24;r26=r15}else{r25=r16;r26=HEAP32[r7]}_memcpy(r26+r25|0,5254016,23);r15=HEAP32[r8]+23|0;HEAP32[r8]=r15;HEAP8[HEAP32[r7]+r15|0]=0;r21=1}else if((r11|0)==1286){r15=HEAP32[r5];r22=HEAP32[r8];r12=r22+35|0;if((r15|0)<(r12|0)){r13=HEAP32[r9];r14=r15;while(1){r27=r14+r13|0;if((r27|0)<(r12|0)){r14=r27}else{break}}HEAP32[r5]=r27;r14=r27+1|0;r12=__Znaj((r14|0)>-1?r14:-1);r14=HEAP32[r7];r13=HEAP32[r8];_memcpy(r12,r14,r13+1|0);if((r14|0)==(r6|0)|(r14|0)==0){r28=r13}else{__ZdlPv(r14);r28=HEAP32[r8]}HEAP32[r7]=r12;r29=r28;r30=r12}else{r29=r22;r30=HEAP32[r7]}_memcpy(r30+r29|0,5253692,35);r12=HEAP32[r8]+35|0;HEAP32[r8]=r12;HEAP8[HEAP32[r7]+r12|0]=0;r21=1}else if((r11|0)==1281){r12=HEAP32[r5];r14=HEAP32[r8];r13=r14+19|0;if((r12|0)<(r13|0)){r16=HEAP32[r9];r15=r12;while(1){r31=r15+r16|0;if((r31|0)<(r13|0)){r15=r31}else{break}}HEAP32[r5]=r31;r15=r31+1|0;r13=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r7];r16=HEAP32[r8];_memcpy(r13,r15,r16+1|0);if((r15|0)==(r6|0)|(r15|0)==0){r32=r16}else{__ZdlPv(r15);r32=HEAP32[r8]}HEAP32[r7]=r13;r33=r32;r34=r13}else{r33=r14;r34=HEAP32[r7]}_memcpy(r34+r33|0,5254424,19);r13=HEAP32[r8]+19|0;HEAP32[r8]=r13;HEAP8[HEAP32[r7]+r13|0]=0;r21=1}else if((r11|0)==1285){r13=HEAP32[r5];r15=HEAP32[r8];r16=r15+19|0;if((r13|0)<(r16|0)){r22=HEAP32[r9];r12=r13;while(1){r35=r12+r22|0;if((r35|0)<(r16|0)){r12=r35}else{break}}HEAP32[r5]=r35;r12=r35+1|0;r16=__Znaj((r12|0)>-1?r12:-1);r12=HEAP32[r7];r22=HEAP32[r8];_memcpy(r16,r12,r22+1|0);if((r12|0)==(r6|0)|(r12|0)==0){r36=r22}else{__ZdlPv(r12);r36=HEAP32[r8]}HEAP32[r7]=r16;r37=r36;r38=r16}else{r37=r15;r38=HEAP32[r7]}_memcpy(r38+r37|0,5253364,19);r16=HEAP32[r8]+19|0;HEAP32[r8]=r16;HEAP8[HEAP32[r7]+r16|0]=0;r21=1}else{r21=r10}r16=r3+1|0;if((r16|0)<10){r3=r16;r10=r21}else{r39=r21;break}}do{if(r1==294){if((HEAP32[r8]|0)!=0){r39=r10;break}r21=HEAP32[r5];if((r21|0)<14){r3=HEAP32[r9];r37=r21;while(1){r40=r37+r3|0;if((r40|0)<14){r37=r40}else{break}}HEAP32[r5]=r40;r37=r40+1|0;r3=__Znaj((r37|0)>-1?r37:-1);r37=HEAP32[r7];r15=HEAP32[r8];_memcpy(r3,r37,r15+1|0);if((r37|0)==(r6|0)|(r37|0)==0){r41=r15}else{__ZdlPv(r37);r41=HEAP32[r8]}HEAP32[r7]=r3;r42=r41;r43=r3}else{r42=0;r43=HEAP32[r7]}_memcpy(r43+r42|0,5255e3,14);r3=HEAP32[r8]+14|0;HEAP32[r8]=r3;HEAP8[HEAP32[r7]+r3|0]=0;r39=r10}}while(0);__Z7mgDebugPKcz(5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r7],tempInt));HEAP32[r4>>2]=5259300;r4=HEAP32[r7];if((r4|0)==(r6|0)|(r4|0)==0){STACKTOP=r2;return r39}__ZdlPv(r4);STACKTOP=r2;return r39}function __ZN14mgWebGLSupport12checkVersionEiiR8mgString(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r1;r6=r1+4,r7=r6>>2;r8=_glGetString(7938);if((r8|0)==0){__ZN8mgStringaSEPKc(r4,5252716);r9=0;STACKTOP=r1;return r9}if((_sscanf(r8,5252456,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,tempInt))|0)!=2){__ZN8mgString6formatEPKcz(r4,5252192,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt));r9=0;STACKTOP=r1;return r9}r8=HEAP32[r7];if(((r8|0)%10|0)==0){r10=r8;while(1){r11=(r10|0)/10&-1;if(((r11|0)%10|0)==0){r10=r11}else{break}}HEAP32[r7]=r11;r12=r11}else{r12=r8}r8=(HEAP32[r5>>2]*100&-1)+r12|0;r12=_glGetString(35724);if((r12|0)==0){__ZN8mgStringaSEPKc(r4,5251940);r9=0;STACKTOP=r1;return r9}if((_sscanf(r12,5252456,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,tempInt))|0)!=2){__ZN8mgString6formatEPKcz(r4,5252192,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r12,tempInt));r9=0;STACKTOP=r1;return r9}r12=HEAP32[r7];if(((r12|0)%10|0)==0){r6=r12;while(1){r13=(r6|0)/10&-1;if(((r13|0)%10|0)==0){r6=r13}else{break}}HEAP32[r7]=r13;r14=r13}else{r14=r12}r12=(HEAP32[r5>>2]*100&-1)+r14|0;if(!((r8|0)<(r2|0)|(r12|0)<(r3|0))){r9=1;STACKTOP=r1;return r9}__ZN8mgString6formatEPKcz(r4,5251640,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[tempInt>>2]=(r2|0)/100&-1,HEAP32[tempInt+4>>2]=(r2|0)%100,HEAP32[tempInt+8>>2]=(r3|0)/100&-1,HEAP32[tempInt+12>>2]=(r3|0)%100,HEAP32[tempInt+16>>2]=(r8|0)/100&-1,HEAP32[tempInt+20>>2]=(r8|0)%100,HEAP32[tempInt+24>>2]=(r12|0)/100&-1,HEAP32[tempInt+28>>2]=(r12|0)%100,tempInt));r9=0;STACKTOP=r1;return r9}function __Z9mgKeyCharii(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=HEAP32[1310728];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+180>>2]](r4,r1,r2);STACKTOP=r3;return}function __ZN14mgWebGLSupport14builtinShadersEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92;r2=STACKTOP;STACKTOP=STACKTOP+176|0;r3=r2;r4=r2+84;r5=r2+168;r6=r3|0;HEAP32[r6>>2]=5259300;r7=(r3+4|0)>>2;HEAP32[r7]=63;r8=r3+20|0;r9=(r3+16|0)>>2;HEAP32[r9]=r8;r10=(r3+8|0)>>2;HEAP32[r10]=0;r11=(r3+12|0)>>2;HEAP32[r11]=128;_memcpy(r8,5251496,25);r3=HEAP32[r10]+25|0;HEAP32[r10]=r3;HEAP8[HEAP32[r9]+r3|0]=0;r3=HEAP32[r7];r12=HEAP32[r10];r13=r12+21|0;if((r3|0)<(r13|0)){r14=HEAP32[r11];r15=r3;while(1){r16=r15+r14|0;if((r16|0)<(r13|0)){r15=r16}else{break}}HEAP32[r7]=r16;r15=r16+1|0;r16=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r9];r13=HEAP32[r10];_memcpy(r16,r15,r13+1|0);if((r15|0)==(r8|0)|(r15|0)==0){r17=r13}else{__ZdlPv(r15);r17=HEAP32[r10]}HEAP32[r9]=r16;r18=r17;r19=r16}else{r18=r12;r19=HEAP32[r9]}_memcpy(r19+r18|0,5251296,21);r18=HEAP32[r10]+21|0;HEAP32[r10]=r18;HEAP8[HEAP32[r9]+r18|0]=0;r18=HEAP32[r7];r19=HEAP32[r10];r12=r19+23|0;if((r18|0)<(r12|0)){r16=HEAP32[r11];r17=r18;while(1){r20=r17+r16|0;if((r20|0)<(r12|0)){r17=r20}else{break}}HEAP32[r7]=r20;r17=r20+1|0;r20=__Znaj((r17|0)>-1?r17:-1);r17=HEAP32[r9];r12=HEAP32[r10];_memcpy(r20,r17,r12+1|0);if((r17|0)==(r8|0)|(r17|0)==0){r21=r12}else{__ZdlPv(r17);r21=HEAP32[r10]}HEAP32[r9]=r20;r22=r21;r23=r20}else{r22=r19;r23=HEAP32[r9]}_memcpy(r23+r22|0,5251060,23);r22=HEAP32[r10]+23|0;HEAP32[r10]=r22;HEAP8[HEAP32[r9]+r22|0]=0;r22=HEAP32[r7];r23=HEAP32[r10];r19=r23+26|0;if((r22|0)<(r19|0)){r20=HEAP32[r11];r21=r22;while(1){r24=r21+r20|0;if((r24|0)<(r19|0)){r21=r24}else{break}}HEAP32[r7]=r24;r21=r24+1|0;r24=__Znaj((r21|0)>-1?r21:-1);r21=HEAP32[r9];r19=HEAP32[r10];_memcpy(r24,r21,r19+1|0);if((r21|0)==(r8|0)|(r21|0)==0){r25=r19}else{__ZdlPv(r21);r25=HEAP32[r10]}HEAP32[r9]=r24;r26=r25;r27=r24}else{r26=r23;r27=HEAP32[r9]}_memcpy(r27+r26|0,5250816,26);r26=HEAP32[r10]+26|0;HEAP32[r10]=r26;HEAP8[HEAP32[r9]+r26|0]=0;r26=HEAP32[r7];r27=HEAP32[r10];r23=r27+30|0;if((r26|0)<(r23|0)){r24=HEAP32[r11];r25=r26;while(1){r28=r25+r24|0;if((r28|0)<(r23|0)){r25=r28}else{break}}HEAP32[r7]=r28;r25=r28+1|0;r28=__Znaj((r25|0)>-1?r25:-1);r25=HEAP32[r9];r23=HEAP32[r10];_memcpy(r28,r25,r23+1|0);if((r25|0)==(r8|0)|(r25|0)==0){r29=r23}else{__ZdlPv(r25);r29=HEAP32[r10]}HEAP32[r9]=r28;r30=r29;r31=r28}else{r30=r27;r31=HEAP32[r9]}_memcpy(r31+r30|0,5250560,30);r30=HEAP32[r10]+30|0;HEAP32[r10]=r30;HEAP8[HEAP32[r9]+r30|0]=0;r30=HEAP32[r7];r31=HEAP32[r10];r27=r31+19|0;if((r30|0)<(r27|0)){r28=HEAP32[r11];r29=r30;while(1){r32=r29+r28|0;if((r32|0)<(r27|0)){r29=r32}else{break}}HEAP32[r7]=r32;r29=r32+1|0;r32=__Znaj((r29|0)>-1?r29:-1);r29=HEAP32[r9];r27=HEAP32[r10];_memcpy(r32,r29,r27+1|0);if((r29|0)==(r8|0)|(r29|0)==0){r33=r27}else{__ZdlPv(r29);r33=HEAP32[r10]}HEAP32[r9]=r32;r34=r33;r35=r32}else{r34=r31;r35=HEAP32[r9]}_memcpy(r35+r34|0,5250184,19);r34=HEAP32[r10]+19|0;HEAP32[r10]=r34;HEAP8[HEAP32[r9]+r34|0]=0;r34=HEAP32[r7];r35=HEAP32[r10];r31=r35+17|0;if((r34|0)<(r31|0)){r32=HEAP32[r11];r33=r34;while(1){r36=r33+r32|0;if((r36|0)<(r31|0)){r33=r36}else{break}}HEAP32[r7]=r36;r33=r36+1|0;r36=__Znaj((r33|0)>-1?r33:-1);r33=HEAP32[r9];r31=HEAP32[r10];_memcpy(r36,r33,r31+1|0);if((r33|0)==(r8|0)|(r33|0)==0){r37=r31}else{__ZdlPv(r33);r37=HEAP32[r10]}HEAP32[r9]=r36;r38=r37;r39=r36}else{r38=r35;r39=HEAP32[r9]}_memcpy(r39+r38|0,5249912,17);r38=HEAP32[r10]+17|0;HEAP32[r10]=r38;HEAP8[HEAP32[r9]+r38|0]=0;r38=HEAP32[r7];r39=HEAP32[r10];r35=r39+3|0;if((r38|0)<(r35|0)){r36=HEAP32[r11];r37=r38;while(1){r40=r37+r36|0;if((r40|0)<(r35|0)){r37=r40}else{break}}HEAP32[r7]=r40;r37=r40+1|0;r40=__Znaj((r37|0)>-1?r37:-1);r37=HEAP32[r9];r35=HEAP32[r10];_memcpy(r40,r37,r35+1|0);if((r37|0)==(r8|0)|(r37|0)==0){r41=r35}else{__ZdlPv(r37);r41=HEAP32[r10]}HEAP32[r9]=r40;r42=r41;r43=r40}else{r42=r39;r43=HEAP32[r9]}r39=r43+r42|0;HEAP8[r39]=HEAP8[5249688];HEAP8[r39+1|0]=HEAP8[5249689|0];HEAP8[r39+2|0]=HEAP8[5249690|0];r39=HEAP32[r10]+3|0;HEAP32[r10]=r39;HEAP8[HEAP32[r9]+r39|0]=0;r39=HEAP32[r7];r42=HEAP32[r10];r43=r42+24|0;if((r39|0)<(r43|0)){r40=HEAP32[r11];r41=r39;while(1){r44=r41+r40|0;if((r44|0)<(r43|0)){r41=r44}else{break}}HEAP32[r7]=r44;r41=r44+1|0;r44=__Znaj((r41|0)>-1?r41:-1);r41=HEAP32[r9];r43=HEAP32[r10];_memcpy(r44,r41,r43+1|0);if((r41|0)==(r8|0)|(r41|0)==0){r45=r43}else{__ZdlPv(r41);r45=HEAP32[r10]}HEAP32[r9]=r44;r46=r45;r47=r44}else{r46=r42;r47=HEAP32[r9]}_memcpy(r47+r46|0,5249476,24);r46=HEAP32[r10]+24|0;HEAP32[r10]=r46;HEAP8[HEAP32[r9]+r46|0]=0;r46=HEAP32[r7];r47=HEAP32[r10];r42=r47+69|0;if((r46|0)<(r42|0)){r44=HEAP32[r11];r45=r46;while(1){r48=r45+r44|0;if((r48|0)<(r42|0)){r45=r48}else{break}}HEAP32[r7]=r48;r45=r48+1|0;r48=__Znaj((r45|0)>-1?r45:-1);r45=HEAP32[r9];r42=HEAP32[r10];_memcpy(r48,r45,r42+1|0);if((r45|0)==(r8|0)|(r45|0)==0){r49=r42}else{__ZdlPv(r45);r49=HEAP32[r10]}HEAP32[r9]=r48;r50=r49;r51=r48}else{r50=r47;r51=HEAP32[r9]}_memcpy(r51+r50|0,5249244,69);r50=HEAP32[r10]+69|0;HEAP32[r10]=r50;HEAP8[HEAP32[r9]+r50|0]=0;r50=HEAP32[r7];r51=HEAP32[r10];r47=r51+70|0;if((r50|0)<(r47|0)){r48=HEAP32[r11];r49=r50;while(1){r52=r49+r48|0;if((r52|0)<(r47|0)){r49=r52}else{break}}HEAP32[r7]=r52;r49=r52+1|0;r52=__Znaj((r49|0)>-1?r49:-1);r49=HEAP32[r9];r47=HEAP32[r10];_memcpy(r52,r49,r47+1|0);if((r49|0)==(r8|0)|(r49|0)==0){r53=r47}else{__ZdlPv(r49);r53=HEAP32[r10]}HEAP32[r9]=r52;r54=r53;r55=r52}else{r54=r51;r55=HEAP32[r9]}_memcpy(r55+r54|0,5249056,70);r54=HEAP32[r10]+70|0;HEAP32[r10]=r54;HEAP8[HEAP32[r9]+r54|0]=0;r54=HEAP32[r7];r55=HEAP32[r10];r51=r55+23|0;if((r54|0)<(r51|0)){r52=HEAP32[r11];r53=r54;while(1){r56=r53+r52|0;if((r56|0)<(r51|0)){r53=r56}else{break}}HEAP32[r7]=r56;r53=r56+1|0;r56=__Znaj((r53|0)>-1?r53:-1);r53=HEAP32[r9];r51=HEAP32[r10];_memcpy(r56,r53,r51+1|0);if((r53|0)==(r8|0)|(r53|0)==0){r57=r51}else{__ZdlPv(r53);r57=HEAP32[r10]}HEAP32[r9]=r56;r58=r57;r59=r56}else{r58=r55;r59=HEAP32[r9]}_memcpy(r59+r58|0,5248856,23);r58=HEAP32[r10]+23|0;HEAP32[r10]=r58;HEAP8[HEAP32[r9]+r58|0]=0;r58=HEAP32[r7];r59=HEAP32[r10];r55=r59+23|0;if((r58|0)<(r55|0)){r56=HEAP32[r11];r57=r58;while(1){r60=r57+r56|0;if((r60|0)<(r55|0)){r57=r60}else{break}}HEAP32[r7]=r60;r57=r60+1|0;r60=__Znaj((r57|0)>-1?r57:-1);r57=HEAP32[r9];r55=HEAP32[r10];_memcpy(r60,r57,r55+1|0);if((r57|0)==(r8|0)|(r57|0)==0){r61=r55}else{__ZdlPv(r57);r61=HEAP32[r10]}HEAP32[r9]=r60;r62=r61;r63=r60}else{r62=r59;r63=HEAP32[r9]}_memcpy(r63+r62|0,5248728,23);r62=HEAP32[r10]+23|0;HEAP32[r10]=r62;HEAP8[HEAP32[r9]+r62|0]=0;r62=HEAP32[r7];r63=HEAP32[r10];r59=r63+2|0;if((r62|0)<(r59|0)){r60=HEAP32[r11];r11=r62;while(1){r64=r11+r60|0;if((r64|0)<(r59|0)){r11=r64}else{break}}HEAP32[r7]=r64;r7=r64+1|0;r64=__Znaj((r7|0)>-1?r7:-1);r7=HEAP32[r9];r11=HEAP32[r10];_memcpy(r64,r7,r11+1|0);if((r7|0)==(r8|0)|(r7|0)==0){r65=r11}else{__ZdlPv(r7);r65=HEAP32[r10]}HEAP32[r9]=r64;r66=r65;r67=r64}else{r66=r63;r67=HEAP32[r9]}r63=r67+r66|0;tempBigInt=2685;HEAP8[r63]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r63+1|0]=tempBigInt&255;r63=HEAP32[r10]+2|0;HEAP32[r10]=r63;HEAP8[HEAP32[r9]+r63|0]=0;r63=r4|0;HEAP32[r63>>2]=5259300;r10=(r4+4|0)>>2;HEAP32[r10]=63;r66=r4+20|0;r67=(r4+16|0)>>2;HEAP32[r67]=r66;r64=(r4+8|0)>>2;HEAP32[r64]=0;r65=(r4+12|0)>>2;HEAP32[r65]=128;_memcpy(r66,5251496,25);r4=HEAP32[r64]+25|0;HEAP32[r64]=r4;HEAP8[HEAP32[r67]+r4|0]=0;r4=HEAP32[r10];r7=HEAP32[r64];r11=r7+34|0;if((r4|0)<(r11|0)){r59=HEAP32[r65];r60=r4;while(1){r68=r60+r59|0;if((r68|0)<(r11|0)){r60=r68}else{break}}HEAP32[r10]=r68;r60=r68+1|0;r68=__Znaj((r60|0)>-1?r60:-1);r60=HEAP32[r67];r11=HEAP32[r64];_memcpy(r68,r60,r11+1|0);if((r60|0)==(r66|0)|(r60|0)==0){r69=r11}else{__ZdlPv(r60);r69=HEAP32[r64]}HEAP32[r67]=r68;r70=r69;r71=r68}else{r70=r7;r71=HEAP32[r67]}_memcpy(r71+r70|0,5248288,34);r70=HEAP32[r64]+34|0;HEAP32[r64]=r70;HEAP8[HEAP32[r67]+r70|0]=0;r70=HEAP32[r10];r71=HEAP32[r64];r7=r71+19|0;if((r70|0)<(r7|0)){r68=HEAP32[r65];r69=r70;while(1){r72=r69+r68|0;if((r72|0)<(r7|0)){r69=r72}else{break}}HEAP32[r10]=r72;r69=r72+1|0;r72=__Znaj((r69|0)>-1?r69:-1);r69=HEAP32[r67];r7=HEAP32[r64];_memcpy(r72,r69,r7+1|0);if((r69|0)==(r66|0)|(r69|0)==0){r73=r7}else{__ZdlPv(r69);r73=HEAP32[r64]}HEAP32[r67]=r72;r74=r73;r75=r72}else{r74=r71;r75=HEAP32[r67]}_memcpy(r75+r74|0,5250184,19);r74=HEAP32[r64]+19|0;HEAP32[r64]=r74;HEAP8[HEAP32[r67]+r74|0]=0;r74=HEAP32[r10];r75=HEAP32[r64];r71=r75+17|0;if((r74|0)<(r71|0)){r72=HEAP32[r65];r73=r74;while(1){r76=r73+r72|0;if((r76|0)<(r71|0)){r73=r76}else{break}}HEAP32[r10]=r76;r73=r76+1|0;r76=__Znaj((r73|0)>-1?r73:-1);r73=HEAP32[r67];r71=HEAP32[r64];_memcpy(r76,r73,r71+1|0);if((r73|0)==(r66|0)|(r73|0)==0){r77=r71}else{__ZdlPv(r73);r77=HEAP32[r64]}HEAP32[r67]=r76;r78=r77;r79=r76}else{r78=r75;r79=HEAP32[r67]}_memcpy(r79+r78|0,5249912,17);r78=HEAP32[r64]+17|0;HEAP32[r64]=r78;HEAP8[HEAP32[r67]+r78|0]=0;r78=HEAP32[r10];r79=HEAP32[r64];r75=r79+2|0;if((r78|0)<(r75|0)){r76=HEAP32[r65];r77=r78;while(1){r80=r77+r76|0;if((r80|0)<(r75|0)){r77=r80}else{break}}HEAP32[r10]=r80;r77=r80+1|0;r80=__Znaj((r77|0)>-1?r77:-1);r77=HEAP32[r67];r75=HEAP32[r64];_memcpy(r80,r77,r75+1|0);if((r77|0)==(r66|0)|(r77|0)==0){r81=r75}else{__ZdlPv(r77);r81=HEAP32[r64]}HEAP32[r67]=r80;r82=r81;r83=r80}else{r82=r79;r83=HEAP32[r67]}r79=r83+r82|0;tempBigInt=2683;HEAP8[r79]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r79+1|0]=tempBigInt&255;r79=HEAP32[r64]+2|0;HEAP32[r64]=r79;HEAP8[HEAP32[r67]+r79|0]=0;r79=HEAP32[r10];r82=HEAP32[r64];r83=r82+50|0;if((r79|0)<(r83|0)){r80=HEAP32[r65];r81=r79;while(1){r84=r81+r80|0;if((r84|0)<(r83|0)){r81=r84}else{break}}HEAP32[r10]=r84;r81=r84+1|0;r84=__Znaj((r81|0)>-1?r81:-1);r81=HEAP32[r67];r83=HEAP32[r64];_memcpy(r84,r81,r83+1|0);if((r81|0)==(r66|0)|(r81|0)==0){r85=r83}else{__ZdlPv(r81);r85=HEAP32[r64]}HEAP32[r67]=r84;r86=r85;r87=r84}else{r86=r82;r87=HEAP32[r67]}_memcpy(r87+r86|0,5247660,50);r86=HEAP32[r64]+50|0;HEAP32[r64]=r86;HEAP8[HEAP32[r67]+r86|0]=0;r86=HEAP32[r10];r87=HEAP32[r64];r82=r87+2|0;if((r86|0)<(r82|0)){r84=HEAP32[r65];r65=r86;while(1){r88=r65+r84|0;if((r88|0)<(r82|0)){r65=r88}else{break}}HEAP32[r10]=r88;r10=r88+1|0;r88=__Znaj((r10|0)>-1?r10:-1);r10=HEAP32[r67];r65=HEAP32[r64];_memcpy(r88,r10,r65+1|0);if((r10|0)==(r66|0)|(r10|0)==0){r89=r65}else{__ZdlPv(r10);r89=HEAP32[r64]}HEAP32[r67]=r88;r90=r89;r91=r88}else{r90=r87;r91=HEAP32[r67]}r87=r91+r90|0;tempBigInt=2685;HEAP8[r87]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r87+1|0]=tempBigInt&255;r87=HEAP32[r64]+2|0;HEAP32[r64]=r87;HEAP8[HEAP32[r67]+r87|0]=0;__Z7mgDebugPKcz(5247476,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r87=r5;r64=5258304;r90=HEAP32[r64+4>>2];HEAP32[r87>>2]=HEAP32[r64>>2];HEAP32[r87+4>>2]=r90;r90=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1,HEAP32[r9],HEAP32[r67],2,r5|0,5258312);r5=(r1+32|0)>>2;HEAP32[r5]=r90;if((r90|0)==0){__Z7mgDebugPKcz(5246772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r92=0}else{HEAP32[r1+40>>2]=_glGetUniformLocation(r90,5246600);HEAP32[r1+44>>2]=_glGetUniformLocation(HEAP32[r5],5246384);HEAP32[r1+48>>2]=_glGetUniformLocation(HEAP32[r5],5246288);r92=1}HEAP32[r63>>2]=5259300;r63=HEAP32[r67];if(!((r63|0)==(r66|0)|(r63|0)==0)){__ZdlPv(r63)}HEAP32[r6>>2]=5259300;r6=HEAP32[r9];if((r6|0)==(r8|0)|(r6|0)==0){STACKTOP=r2;return r92}__ZdlPv(r6);STACKTOP=r2;return r92}function __ZN16mgDisplaySupport15setGraphicsSizeEii(r1,r2,r3){HEAP32[r1+20>>2]=r2;HEAP32[r1+24>>2]=r3;return}function __ZN14mgWebGLSupport12getShaderLogEjR8mgString(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r1;r5=r1+4;_glGetShaderiv(r2,35716,r4);r6=HEAP32[r4>>2];r7=__Znaj((r6|0)>-1?r6:-1);_glGetShaderInfoLog(r2,HEAP32[r4>>2],r5,r7);r4=(r3+8|0)>>2;HEAP32[r4]=0;r2=(r3+16|0)>>2;HEAP8[HEAP32[r2]]=0;r6=HEAP32[r5>>2];r5=r3+4|0;r8=HEAP32[r5>>2];r9=HEAP32[r4];r10=r9+r6|0;if((r8|0)<(r10|0)){r11=HEAP32[r3+12>>2];r12=r8;while(1){r13=r12+r11|0;if((r13|0)<(r10|0)){r12=r13}else{break}}HEAP32[r5>>2]=r13;r5=r13+1|0;r13=__Znaj((r5|0)>-1?r5:-1);r5=HEAP32[r2];r12=HEAP32[r4];_memcpy(r13,r5,r12+1|0);if((r5|0)==(r3+20|0)|(r5|0)==0){r14=r12}else{__ZdlPv(r5);r14=HEAP32[r4]}HEAP32[r2]=r13;r15=r14;r16=r13}else{r15=r9;r16=HEAP32[r2]}_memcpy(r16+r15|0,r7,r6);r15=HEAP32[r4]+r6|0;HEAP32[r4]=r15;HEAP8[HEAP32[r2]+r15|0]=0;if((r7|0)==0){STACKTOP=r1;return}__ZdlPv(r7);STACKTOP=r1;return}function __ZN14mgWebGLSupport13compileShaderEPKcj(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+92|0;r5=r4+4;r6=r4+88;r7=_glCreateShader(r3);r8=r4|0;HEAP32[r8>>2]=r2;_glShaderSource(r7,1,r8,0);r8=(r3|0)==35633?5246096:5245904;_glCompileShader(r7);r3=r5|0;HEAP32[r3>>2]=5259300;HEAP32[r5+4>>2]=63;r2=r5+20|0;r9=(r5+16|0)>>2;HEAP32[r9]=r2;r10=(r5+8|0)>>2;HEAP32[r10]=0;HEAP8[r2]=0;HEAP32[r5+12>>2]=128;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r1,r7,r5);r5=HEAP32[r10];while(1){r1=r5-1|0;if((r5|0)<=0){break}r11=HEAP8[HEAP32[r9]+r1|0]<<24>>24;if((r11&128|0)!=0){break}if((_isspace(r11)|0)==0){break}else{r5=r1}}HEAP32[r10]=r5;HEAP8[HEAP32[r9]+r5|0]=0;r5=0;while(1){if((r5|0)>=(HEAP32[r10]|0)){break}r1=HEAP8[HEAP32[r9]+r5|0]<<24>>24;if((r1&128|0)!=0){break}if((_isspace(r1)|0)==0){break}else{r5=r5+1|0}}if((r5|0)>0){r1=HEAP32[r9];_memmove(r1,r1+r5|0,HEAP32[r10]-r5|0,1,0);r1=HEAP32[r10]-r5|0;HEAP32[r10]=r1;HEAP8[HEAP32[r9]+r1|0]=0}if((HEAP32[r10]|0)==0){__Z7mgDebugPKcz(5245676,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))}else{r10=HEAP32[r9];__Z7mgDebugPKcz(5245628,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r8,HEAP32[tempInt+4>>2]=r10,tempInt))}_glGetShaderiv(r7,35713,r6);if((HEAP32[r6>>2]|0)==0){__Z7mgDebugPKcz(5245404,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt));r12=0}else{r12=r7}HEAP32[r3>>2]=5259300;r3=HEAP32[r9];if((r3|0)==(r2|0)|(r3|0)==0){STACKTOP=r4;return r12}__ZdlPv(r3);STACKTOP=r4;return r12}function __ZN14mgWebGLSupport17compileShaderPairEPKcS1_iPS1_PKj(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13;r7=STACKTOP;STACKTOP=STACKTOP+12|0;r8=r7;r9=r7+4;r10=r7+8;r11=r1;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+48>>2]](r1,r2,35633);r2=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+48>>2]](r1,r3,35632);if((r12|0)==0|(r2|0)==0){r13=0;STACKTOP=r7;return r13}r3=_glCreateProgram();_glAttachShader(r3,r12);_glAttachShader(r3,r2);L488:do{if((r4|0)>0){r1=0;while(1){_glBindAttribLocation(r3,HEAP32[r6+(r1<<2)>>2],HEAP32[r5+(r1<<2)>>2]);r11=r1+1|0;if((r11|0)==(r4|0)){break L488}else{r1=r11}}}}while(0);_glLinkProgram(r3);_glDeleteShader(r12);_glDeleteShader(r2);_glGetProgramiv(r3,35714,r8);if((HEAP32[r8>>2]|0)!=0){r13=r3;STACKTOP=r7;return r13}_glGetProgramiv(r3,35716,r9);r8=HEAP32[r9>>2];r2=__Znaj((r8|0)>-1?r8:-1);_glGetProgramInfoLog(r3,HEAP32[r9>>2],r10,r2);__Z7mgDebugPKcz(5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));if((r2|0)!=0){__ZdlPv(r2)}_glDeleteProgram(r3);__Z7mgDebugPKcz(5245304,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r13=0;STACKTOP=r7;return r13}function __ZN14mgWebGLSupport18drawOverlayTextureEjiiii(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12;r7=r1>>2;r8=STACKTOP;STACKTOP=STACKTOP+96|0;r9=r8,r10=r9>>2;r11=HEAP32[r7+8];if((r11|0)==0){STACKTOP=r8;return}_glUseProgram(r11);_glUniform1i(HEAP32[r7+10],0);_glUniform2f(HEAP32[r7+11],HEAP32[r7+5]|0,HEAP32[r7+6]|0);_glUniform2f(HEAP32[r7+12],r3|0,r4|0);r4=r1+36|0;r1=HEAP32[r4>>2];if((r1|0)==0){_glGenBuffers(1,r4);r12=HEAP32[r4>>2]}else{r12=r1}_glBindBuffer(34962,r12);r12=r5|0;r5=r6|0;r6=r9>>2;HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;HEAP32[r6+3]=0;HEAPF32[r10+4]=r12;HEAPF32[r10+5]=0;HEAPF32[r10+6]=1;HEAPF32[r10+7]=0;HEAPF32[r10+8]=0;HEAPF32[r10+9]=r5;HEAPF32[r10+10]=0;HEAPF32[r10+11]=1;HEAPF32[r10+12]=0;HEAPF32[r10+13]=r5;HEAPF32[r10+14]=0;HEAPF32[r10+15]=1;HEAPF32[r10+16]=r12;HEAPF32[r10+17]=0;HEAPF32[r10+18]=1;HEAPF32[r10+19]=0;HEAPF32[r10+20]=r12;HEAPF32[r10+21]=r5;HEAPF32[r10+22]=1;HEAPF32[r10+23]=1;_glBufferData(34962,96,r9,35048);_glEnableVertexAttribArray(0);_glVertexAttribPointer(0,2,5126,0,16,0);_glEnableVertexAttribArray(1);_glVertexAttribPointer(1,2,5126,0,16,8);_glBindTexture(3553,r2);_glDrawArrays(4,0,6);_glBindBuffer(34962,0);_glBindTexture(3553,0);STACKTOP=r8;return}function __ZN20mgPlatformErrorTableC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2;__ZN16mgUtilErrorTableC2Ev(r1|0);HEAP32[r1>>2]=5259820;r4=r3|0;HEAP32[r4>>2]=5259300;r5=(r3+4|0)>>2;HEAP32[r5]=63;r6=r3+20|0;r7=(r3+16|0)>>2;HEAP32[r7]=r6;r8=(r3+8|0)>>2;HEAP32[r8]=0;r9=(r3+12|0)>>2;HEAP32[r9]=128;_memcpy(r6,5254256,12);r3=HEAP32[r8]+12|0;HEAP32[r8]=r3;HEAP8[HEAP32[r7]+r3|0]=0;r3=HEAP32[r5];r10=HEAP32[r8];r11=r10+82|0;if((r3|0)<(r11|0)){r12=HEAP32[r9];r13=r3;while(1){r14=r13+r12|0;if((r14|0)<(r11|0)){r13=r14}else{break}}HEAP32[r5]=r14;r13=r14+1|0;r14=__Znaj((r13|0)>-1?r13:-1);r13=HEAP32[r7];r11=HEAP32[r8];_memcpy(r14,r13,r11+1|0);if((r13|0)==(r6|0)|(r13|0)==0){r15=r11}else{__ZdlPv(r13);r15=HEAP32[r8]}HEAP32[r7]=r14;r16=r15;r17=r14}else{r16=r10;r17=HEAP32[r7]}_memcpy(r17+r16|0,5255184,82);r16=HEAP32[r8]+82|0;HEAP32[r8]=r16;HEAP8[HEAP32[r7]+r16|0]=0;r16=HEAP32[r5];r17=HEAP32[r8];r10=r17+83|0;if((r16|0)<(r10|0)){r14=HEAP32[r9];r15=r16;while(1){r18=r15+r14|0;if((r18|0)<(r10|0)){r15=r18}else{break}}HEAP32[r5]=r18;r15=r18+1|0;r18=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r7];r10=HEAP32[r8];_memcpy(r18,r15,r10+1|0);if((r15|0)==(r6|0)|(r15|0)==0){r19=r10}else{__ZdlPv(r15);r19=HEAP32[r8]}HEAP32[r7]=r18;r20=r19;r21=r18}else{r20=r17;r21=HEAP32[r7]}_memcpy(r21+r20|0,5252088,83);r20=HEAP32[r8]+83|0;HEAP32[r8]=r20;HEAP8[HEAP32[r7]+r20|0]=0;r20=HEAP32[r5];r21=HEAP32[r8];r17=r21+72|0;if((r20|0)<(r17|0)){r18=HEAP32[r9];r19=r20;while(1){r22=r19+r18|0;if((r22|0)<(r17|0)){r19=r22}else{break}}HEAP32[r5]=r22;r19=r22+1|0;r22=__Znaj((r19|0)>-1?r19:-1);r19=HEAP32[r7];r17=HEAP32[r8];_memcpy(r22,r19,r17+1|0);if((r19|0)==(r6|0)|(r19|0)==0){r23=r17}else{__ZdlPv(r19);r23=HEAP32[r8]}HEAP32[r7]=r22;r24=r23;r25=r22}else{r24=r21;r25=HEAP32[r7]}_memcpy(r25+r24|0,5249612,72);r24=HEAP32[r8]+72|0;HEAP32[r8]=r24;HEAP8[HEAP32[r7]+r24|0]=0;r24=HEAP32[r5];r25=HEAP32[r8];r21=r25+76|0;if((r24|0)<(r21|0)){r22=HEAP32[r9];r23=r24;while(1){r26=r23+r22|0;if((r26|0)<(r21|0)){r23=r26}else{break}}HEAP32[r5]=r26;r23=r26+1|0;r26=__Znaj((r23|0)>-1?r23:-1);r23=HEAP32[r7];r21=HEAP32[r8];_memcpy(r26,r23,r21+1|0);if((r23|0)==(r6|0)|(r23|0)==0){r27=r21}else{__ZdlPv(r23);r27=HEAP32[r8]}HEAP32[r7]=r26;r28=r27;r29=r26}else{r28=r25;r29=HEAP32[r7]}_memcpy(r29+r28|0,5247396,76);r28=HEAP32[r8]+76|0;HEAP32[r8]=r28;HEAP8[HEAP32[r7]+r28|0]=0;r28=HEAP32[r5];r29=HEAP32[r8];r25=r29+91|0;if((r28|0)<(r25|0)){r26=HEAP32[r9];r27=r28;while(1){r30=r27+r26|0;if((r30|0)<(r25|0)){r27=r30}else{break}}HEAP32[r5]=r30;r27=r30+1|0;r30=__Znaj((r27|0)>-1?r27:-1);r27=HEAP32[r7];r25=HEAP32[r8];_memcpy(r30,r27,r25+1|0);if((r27|0)==(r6|0)|(r27|0)==0){r31=r25}else{__ZdlPv(r27);r31=HEAP32[r8]}HEAP32[r7]=r30;r32=r31;r33=r30}else{r32=r29;r33=HEAP32[r7]}_memcpy(r33+r32|0,5245436,91);r29=r32+91|0;HEAP32[r8]=r29;HEAP8[r33+r29|0]=0;r29=HEAP32[r5];r33=HEAP32[r8];r32=r33+83|0;if((r29|0)<(r32|0)){r30=HEAP32[r9];r31=r29;while(1){r34=r31+r30|0;if((r34|0)<(r32|0)){r31=r34}else{break}}HEAP32[r5]=r34;r31=r34+1|0;r34=__Znaj((r31|0)>-1?r31:-1);r31=HEAP32[r7];r32=HEAP32[r8];_memcpy(r34,r31,r32+1|0);if((r31|0)==(r6|0)|(r31|0)==0){r35=r32}else{__ZdlPv(r31);r35=HEAP32[r8]}HEAP32[r7]=r34;r36=r35;r37=r34}else{r36=r33;r37=HEAP32[r7]}_memcpy(r37+r36|0,5244752,83);r36=HEAP32[r8]+83|0;HEAP32[r8]=r36;HEAP8[HEAP32[r7]+r36|0]=0;r36=HEAP32[r5];r37=HEAP32[r8];r33=r37+125|0;if((r36|0)<(r33|0)){r34=HEAP32[r9];r35=r36;while(1){r38=r35+r34|0;if((r38|0)<(r33|0)){r35=r38}else{break}}HEAP32[r5]=r38;r35=r38+1|0;r38=__Znaj((r35|0)>-1?r35:-1);r35=HEAP32[r7];r33=HEAP32[r8];_memcpy(r38,r35,r33+1|0);if((r35|0)==(r6|0)|(r35|0)==0){r39=r33}else{__ZdlPv(r35);r39=HEAP32[r8]}HEAP32[r7]=r38;r40=r39;r41=r38}else{r40=r37;r41=HEAP32[r7]}_memcpy(r41+r40|0,5244168,125);r37=r40+125|0;HEAP32[r8]=r37;HEAP8[r41+r37|0]=0;r37=HEAP32[r5];r41=HEAP32[r8];r40=r41+108|0;if((r37|0)<(r40|0)){r38=HEAP32[r9];r39=r37;while(1){r42=r39+r38|0;if((r42|0)<(r40|0)){r39=r42}else{break}}HEAP32[r5]=r42;r39=r42+1|0;r42=__Znaj((r39|0)>-1?r39:-1);r39=HEAP32[r7];r40=HEAP32[r8];_memcpy(r42,r39,r40+1|0);if((r39|0)==(r6|0)|(r39|0)==0){r43=r40}else{__ZdlPv(r39);r43=HEAP32[r8]}HEAP32[r7]=r42;r44=r43;r45=r42}else{r44=r41;r45=HEAP32[r7]}_memcpy(r45+r44|0,5243624,108);r41=r44+108|0;HEAP32[r8]=r41;HEAP8[r45+r41|0]=0;r41=HEAP32[r5];r45=HEAP32[r8];r44=r45+84|0;if((r41|0)<(r44|0)){r42=HEAP32[r9];r43=r41;while(1){r46=r43+r42|0;if((r46|0)<(r44|0)){r43=r46}else{break}}HEAP32[r5]=r46;r43=r46+1|0;r46=__Znaj((r43|0)>-1?r43:-1);r43=HEAP32[r7];r44=HEAP32[r8];_memcpy(r46,r43,r44+1|0);if((r43|0)==(r6|0)|(r43|0)==0){r47=r44}else{__ZdlPv(r43);r47=HEAP32[r8]}HEAP32[r7]=r46;r48=r47;r49=r46}else{r48=r45;r49=HEAP32[r7]}_memcpy(r49+r48|0,5243108,84);r48=HEAP32[r8]+84|0;HEAP32[r8]=r48;HEAP8[HEAP32[r7]+r48|0]=0;r48=HEAP32[r5];r49=HEAP32[r8];r45=r49+63|0;if((r48|0)<(r45|0)){r46=HEAP32[r9];r47=r48;while(1){r50=r47+r46|0;if((r50|0)<(r45|0)){r47=r50}else{break}}HEAP32[r5]=r50;r47=r50+1|0;r50=__Znaj((r47|0)>-1?r47:-1);r47=HEAP32[r7];r45=HEAP32[r8];_memcpy(r50,r47,r45+1|0);if((r47|0)==(r6|0)|(r47|0)==0){r51=r45}else{__ZdlPv(r47);r51=HEAP32[r8]}HEAP32[r7]=r50;r52=r51;r53=r50}else{r52=r49;r53=HEAP32[r7]}_memcpy(r53+r52|0,5257356,63);r52=HEAP32[r8]+63|0;HEAP32[r8]=r52;HEAP8[HEAP32[r7]+r52|0]=0;r52=HEAP32[r5];r53=HEAP32[r8];r49=r53+104|0;if((r52|0)<(r49|0)){r50=HEAP32[r9];r51=r52;while(1){r54=r51+r50|0;if((r54|0)<(r49|0)){r51=r54}else{break}}HEAP32[r5]=r54;r51=r54+1|0;r54=__Znaj((r51|0)>-1?r51:-1);r51=HEAP32[r7];r49=HEAP32[r8];_memcpy(r54,r51,r49+1|0);if((r51|0)==(r6|0)|(r51|0)==0){r55=r49}else{__ZdlPv(r51);r55=HEAP32[r8]}HEAP32[r7]=r54;r56=r55;r57=r54}else{r56=r53;r57=HEAP32[r7]}_memcpy(r57+r56|0,5256756,104);r53=r56+104|0;HEAP32[r8]=r53;HEAP8[r57+r53|0]=0;r53=HEAP32[r5];r57=HEAP32[r8];r56=r57+80|0;if((r53|0)<(r56|0)){r54=HEAP32[r9];r55=r53;while(1){r58=r55+r54|0;if((r58|0)<(r56|0)){r55=r58}else{break}}HEAP32[r5]=r58;r55=r58+1|0;r58=__Znaj((r55|0)>-1?r55:-1);r55=HEAP32[r7];r56=HEAP32[r8];_memcpy(r58,r55,r56+1|0);if((r55|0)==(r6|0)|(r55|0)==0){r59=r56}else{__ZdlPv(r55);r59=HEAP32[r8]}HEAP32[r7]=r58;r60=r59;r61=r58}else{r60=r57;r61=HEAP32[r7]}_memcpy(r61+r60|0,5256112,80);r60=HEAP32[r8]+80|0;HEAP32[r8]=r60;HEAP8[HEAP32[r7]+r60|0]=0;r60=HEAP32[r5];r61=HEAP32[r8];r57=r61+81|0;if((r60|0)<(r57|0)){r58=HEAP32[r9];r59=r60;while(1){r62=r59+r58|0;if((r62|0)<(r57|0)){r59=r62}else{break}}HEAP32[r5]=r62;r59=r62+1|0;r62=__Znaj((r59|0)>-1?r59:-1);r59=HEAP32[r7];r57=HEAP32[r8];_memcpy(r62,r59,r57+1|0);if((r59|0)==(r6|0)|(r59|0)==0){r63=r57}else{__ZdlPv(r59);r63=HEAP32[r8]}HEAP32[r7]=r62;r64=r63;r65=r62}else{r64=r61;r65=HEAP32[r7]}_memcpy(r65+r64|0,5255668,81);r64=HEAP32[r8]+81|0;HEAP32[r8]=r64;HEAP8[HEAP32[r7]+r64|0]=0;r64=HEAP32[r5];r65=HEAP32[r8];r61=r65+65|0;if((r64|0)<(r61|0)){r62=HEAP32[r9];r63=r64;while(1){r66=r63+r62|0;if((r66|0)<(r61|0)){r63=r66}else{break}}HEAP32[r5]=r66;r63=r66+1|0;r66=__Znaj((r63|0)>-1?r63:-1);r63=HEAP32[r7];r61=HEAP32[r8];_memcpy(r66,r63,r61+1|0);if((r63|0)==(r6|0)|(r63|0)==0){r67=r61}else{__ZdlPv(r63);r67=HEAP32[r8]}HEAP32[r7]=r66;r68=r67;r69=r66}else{r68=r65;r69=HEAP32[r7]}_memcpy(r69+r68|0,5255288,65);r68=HEAP32[r8]+65|0;HEAP32[r8]=r68;HEAP8[HEAP32[r7]+r68|0]=0;r68=HEAP32[r5];r69=HEAP32[r8];r65=r69+71|0;if((r68|0)<(r65|0)){r66=HEAP32[r9];r67=r68;while(1){r70=r67+r66|0;if((r70|0)<(r65|0)){r67=r70}else{break}}HEAP32[r5]=r70;r67=r70+1|0;r70=__Znaj((r67|0)>-1?r67:-1);r67=HEAP32[r7];r65=HEAP32[r8];_memcpy(r70,r67,r65+1|0);if((r67|0)==(r6|0)|(r67|0)==0){r71=r65}else{__ZdlPv(r67);r71=HEAP32[r8]}HEAP32[r7]=r70;r72=r71;r73=r70}else{r72=r69;r73=HEAP32[r7]}_memcpy(r73+r72|0,5254928,71);r72=HEAP32[r8]+71|0;HEAP32[r8]=r72;HEAP8[HEAP32[r7]+r72|0]=0;r72=HEAP32[r5];r73=HEAP32[r8];r69=r73+106|0;if((r72|0)<(r69|0)){r70=HEAP32[r9];r71=r72;while(1){r74=r71+r70|0;if((r74|0)<(r69|0)){r71=r74}else{break}}HEAP32[r5]=r74;r71=r74+1|0;r74=__Znaj((r71|0)>-1?r71:-1);r71=HEAP32[r7];r69=HEAP32[r8];_memcpy(r74,r71,r69+1|0);if((r71|0)==(r6|0)|(r71|0)==0){r75=r69}else{__ZdlPv(r71);r75=HEAP32[r8]}HEAP32[r7]=r74;r76=r75;r77=r74}else{r76=r73;r77=HEAP32[r7]}_memcpy(r77+r76|0,5254644,106);r73=r76+106|0;HEAP32[r8]=r73;HEAP8[r77+r73|0]=0;r73=HEAP32[r5];r77=HEAP32[r8];r76=r77+81|0;if((r73|0)<(r76|0)){r74=HEAP32[r9];r75=r73;while(1){r78=r75+r74|0;if((r78|0)<(r76|0)){r75=r78}else{break}}HEAP32[r5]=r78;r75=r78+1|0;r78=__Znaj((r75|0)>-1?r75:-1);r75=HEAP32[r7];r76=HEAP32[r8];_memcpy(r78,r75,r76+1|0);if((r75|0)==(r6|0)|(r75|0)==0){r79=r76}else{__ZdlPv(r75);r79=HEAP32[r8]}HEAP32[r7]=r78;r80=r79;r81=r78}else{r80=r77;r81=HEAP32[r7]}_memcpy(r81+r80|0,5254308,81);r80=HEAP32[r8]+81|0;HEAP32[r8]=r80;HEAP8[HEAP32[r7]+r80|0]=0;r80=HEAP32[r5];r81=HEAP32[r8];r77=r81+75|0;if((r80|0)<(r77|0)){r78=HEAP32[r9];r79=r80;while(1){r82=r79+r78|0;if((r82|0)<(r77|0)){r79=r82}else{break}}HEAP32[r5]=r82;r79=r82+1|0;r82=__Znaj((r79|0)>-1?r79:-1);r79=HEAP32[r7];r77=HEAP32[r8];_memcpy(r82,r79,r77+1|0);if((r79|0)==(r6|0)|(r79|0)==0){r83=r77}else{__ZdlPv(r79);r83=HEAP32[r8]}HEAP32[r7]=r82;r84=r83;r85=r82}else{r84=r81;r85=HEAP32[r7]}_memcpy(r85+r84|0,5253940,75);r84=HEAP32[r8]+75|0;HEAP32[r8]=r84;HEAP8[HEAP32[r7]+r84|0]=0;r84=HEAP32[r5];r85=HEAP32[r8];r81=r85+76|0;if((r84|0)<(r81|0)){r82=HEAP32[r9];r83=r84;while(1){r86=r83+r82|0;if((r86|0)<(r81|0)){r83=r86}else{break}}HEAP32[r5]=r86;r83=r86+1|0;r86=__Znaj((r83|0)>-1?r83:-1);r83=HEAP32[r7];r81=HEAP32[r8];_memcpy(r86,r83,r81+1|0);if((r83|0)==(r6|0)|(r83|0)==0){r87=r81}else{__ZdlPv(r83);r87=HEAP32[r8]}HEAP32[r7]=r86;r88=r87;r89=r86}else{r88=r85;r89=HEAP32[r7]}_memcpy(r89+r88|0,5253612,76);r88=HEAP32[r8]+76|0;HEAP32[r8]=r88;HEAP8[HEAP32[r7]+r88|0]=0;r88=HEAP32[r5];r89=HEAP32[r8];r85=r89+72|0;if((r88|0)<(r85|0)){r86=HEAP32[r9];r87=r88;while(1){r90=r87+r86|0;if((r90|0)<(r85|0)){r87=r90}else{break}}HEAP32[r5]=r90;r87=r90+1|0;r90=__Znaj((r87|0)>-1?r87:-1);r87=HEAP32[r7];r85=HEAP32[r8];_memcpy(r90,r87,r85+1|0);if((r87|0)==(r6|0)|(r87|0)==0){r91=r85}else{__ZdlPv(r87);r91=HEAP32[r8]}HEAP32[r7]=r90;r92=r91;r93=r90}else{r92=r89;r93=HEAP32[r7]}_memcpy(r93+r92|0,5253288,72);r92=HEAP32[r8]+72|0;HEAP32[r8]=r92;HEAP8[HEAP32[r7]+r92|0]=0;r92=HEAP32[r5];r93=HEAP32[r8];r89=r93+13|0;if((r92|0)<(r89|0)){r90=HEAP32[r9];r9=r92;while(1){r94=r9+r90|0;if((r94|0)<(r89|0)){r9=r94}else{break}}HEAP32[r5]=r94;r5=r94+1|0;r94=__Znaj((r5|0)>-1?r5:-1);r5=HEAP32[r7];r9=HEAP32[r8];_memcpy(r94,r5,r9+1|0);if((r5|0)==(r6|0)|(r5|0)==0){r95=r9}else{__ZdlPv(r5);r95=HEAP32[r8]}HEAP32[r7]=r94;r96=r95;r97=r94}else{r96=r93;r97=HEAP32[r7]}_memcpy(r97+r96|0,5245208,13);r96=HEAP32[r8]+13|0;HEAP32[r8]=r96;HEAP8[HEAP32[r7]+r96|0]=0;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r1|0,HEAP32[r8],HEAP32[r7]);HEAP32[r4>>2]=5259300;r4=HEAP32[r7];if((r4|0)==(r6|0)|(r4|0)==0){STACKTOP=r2;return}__ZdlPv(r4);STACKTOP=r2;return}function __ZN20mgPlatformErrorTableD1Ev(r1){__ZN12mgErrorTableD2Ev(r1|0);return}function __ZN20mgPlatformErrorTableD0Ev(r1){__ZN12mgErrorTableD2Ev(r1|0);__ZdlPv(r1);return}function __ZN12mgGenSurfaceD0Ev(r1){__ZN12mgGenSurfaceD2Ev(r1);__ZdlPv(r1);return}function __ZN12mgGenSurfaceD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;HEAP32[r1>>2]=5270008;r5=(r1+44|0)>>2;r6=(r1+36|0)>>2;r7=HEAP32[r6];r8=0;while(1){if((r8|0)>=(r7|0)){r9=r7;break}if((HEAP32[HEAP32[r5]+(r8<<3)>>2]|0)==0){r8=r8+1|0}else{r2=822;break}}L753:do{if(r2==822){if((r8|0)==-1){r9=r7;break}r10=r4|0;r11=r4+4|0;r12=r4+20|0;r13=(r4+16|0)>>2;r14=(r4+8|0)>>2;r15=r4+12|0;r16=r8;r17=0;r18=r7;while(1){HEAP32[r10>>2]=5259300;HEAP32[r11>>2]=63;HEAP32[r13]=r12;HEAP32[r14]=0;HEAP8[r12]=0;HEAP32[r15>>2]=128;r19=r18-1|0;r20=(r19|0)<(r16|0)?r19:r16;r19=(r20|0)<0?0:r20;r20=HEAP32[r5];r21=HEAP32[r20+(r19<<3)>>2];L758:do{if((r21|0)==0){r22=r17;r23=r16}else{HEAP32[r14]=0;HEAP8[r12]=0;r24=_strlen(r21);if((r24|0)>63){r25=63;while(1){r26=r25+128|0;if((r26|0)<(r24|0)){r25=r26}else{break}}HEAP32[r11>>2]=r26;r27=r25+129|0;r28=__Znaj((r27|0)>-1?r27:-1);r27=HEAP32[r13];r29=HEAP32[r14];_memcpy(r28,r27,r29+1|0);if((r27|0)==(r12|0)|(r27|0)==0){r30=r29}else{__ZdlPv(r27);r30=HEAP32[r14]}HEAP32[r13]=r28;r31=r30;r32=r28}else{r31=0;r32=r12}_memcpy(r32+r31|0,r21,r24);r28=HEAP32[r14]+r24|0;HEAP32[r14]=r28;HEAP8[HEAP32[r13]+r28|0]=0;r28=HEAP32[r20+(r19<<3)+4>>2];r27=HEAP32[r6];r29=r19;while(1){r33=r29+1|0;if((r33|0)>=(r27|0)){r22=r28;r23=-1;break L758}if((HEAP32[HEAP32[r5]+(r33<<3)>>2]|0)==0){r29=r33}else{r22=r28;r23=r33;break L758}}}}while(0);if((r22|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+4>>2]](r22)}HEAP32[r10>>2]=5259300;r19=HEAP32[r13];if(!((r19|0)==(r12|0)|(r19|0)==0)){__ZdlPv(r19)}r19=HEAP32[r6];if((r23|0)==-1){r9=r19;break L753}else{r16=r23;r17=r22;r18=r19}}}}while(0);L780:do{if((r9|0)>0){r22=r1+40|0;r23=0;r31=r9;while(1){r32=HEAP32[r5];r30=(r23<<3)+r32|0;r26=HEAP32[r30>>2];if((r26|0)==0){r34=r31}else{__ZdlPv(r26);HEAP32[r30>>2]=0;HEAP32[r32+(r23<<3)+4>>2]=0;HEAP32[r22>>2]=HEAP32[r22>>2]-1|0;r34=HEAP32[r6]}r32=r23+1|0;if((r32|0)<(r34|0)){r23=r32;r31=r34}else{break}}HEAP32[r1+32>>2]=5262356;r31=HEAP32[r5];if((r34|0)<=0){r35=r31;break}r23=r1+40|0;r22=0;r32=r31;r31=r34;while(1){r30=(r22<<3)+r32|0;r26=HEAP32[r30>>2];if((r26|0)==0){r36=r31;r37=r32}else{__ZdlPv(r26);HEAP32[r30>>2]=0;HEAP32[r32+(r22<<3)+4>>2]=0;HEAP32[r23>>2]=HEAP32[r23>>2]-1|0;r36=HEAP32[r6];r37=HEAP32[r5]}r30=r22+1|0;if((r30|0)<(r36|0)){r22=r30;r32=r37;r31=r36}else{r35=r37;break L780}}}else{HEAP32[r1+32>>2]=5262356;r35=HEAP32[r5]}}while(0);if((r35|0)==0){STACKTOP=r3;return}__ZdlPv(r35);STACKTOP=r3;return}function __ZN12mgGenSurface18removeAllResourcesEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;r5=(r1+44|0)>>2;r6=(r1+36|0)>>2;r7=HEAP32[r6];r8=0;while(1){if((r8|0)>=(r7|0)){r9=r7;break}if((HEAP32[HEAP32[r5]+(r8<<3)>>2]|0)==0){r8=r8+1|0}else{r2=868;break}}L804:do{if(r2==868){if((r8|0)==-1){r9=r7;break}r10=r4|0;r11=r4+4|0;r12=r4+20|0;r13=(r4+16|0)>>2;r14=(r4+8|0)>>2;r15=r4+12|0;r16=r8;r17=0;r18=r7;while(1){HEAP32[r10>>2]=5259300;HEAP32[r11>>2]=63;HEAP32[r13]=r12;HEAP32[r14]=0;HEAP8[r12]=0;HEAP32[r15>>2]=128;r19=r18-1|0;r20=(r19|0)<(r16|0)?r19:r16;r19=(r20|0)<0?0:r20;r20=HEAP32[r5];r21=HEAP32[r20+(r19<<3)>>2];L809:do{if((r21|0)==0){r22=r17;r23=r16}else{HEAP32[r14]=0;HEAP8[r12]=0;r24=_strlen(r21);if((r24|0)>63){r25=63;while(1){r26=r25+128|0;if((r26|0)<(r24|0)){r25=r26}else{break}}HEAP32[r11>>2]=r26;r27=r25+129|0;r28=__Znaj((r27|0)>-1?r27:-1);r27=HEAP32[r13];r29=HEAP32[r14];_memcpy(r28,r27,r29+1|0);if((r27|0)==(r12|0)|(r27|0)==0){r30=r29}else{__ZdlPv(r27);r30=HEAP32[r14]}HEAP32[r13]=r28;r31=r30;r32=r28}else{r31=0;r32=r12}_memcpy(r32+r31|0,r21,r24);r28=HEAP32[r14]+r24|0;HEAP32[r14]=r28;HEAP8[HEAP32[r13]+r28|0]=0;r28=HEAP32[r20+(r19<<3)+4>>2];r27=HEAP32[r6];r29=r19;while(1){r33=r29+1|0;if((r33|0)>=(r27|0)){r22=r28;r23=-1;break L809}if((HEAP32[HEAP32[r5]+(r33<<3)>>2]|0)==0){r29=r33}else{r22=r28;r23=r33;break L809}}}}while(0);if((r22|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+4>>2]](r22)}HEAP32[r10>>2]=5259300;r19=HEAP32[r13];if(!((r19|0)==(r12|0)|(r19|0)==0)){__ZdlPv(r19)}r19=HEAP32[r6];if((r23|0)==-1){r9=r19;break L804}else{r16=r23;r17=r22;r18=r19}}}}while(0);if((r9|0)<=0){STACKTOP=r3;return}r22=r1+40|0;r1=0;r23=r9;while(1){r9=HEAP32[r5];r31=(r1<<3)+r9|0;r32=HEAP32[r31>>2];if((r32|0)==0){r34=r23}else{__ZdlPv(r32);HEAP32[r31>>2]=0;HEAP32[r9+(r1<<3)+4>>2]=0;HEAP32[r22>>2]=HEAP32[r22>>2]-1|0;r34=HEAP32[r6]}r9=r1+1|0;if((r9|0)<(r34|0)){r1=r9;r23=r34}else{break}}STACKTOP=r3;return}function __ZNK12mgGenSurface6pointsEd(r1,r2){return Math.floor((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+100>>2]](r1)|0)*r2/72+.5)&-1}function __ZN12mgGenSurface10createFontEPKcijj(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r6=STACKTOP;STACKTOP=STACKTOP+84|0;r7=r6;r8=r7|0;HEAP32[r8>>2]=5259300;HEAP32[r7+4>>2]=63;r9=r7+20|0;r10=(r7+16|0)>>2;HEAP32[r10]=r9;r11=(r7+8|0)>>2;HEAP32[r11]=0;HEAP8[r9]=0;HEAP32[r7+12>>2]=128;__ZN8mgString6formatEPKcz(r7,5246392,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r2,HEAP32[tempInt+4>>2]=r3,HEAP32[tempInt+8>>2]=(r4|0)!=0?5255156:5254808,HEAP32[tempInt+12>>2]=(r5|0)!=0?5249592:5254808,tempInt));r7=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+52>>2]](r1,HEAP32[r10]);if((r7|0)==0){r12=__Znwj(208),r13=r12>>2;HEAP32[r13+1]=5259300;r14=(r12+8|0)>>2;HEAP32[r14]=63;r15=r12+24|0;r16=(r12+20|0)>>2;HEAP32[r16]=r15;r17=(r12+12|0)>>2;HEAP32[r17]=0;HEAP8[r15]=0;r18=r12+16|0;HEAP32[r18>>2]=128;HEAP32[r13+22]=0;r19=r12+92|0;HEAP32[r19>>2]=5259300;HEAP32[r13+24]=63;r20=r12+112|0;HEAP32[r13+27]=r20;HEAP32[r13+25]=0;HEAP8[r20]=0;HEAP32[r13+26]=128;HEAP32[r13]=5258692;r20=r12+200|0;HEAP32[r20>>2]=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1,r3|0);__ZN8mgStringaSEPKc(r19,r2);HEAP32[r13+44]=r3;HEAP32[r13+45]=r4;HEAP32[r13+46]=r5;r5=HEAP32[r20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+104>>2]](r5,r12);r5=HEAP32[r11];r20=HEAP32[r14];if((r5|0)>(r20|0)){r13=HEAP32[r18>>2];r18=r20;while(1){r21=r18+r13|0;if((r21|0)<(r5|0)){r18=r21}else{break}}HEAP32[r14]=r21;r14=r21+1|0;r21=__Znaj((r14|0)>-1?r14:-1);r14=HEAP32[r16];_memcpy(r21,r14,HEAP32[r17]+1|0);if(!((r14|0)==(r15|0)|(r14|0)==0)){__ZdlPv(r14)}HEAP32[r16]=r21;r22=HEAP32[r11];r23=r21}else{r22=r5;r23=HEAP32[r16]}_memcpy(r23,HEAP32[r10],r22+1|0);HEAP32[r17]=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](r1,r12);r24=r12}else{r24=r7}HEAP32[r8>>2]=5259300;r8=HEAP32[r10];if((r8|0)==(r9|0)|(r8|0)==0){STACKTOP=r6;return r24}__ZdlPv(r8);STACKTOP=r6;return r24}function __ZN12mgGenSurface10createFontEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+308|0;r5=r4;r6=r4+84;r7=r4+88;r8=r4+172;r9=r4+256;r10=r5|0;HEAP32[r10>>2]=5259300;r11=(r5+4|0)>>2;HEAP32[r11]=63;r12=r5+20|0;r13=(r5+16|0)>>2;HEAP32[r13]=r12;r14=(r5+8|0)>>2;HEAP32[r14]=0;HEAP8[r12]=0;r15=(r5+12|0)>>2;HEAP32[r15]=128;HEAP32[r6>>2]=12;r5=r7|0;HEAP32[r5>>2]=5259300;r16=r7+4|0;HEAP32[r16>>2]=63;r17=r7+20|0;r18=(r7+16|0)>>2;HEAP32[r18]=r17;r19=(r7+8|0)>>2;HEAP32[r19]=0;HEAP8[r17]=0;HEAP32[r7+12>>2]=128;if((r2|0)==0){r20=0;r21=r17}else{r7=_strlen(r2);if((r7|0)>63){r22=63;while(1){r23=r22+128|0;if((r23|0)<(r7|0)){r22=r23}else{break}}HEAP32[r16>>2]=r23;r23=r22+129|0;r22=__Znaj((r23|0)>-1?r23:-1);r23=HEAP32[r18];r16=HEAP32[r19];_memcpy(r22,r23,r16+1|0);if((r23|0)==(r17|0)|(r23|0)==0){r24=r16}else{__ZdlPv(r23);r24=HEAP32[r19]}HEAP32[r18]=r22;r25=r24;r26=r22}else{r25=0;r26=r17}_memcpy(r26+r25|0,r2,r7);r2=HEAP32[r19]+r7|0;HEAP32[r19]=r2;HEAP8[HEAP32[r18]+r2|0]=0;r20=HEAP32[r19];r21=HEAP32[r18]}r2=r20-1|0;r7=0;while(1){if((r7|0)>(r2|0)){r27=-1;break}if(HEAP8[r21+r7|0]<<24>>24==45){r27=r7;break}else{r7=r7+1|0}}do{if((r27|0)<(r20|0)){HEAP32[r14]=0;HEAP8[HEAP32[r13]]=0;if((r27|0)<0){r28=0}else{r7=HEAP32[r19];if((r27|0)>(r7|0)){r29=r7}else{r7=HEAP32[r18];r2=HEAP32[r11];r25=HEAP32[r14];r26=r25+r27|0;if((r2|0)<(r26|0)){r22=HEAP32[r15];r24=r2;while(1){r30=r24+r22|0;if((r30|0)<(r26|0)){r24=r30}else{break}}HEAP32[r11]=r30;r24=r30+1|0;r26=__Znaj((r24|0)>-1?r24:-1);r24=HEAP32[r13];r22=HEAP32[r14];_memcpy(r26,r24,r22+1|0);if((r24|0)==(r12|0)|(r24|0)==0){r31=r22}else{__ZdlPv(r24);r31=HEAP32[r14]}HEAP32[r13]=r26;r32=r31;r33=r26}else{r32=r25;r33=HEAP32[r13]}_memcpy(r33+r32|0,r7,r27);r26=HEAP32[r14]+r27|0;HEAP32[r14]=r26;HEAP8[HEAP32[r13]+r26|0]=0;r29=HEAP32[r19]}if((r29|0)>(r27|0)){r28=r27}else{r34=r29;r35=r29;break}}r26=HEAP32[r18];r24=HEAP8[r26+r28|0];L904:do{if(r24<<24>>24==0){r36=1}else{r22=0;r2=r24;r23=1;while(1){r16=r2&255;if((r16&128|0)==0){r36=r23;break L904}do{if((r16&192|0)==128){r37=r22-1|0;if((r37|0)<1){r36=r23;break L904}else{r38=r37}}else{if((r16&224|0)==192){r38=1;break}if((r16&240|0)==224){r38=2;break}if((r16&248|0)==240){r38=3;break}if((r16&252|0)==248){r38=4;break}if((r16&254|0)==252){r38=5}else{r36=r23;break L904}}}while(0);r16=HEAP8[r26+r23+r28|0];r37=r23+1|0;if(r16<<24>>24==0){r36=r37;break L904}else{r22=r38;r2=r16;r23=r37}}}}while(0);r34=r36+r28|0;r35=HEAP32[r19]}else{r26=HEAP32[r11];if((r20|0)>(r26|0)){r24=HEAP32[r15];r7=r26;while(1){r39=r7+r24|0;if((r39|0)<(r20|0)){r7=r39}else{break}}HEAP32[r11]=r39;r7=r39+1|0;r24=__Znaj((r7|0)>-1?r7:-1);r7=HEAP32[r13];_memcpy(r24,r7,HEAP32[r14]+1|0);if(!((r7|0)==(r12|0)|(r7|0)==0)){__ZdlPv(r7)}HEAP32[r13]=r24;r40=HEAP32[r19];r41=r24;r42=HEAP32[r18]}else{r40=r20;r41=HEAP32[r13];r42=r21}_memcpy(r41,r42,r40+1|0);r24=HEAP32[r19];HEAP32[r14]=r24;r34=r27;r35=r24}}while(0);r27=r8|0;HEAP32[r27>>2]=5259300;r14=(r8+4|0)>>2;HEAP32[r14]=63;r40=r8+20|0;r42=(r8+16|0)>>2;HEAP32[r42]=r40;r41=(r8+8|0)>>2;HEAP32[r41]=0;HEAP8[r40]=0;HEAP32[r8+12>>2]=128;do{if((r34|0)<(r35|0)){r8=r35-1|0;r21=HEAP32[r18];r20=r34;while(1){if((r20|0)>(r8|0)){r3=993;break}if(HEAP8[r21+r20|0]<<24>>24==45){r3=979;break}else{r20=r20+1|0}}do{if(r3==979){if((r20|0)==-1){r3=993;break}r8=r20-r34|0;HEAP32[r41]=0;HEAP8[r40]=0;if((r8|r34|0)<0|(r20|0)>(r35|0)){r43=r20;break}r39=r21+r34|0;if((r8|0)>63){r11=63;while(1){r44=r11+128|0;if((r44|0)<(r8|0)){r11=r44}else{break}}HEAP32[r14]=r44;r15=r11+129|0;r28=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r42];r36=HEAP32[r41];_memcpy(r28,r15,r36+1|0);if((r15|0)==(r40|0)|(r15|0)==0){r45=r36}else{__ZdlPv(r15);r45=HEAP32[r41]}HEAP32[r42]=r28;r46=r45;r47=r28}else{r46=0;r47=HEAP32[r42]}_memcpy(r47+r46|0,r39,r8);r28=HEAP32[r41]+r8|0;HEAP32[r41]=r28;HEAP8[HEAP32[r42]+r28|0]=0;r43=r20;break}}while(0);do{if(r3==993){HEAP32[r41]=0;HEAP8[r40]=0;if((r34|0)<0){r43=r35;break}r20=r21+r34|0;r28=r35-r34|0;if((r28|0)>63){r15=63;while(1){r48=r15+128|0;if((r48|0)<(r28|0)){r15=r48}else{break}}HEAP32[r14]=r48;r8=r15+129|0;r39=__Znaj((r8|0)>-1?r8:-1);r8=HEAP32[r42];r11=HEAP32[r41];_memcpy(r39,r8,r11+1|0);if((r8|0)==(r40|0)|(r8|0)==0){r49=r11}else{__ZdlPv(r8);r49=HEAP32[r41]}HEAP32[r42]=r39;r50=r49;r51=r39}else{r50=0;r51=r40}_memcpy(r51+r50|0,r20,r28);r39=HEAP32[r41]+r28|0;HEAP32[r41]=r39;HEAP8[HEAP32[r42]+r39|0]=0;r43=HEAP32[r19]}}while(0);if((_sscanf(HEAP32[r42],5243328,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r6,tempInt))|0)==1){r52=r43;r53=HEAP32[r19];break}r21=___cxa_allocate_exception(4);r39=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r39,5244736,5244160,5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r18],tempInt));HEAP32[r21>>2]=r39;___cxa_throw(r21,5275304,0)}else{r52=r34;r53=r35}}while(0);L969:do{if((r52|0)<(r53|0)){r35=r9|0;r34=r52;r43=0;r41=0;r50=r53;L971:while(1){r51=r34;r49=r41;r48=r50;L973:while(1){HEAP8[r35]=0;do{if((r51|0)<0){r54=0;r3=1014}else{if((r48|0)>(r51|0)){r54=r51;r3=1014;break}else{r55=r48;break}}}while(0);if(r3==1014){r3=0;r14=HEAP32[r18];r46=r14+r54|0;r47=HEAP8[r46];L979:do{if(r47<<24>>24==0){r56=1}else{r45=0;r44=r47;r21=1;while(1){r39=r44&255;if((r39&128|0)==0){r56=r21;break L979}do{if((r39&192|0)==128){r8=r45-1|0;if((r8|0)<1){r56=r21;break L979}else{r57=r8}}else{if((r39&224|0)==192){r57=1;break}if((r39&240|0)==224){r57=2;break}if((r39&248|0)==240){r57=3;break}if((r39&252|0)==248){r57=4;break}if((r39&254|0)==252){r57=5}else{r56=r21;break L979}}}while(0);r39=HEAP8[r14+r21+r54|0];r8=r21+1|0;if(r39<<24>>24==0){r56=r8;break L979}else{r45=r57;r44=r39;r21=r8}}}}while(0);_memcpy(r35,r46,r56);HEAP8[r9+r56|0]=0;r55=r56+r54|0}if((_strcmp(r35,5247392)|0)!=0){r3=1026;break L971}HEAP8[r35]=0;do{if((r55|0)<0){r58=0;r3=1034}else{if((r48|0)>(r55|0)){r58=r55;r3=1034;break}else{r59=r48;break}}}while(0);if(r3==1034){r3=0;r46=HEAP32[r18];r14=r46+r58|0;r47=HEAP8[r14];L998:do{if(r47<<24>>24==0){r60=1}else{r21=0;r44=r47;r45=1;while(1){r8=r44&255;if((r8&128|0)==0){r60=r45;break L998}do{if((r8&192|0)==128){r39=r21-1|0;if((r39|0)<1){r60=r45;break L998}else{r61=r39}}else{if((r8&224|0)==192){r61=1;break}if((r8&240|0)==224){r61=2;break}if((r8&248|0)==240){r61=3;break}if((r8&252|0)==248){r61=4;break}if((r8&254|0)==252){r61=5}else{r60=r45;break L998}}}while(0);r8=HEAP8[r46+r45+r58|0];r39=r45+1|0;if(r8<<24>>24==0){r60=r39;break L998}else{r21=r61;r44=r8;r45=r39}}}}while(0);_memcpy(r35,r14,r60);HEAP8[r9+r60|0]=0;r59=r60+r58|0}r46=5243104;r47=r35;while(1){r45=HEAP8[r47];r44=HEAP8[r46];r21=r45<<24>>24;if((r21&128|0)==0){r62=_tolower(r21)&255}else{r62=r45}if(r62<<24>>24>-1){r63=_tolower(r44<<24>>24)&255}else{r63=r44}if(r62<<24>>24!=r63<<24>>24){r64=5257352;r65=r35;break L973}if(r62<<24>>24==0){break}else{r46=r46+1|0;r47=r47+1|0}}r47=HEAP32[r19];if((r59|0)<(r47|0)){r51=r59;r49=1;r48=r47}else{r66=1;r67=r43;break L969}}while(1){r48=HEAP8[r65];r51=HEAP8[r64];r28=r48<<24>>24;if((r28&128|0)==0){r68=_tolower(r28)&255}else{r68=r48}if(r68<<24>>24>-1){r69=_tolower(r51<<24>>24)&255}else{r69=r51}if(r68<<24>>24!=r69<<24>>24){r3=1064;break L971}if(r68<<24>>24==0){break}else{r64=r64+1|0;r65=r65+1|0}}r51=HEAP32[r19];if((r59|0)<(r51|0)){r34=r59;r43=1;r41=r49;r50=r51}else{r66=r49;r67=1;break L969}}if(r3==1026){r50=___cxa_allocate_exception(4);r41=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r41,5244736,5244160,5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r18],tempInt));HEAP32[r50>>2]=r41;___cxa_throw(r50,5275304,0)}else if(r3==1064){r50=___cxa_allocate_exception(4);r41=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r41,5244736,5244160,5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r18],tempInt));HEAP32[r50>>2]=r41;___cxa_throw(r50,5275304,0)}}else{r66=0;r67=0}}while(0);r3=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1,HEAP32[r13],HEAP32[r6>>2],r66,r67);HEAP32[r27>>2]=5259300;r27=HEAP32[r42];if(!((r27|0)==(r40|0)|(r27|0)==0)){__ZdlPv(r27)}HEAP32[r5>>2]=5259300;r5=HEAP32[r18];if(!((r5|0)==(r17|0)|(r5|0)==0)){__ZdlPv(r5)}HEAP32[r10>>2]=5259300;r10=HEAP32[r13];if((r10|0)==(r12|0)|(r10|0)==0){STACKTOP=r4;return r3}__ZdlPv(r10);STACKTOP=r4;return r3}function __ZN12mgGenSurface6damageEiiii(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r6=r1>>2;r7=(r1+12|0)>>2;if((HEAP32[r7]|0)==0){HEAP32[r6+4]=(r2|0)<0?0:r2;HEAP32[r6+5]=(r3|0)<0?0:r3;r8=HEAP32[r6+1];r9=r4+r2|0;HEAP32[r6+6]=(r8|0)<(r9|0)?r8:r9;r9=HEAP32[r6+2];r8=r5+r3|0;HEAP32[r6+7]=(r9|0)<(r8|0)?r9:r8;HEAP32[r7]=1;return}else{r8=r1+16|0;r9=HEAP32[r8>>2];r10=(r9|0)<(r2|0)?r9:r2;HEAP32[r8>>2]=(r10|0)<0?0:r10;r10=r1+20|0;r8=HEAP32[r10>>2];r9=(r8|0)<(r3|0)?r8:r3;HEAP32[r10>>2]=(r9|0)<0?0:r9;r9=HEAP32[r6+1];r10=r1+24|0;r8=HEAP32[r10>>2];r11=r4+r2|0;r2=(r8|0)>(r11|0)?r8:r11;HEAP32[r10>>2]=(r9|0)<(r2|0)?r9:r2;r2=HEAP32[r6+2];r6=r1+28|0;r1=HEAP32[r6>>2];r9=r5+r3|0;r3=(r1|0)>(r9|0)?r1:r9;HEAP32[r6>>2]=(r2|0)<(r3|0)?r2:r3;HEAP32[r7]=1;return}}function __ZNK12mgGenSurface9getDamageER11mgRectangle(r1,r2){var r3,r4;r3=r1+16|0;HEAP32[r2>>2]=HEAP32[r3>>2];r4=r1+20|0;HEAP32[r2+4>>2]=HEAP32[r4>>2];HEAP32[r2+8>>2]=HEAP32[r1+24>>2]-HEAP32[r3>>2]|0;HEAP32[r2+12>>2]=HEAP32[r1+28>>2]-HEAP32[r4>>2]|0;return}function __ZNK12mgGenSurface9isDamagedEv(r1){return HEAP32[r1+12>>2]}function __ZN12mgGenSurface11createBrushERK7mgColor(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;r5=r4|0;HEAP32[r5>>2]=5259300;HEAP32[r4+4>>2]=63;r6=r4+20|0;r7=(r4+16|0)>>2;HEAP32[r7]=r6;r8=(r4+8|0)>>2;HEAP32[r8]=0;HEAP8[r6]=0;HEAP32[r4+12>>2]=128;r9=(r2|0)>>2;r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r9],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+1],HEAPF64[tempDoublePtr>>3]);r11=(r2+8|0)>>2;r12=(HEAP32[tempDoublePtr>>2]=HEAP32[r11],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+1],HEAPF64[tempDoublePtr>>3]);r13=(r2+16|0)>>2;r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r13],HEAP32[tempDoublePtr+4>>2]=HEAP32[r13+1],HEAPF64[tempDoublePtr>>3]);r15=(r2+24|0)>>2;r2=(HEAP32[tempDoublePtr>>2]=HEAP32[r15],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+1],HEAPF64[tempDoublePtr>>3]);__ZN8mgString6formatEPKcz(r4,5256724,(tempInt=STACKTOP,STACKTOP=STACKTOP+32|0,HEAPF64[tempDoublePtr>>3]=r10,HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r12,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r14,HEAP32[tempInt+16>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+20>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r2,HEAP32[tempInt+24>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+28>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+52>>2]](r1,HEAP32[r7]);if((r2|0)==0){r14=__Znwj(124),r12=r14>>2;r10=r14;HEAP32[r12+1]=5259300;r4=r14+8|0;HEAP32[r4>>2]=63;r16=r14+24|0;r17=(r14+20|0)>>2;HEAP32[r17]=r16;r18=(r14+12|0)>>2;HEAP32[r18]=0;HEAP8[r16]=0;HEAP32[r12+4]=128;HEAP32[r12+22]=0;HEAP32[r12]=5259700;r12=r14+92|0,r19=r12>>2;r20=r14+116|0;HEAP32[r19]=0;HEAP32[r19+1]=0;HEAP32[r19+2]=0;HEAP32[r19+3]=0;r19=(HEAP32[tempDoublePtr>>2]=HEAP32[r9],HEAP32[tempDoublePtr+4>>2]=HEAP32[r9+1],HEAPF64[tempDoublePtr>>3]);r9=r12;HEAPF64[tempDoublePtr>>3]=r19,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=(HEAP32[tempDoublePtr>>2]=HEAP32[r11],HEAP32[tempDoublePtr+4>>2]=HEAP32[r11+1],HEAPF64[tempDoublePtr>>3]);r11=r14+100|0;HEAPF64[tempDoublePtr>>3]=r9,HEAP32[r11>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r11+4>>2]=HEAP32[tempDoublePtr+4>>2];r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r13],HEAP32[tempDoublePtr+4>>2]=HEAP32[r13+1],HEAPF64[tempDoublePtr>>3]);r13=r14+108|0;HEAPF64[tempDoublePtr>>3]=r11,HEAP32[r13>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r13+4>>2]=HEAP32[tempDoublePtr+4>>2];r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r15],HEAP32[tempDoublePtr+4>>2]=HEAP32[r15+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r13,HEAP32[r20>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r20+4>>2]=HEAP32[tempDoublePtr+4>>2];r20=HEAP32[r8];if((r20|0)>63){r13=63;while(1){r21=r13+128|0;if((r21|0)<(r20|0)){r13=r21}else{break}}HEAP32[r4>>2]=r21;r21=r13+129|0;r13=__Znaj((r21|0)>-1?r21:-1);r21=HEAP32[r17];_memcpy(r13,r21,HEAP32[r18]+1|0);if(!((r21|0)==(r16|0)|(r21|0)==0)){__ZdlPv(r21)}HEAP32[r17]=r13;r22=HEAP32[r8];r23=r13}else{r22=r20;r23=r16}_memcpy(r23,HEAP32[r7],r22+1|0);HEAP32[r18]=HEAP32[r8];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](r1,r14);r24=r10}else{r24=r2}HEAP32[r5>>2]=5259300;r5=HEAP32[r7];if((r5|0)==(r6|0)|(r5|0)==0){STACKTOP=r3;return r24}__ZdlPv(r5);STACKTOP=r3;return r24}function __ZN12mgGenSurface11createBrushEdddd(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r6=STACKTOP;STACKTOP=STACKTOP+32|0;r7=r6;r8=HEAP32[HEAP32[r1>>2]+16>>2];r9=r7|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r7+8|0;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r7+16|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=r7+24|0;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r9>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r9+4>>2]=HEAP32[tempDoublePtr+4>>2];r9=FUNCTION_TABLE[r8](r1,r7);STACKTOP=r6;return r9}function __ZN12mgGenSurface11createBrushEPKc(r1,r2){var r3,r4,r5;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3;r5=HEAP32[HEAP32[r1>>2]+16>>2];__ZN7mgColorC2EPKc(r4,r2);r2=FUNCTION_TABLE[r5](r1,r4);STACKTOP=r3;return r2}function __ZN12mgGenSurface9createPenEdRK7mgColor(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r4=STACKTOP;STACKTOP=STACKTOP+84|0;r5=r4;r6=r5|0;HEAP32[r6>>2]=5259300;HEAP32[r5+4>>2]=63;r7=r5+20|0;r8=(r5+16|0)>>2;HEAP32[r8]=r7;r9=(r5+8|0)>>2;HEAP32[r9]=0;HEAP8[r7]=0;HEAP32[r5+12>>2]=128;r10=(r3|0)>>2;r11=(HEAP32[tempDoublePtr>>2]=HEAP32[r10],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+1],HEAPF64[tempDoublePtr>>3]);r12=(r3+8|0)>>2;r13=(HEAP32[tempDoublePtr>>2]=HEAP32[r12],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+1],HEAPF64[tempDoublePtr>>3]);r14=(r3+16|0)>>2;r15=(HEAP32[tempDoublePtr>>2]=HEAP32[r14],HEAP32[tempDoublePtr+4>>2]=HEAP32[r14+1],HEAPF64[tempDoublePtr>>3]);r16=(r3+24|0)>>2;r3=(HEAP32[tempDoublePtr>>2]=HEAP32[r16],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+1],HEAPF64[tempDoublePtr>>3]);__ZN8mgString6formatEPKcz(r5,5256080,(tempInt=STACKTOP,STACKTOP=STACKTOP+40|0,HEAPF64[tempDoublePtr>>3]=r2,HEAP32[tempInt>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+4>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r11,HEAP32[tempInt+8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+12>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r13,HEAP32[tempInt+16>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+20>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r15,HEAP32[tempInt+24>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+28>>2]=HEAP32[tempDoublePtr+4>>2],HEAPF64[tempDoublePtr>>3]=r3,HEAP32[tempInt+32>>2]=HEAP32[tempDoublePtr>>2],HEAP32[tempInt+36>>2]=HEAP32[tempDoublePtr+4>>2],tempInt));r3=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+52>>2]](r1,HEAP32[r8]);if((r3|0)==0){r15=__Znwj(132),r13=r15>>2;r11=r15;HEAP32[r13+1]=5259300;r5=r15+8|0;HEAP32[r5>>2]=63;r17=r15+24|0;r18=(r15+20|0)>>2;HEAP32[r18]=r17;r19=(r15+12|0)>>2;HEAP32[r19]=0;HEAP8[r17]=0;HEAP32[r13+4]=128;HEAP32[r13+22]=0;HEAP32[r13]=5259800;r13=r15+92|0,r20=r13>>2;r21=r15+116|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;HEAP32[r20+3]=0;r20=r15+124|0;HEAPF64[tempDoublePtr>>3]=r2,HEAP32[r20>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r20+4>>2]=HEAP32[tempDoublePtr+4>>2];r20=(HEAP32[tempDoublePtr>>2]=HEAP32[r10],HEAP32[tempDoublePtr+4>>2]=HEAP32[r10+1],HEAPF64[tempDoublePtr>>3]);r10=r13;HEAPF64[tempDoublePtr>>3]=r20,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=(HEAP32[tempDoublePtr>>2]=HEAP32[r12],HEAP32[tempDoublePtr+4>>2]=HEAP32[r12+1],HEAPF64[tempDoublePtr>>3]);r12=r15+100|0;HEAPF64[tempDoublePtr>>3]=r10,HEAP32[r12>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r12+4>>2]=HEAP32[tempDoublePtr+4>>2];r12=(HEAP32[tempDoublePtr>>2]=HEAP32[r14],HEAP32[tempDoublePtr+4>>2]=HEAP32[r14+1],HEAPF64[tempDoublePtr>>3]);r14=r15+108|0;HEAPF64[tempDoublePtr>>3]=r12,HEAP32[r14>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r14+4>>2]=HEAP32[tempDoublePtr+4>>2];r14=(HEAP32[tempDoublePtr>>2]=HEAP32[r16],HEAP32[tempDoublePtr+4>>2]=HEAP32[r16+1],HEAPF64[tempDoublePtr>>3]);HEAPF64[tempDoublePtr>>3]=r14,HEAP32[r21>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r21+4>>2]=HEAP32[tempDoublePtr+4>>2];r21=HEAP32[r9];if((r21|0)>63){r14=63;while(1){r22=r14+128|0;if((r22|0)<(r21|0)){r14=r22}else{break}}HEAP32[r5>>2]=r22;r22=r14+129|0;r14=__Znaj((r22|0)>-1?r22:-1);r22=HEAP32[r18];_memcpy(r14,r22,HEAP32[r19]+1|0);if(!((r22|0)==(r17|0)|(r22|0)==0)){__ZdlPv(r22)}HEAP32[r18]=r14;r23=HEAP32[r9];r24=r14}else{r23=r21;r24=r17}_memcpy(r24,HEAP32[r8],r23+1|0);HEAP32[r19]=HEAP32[r9];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](r1,r15);r25=r11}else{r25=r3}HEAP32[r6>>2]=5259300;r6=HEAP32[r8];if((r6|0)==(r7|0)|(r6|0)==0){STACKTOP=r4;return r25}__ZdlPv(r6);STACKTOP=r4;return r25}function __ZN12mgGenSurface9createPenEdPKc(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=HEAP32[HEAP32[r1>>2]+28>>2];__ZN7mgColorC2EPKc(r5,r3);r3=FUNCTION_TABLE[r6](r1,r2,r5);STACKTOP=r4;return r3}function __ZN12mgGenSurface9createPenEddddd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10;r7=STACKTOP;STACKTOP=STACKTOP+32|0;r8=r7;r9=HEAP32[HEAP32[r1>>2]+28>>2];r10=r8|0;HEAPF64[tempDoublePtr>>3]=r3,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r8+8|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r8+16|0;HEAPF64[tempDoublePtr>>3]=r5,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=r8+24|0;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r10>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r10+4>>2]=HEAP32[tempDoublePtr+4>>2];r10=FUNCTION_TABLE[r9](r1,r2,r8);STACKTOP=r7;return r10}function __ZN12mgGenSurface10createIconEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r3;r5=r4|0;HEAP32[r5>>2]=5259300;HEAP32[r4+4>>2]=63;r6=r4+20|0;r7=(r4+16|0)>>2;HEAP32[r7]=r6;r8=(r4+8|0)>>2;HEAP32[r8]=0;HEAP8[r6]=0;HEAP32[r4+12>>2]=128;__ZN8mgString6formatEPKcz(r4,5255660,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));r4=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+52>>2]](r1,HEAP32[r7]);if((r4|0)==0){r9=__Znwj(192),r10=r9>>2;HEAP32[r10+1]=5259300;r11=(r9+8|0)>>2;HEAP32[r11]=63;r12=r9+24|0;r13=(r9+20|0)>>2;HEAP32[r13]=r12;r14=(r9+12|0)>>2;HEAP32[r14]=0;HEAP8[r12]=0;r15=r9+16|0;HEAP32[r15>>2]=128;HEAP32[r10+22]=0;r16=r9+92|0;HEAP32[r16>>2]=5259300;HEAP32[r10+24]=63;r17=r9+112|0;HEAP32[r10+27]=r17;HEAP32[r10+25]=0;HEAP8[r17]=0;HEAP32[r10+26]=128;HEAP32[r10]=5258672;HEAP32[r10+46]=r1;r17=r9+188|0;HEAP32[r17>>2]=0;HEAP32[r10+44]=0;HEAP32[r10+45]=0;r10=r9;__ZN8mgStringaSEPKc(r16,r2);HEAP32[r17>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+120>>2]](r1,r9);r17=HEAP32[r8];r2=HEAP32[r11];if((r17|0)>(r2|0)){r16=HEAP32[r15>>2];r15=r2;while(1){r18=r15+r16|0;if((r18|0)<(r17|0)){r15=r18}else{break}}HEAP32[r11]=r18;r11=r18+1|0;r18=__Znaj((r11|0)>-1?r11:-1);r11=HEAP32[r13];_memcpy(r18,r11,HEAP32[r14]+1|0);if(!((r11|0)==(r12|0)|(r11|0)==0)){__ZdlPv(r11)}HEAP32[r13]=r18;r19=HEAP32[r8];r20=r18}else{r19=r17;r20=HEAP32[r13]}_memcpy(r20,HEAP32[r7],r19+1|0);HEAP32[r14]=HEAP32[r8];FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](r1,r9);r21=r10}else{r21=r4}HEAP32[r5>>2]=5259300;r5=HEAP32[r7];if((r5|0)==(r6|0)|(r5|0)==0){STACKTOP=r3;return r21}__ZdlPv(r5);STACKTOP=r3;return r21}function __ZN12mgGenSurface11createImageEPKc(r1,r2){var r3,r4,r5,r6;r3=__Znwj(104),r4=r3>>2;r5=r3+4|0;HEAP32[r5>>2]=5259300;HEAP32[r4+2]=63;r6=r3+24|0;HEAP32[r4+5]=r6;HEAP32[r4+3]=0;HEAP8[r6]=0;HEAP32[r4+4]=128;HEAP32[r4+22]=0;HEAP32[r4+23]=0;HEAP32[r4]=5271348;HEAP32[r4+24]=r1;r4=r3+100|0;HEAP32[r4>>2]=0;__ZN8mgStringaSEPKc(r5,r2);HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+112>>2]](r1,r3);return r3}function __ZN12mgGenSurface12saveResourceEPK10mgResource(r1,r2){__ZN16mgMapStringToPtr5setAtEPKcPKv(r1+32|0,HEAP32[r2+20>>2],r2);return}function __ZNK12mgGenSurface12findResourceEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=HEAP8[r2];L1139:do{if(r4<<24>>24==0){r5=0}else{r6=0;r7=0;r8=r4;while(1){r9=r8<<24>>24^r7;r10=r9<<8|r9>>24;r9=r6+1|0;r11=HEAP8[r2+r9|0];if(r11<<24>>24==0){r5=r10;break L1139}else{r6=r9;r7=r10;r8=r11}}}}while(0);r4=HEAP32[r1+36>>2];r8=(((r5|0)>-1?r5:-r5|0)|0)%(r4|0);r5=HEAP32[r1+44>>2];r1=r8;while(1){r7=HEAP32[r5+(r1<<3)>>2];if((r7|0)==0){r12=0;r3=1177;break}if((_strcmp(r7,r2)|0)==0){r3=1175;break}r7=r1+1|0;r6=(r7|0)<(r4|0)?r7:0;if((r6|0)==(r8|0)){r12=0;r3=1179;break}else{r1=r6}}if(r3==1177){return r12}else if(r3==1175){r12=HEAP32[r5+(r1<<3)+4>>2];return r12}else if(r3==1179){return r12}}function __ZN12mgGenSurface14removeResourceEPK10mgResource(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=HEAP32[r2+20>>2];r2=HEAP8[r4];L1153:do{if(r2<<24>>24==0){r5=0}else{r6=0;r7=0;r8=r2;while(1){r9=r8<<24>>24^r7;r10=r9<<8|r9>>24;r9=r6+1|0;r11=HEAP8[r4+r9|0];if(r11<<24>>24==0){r5=r10;break L1153}else{r6=r9;r7=r10;r8=r11}}}}while(0);r2=HEAP32[r1+36>>2];r8=(((r5|0)>-1?r5:-r5|0)|0)%(r2|0);r5=(r1+44|0)>>2;r7=HEAP32[r5];r6=r8;while(1){r12=HEAP32[r7+(r6<<3)>>2];if((r12|0)!=0){if((_strcmp(r12,r4)|0)==0){break}}r11=r6+1|0;r10=(r11|0)<(r2|0)?r11:0;if((r10|0)==(r8|0)){r3=1189;break}else{r6=r10}}if(r3==1189){return}__ZdlPv(r12);HEAP32[HEAP32[r5]+(r6<<3)>>2]=0;HEAP32[HEAP32[r5]+(r6<<3)+4>>2]=0;r6=r1+40|0;HEAP32[r6>>2]=HEAP32[r6>>2]-1|0;return}function __ZN12mgGenSurface10newContextEv(r1){var r2,r3,r4,r5,r6,r7,r8;r2=__Znwj(40),r3=r2>>2;r4=r2;HEAP32[r3]=5270184;r5=(r2+24|0)>>2;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;r5=(r2+4|0)>>2;HEAP32[r5]=r1;r1=__Znwj(84),r6=r1>>2;r7=r1;_memset(r1,0,52);HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;HEAP32[r6+3]=0;r6=(r1+52|0)>>2;r8=r1+76|0;HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;HEAP32[r6+3]=0;HEAP32[r6+4]=0;HEAP32[r6+5]=0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r8+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[r3+2]=r7;r7=HEAP32[r5];HEAP32[r3+3]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+8>>2]](r7,5245172,10,0,0);r7=HEAP32[r5];HEAP32[r3+4]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+36>>2]](r7,1,0,0,0,1);r7=HEAP32[r5];HEAP32[r3+5]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+20>>2]](r7,0,0,0,1);FUNCTION_TABLE[HEAP32[HEAP32[r3]+12>>2]](r4);return r2}function __ZN12mgGenSurface9damageAllEv(r1){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+64>>2]](r1,0,0,HEAP32[r1+4>>2],HEAP32[r1+8>>2]);return}function __ZN12mgGenSurface6repairER11mgRectangle(r1,r2){var r3,r4,r5;r3=r1+12|0;if((HEAP32[r3>>2]|0)==0){return}r4=r1+16|0;HEAP32[r2>>2]=HEAP32[r4>>2];r5=r1+20|0;HEAP32[r2+4>>2]=HEAP32[r5>>2];HEAP32[r2+8>>2]=HEAP32[r1+24>>2]-HEAP32[r4>>2]|0;HEAP32[r2+12>>2]=HEAP32[r1+28>>2]-HEAP32[r5>>2]|0;HEAP32[r3>>2]=0;return}function __ZNK12mgGenSurface14getSurfaceSizeERiS0_(r1,r2,r3){HEAP32[r2>>2]=HEAP32[r1+4>>2];HEAP32[r3>>2]=HEAP32[r1+8>>2];return}function __ZN12mgGenSurface14setSurfaceSizeEii(r1,r2,r3){var r4,r5,r6;r4=0;r5=r1+4|0;r6=r1+8|0;do{if((HEAP32[r5>>2]|0)==(r2|0)){if((HEAP32[r6>>2]|0)==(r3|0)){break}else{r4=1206;break}}else{r4=1206}}while(0);if(r4==1206){HEAP32[r5>>2]=r2;HEAP32[r6>>2]=r3}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+64>>2]](r1,0,0,r2,r3);return}function __ZN10mgGenImageD1Ev(r1){var r2,r3;r2=r1|0;HEAP32[r2>>2]=5271348;r3=HEAP32[r1+96>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+116>>2]](r3,r1);HEAP32[r1+100>>2]=0;HEAP32[r2>>2]=5259640;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN10mgGenImageD0Ev(r1){var r2,r3,r4;r2=r1|0;HEAP32[r2>>2]=5271348;r3=HEAP32[r1+96>>2];FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+116>>2]](r3,r1);HEAP32[r1+100>>2]=0;HEAP32[r2>>2]=5259640;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r4=r1;__ZdlPv(r4);return}__ZdlPv(r2);r4=r1;__ZdlPv(r4);return}function __ZN7mgImageD1Ev(r1){var r2;HEAP32[r1>>2]=5259640;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN7mgImageD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5259640;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN9mgGenIconD1Ev(r1){__ZN9mgGenIconD2Ev(r1);return}function __ZN9mgGenIconD0Ev(r1){__ZN9mgGenIconD2Ev(r1);__ZdlPv(r1);return}function __ZN9mgGenIconD2Ev(r1){var r2,r3,r4;r2=r1>>2;r3=(r1|0)>>2;HEAP32[r3]=5258672;r4=HEAP32[r2+46];FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](r4,r1);HEAP32[r2+47]=0;HEAP32[r3]=5259720;HEAP32[r2+23]=5259300;r4=HEAP32[r2+27];if(!((r4|0)==(r1+112|0)|(r4|0)==0)){__ZdlPv(r4)}HEAP32[r3]=5271224;HEAP32[r2+1]=5259300;r3=HEAP32[r2+5];if((r3|0)==(r1+24|0)|(r3|0)==0){return}__ZdlPv(r3);return}function __ZN6mgIconD1Ev(r1){var r2,r3;r2=r1|0;HEAP32[r2>>2]=5259720;HEAP32[r1+92>>2]=5259300;r3=HEAP32[r1+108>>2];if(!((r3|0)==(r1+112|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN6mgIconD0Ev(r1){var r2,r3,r4;r2=r1|0;HEAP32[r2>>2]=5259720;HEAP32[r1+92>>2]=5259300;r3=HEAP32[r1+108>>2];if(!((r3|0)==(r1+112|0)|(r3|0)==0)){__ZdlPv(r3)}HEAP32[r2>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r4=r1;__ZdlPv(r4);return}__ZdlPv(r2);r4=r1;__ZdlPv(r4);return}function __ZN10mgResourceD1Ev(r1){var r2;HEAP32[r1>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN10mgResourceD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN5mgPenD1Ev(r1){var r2;HEAP32[r1>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN5mgPenD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN7mgBrushD1Ev(r1){var r2;HEAP32[r1>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN7mgBrushD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5271224;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN7mgColorC2EPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4;r6=(r1|0)>>2;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];r7=r1+8|0,r8=r7>>2;r9=(r1+16|0)>>2;r10=(r1+24|0)>>2;r11=r7>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10]=HEAP32[tempDoublePtr>>2],HEAP32[r10+1]=HEAP32[tempDoublePtr+4>>2];r11=5250788;r12=r2;while(1){r13=HEAP8[r12];r14=HEAP8[r11];r15=r13<<24>>24;if((r15&128|0)==0){r16=_tolower(r15)&255}else{r16=r13}if(r16<<24>>24>-1){r17=_tolower(r14<<24>>24)&255}else{r17=r14}if(r16<<24>>24!=r17<<24>>24){r18=5250680;r19=r2;break}if(r16<<24>>24==0){r3=1304;break}else{r11=r11+1|0;r12=r12+1|0}}if(r3==1304){r12=r1>>2;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r12+4]=0;HEAP32[r12+5]=0;STACKTOP=r4;return}while(1){r12=HEAP8[r19];r11=HEAP8[r18];r16=r12<<24>>24;if((r16&128|0)==0){r20=_tolower(r16)&255}else{r20=r12}if(r20<<24>>24>-1){r21=_tolower(r11<<24>>24)&255}else{r21=r11}if(r20<<24>>24!=r21<<24>>24){r22=5251916;r23=r2;break}if(r20<<24>>24==0){r3=1311;break}else{r18=r18+1|0;r19=r19+1|0}}if(r3==1311){HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r19=HEAP8[r23];r18=HEAP8[r22];r20=r19<<24>>24;if((r20&128|0)==0){r24=_tolower(r20)&255}else{r24=r19}if(r24<<24>>24>-1){r25=_tolower(r18<<24>>24)&255}else{r25=r18}if(r24<<24>>24!=r25<<24>>24){r26=5249464;r27=r2;break}if(r24<<24>>24==0){r3=1318;break}else{r22=r22+1|0;r23=r23+1|0}}if(r3==1318){HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r23=HEAP8[r27];r22=HEAP8[r26];r24=r23<<24>>24;if((r24&128|0)==0){r28=_tolower(r24)&255}else{r28=r23}if(r28<<24>>24>-1){r29=_tolower(r22<<24>>24)&255}else{r29=r22}if(r28<<24>>24!=r29<<24>>24){r30=5246280;r31=r2;break}if(r28<<24>>24==0){r3=1325;break}else{r26=r26+1|0;r27=r27+1|0}}if(r3==1325){HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r27=HEAP8[r31];r26=HEAP8[r30];r28=r27<<24>>24;if((r28&128|0)==0){r32=_tolower(r28)&255}else{r32=r27}if(r32<<24>>24>-1){r33=_tolower(r26<<24>>24)&255}else{r33=r26}if(r32<<24>>24!=r33<<24>>24){r34=5245324;r35=r2;break}if(r32<<24>>24==0){r3=1332;break}else{r30=r30+1|0;r31=r31+1|0}}if(r3==1332){HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r31=HEAP8[r35];r30=HEAP8[r34];r32=r31<<24>>24;if((r32&128|0)==0){r36=_tolower(r32)&255}else{r36=r31}if(r36<<24>>24>-1){r37=_tolower(r30<<24>>24)&255}else{r37=r30}if(r36<<24>>24!=r37<<24>>24){r38=5244724;r39=r2;break}if(r36<<24>>24==0){r3=1339;break}else{r34=r34+1|0;r35=r35+1|0}}if(r3==1339){HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.75,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r35=HEAP8[r39];r34=HEAP8[r38];r36=r35<<24>>24;if((r36&128|0)==0){r40=_tolower(r36)&255}else{r40=r35}if(r40<<24>>24>-1){r41=_tolower(r34<<24>>24)&255}else{r41=r34}if(r40<<24>>24!=r41<<24>>24){r42=5244148;r43=r2;break}if(r40<<24>>24==0){r3=1346;break}else{r38=r38+1|0;r39=r39+1|0}}if(r3==1346){HEAPF64[tempDoublePtr>>3]=.5,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.5,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.5,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r39=HEAP8[r43];r38=HEAP8[r42];r40=r39<<24>>24;if((r40&128|0)==0){r44=_tolower(r40)&255}else{r44=r39}if(r44<<24>>24>-1){r45=_tolower(r38<<24>>24)&255}else{r45=r38}if(r44<<24>>24!=r45<<24>>24){r46=5257036;r47=r2;break}if(r44<<24>>24==0){r3=1353;break}else{r42=r42+1|0;r43=r43+1|0}}if(r3==1353){HEAPF64[tempDoublePtr>>3]=.5,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.5,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=.5,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r43=HEAP8[r47];r42=HEAP8[r46];r44=r43<<24>>24;if((r44&128|0)==0){r48=_tolower(r44)&255}else{r48=r43}if(r48<<24>>24>-1){r49=_tolower(r42<<24>>24)&255}else{r49=r42}if(r48<<24>>24!=r49<<24>>24){r50=5243096;r51=r2;break}if(r48<<24>>24==0){r3=1360;break}else{r46=r46+1|0;r47=r47+1|0}}if(r3==1360){HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];r47=r7>>2;HEAP32[r47]=0;HEAP32[r47+1]=0;HEAP32[r47+2]=0;HEAP32[r47+3]=0;STACKTOP=r4;return}while(1){r47=HEAP8[r51];r7=HEAP8[r50];r46=r47<<24>>24;if((r46&128|0)==0){r52=_tolower(r46)&255}else{r52=r47}if(r52<<24>>24>-1){r53=_tolower(r7<<24>>24)&255}else{r53=r7}if(r52<<24>>24!=r53<<24>>24){r54=5249572;r55=r2;break}if(r52<<24>>24==0){r3=1367;break}else{r50=r50+1|0;r51=r51+1|0}}if(r3==1367){HEAPF64[tempDoublePtr>>3]=0,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=0,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r51=HEAP8[r55];r50=HEAP8[r54];r52=r51<<24>>24;if((r52&128|0)==0){r56=_tolower(r52)&255}else{r56=r51}if(r56<<24>>24>-1){r57=_tolower(r50<<24>>24)&255}else{r57=r50}if(r56<<24>>24!=r57<<24>>24){r58=5256696;r59=r2;break}if(r56<<24>>24==0){r3=1374;break}else{r54=r54+1|0;r55=r55+1|0}}if(r3==1374){r55=r1>>2;HEAP32[r55]=0;HEAP32[r55+1]=0;HEAP32[r55+2]=0;HEAP32[r55+3]=0;HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r55=HEAP8[r59];r1=HEAP8[r58];r54=r55<<24>>24;if((r54&128|0)==0){r60=_tolower(r54)&255}else{r60=r55}if(r60<<24>>24>-1){r61=_tolower(r1<<24>>24)&255}else{r61=r1}if(r60<<24>>24!=r61<<24>>24){r62=5256072;r63=r2;break}if(r60<<24>>24==0){r3=1381;break}else{r58=r58+1|0;r59=r59+1|0}}if(r3==1381){HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=0,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r59=HEAP8[r63];r58=HEAP8[r62];r60=r59<<24>>24;if((r60&128|0)==0){r64=_tolower(r60)&255}else{r64=r59}if(r64<<24>>24>-1){r65=_tolower(r58<<24>>24)&255}else{r65=r58}if(r64<<24>>24!=r65<<24>>24){r66=5255652;r67=r2;break}if(r64<<24>>24==0){r3=1388;break}else{r62=r62+1|0;r63=r63+1|0}}if(r3==1388){HEAPF64[tempDoublePtr>>3]=1,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=0,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}while(1){r63=HEAP8[r67];r62=HEAP8[r66];r64=r63<<24>>24;if((r64&128|0)==0){r68=_tolower(r64)&255}else{r68=r63}if(r68<<24>>24>-1){r69=_tolower(r62<<24>>24)&255}else{r69=r62}if(r68<<24>>24!=r69<<24>>24){break}if(r68<<24>>24==0){r3=1395;break}else{r66=r66+1|0;r67=r67+1|0}}if(r3==1395){HEAPF64[tempDoublePtr>>3]=0,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}if(HEAP8[r2]<<24>>24==35){r70=1}else{STACKTOP=r4;return}while(1){r71=r2+r70|0;r3=HEAP8[r71];if(r3<<24>>24==0){break}if((_isxdigit(r3<<24>>24)|0)==0){r70=r70+1|0}else{break}}if((_sscanf(r71,5255268,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt))|0)==1){r72=r70}else{STACKTOP=r4;return}while(1){r71=HEAP8[r2+r72|0];if(r71<<24>>24==0){break}if((_isxdigit(r71<<24>>24)|0)==0){break}else{r72=r72+1|0}}r2=HEAP32[r5>>2];if((r72-r70|0)>6){r70=r2>>>16&255;r72=r2>>>8&255;r5=r2&255;r71=(r2>>>24|0)/255;HEAPF64[tempDoublePtr>>3]=r71,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];r71=(r70|0)/255;HEAPF64[tempDoublePtr>>3]=r71,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];r71=(r72|0)/255;HEAPF64[tempDoublePtr>>3]=r71,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];r71=(r5|0)/255;HEAPF64[tempDoublePtr>>3]=r71,HEAP32[r10]=HEAP32[tempDoublePtr>>2],HEAP32[r10+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}else{r71=r2>>>8&255;r5=r2&255;r72=(r2>>>16&255|0)/255;HEAPF64[tempDoublePtr>>3]=r72,HEAP32[r6]=HEAP32[tempDoublePtr>>2],HEAP32[r6+1]=HEAP32[tempDoublePtr+4>>2];r6=(r71|0)/255;HEAPF64[tempDoublePtr>>3]=r6,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];r8=(r5|0)/255;HEAPF64[tempDoublePtr>>3]=r8,HEAP32[r9]=HEAP32[tempDoublePtr>>2],HEAP32[r9+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=1,HEAP32[r10]=HEAP32[tempDoublePtr>>2],HEAP32[r10+1]=HEAP32[tempDoublePtr+4>>2];STACKTOP=r4;return}}function __ZN12mgGenContextD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5270184;r2=r1+8|0;r3=HEAP32[r2>>2];if((r3|0)!=0){__ZdlPv(r3)}HEAP32[r2>>2]=0;__ZdlPv(r1);return}function __ZN12mgGenContextD2Ev(r1){var r2;HEAP32[r1>>2]=5270184;r2=(r1+8|0)>>2;r1=HEAP32[r2];if((r1|0)==0){HEAP32[r2]=0;return}__ZdlPv(r1);HEAP32[r2]=0;return}function __ZN12mgGenContext10resetStateEv(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3;r5=(r1+8|0)>>2;HEAP32[HEAP32[r5]+32>>2]=1;HEAP32[HEAP32[r5]+36>>2]=1;HEAP32[HEAP32[r5]+40>>2]=HEAP32[r2+3];HEAP32[HEAP32[r5]+48>>2]=HEAP32[r2+4];HEAP32[HEAP32[r5]+44>>2]=HEAP32[r2+5];r1=HEAP32[r5];__ZN7mgColorC2EPKc(r4,5250788);r6=r4|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+52|0;HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+8|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+60|0;HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+16|0;r7=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+68|0;HEAPF64[tempDoublePtr>>3]=r7,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=r4+24|0;r4=(HEAP32[tempDoublePtr>>2]=HEAP32[r6>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r6+4>>2],HEAPF64[tempDoublePtr>>3]);r6=r1+76|0;HEAPF64[tempDoublePtr>>3]=r4,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=HEAP32[r5]+16|0;HEAPF64[tempDoublePtr>>3]=0,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];r6=HEAP32[r5]+24|0;HEAPF64[tempDoublePtr>>3]=0,HEAP32[r6>>2]=HEAP32[tempDoublePtr>>2],HEAP32[r6+4>>2]=HEAP32[tempDoublePtr+4>>2];HEAP32[HEAP32[r5]>>2]=0;HEAP32[HEAP32[r5]+4>>2]=0;HEAP32[HEAP32[r5]+8>>2]=32768;HEAP32[HEAP32[r5]+12>>2]=32768;HEAP32[r2+6]=0;HEAP32[r2+7]=0;r5=HEAP32[r2+1];HEAP32[r2+8]=HEAP32[r5+4>>2];HEAP32[r2+9]=HEAP32[r5+8>>2];STACKTOP=r3;return}
function __ZN12mgXMLScanner5parseEiPKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+168|0;r6=r5;r7=r5+84;r8=r1+96|0;r9=(r1+92|0)>>2;r10=r1+88|0;r11=(r1+100|0)>>2;r12=(r1+112|0)>>2;r13=r1>>2;r14=(r1+120|0)>>2;r15=(r1+108|0)>>2;r16=(r1+116|0)>>2;r17=r1+124|0;r18=r1>>2;r19=r1>>2;r20=r1+104|0;r21=r1>>2;r22=r1+272|0;r23=r6|0;r24=r6+4|0;r25=r6+20|0;r26=(r6+16|0)>>2;r27=r6+8|0;r28=r6+12|0;r29=r1;r30=(r1+204|0)>>2;r31=(r1+196|0)>>2;r32=(r1+192|0)>>2;r33=r1+200|0;r34=r1+208|0;r35=r7|0;r36=r7+4|0;r37=r7+20|0;r38=(r7+16|0)>>2;r39=r7+8|0;r40=r7+12|0;r41=0;L4622:while(1){r42=r41;r43=HEAP8[r8];while(1){do{if(r43<<24>>24==0){if((r42|0)>=(r2|0)){break L4622}r44=r42+1|0;r45=HEAP8[r3+r42|0];if(r45<<24>>24==13){r46=13;r47=r44;break}else if(r45<<24>>24==10){HEAP32[r10>>2]=HEAP32[r10>>2]+1|0;HEAP32[r9]=0;r46=10;r47=r44;break}else{HEAP32[r9]=HEAP32[r9]+1|0;r46=r45;r47=r44;break}}else{HEAP8[r8]=0;r46=r43;r47=r42}}while(0);r44=HEAP32[r11];if((r44|0)==1){if(r46<<24>>24==63){r4=3850;break}else if(r46<<24>>24==33){r4=3851;break}else if(r46<<24>>24==47){r4=3852;break}HEAP32[r11]=26;HEAP8[r8]=r46;r42=r47;r43=r46;continue}else if((r44|0)==4){r4=3874;break}else if((r44|0)==5){r4=3879;break}else if((r44|0)==0){r4=3831;break}else if((r44|0)==7){r4=3892;break}else if((r44|0)==6){r4=3882;break}else if((r44|0)==3){r4=3864;break}else if((r44|0)==17){if(r46<<24>>24==62){r4=3946;break}HEAP32[r11]=15;__ZN8mgStringpLEPKc(r20,5255940);HEAP8[r8]=r46;r42=r47;r43=r46;continue}else if((r44|0)==19){r4=3948;break}else if((r44|0)==20){r4=3951;break}else if((r44|0)==21){r4=3954;break}else if((r44|0)==22){r4=3957;break}else if((r44|0)==23){r4=3960;break}else if((r44|0)==8){r4=3902;break}else if((r44|0)==9){r4=3905;break}else if((r44|0)==10){r4=3908;break}else if((r44|0)==11){r4=3911;break}else if((r44|0)==12){r4=3914;break}else if((r44|0)==13){r4=3917;break}else if((r44|0)==14){r4=3920;break}else if((r44|0)==2){r4=3854;break}else if((r44|0)==15){r4=3923;break}else if((r44|0)==16){if(r46<<24>>24==93){r4=3936;break}HEAP32[r11]=15;r45=HEAP32[r15];r48=HEAP32[r12];r49=r48+1|0;if((r45|0)<(r49|0)){r50=HEAP32[r16];r51=r45;while(1){r52=r51+r50|0;if((r52|0)<(r49|0)){r51=r52}else{break}}HEAP32[r15]=r52;r51=r52+1|0;r49=__Znaj((r51|0)>-1?r51:-1);r51=HEAP32[r14];r50=HEAP32[r12];_memcpy(r49,r51,r50+1|0);if((r51|0)==(r17|0)|(r51|0)==0){r53=r50}else{__ZdlPv(r51);r53=HEAP32[r12]}HEAP32[r14]=r49;r54=r53;r55=r49}else{r54=r48;r55=HEAP32[r14]}HEAP32[r12]=r54+1|0;HEAP8[r55+r54|0]=93;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;HEAP8[r8]=r46;r42=r47;r43=r46;continue}else if((r44|0)==24){r4=3963;break}else if((r44|0)==25){r4=3966;break}else if((r44|0)==26){r4=3968;break}else if((r44|0)==27){r4=3981;break}else if((r44|0)==28){r4=3993;break}else if((r44|0)==29){if(r46<<24>>24==62){r4=3998;break}else if(r46<<24>>24==47){r4=4001;break}if((_isspace(r46<<24>>24)|0)!=0){r41=r47;continue L4622}HEAP32[r11]=30;HEAP8[r8]=r46;r42=r47;r43=r46;continue}else if((r44|0)==30){r4=4006;break}else if((r44|0)==31){r4=4020;break}else if((r44|0)==33){r4=4024;break}else if((r44|0)==34){r4=4029;break}else if((r44|0)==35){r4=4041;break}else if((r44|0)==36){r4=4065;break}else{r41=r47;continue L4622}}if(r4==3850){r4=0;HEAP32[r11]=2;r41=r47;continue}else if(r4==3851){r4=0;HEAP32[r11]=4;r41=r47;continue}else if(r4==3874){r4=0;if(r46<<24>>24==45){HEAP32[r11]=5;r41=r47;continue}else if(r46<<24>>24==91){HEAP32[r11]=9;r41=r47;continue}else if(r46<<24>>24==68){HEAP32[r11]=19;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5248160,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3879){r4=0;if(r46<<24>>24==45){HEAP32[r11]=6;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5246020,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3831){r4=0;if(r46<<24>>24==60){r43=HEAP32[r12];if((r43|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r13]+44>>2]](r1,HEAP32[r14],r43);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0}HEAP32[r11]=1;r41=r47;continue}r43=HEAP32[r12];if(r46<<24>>24==38){if((r43|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r13]+44>>2]](r1,HEAP32[r14],r43);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0}HEAP32[r11]=36;r41=r47;continue}if((r43|0)>1024){FUNCTION_TABLE[HEAP32[HEAP32[r13]+44>>2]](r1,HEAP32[r14],r43);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;r56=HEAP32[r12]}else{r56=r43}r43=HEAP32[r15];r42=r56+1|0;if((r43|0)<(r42|0)){r49=HEAP32[r16];r51=r43;while(1){r57=r51+r49|0;if((r57|0)<(r42|0)){r51=r57}else{break}}HEAP32[r15]=r57;r51=r57+1|0;r42=__Znaj((r51|0)>-1?r51:-1);r51=HEAP32[r14];r49=HEAP32[r12];_memcpy(r42,r51,r49+1|0);if((r51|0)==(r17|0)|(r51|0)==0){r58=r49}else{__ZdlPv(r51);r58=HEAP32[r12]}HEAP32[r14]=r42;r59=r58;r60=r42}else{r59=r56;r60=HEAP32[r14]}HEAP32[r12]=r59+1|0;HEAP8[r60+r59|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==3892){r4=0;if(r46<<24>>24==45){HEAP32[r11]=8;r41=r47;continue}r42=HEAP32[r15];r51=HEAP32[r12];r49=r51+1|0;if((r42|0)<(r49|0)){r43=HEAP32[r16];r50=r42;while(1){r61=r50+r43|0;if((r61|0)<(r49|0)){r50=r61}else{break}}HEAP32[r15]=r61;r50=r61+1|0;r49=__Znaj((r50|0)>-1?r50:-1);r50=HEAP32[r14];r43=HEAP32[r12];_memcpy(r49,r50,r43+1|0);if((r50|0)==(r17|0)|(r50|0)==0){r62=r43}else{__ZdlPv(r50);r62=HEAP32[r12]}HEAP32[r14]=r49;r63=r62;r64=r49}else{r63=r51;r64=HEAP32[r14]}HEAP32[r12]=r63+1|0;HEAP8[r64+r63|0]=45;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;HEAP8[r8]=r46;HEAP32[r11]=6;r41=r47;continue}else if(r4==3882){r4=0;if(r46<<24>>24==45){HEAP32[r11]=7;r41=r47;continue}r49=HEAP32[r15];r50=HEAP32[r12];r43=r50+1|0;if((r49|0)<(r43|0)){r42=HEAP32[r16];r45=r49;while(1){r65=r45+r42|0;if((r65|0)<(r43|0)){r45=r65}else{break}}HEAP32[r15]=r65;r45=r65+1|0;r43=__Znaj((r45|0)>-1?r45:-1);r45=HEAP32[r14];r42=HEAP32[r12];_memcpy(r43,r45,r42+1|0);if((r45|0)==(r17|0)|(r45|0)==0){r66=r42}else{__ZdlPv(r45);r66=HEAP32[r12]}HEAP32[r14]=r43;r67=r66;r68=r43}else{r67=r50;r68=HEAP32[r14]}HEAP32[r12]=r67+1|0;HEAP8[r68+r67|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==3864){r4=0;if(r46<<24>>24==62){FUNCTION_TABLE[HEAP32[HEAP32[r18]+32>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=0;r41=r47;continue}r43=HEAP32[r15];r45=HEAP32[r12];r42=r45+1|0;if((r43|0)<(r42|0)){r51=HEAP32[r16];r49=r43;while(1){r69=r49+r51|0;if((r69|0)<(r42|0)){r49=r69}else{break}}HEAP32[r15]=r69;r49=r69+1|0;r42=__Znaj((r49|0)>-1?r49:-1);r49=HEAP32[r14];r51=HEAP32[r12];_memcpy(r42,r49,r51+1|0);if((r49|0)==(r17|0)|(r49|0)==0){r70=r51}else{__ZdlPv(r49);r70=HEAP32[r12]}HEAP32[r14]=r42;r71=r70;r72=r42}else{r71=r45;r72=HEAP32[r14]}HEAP32[r12]=r71+1|0;HEAP8[r72+r71|0]=63;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;HEAP8[r8]=r46;HEAP32[r11]=2;r41=r47;continue}else if(r4==3946){r4=0;FUNCTION_TABLE[HEAP32[HEAP32[r13]+40>>2]](r1,HEAP32[r14],HEAP32[r12]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=0;r41=r47;continue}else if(r4==3948){r4=0;if(r46<<24>>24==79){HEAP32[r11]=20;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5244460,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3951){r4=0;if(r46<<24>>24==67){HEAP32[r11]=21;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243916,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3954){r4=0;if(r46<<24>>24==84){HEAP32[r11]=22;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243916,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3957){r4=0;if(r46<<24>>24==89){HEAP32[r11]=23;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243916,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3960){r4=0;if(r46<<24>>24==80){HEAP32[r11]=24;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243916,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3902){r4=0;if(r46<<24>>24==62){FUNCTION_TABLE[HEAP32[HEAP32[r18]+36>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=0;r41=r47;continue}else{__ZN8mgStringpLEPKc(r20,5244996);HEAP8[r8]=r46;HEAP32[r11]=6;r41=r47;continue}}else if(r4==3905){r4=0;if(r46<<24>>24==67){HEAP32[r11]=10;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5244460,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3908){r4=0;if(r46<<24>>24==68){HEAP32[r11]=11;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243916,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3911){r4=0;if(r46<<24>>24==65){HEAP32[r11]=12;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243332,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3914){r4=0;if(r46<<24>>24==84){HEAP32[r11]=13;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5257624,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3917){r4=0;if(r46<<24>>24==65){HEAP32[r11]=14;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5257096,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3920){r4=0;if(r46<<24>>24==91){HEAP32[r11]=15;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5256364,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3852){r4=0;HEAP32[r11]=27;r41=r47;continue}else if(r4==3854){r4=0;if(r46<<24>>24==63){HEAP32[r11]=3;r41=r47;continue}r42=HEAP32[r15];r49=HEAP32[r12];r51=r49+1|0;if((r42|0)<(r51|0)){r50=HEAP32[r16];r43=r42;while(1){r73=r43+r50|0;if((r73|0)<(r51|0)){r43=r73}else{break}}HEAP32[r15]=r73;r43=r73+1|0;r51=__Znaj((r43|0)>-1?r43:-1);r43=HEAP32[r14];r50=HEAP32[r12];_memcpy(r51,r43,r50+1|0);if((r43|0)==(r17|0)|(r43|0)==0){r74=r50}else{__ZdlPv(r43);r74=HEAP32[r12]}HEAP32[r14]=r51;r75=r74;r76=r51}else{r75=r49;r76=HEAP32[r14]}HEAP32[r12]=r75+1|0;HEAP8[r76+r75|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==3923){r4=0;if(r46<<24>>24==93){HEAP32[r11]=16;r41=r47;continue}r51=HEAP32[r12];if((r51|0)>1024){FUNCTION_TABLE[HEAP32[HEAP32[r13]+40>>2]](r1,HEAP32[r14],r51);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;r77=HEAP32[r12]}else{r77=r51}r51=HEAP32[r15];r43=r77+1|0;if((r51|0)<(r43|0)){r50=HEAP32[r16];r45=r51;while(1){r78=r45+r50|0;if((r78|0)<(r43|0)){r45=r78}else{break}}HEAP32[r15]=r78;r45=r78+1|0;r43=__Znaj((r45|0)>-1?r45:-1);r45=HEAP32[r14];r50=HEAP32[r12];_memcpy(r43,r45,r50+1|0);if((r45|0)==(r17|0)|(r45|0)==0){r79=r50}else{__ZdlPv(r45);r79=HEAP32[r12]}HEAP32[r14]=r43;r80=r79;r81=r43}else{r80=r77;r81=HEAP32[r14]}HEAP32[r12]=r80+1|0;HEAP8[r81+r80|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==3936){r4=0;HEAP32[r11]=17;r41=r47;continue}else if(r4==3963){r4=0;if(r46<<24>>24==69){HEAP32[r11]=25;r41=r47;continue}else{FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5252948,5250428,5243916,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r46<<24>>24,tempInt));r41=r47;continue}}else if(r4==3966){r4=0;if(r46<<24>>24!=62){r41=r47;continue}HEAP32[r11]=0;r41=r47;continue}else if(r4==3968){r4=0;if(r46<<24>>24==62){FUNCTION_TABLE[HEAP32[HEAP32[r18]+48>>2]](r1,HEAP32[r14]);FUNCTION_TABLE[HEAP32[HEAP32[r21]+68>>2]](r1);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=0;r41=r47;continue}else if(r46<<24>>24==47){FUNCTION_TABLE[HEAP32[HEAP32[r18]+48>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;FUNCTION_TABLE[HEAP32[HEAP32[r21]+68>>2]](r1);FUNCTION_TABLE[HEAP32[HEAP32[r21]+52>>2]](r1);HEAP32[r11]=28;r41=r47;continue}else{if((_isspace(r46<<24>>24)|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r18]+48>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=29;r41=r47;continue}r43=HEAP32[r15];r45=HEAP32[r12];r50=r45+1|0;if((r43|0)<(r50|0)){r49=HEAP32[r16];r51=r43;while(1){r82=r51+r49|0;if((r82|0)<(r50|0)){r51=r82}else{break}}HEAP32[r15]=r82;r51=r82+1|0;r50=__Znaj((r51|0)>-1?r51:-1);r51=HEAP32[r14];r49=HEAP32[r12];_memcpy(r50,r51,r49+1|0);if((r51|0)==(r17|0)|(r51|0)==0){r83=r49}else{__ZdlPv(r51);r83=HEAP32[r12]}HEAP32[r14]=r50;r84=r83;r85=r50}else{r84=r45;r85=HEAP32[r14]}HEAP32[r12]=r84+1|0;HEAP8[r85+r84|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}}else if(r4==3981){r4=0;if(r46<<24>>24==62){FUNCTION_TABLE[HEAP32[HEAP32[r18]+56>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=0;r41=r47;continue}if((_isspace(r46<<24>>24)|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r18]+56>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=28;r41=r47;continue}r50=HEAP32[r15];r51=HEAP32[r12];r49=r51+1|0;if((r50|0)<(r49|0)){r43=HEAP32[r16];r42=r50;while(1){r86=r42+r43|0;if((r86|0)<(r49|0)){r42=r86}else{break}}HEAP32[r15]=r86;r42=r86+1|0;r49=__Znaj((r42|0)>-1?r42:-1);r42=HEAP32[r14];r43=HEAP32[r12];_memcpy(r49,r42,r43+1|0);if((r42|0)==(r17|0)|(r42|0)==0){r87=r43}else{__ZdlPv(r42);r87=HEAP32[r12]}HEAP32[r14]=r49;r88=r87;r89=r49}else{r88=r51;r89=HEAP32[r14]}HEAP32[r12]=r88+1|0;HEAP8[r89+r88|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==3993){r4=0;if(r46<<24>>24==62){HEAP32[r11]=0;r41=r47;continue}if((_isspace(r46<<24>>24)|0)!=0){r41=r47;continue}FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5255436,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r41=r47;continue}else if(r4==3998){r4=0;if((HEAP32[r12]|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r18]+48>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0}FUNCTION_TABLE[HEAP32[HEAP32[r21]+68>>2]](r1);HEAP32[r11]=0;r41=r47;continue}else if(r4==4001){r4=0;if((HEAP32[r12]|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r18]+48>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0}FUNCTION_TABLE[HEAP32[HEAP32[r21]+68>>2]](r1);FUNCTION_TABLE[HEAP32[HEAP32[r21]+52>>2]](r1);HEAP32[r11]=28;r41=r47;continue}else if(r4==4006){r4=0;r49=r46<<24>>24;do{if((_isalnum(r49)|0)==0){if(r46<<24>>24==95|r46<<24>>24==46|r46<<24>>24==45){break}else if(r46<<24>>24==61){FUNCTION_TABLE[HEAP32[HEAP32[r18]+60>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=33;r41=r47;continue L4622}if((_isspace(r49)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5255044,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r41=r47;continue L4622}else{FUNCTION_TABLE[HEAP32[HEAP32[r18]+60>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=31;r41=r47;continue L4622}}}while(0);r49=HEAP32[r15];r51=HEAP32[r12];r42=r51+1|0;if((r49|0)<(r42|0)){r43=HEAP32[r16];r45=r49;while(1){r90=r45+r43|0;if((r90|0)<(r42|0)){r45=r90}else{break}}HEAP32[r15]=r90;r45=r90+1|0;r42=__Znaj((r45|0)>-1?r45:-1);r45=HEAP32[r14];r43=HEAP32[r12];_memcpy(r42,r45,r43+1|0);if((r45|0)==(r17|0)|(r45|0)==0){r91=r43}else{__ZdlPv(r45);r91=HEAP32[r12]}HEAP32[r14]=r42;r92=r91;r93=r42}else{r92=r51;r93=HEAP32[r14]}HEAP32[r12]=r92+1|0;HEAP8[r93+r92|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==4020){r4=0;if(r46<<24>>24==61){HEAP32[r11]=33;r41=r47;continue}if((_isspace(r46<<24>>24)|0)!=0){r41=r47;continue}FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5255044,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r41=r47;continue}else if(r4==4024){r4=0;if(r46<<24>>24==34){HEAP32[r11]=34;HEAP8[r22]=34;r41=r47;continue}else if(r46<<24>>24==39){HEAP32[r11]=34;HEAP8[r22]=39;r41=r47;continue}else{if((_isspace(r46<<24>>24)|0)!=0){r41=r47;continue}FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5254812,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r41=r47;continue}}else if(r4==4029){r4=0;if(r46<<24>>24==HEAP8[r22]<<24>>24){FUNCTION_TABLE[HEAP32[HEAP32[r18]+64>>2]](r1,HEAP32[r14]);HEAP32[r12]=0;HEAP8[HEAP32[r14]]=0;HEAP32[r11]=29;r41=r47;continue}if(r46<<24>>24==38){HEAP32[r11]=35;r41=r47;continue}r42=HEAP32[r15];r45=HEAP32[r12];r43=r45+1|0;if((r42|0)<(r43|0)){r49=HEAP32[r16];r50=r42;while(1){r94=r50+r49|0;if((r94|0)<(r43|0)){r50=r94}else{break}}HEAP32[r15]=r94;r50=r94+1|0;r43=__Znaj((r50|0)>-1?r50:-1);r50=HEAP32[r14];r49=HEAP32[r12];_memcpy(r43,r50,r49+1|0);if((r50|0)==(r17|0)|(r50|0)==0){r95=r49}else{__ZdlPv(r50);r95=HEAP32[r12]}HEAP32[r14]=r43;r96=r95;r97=r43}else{r96=r45;r97=HEAP32[r14]}HEAP32[r12]=r96+1|0;HEAP8[r97+r96|0]=r46;HEAP8[HEAP32[r14]+HEAP32[r12]|0]=0;r41=r47;continue}else if(r4==4041){r4=0;if(r46<<24>>24!=59){if((_isspace(r46<<24>>24)|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5254472,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r41=r47;continue}r43=HEAP32[r32];r50=HEAP32[r31];r49=r50+1|0;if((r43|0)<(r49|0)){r51=HEAP32[r33>>2];r42=r43;while(1){r98=r42+r51|0;if((r98|0)<(r49|0)){r42=r98}else{break}}HEAP32[r32]=r98;r42=r98+1|0;r49=__Znaj((r42|0)>-1?r42:-1);r42=HEAP32[r30];r51=HEAP32[r31];_memcpy(r49,r42,r51+1|0);if((r42|0)==(r34|0)|(r42|0)==0){r99=r51}else{__ZdlPv(r42);r99=HEAP32[r31]}HEAP32[r30]=r49;r100=r99;r101=r49}else{r100=r50;r101=HEAP32[r30]}HEAP32[r31]=r100+1|0;HEAP8[r101+r100|0]=r46;HEAP8[HEAP32[r30]+HEAP32[r31]|0]=0;r41=r47;continue}HEAP32[r23>>2]=5259300;HEAP32[r24>>2]=63;HEAP32[r26]=r25;HEAP32[r27>>2]=0;HEAP8[r25]=0;HEAP32[r28>>2]=128;FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+72>>2]](r1,HEAP32[r30],r6);r49=HEAP32[r26];r42=HEAP32[r27>>2];r51=HEAP32[r15];r45=HEAP32[r12];r43=r45+r42|0;if((r51|0)<(r43|0)){r102=HEAP32[r16];r103=r51;while(1){r104=r103+r102|0;if((r104|0)<(r43|0)){r103=r104}else{break}}HEAP32[r15]=r104;r103=r104+1|0;r43=__Znaj((r103|0)>-1?r103:-1);r103=HEAP32[r14];r102=HEAP32[r12];_memcpy(r43,r103,r102+1|0);if((r103|0)==(r17|0)|(r103|0)==0){r105=r102}else{__ZdlPv(r103);r105=HEAP32[r12]}HEAP32[r14]=r43;r106=r105;r107=r43}else{r106=r45;r107=HEAP32[r14]}_memcpy(r107+r106|0,r49,r42);r43=HEAP32[r12]+r42|0;HEAP32[r12]=r43;HEAP8[HEAP32[r14]+r43|0]=0;HEAP32[r31]=0;HEAP8[HEAP32[r30]]=0;HEAP32[r11]=34;HEAP32[r23>>2]=5259300;r43=HEAP32[r26];if((r43|0)==(r25|0)|(r43|0)==0){r41=r47;continue}__ZdlPv(r43);r41=r47;continue}else if(r4==4065){r4=0;if(r46<<24>>24!=59){if((_isspace(r46<<24>>24)|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](r1,5254472,5254808,5254808,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));r41=r47;continue}r43=HEAP32[r32];r103=HEAP32[r31];r102=r103+1|0;if((r43|0)<(r102|0)){r50=HEAP32[r33>>2];r51=r43;while(1){r108=r51+r50|0;if((r108|0)<(r102|0)){r51=r108}else{break}}HEAP32[r32]=r108;r51=r108+1|0;r102=__Znaj((r51|0)>-1?r51:-1);r51=HEAP32[r30];r50=HEAP32[r31];_memcpy(r102,r51,r50+1|0);if((r51|0)==(r34|0)|(r51|0)==0){r109=r50}else{__ZdlPv(r51);r109=HEAP32[r31]}HEAP32[r30]=r102;r110=r109;r111=r102}else{r110=r103;r111=HEAP32[r30]}HEAP32[r31]=r110+1|0;HEAP8[r111+r110|0]=r46;HEAP8[HEAP32[r30]+HEAP32[r31]|0]=0;r41=r47;continue}HEAP32[r35>>2]=5259300;HEAP32[r36>>2]=63;HEAP32[r38]=r37;HEAP32[r39>>2]=0;HEAP8[r37]=0;HEAP32[r40>>2]=128;FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+72>>2]](r1,HEAP32[r30],r7);r102=HEAP32[r38];r51=HEAP32[r39>>2];r50=HEAP32[r15];r42=HEAP32[r12];r49=r42+r51|0;if((r50|0)<(r49|0)){r45=HEAP32[r16];r43=r50;while(1){r112=r43+r45|0;if((r112|0)<(r49|0)){r43=r112}else{break}}HEAP32[r15]=r112;r43=r112+1|0;r49=__Znaj((r43|0)>-1?r43:-1);r43=HEAP32[r14];r45=HEAP32[r12];_memcpy(r49,r43,r45+1|0);if((r43|0)==(r17|0)|(r43|0)==0){r113=r45}else{__ZdlPv(r43);r113=HEAP32[r12]}HEAP32[r14]=r49;r114=r113;r115=r49}else{r114=r42;r115=HEAP32[r14]}_memcpy(r115+r114|0,r102,r51);r49=HEAP32[r12]+r51|0;HEAP32[r12]=r49;HEAP8[HEAP32[r14]+r49|0]=0;HEAP32[r31]=0;HEAP8[HEAP32[r30]]=0;HEAP32[r11]=0;HEAP32[r35>>2]=5259300;r49=HEAP32[r38];if((r49|0)==(r37|0)|(r49|0)==0){r41=r47;continue}__ZdlPv(r49);r41=r47;continue}}STACKTOP=r5;return}function __ZN12mgXMLScanner21processingInstructionEPKc(r1,r2){return}function __ZN12mgXMLScanner7commentEPKc(r1,r2){return}function __ZN12mgXMLScanner8endAttrsEv(r1){return}function __ZN12mgXMLScanner9entityRefEPKcR8mgString(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r1=0;r4=5252040;r5=r2;while(1){r6=HEAP8[r5];r7=HEAP8[r4];r8=r6<<24>>24;if((r8&128|0)==0){r9=_tolower(r8)&255}else{r9=r6}if(r9<<24>>24>-1){r10=_tolower(r7<<24>>24)&255}else{r10=r7}if(r9<<24>>24!=r10<<24>>24){r11=5251544;r12=r2;break}if(r9<<24>>24==0){r1=4101;break}else{r4=r4+1|0;r5=r5+1|0}}if(r1==4101){__ZN8mgStringaSEPKc(r3,5251808);return}while(1){r5=HEAP8[r12];r4=HEAP8[r11];r9=r5<<24>>24;if((r9&128|0)==0){r13=_tolower(r9)&255}else{r13=r5}if(r13<<24>>24>-1){r14=_tolower(r4<<24>>24)&255}else{r14=r4}if(r13<<24>>24!=r14<<24>>24){r15=5251100;r16=r2;break}if(r13<<24>>24==0){r1=4108;break}else{r11=r11+1|0;r12=r12+1|0}}if(r1==4108){__ZN8mgStringaSEPKc(r3,5251332);return}while(1){r12=HEAP8[r16];r11=HEAP8[r15];r13=r12<<24>>24;if((r13&128|0)==0){r17=_tolower(r13)&255}else{r17=r12}if(r17<<24>>24>-1){r18=_tolower(r11<<24>>24)&255}else{r18=r11}if(r17<<24>>24!=r18<<24>>24){r1=4119;break}if(r17<<24>>24==0){break}else{r15=r15+1|0;r16=r16+1|0}}if(r1==4119){return}__ZN8mgStringaSEPKc(r3,5250868);return}function __ZN12mgXMLScanner12CDATAContentEPKci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r1=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r1;r5=r4|0;HEAP32[r5>>2]=5259300;r6=(r4+4|0)>>2;HEAP32[r6]=63;r7=r4+20|0;r8=(r4+16|0)>>2;HEAP32[r8]=r7;r9=(r4+8|0)>>2;HEAP32[r9]=0;HEAP8[r7]=0;r10=(r4+12|0)>>2;HEAP32[r10]=128;if((r3|0)>0){r4=0;r11=63;r12=0;while(1){r13=HEAP8[r2+r4|0];if(r13<<24>>24==10){r14=r12+2|0;if((r11|0)<(r14|0)){r15=HEAP32[r10];r16=r11;while(1){r17=r16+r15|0;if((r17|0)<(r14|0)){r16=r17}else{break}}HEAP32[r6]=r17;r16=r17+1|0;r14=__Znaj((r16|0)>-1?r16:-1);r16=HEAP32[r8];r15=HEAP32[r9];_memcpy(r14,r16,r15+1|0);if((r16|0)==(r7|0)|(r16|0)==0){r18=r15}else{__ZdlPv(r16);r18=HEAP32[r9]}HEAP32[r8]=r14;r19=r18;r20=r14}else{r19=r12;r20=HEAP32[r8]}r14=r20+r19|0;tempBigInt=28252;HEAP8[r14]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r14+1|0]=tempBigInt&255;r14=HEAP32[r9]+2|0;HEAP32[r9]=r14;HEAP8[HEAP32[r8]+r14|0]=0}else{r14=r12+1|0;if((r11|0)<(r14|0)){r16=HEAP32[r10];r15=r11;while(1){r21=r15+r16|0;if((r21|0)<(r14|0)){r15=r21}else{break}}HEAP32[r6]=r21;r15=r21+1|0;r14=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r8];r16=HEAP32[r9];_memcpy(r14,r15,r16+1|0);if((r15|0)==(r7|0)|(r15|0)==0){r22=r16}else{__ZdlPv(r15);r22=HEAP32[r9]}HEAP32[r8]=r14;r23=r22;r24=r14}else{r23=r12;r24=HEAP32[r8]}HEAP32[r9]=r23+1|0;HEAP8[r24+r23|0]=r13;HEAP8[HEAP32[r8]+HEAP32[r9]|0]=0}r14=r4+1|0;if((r14|0)>=(r3|0)){break}r4=r14;r11=HEAP32[r6];r12=HEAP32[r9]}r25=HEAP32[r8]}else{r25=r7}__Z7mgDebugPKcz(5250220,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r25,tempInt));HEAP32[r5>>2]=5259300;r5=HEAP32[r8];if((r5|0)==(r7|0)|(r5|0)==0){STACKTOP=r1;return}__ZdlPv(r5);STACKTOP=r1;return}function __ZN12mgXMLScanner7contentEPKci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r1=STACKTOP;STACKTOP=STACKTOP+84|0;r4=r1;r5=r4|0;HEAP32[r5>>2]=5259300;r6=(r4+4|0)>>2;HEAP32[r6]=63;r7=r4+20|0;r8=(r4+16|0)>>2;HEAP32[r8]=r7;r9=(r4+8|0)>>2;HEAP32[r9]=0;HEAP8[r7]=0;r10=(r4+12|0)>>2;HEAP32[r10]=128;if((r3|0)>0){r4=0;r11=63;r12=0;while(1){r13=HEAP8[r2+r4|0];if(r13<<24>>24==10){r14=r12+2|0;if((r11|0)<(r14|0)){r15=HEAP32[r10];r16=r11;while(1){r17=r16+r15|0;if((r17|0)<(r14|0)){r16=r17}else{break}}HEAP32[r6]=r17;r16=r17+1|0;r14=__Znaj((r16|0)>-1?r16:-1);r16=HEAP32[r8];r15=HEAP32[r9];_memcpy(r14,r16,r15+1|0);if((r16|0)==(r7|0)|(r16|0)==0){r18=r15}else{__ZdlPv(r16);r18=HEAP32[r9]}HEAP32[r8]=r14;r19=r18;r20=r14}else{r19=r12;r20=HEAP32[r8]}r14=r20+r19|0;tempBigInt=28252;HEAP8[r14]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r14+1|0]=tempBigInt&255;r14=HEAP32[r9]+2|0;HEAP32[r9]=r14;HEAP8[HEAP32[r8]+r14|0]=0}else{r14=r12+1|0;if((r11|0)<(r14|0)){r16=HEAP32[r10];r15=r11;while(1){r21=r15+r16|0;if((r21|0)<(r14|0)){r15=r21}else{break}}HEAP32[r6]=r21;r15=r21+1|0;r14=__Znaj((r15|0)>-1?r15:-1);r15=HEAP32[r8];r16=HEAP32[r9];_memcpy(r14,r15,r16+1|0);if((r15|0)==(r7|0)|(r15|0)==0){r22=r16}else{__ZdlPv(r15);r22=HEAP32[r9]}HEAP32[r8]=r14;r23=r22;r24=r14}else{r23=r12;r24=HEAP32[r8]}HEAP32[r9]=r23+1|0;HEAP8[r24+r23|0]=r13;HEAP8[HEAP32[r8]+HEAP32[r9]|0]=0}r14=r4+1|0;if((r14|0)>=(r3|0)){break}r4=r14;r11=HEAP32[r6];r12=HEAP32[r9]}r25=HEAP32[r8]}else{r25=r7}__Z7mgDebugPKcz(5249932,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r25,tempInt));HEAP32[r5>>2]=5259300;r5=HEAP32[r8];if((r5|0)==(r7|0)|(r5|0)==0){STACKTOP=r1;return}__ZdlPv(r5);STACKTOP=r1;return}function __ZN12mgXMLScanner7tagOpenEPKc(r1,r2){r1=STACKTOP;__Z7mgDebugPKcz(5249708,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));STACKTOP=r1;return}function __ZN12mgXMLScanner12tagNoContentEv(r1){r1=STACKTOP;__Z7mgDebugPKcz(5249504,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt));STACKTOP=r1;return}function __ZN12mgXMLScanner8tagCloseEPKc(r1,r2){r1=STACKTOP;__Z7mgDebugPKcz(5249316,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));STACKTOP=r1;return}function __ZN12mgXMLScanner8attrNameEPKc(r1,r2){r1=STACKTOP;__Z7mgDebugPKcz(5249128,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));STACKTOP=r1;return}function __ZN12mgXMLScanner9attrValueEPKc(r1,r2){r1=STACKTOP;__Z7mgDebugPKcz(5248880,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r2,tempInt));STACKTOP=r1;return}function __ZN8mgXMLTag7tagAttrEP11mgXMLParserPKcS3_(r1,r2,r3,r4){r4=STACKTOP;FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2|0,5253588,5256548,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[r1+20>>2],HEAP32[tempInt+4>>2]=r3,tempInt));STACKTOP=r4;return}function __ZN8mgXMLTag8tagChildEP11mgXMLParserPS_(r1,r2,r3){var r4,r5;r4=STACKTOP;r5=HEAP32[r3+20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2|0,5250416,5248140,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[r1+20>>2],HEAP32[tempInt+4>>2]=r5,tempInt));if((r3|0)==0){STACKTOP=r4;return}FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+4>>2]](r3);STACKTOP=r4;return}function __ZN8mgXMLTag10getBooleanEP11mgXMLParserPKcS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r1=0;r5=STACKTOP;r6=5246012;r7=r4;while(1){r8=HEAP8[r7];r9=HEAP8[r6];r10=r8<<24>>24;if((r10&128|0)==0){r11=_tolower(r10)&255}else{r11=r8}if(r11<<24>>24>-1){r12=_tolower(r9<<24>>24)&255}else{r12=r9}if(r11<<24>>24!=r12<<24>>24){r13=5244988;r14=r4;break}if(r11<<24>>24==0){r15=1;r1=4215;break}else{r6=r6+1|0;r7=r7+1|0}}if(r1==4215){STACKTOP=r5;return r15}while(1){r7=HEAP8[r14];r6=HEAP8[r13];r11=r7<<24>>24;if((r11&128|0)==0){r16=_tolower(r11)&255}else{r16=r7}if(r16<<24>>24>-1){r17=_tolower(r6<<24>>24)&255}else{r17=r6}if(r16<<24>>24!=r17<<24>>24){break}if(r16<<24>>24==0){r15=0;r1=4216;break}else{r13=r13+1|0;r14=r14+1|0}}if(r1==4216){STACKTOP=r5;return r15}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2|0,5244444,5243904,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=r4,tempInt));r15=0;STACKTOP=r5;return r15}function __ZN8mgXMLTag10getIntegerEP11mgXMLParserPKcS3_(r1,r2,r3,r4){var r5,r6;r1=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r1;if((_sscanf(r4,5243328,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt))|0)==1){r6=HEAP32[r5>>2];STACKTOP=r1;return r6}else{FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2|0,5257608,5243904,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=r4,tempInt));r6=0;STACKTOP=r1;return r6}}function __ZN8mgXMLTag9getDoubleEP11mgXMLParserPKcS3_(r1,r2,r3,r4){var r5,r6;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r1;if((_sscanf(r4,5257092,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r5,tempInt))|0)==1){r6=(HEAP32[tempDoublePtr>>2]=HEAP32[r5>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r5+4>>2],HEAPF64[tempDoublePtr>>3]);STACKTOP=r1;return r6}else{FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2|0,5256348,5243904,5252940,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r3,HEAP32[tempInt+4>>2]=r4,tempInt));r6=0;STACKTOP=r1;return r6}}function __ZNK12mgXMLScanner9exceptionEPKcz(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;STACKTOP=STACKTOP+88|0;r5=r4;r6=r4+4,r4=r6>>2;HEAP32[r5>>2]=r3;HEAP32[r4]=5259300;HEAP32[r4+1]=63;r3=r6+20|0;r7=r6+16|0;HEAP32[r7>>2]=r3;HEAP32[r4+2]=0;HEAP8[r3]=0;HEAP32[r4+3]=128;__ZN8mgString7formatVEPKcPc(r6,r2,HEAP32[r5>>2]);r5=___cxa_allocate_exception(4);r2=__Znwj(84);r6=HEAP32[r1+88>>2];r4=HEAP32[r1+92>>2];r3=HEAP32[r7>>2];__ZN11mgExceptionC2EPKcz(r2,5254104,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r1+20>>2],HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r4,HEAP32[tempInt+12>>2]=r3,tempInt));HEAP32[r5>>2]=r2;___cxa_throw(r5,5275288,0)}function __ZNK12mgXMLScanner8errorMsgEPKcS1_S1_z(r1,r2,r3,r4,r5){var r6,r7;r6=STACKTOP;STACKTOP=STACKTOP+4|0;r7=r6;HEAP32[r7>>2]=r5;r5=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_Pc(r5,r2,r3,r4,HEAP32[r7>>2]);r7=HEAP32[r1+88>>2];r4=HEAP32[r1+92>>2];__ZN10mgErrorMsg7addVarsEPKcS1_z(r5,5253812,5253400,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=HEAP32[r1+20>>2],HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r4,tempInt));r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=r5;___cxa_throw(r4,5275304,0)}function __ZN12mgXMLScanner9parseFileEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r1+4|0;__ZN8mgStringaSEPKc(r4,r2);__Z15mgOSFixFileNameR8mgString(r4);r4=r1+20|0;r2=_fopen(HEAP32[r4>>2],5253228);if((r2|0)==0){r5=___cxa_allocate_exception(4);r6=__Znwj(256);__ZN10mgErrorMsgC2EPKcS1_S1_z(r6,5252796,5252536,5252284,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r4>>2],tempInt));HEAP32[r5>>2]=r6;___cxa_throw(r5,5275304,0)}r5=__Znaj(4096);r6=_fread(r5,1,4096,r2);L5158:do{if((r6|0)!=0){r4=r1;r7=r6;while(1){FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+12>>2]](r1,r7,r5);r8=_fread(r5,1,4096,r2);if((r8|0)==0){break L5158}else{r7=r8}}}}while(0);if((r5|0)==0){r9=_fclose(r2);r10=r1;r11=HEAP32[r10>>2];r12=r11+16|0;r13=HEAP32[r12>>2];FUNCTION_TABLE[r13](r1);STACKTOP=r3;return}__ZdlPv(r5);r9=_fclose(r2);r10=r1;r11=HEAP32[r10>>2];r12=r11+16|0;r13=HEAP32[r12>>2];FUNCTION_TABLE[r13](r1);STACKTOP=r3;return}function __ZN10__cxxabiv116__shim_type_infoD2Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop1Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop2Ev(r1){return}function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){return(r1|0)==(r2|0)}function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((HEAP32[r2+8>>2]|0)!=(r1|0)){return}r1=r2+16|0;r5=HEAP32[r1>>2];if((r5|0)==0){HEAP32[r1>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r5|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function __ZN8mgXMLTag11getFileNameEP11mgXMLParserPKcS3_R8mgString(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r3=0;r1=STACKTOP;STACKTOP=STACKTOP+252|0;r6=r1;r7=r1+84;r8=r1+168;r9=r6|0;HEAP32[r9>>2]=5259300;r10=r6+4|0;HEAP32[r10>>2]=63;r11=r6+20|0;r12=(r6+16|0)>>2;HEAP32[r12]=r11;r13=(r6+8|0)>>2;HEAP32[r13]=0;HEAP8[r11]=0;HEAP32[r6+12>>2]=128;if((r4|0)==0){r14=0;r15=r11}else{r6=_strlen(r4);if((r6|0)>63){r16=63;while(1){r17=r16+128|0;if((r17|0)<(r6|0)){r16=r17}else{break}}HEAP32[r10>>2]=r17;r17=r16+129|0;r16=__Znaj((r17|0)>-1?r17:-1);r17=HEAP32[r12];r10=HEAP32[r13];_memcpy(r16,r17,r10+1|0);if((r17|0)==(r11|0)|(r17|0)==0){r18=r10}else{__ZdlPv(r17);r18=HEAP32[r13]}HEAP32[r12]=r16;r19=r18;r20=r16}else{r19=0;r20=r11}_memcpy(r20+r19|0,r4,r6);r4=HEAP32[r13]+r6|0;HEAP32[r13]=r4;HEAP8[HEAP32[r12]+r4|0]=0;r14=HEAP32[r13];r15=HEAP32[r12]}r4=r14-1|0;r6=0;while(1){if((r6|0)>(r4|0)){r3=4326;break}r21=r6+1|0;if(HEAP8[r15+r6|0]<<24>>24==59){r3=4287;break}else{r6=r21}}do{if(r3==4287){if((r6|0)==-1){r3=4326;break}r4=r7|0;HEAP32[r4>>2]=5259300;r19=r7+4|0;HEAP32[r19>>2]=63;r20=r7+20|0;r16=(r7+16|0)>>2;HEAP32[r16]=r20;r18=(r7+8|0)>>2;HEAP32[r7+12>>2]=128;HEAP32[r18]=0;HEAP8[r20]=0;if((r6|0)<0|(r6|0)>(r14|0)){r22=r14}else{if((r6|0)>63){r17=63;while(1){r23=r17+128|0;if((r23|0)<(r6|0)){r17=r23}else{break}}HEAP32[r19>>2]=r23;r10=r17+129|0;r24=__Znaj((r10|0)>-1?r10:-1);r10=HEAP32[r16];r25=HEAP32[r18];_memcpy(r24,r10,r25+1|0);if((r10|0)==(r20|0)|(r10|0)==0){r26=r25}else{__ZdlPv(r10);r26=HEAP32[r18]}HEAP32[r16]=r24;r27=r26;r28=r24}else{r27=0;r28=r20}_memcpy(r28+r27|0,r15,r6);r24=HEAP32[r18]+r6|0;HEAP32[r18]=r24;HEAP8[HEAP32[r16]+r24|0]=0;r22=HEAP32[r13]}r24=(r22|0)<(r21|0)?r22:r21;if((r24|0)>=1){r10=HEAP32[r12];_memmove(r10,r10+r24|0,r22-r24|0,1,0);r10=HEAP32[r13]-r24|0;HEAP32[r13]=r10;HEAP8[HEAP32[r12]+r10|0]=0}r10=r2+20|0;__Z23mgOSResolveRelativeNamePKcS0_R8mgString(HEAP32[r10>>2],HEAP32[r16],r5);r24=(r5+4|0)>>2;r25=HEAP32[r24];r29=(r5+8|0)>>2;r30=HEAP32[r29];r31=r30+1|0;if((r25|0)<(r31|0)){r32=HEAP32[r5+12>>2];r33=r25;while(1){r34=r33+r32|0;if((r34|0)<(r31|0)){r33=r34}else{break}}HEAP32[r24]=r34;r33=r34+1|0;r31=__Znaj((r33|0)>-1?r33:-1);r33=r5+16|0;r32=HEAP32[r33>>2];r18=HEAP32[r29];_memcpy(r31,r32,r18+1|0);if((r32|0)==(r5+20|0)|(r32|0)==0){r35=r18}else{__ZdlPv(r32);r35=HEAP32[r29]}HEAP32[r33>>2]=r31;r36=r35;r37=r31}else{r36=r30;r37=HEAP32[r5+16>>2]}HEAP32[r29]=r36+1|0;r31=(r5+16|0)>>2;HEAP8[r37+r36|0]=59;HEAP8[HEAP32[r31]+HEAP32[r29]|0]=0;r33=r8|0;HEAP32[r33>>2]=5259300;HEAP32[r8+4>>2]=63;r32=r8+20|0;r18=(r8+16|0)>>2;HEAP32[r18]=r32;r17=r8+8|0;HEAP32[r17>>2]=0;HEAP8[r32]=0;HEAP32[r8+12>>2]=128;__Z23mgOSResolveRelativeNamePKcS0_R8mgString(HEAP32[r10>>2],HEAP32[r12],r8);r19=HEAP32[r18];r25=HEAP32[r17>>2];r17=HEAP32[r24];r38=HEAP32[r29];r39=r38+r25|0;if((r17|0)<(r39|0)){r40=HEAP32[r5+12>>2];r41=r17;while(1){r42=r41+r40|0;if((r42|0)<(r39|0)){r41=r42}else{break}}HEAP32[r24]=r42;r41=r42+1|0;r39=__Znaj((r41|0)>-1?r41:-1);r41=HEAP32[r31];r40=HEAP32[r29];_memcpy(r39,r41,r40+1|0);if((r41|0)==(r5+20|0)|(r41|0)==0){r43=r40}else{__ZdlPv(r41);r43=HEAP32[r29]}HEAP32[r31]=r39;r44=r43;r45=r39}else{r44=r38;r45=HEAP32[r31]}_memcpy(r45+r44|0,r19,r25);r39=HEAP32[r29]+r25|0;HEAP32[r29]=r39;HEAP8[HEAP32[r31]+r39|0]=0;HEAP32[r33>>2]=5259300;r39=HEAP32[r18];if(!((r39|0)==(r32|0)|(r39|0)==0)){__ZdlPv(r39)}HEAP32[r4>>2]=5259300;r39=HEAP32[r16];if((r39|0)==(r20|0)|(r39|0)==0){break}__ZdlPv(r39);break}}while(0);if(r3==4326){__Z23mgOSResolveRelativeNamePKcS0_R8mgString(HEAP32[r2+20>>2],r15,r5)}HEAP32[r9>>2]=5259300;r9=HEAP32[r12];if((r9|0)==(r11|0)|(r9|0)==0){STACKTOP=r1;return}__ZdlPv(r9);STACKTOP=r1;return}function __ZN8mgXMLTagD1Ev(r1){var r2;HEAP32[r1>>2]=5259240;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){return}__ZdlPv(r2);return}function __ZN8mgXMLTagD0Ev(r1){var r2,r3;HEAP32[r1>>2]=5259240;HEAP32[r1+4>>2]=5259300;r2=HEAP32[r1+20>>2];if((r2|0)==(r1+24|0)|(r2|0)==0){r3=r1;__ZdlPv(r3);return}__ZdlPv(r2);r3=r1;__ZdlPv(r3);return}function __ZN10emscripten8internal21registerStandardTypesEv(){if(HEAP8[5258320]){return}HEAP8[5258320]=1;__embind_register_void(5275252,5253520);__embind_register_bool(5275260,5256540,1,0);__embind_register_integer(__ZTIc,5252920);__embind_register_integer(__ZTIa,5250400);__embind_register_integer(__ZTIh,5248100);__embind_register_integer(__ZTIs,5246004);__embind_register_integer(__ZTIt,5244972);__embind_register_integer(__ZTIi,5244440);__embind_register_integer(__ZTIj,5243888);__embind_register_integer(__ZTIl,5243320);__embind_register_integer(__ZTIm,5257592);__embind_register_float(__ZTIf,5257084);__embind_register_float(__ZTId,5256340);__embind_register_cstring(5275328,5255928);__embind_register_emval(5275352,5255420);return}function __ZN10__cxxabiv123__fundamental_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv117__class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv120__si_class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv119__pointer_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r5=r4,r6=r5>>2;do{if((r1|0)==(r2|0)){r7=1}else{if((r2|0)==0){r7=0;break}r8=___dynamic_cast(r2,5275432,5275420,-1);r9=r8;if((r8|0)==0){r7=0;break}_memset(r5,0,56);HEAP32[r6]=r9;HEAP32[r6+2]=r1;HEAP32[r6+3]=-1;HEAP32[r6+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r9,r5,HEAP32[r3>>2],1);if((HEAP32[r6+6]|0)!=1){r7=0;break}HEAP32[r3>>2]=HEAP32[r6+4];r7=1}}while(0);STACKTOP=r4;return r7}function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((r1|0)!=(HEAP32[r2+8>>2]|0)){r5=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5,r2,r3,r4);return}r5=r2+16|0;r1=HEAP32[r5>>2];if((r1|0)==0){HEAP32[r5>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;if((r1|0)==(HEAP32[r2+8>>2]|0)){r6=r2+16|0;r7=HEAP32[r6>>2];if((r7|0)==0){HEAP32[r6>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r7|0)!=(r3|0)){r7=r2+36|0;HEAP32[r7>>2]=HEAP32[r7>>2]+1|0;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r7=r2+24|0;if((HEAP32[r7>>2]|0)!=2){return}HEAP32[r7>>2]=r4;return}r7=HEAP32[r1+12>>2];r6=(r7<<3)+r1+16|0;r8=HEAP32[r1+20>>2];r9=r8>>8;if((r8&1|0)==0){r10=r9}else{r10=HEAP32[HEAP32[r3>>2]+r9>>2]}r9=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r10|0,(r8&2|0)!=0?r4:2);if((r7|0)<=1){return}r7=r2+54|0;r8=r3;r10=r1+24|0;while(1){r1=HEAP32[r10+4>>2];r9=r1>>8;if((r1&1|0)==0){r11=r9}else{r11=HEAP32[HEAP32[r8>>2]+r9>>2]}r9=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r11|0,(r1&2|0)!=0?r4:2);if((HEAP8[r7]&1)<<24>>24!=0){r5=4396;break}r1=r10+8|0;if(r1>>>0<r6>>>0){r10=r1}else{r5=4397;break}}if(r5==4396){return}else if(r5==4397){return}}function __ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r5=r4,r6=r5>>2;HEAP32[r3>>2]=HEAP32[HEAP32[r3>>2]>>2];r7=r2|0;do{if((r1|0)==(r7|0)|(r7|0)==5275444){r8=1}else{if((r2|0)==0){r8=0;break}r9=___dynamic_cast(r2,5275432,5275396,-1);if((r9|0)==0){r8=0;break}if((HEAP32[r9+8>>2]&(HEAP32[r1+8>>2]^-1)|0)!=0){r8=0;break}r10=HEAP32[r1+12>>2];r11=r9+12|0;if((r10|0)==(HEAP32[r11>>2]|0)|(r10|0)==5275252){r8=1;break}if((r10|0)==0){r8=0;break}r9=___dynamic_cast(r10,5275432,5275420,-1);if((r9|0)==0){r8=0;break}r10=HEAP32[r11>>2];if((r10|0)==0){r8=0;break}r11=___dynamic_cast(r10,5275432,5275420,-1);r10=r11;if((r11|0)==0){r8=0;break}_memset(r5,0,56);HEAP32[r6]=r10;HEAP32[r6+2]=r9;HEAP32[r6+3]=-1;HEAP32[r6+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r10,r5,HEAP32[r3>>2],1);if((HEAP32[r6+6]|0)!=1){r8=0;break}HEAP32[r3>>2]=HEAP32[r6+4];r8=1}}while(0);STACKTOP=r4;return r8}function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6;r5=r2>>2;if((HEAP32[r5+2]|0)==(r1|0)){if((HEAP32[r5+1]|0)!=(r3|0)){return}r6=r2+28|0;if((HEAP32[r6>>2]|0)==1){return}HEAP32[r6>>2]=r4;return}if((HEAP32[r5]|0)!=(r1|0)){return}do{if((HEAP32[r5+4]|0)!=(r3|0)){r1=r2+20|0;if((HEAP32[r1>>2]|0)==(r3|0)){break}HEAP32[r5+8]=r4;HEAP32[r1>>2]=r3;r1=r2+40|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1|0;do{if((HEAP32[r5+9]|0)==1){if((HEAP32[r5+6]|0)!=2){break}HEAP8[r2+54|0]=1}}while(0);HEAP32[r5+11]=4;return}}while(0);if((r4|0)!=1){return}HEAP32[r5+8]=1;return}function ___dynamic_cast(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+56|0;r6=r5,r7=r6>>2;r8=HEAP32[r1>>2];r9=r1+HEAP32[r8-8>>2]|0;r10=HEAP32[r8-4>>2];r8=r10;HEAP32[r7]=r3;HEAP32[r7+1]=r1;HEAP32[r7+2]=r2;HEAP32[r7+3]=r4;r4=r6+16|0;r2=r6+20|0;r1=r6+24|0;r11=r6+28|0;r12=r6+32|0;r13=r6+40|0;_memset(r4,0,39);if((r10|0)==(r3|0)){HEAP32[r7+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+20>>2]](r8,r6,r9,r9,1,0);STACKTOP=r5;return(HEAP32[r1>>2]|0)==1?r9:0}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r8,r6,r9,1,0);r9=HEAP32[r7+9];do{if((r9|0)==0){if((HEAP32[r13>>2]|0)!=1){r14=0;break}if((HEAP32[r11>>2]|0)!=1){r14=0;break}r14=(HEAP32[r12>>2]|0)==1?HEAP32[r2>>2]:0}else if((r9|0)==1){if((HEAP32[r1>>2]|0)!=1){if((HEAP32[r13>>2]|0)!=0){r14=0;break}if((HEAP32[r11>>2]|0)!=1){r14=0;break}if((HEAP32[r12>>2]|0)!=1){r14=0;break}}r14=HEAP32[r4>>2]}else{r14=0}}while(0);STACKTOP=r5;return r14}function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r2>>2;r7=r1>>2;r8=0;r9=r1|0;if((r9|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r10=r2+28|0;if((HEAP32[r10>>2]|0)==1){return}HEAP32[r10>>2]=r4;return}if((r9|0)==(HEAP32[r6]|0)){do{if((HEAP32[r6+4]|0)!=(r3|0)){r9=r2+20|0;if((HEAP32[r9>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r10=(r2+44|0)>>2;if((HEAP32[r10]|0)==4){return}r11=HEAP32[r7+3];r12=(r11<<3)+r1+16|0;L5404:do{if((r11|0)>0){r13=r2+52|0;r14=r2+53|0;r15=r2+54|0;r16=r1+8|0;r17=r2+24|0;r18=r3;r19=0;r20=r1+16|0;r21=0;L5406:while(1){HEAP8[r13]=0;HEAP8[r14]=0;r22=HEAP32[r20+4>>2];r23=r22>>8;if((r22&1|0)==0){r24=r23}else{r24=HEAP32[HEAP32[r18>>2]+r23>>2]}r23=HEAP32[r20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+20>>2]](r23,r2,r3,r3+r24|0,2-(r22>>>1&1)|0,r5);if((HEAP8[r15]&1)<<24>>24!=0){r25=r21;r26=r19;break}do{if((HEAP8[r14]&1)<<24>>24==0){r27=r21;r28=r19}else{if((HEAP8[r13]&1)<<24>>24==0){if((HEAP32[r16>>2]&1|0)==0){r25=1;r26=r19;break L5406}else{r27=1;r28=r19;break}}if((HEAP32[r17>>2]|0)==1){break L5404}if((HEAP32[r16>>2]&2|0)==0){break L5404}else{r27=1;r28=1}}}while(0);r22=r20+8|0;if(r22>>>0<r12>>>0){r19=r28;r20=r22;r21=r27}else{r25=r27;r26=r28;break}}if((r26&1)<<24>>24==0){r29=r25;r8=4465;break}else{r30=r25;r8=4468;break}}else{r29=0;r8=4465}}while(0);do{if(r8==4465){HEAP32[r9>>2]=r3;r12=r2+40|0;HEAP32[r12>>2]=HEAP32[r12>>2]+1|0;if((HEAP32[r6+9]|0)!=1){r30=r29;r8=4468;break}if((HEAP32[r6+6]|0)!=2){r30=r29;r8=4468;break}HEAP8[r2+54|0]=1;r30=r29;r8=4468;break}}while(0);do{if(r8==4468){if((r30&1)<<24>>24!=0){break}HEAP32[r10]=4;return}}while(0);HEAP32[r10]=3;return}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}r6=HEAP32[r7+3];r30=(r6<<3)+r1+16|0;r29=HEAP32[r7+5];r25=r29>>8;if((r29&1|0)==0){r31=r25}else{r31=HEAP32[HEAP32[r3>>2]+r25>>2]}r25=HEAP32[r7+4];FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r25,r2,r3+r31|0,(r29&2|0)!=0?r4:2,r5);r29=r1+24|0;if((r6|0)<=1){return}r6=HEAP32[r7+2];do{if((r6&2|0)==0){r7=(r2+36|0)>>2;if((HEAP32[r7]|0)==1){break}if((r6&1|0)==0){r1=r2+54|0;r31=r3;r25=r29;while(1){if((HEAP8[r1]&1)<<24>>24!=0){r8=4510;break}if((HEAP32[r7]|0)==1){r8=4511;break}r26=HEAP32[r25+4>>2];r28=r26>>8;if((r26&1|0)==0){r32=r28}else{r32=HEAP32[HEAP32[r31>>2]+r28>>2]}r28=HEAP32[r25>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r32|0,(r26&2|0)!=0?r4:2,r5);r26=r25+8|0;if(r26>>>0<r30>>>0){r25=r26}else{r8=4512;break}}if(r8==4510){return}else if(r8==4511){return}else if(r8==4512){return}}r25=r2+24|0;r31=r2+54|0;r1=r3;r10=r29;while(1){if((HEAP8[r31]&1)<<24>>24!=0){r8=4507;break}if((HEAP32[r7]|0)==1){if((HEAP32[r25>>2]|0)==1){r8=4508;break}}r26=HEAP32[r10+4>>2];r28=r26>>8;if((r26&1|0)==0){r33=r28}else{r33=HEAP32[HEAP32[r1>>2]+r28>>2]}r28=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r33|0,(r26&2|0)!=0?r4:2,r5);r26=r10+8|0;if(r26>>>0<r30>>>0){r10=r26}else{r8=4509;break}}if(r8==4507){return}else if(r8==4508){return}else if(r8==4509){return}}}while(0);r33=r2+54|0;r32=r3;r6=r29;while(1){if((HEAP8[r33]&1)<<24>>24!=0){r8=4505;break}r29=HEAP32[r6+4>>2];r10=r29>>8;if((r29&1|0)==0){r34=r10}else{r34=HEAP32[HEAP32[r32>>2]+r10>>2]}r10=HEAP32[r6>>2];FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r10,r2,r3+r34|0,(r29&2|0)!=0?r4:2,r5);r29=r6+8|0;if(r29>>>0<r30>>>0){r6=r29}else{r8=4506;break}}if(r8==4505){return}else if(r8==4506){return}}function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2>>2;r7=0;r8=r1|0;if((r8|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r9=r2+28|0;if((HEAP32[r9>>2]|0)==1){return}HEAP32[r9>>2]=r4;return}if((r8|0)!=(HEAP32[r6]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r8,r2,r3,r4,r5);return}do{if((HEAP32[r6+4]|0)!=(r3|0)){r8=r2+20|0;if((HEAP32[r8>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r9=(r2+44|0)>>2;if((HEAP32[r9]|0)==4){return}r10=r2+52|0;HEAP8[r10]=0;r11=r2+53|0;HEAP8[r11]=0;r12=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+20>>2]](r12,r2,r3,r3,1,r5);do{if((HEAP8[r11]&1)<<24>>24==0){r13=0;r7=4525}else{if((HEAP8[r10]&1)<<24>>24==0){r13=1;r7=4525;break}else{break}}}while(0);L5505:do{if(r7==4525){HEAP32[r8>>2]=r3;r10=r2+40|0;HEAP32[r10>>2]=HEAP32[r10>>2]+1|0;do{if((HEAP32[r6+9]|0)==1){if((HEAP32[r6+6]|0)!=2){r7=4528;break}HEAP8[r2+54|0]=1;if(r13){break L5505}else{break}}else{r7=4528}}while(0);if(r7==4528){if(r13){break}}HEAP32[r9]=4;return}}while(0);HEAP32[r9]=3;return}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=r2+52|0;r9=HEAP8[r8]&1;r10=r2+53|0;r11=HEAP8[r10]&1;r12=HEAP32[r1+12>>2];r13=(r12<<3)+r1+16|0;HEAP8[r8]=0;HEAP8[r10]=0;r14=HEAP32[r1+20>>2];r15=r14>>8;if((r14&1|0)==0){r16=r15}else{r16=HEAP32[HEAP32[r4>>2]+r15>>2]}r15=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r15,r2,r3,r4+r16|0,(r14&2|0)!=0?r5:2,r6);L5527:do{if((r12|0)>1){r14=r2+24|0;r16=r1+8|0;r15=r2+54|0;r17=r4;r18=r1+24|0;while(1){if((HEAP8[r15]&1)<<24>>24!=0){break L5527}do{if((HEAP8[r8]&1)<<24>>24==0){if((HEAP8[r10]&1)<<24>>24==0){break}if((HEAP32[r16>>2]&1|0)==0){break L5527}}else{if((HEAP32[r14>>2]|0)==1){break L5527}if((HEAP32[r16>>2]&2|0)==0){break L5527}}}while(0);HEAP8[r8]=0;HEAP8[r10]=0;r19=HEAP32[r18+4>>2];r20=r19>>8;if((r19&1|0)==0){r21=r20}else{r21=HEAP32[HEAP32[r17>>2]+r20>>2]}r20=HEAP32[r18>>2];FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+20>>2]](r20,r2,r3,r4+r21|0,(r19&2|0)!=0?r5:2,r6);r19=r18+8|0;if(r19>>>0<r13>>>0){r18=r19}else{break L5527}}}}while(0);HEAP8[r8]=r9;HEAP8[r10]=r11;return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r11=HEAP32[r4>>2];if((r11|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r11|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r11=HEAP32[r3>>2];if((r11|0)==2){HEAP32[r3>>2]=r5;r22=r5}else{r22=r11}if(!((HEAP32[r7+12]|0)==1&(r22|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7;r6=r2>>2;if((HEAP32[r6+2]|0)!=(r1|0)){return}HEAP8[r2+53|0]=1;if((HEAP32[r6+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r1=HEAP32[r4>>2];if((r1|0)==0){HEAP32[r4>>2]=r3;HEAP32[r6+6]=r5;HEAP32[r6+9]=1;if(!((HEAP32[r6+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r1=HEAP32[r3>>2];if((r1|0)==2){HEAP32[r3>>2]=r5;r7=r5}else{r7=r1}if(!((HEAP32[r6+12]|0)==1&(r7|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+20>>2]](r8,r2,r3,r4,r5,r6);return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r6=HEAP32[r4>>2];if((r6|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r6|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r6=HEAP32[r3>>2];if((r6|0)==2){HEAP32[r3>>2]=r5;r9=r5}else{r9=r6}if(!((HEAP32[r7+12]|0)==1&(r9|0)==1)){return}HEAP8[r2+54|0]=1;return}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[1314458];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+5257872|0;r10=(r8+2<<2)+5257872|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[1314458]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[1314462]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[1314460]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+5257872|0;r13=(r17+2<<2)+5257872|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[1314458]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[1314462]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[1314460];if((r12|0)!=0){r18=HEAP32[1314463];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+5257872|0;r11=HEAP32[1314458];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[1314458]=r11|r8;r20=r6;r21=(r12+2<<2)+5257872|0}else{r4=(r12+2<<2)+5257872|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[1314462]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[1314460]=r13;HEAP32[1314463]=r5;r14=r9;return r14}r12=HEAP32[1314459];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+5258136>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[1314462];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L56:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L56}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L78:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+5258136|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[1314459]=HEAP32[1314459]&(1<<HEAP32[r6>>2]^-1);break L78}else{if(r5>>>0<HEAP32[1314462]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L78}}}while(0);if(r23>>>0<HEAP32[1314462]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[1314460];if((r6|0)!=0){r5=HEAP32[1314463];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+5257872|0;r12=HEAP32[1314458];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[1314458]=r12|r7;r27=r18;r28=(r6+2<<2)+5257872|0}else{r9=(r6+2<<2)+5257872|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[1314462]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[1314460]=r11;HEAP32[1314463]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[1314459];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+5258136>>2];L126:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L126}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L126}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+5258136>>2]}else{r38=r34}L141:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L141}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[1314460]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[1314462];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L154:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L154}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L176:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+5258136|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[1314459]=HEAP32[1314459]&(1<<HEAP32[r13>>2]^-1);break L176}else{if(r17>>>0<HEAP32[1314462]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L176}}}while(0);if(r42>>>0<HEAP32[1314462]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+5257872|0;r9=HEAP32[1314458];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[1314458]=r9|r6;r46=r5;r47=(r17+2<<2)+5257872|0}else{r13=(r17+2<<2)+5257872|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[1314462]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+5258136|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[1314459];r30=1<<r48;if((r5&r30|0)==0){HEAP32[1314459]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=151;break}else{r30=r30<<1;r5=r6}}if(r2==151){if(r50>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[1314462];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[1314460];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[1314463];if(r50>>>0>15){r49=r39;HEAP32[1314463]=r49+r15|0;HEAP32[1314460]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[1314460]=0;HEAP32[1314463]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[1314461];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[1314461]=r50;r39=HEAP32[1314464];r40=r39;HEAP32[1314464]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[1310720]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[1310722]=r39;HEAP32[1310721]=r39;HEAP32[1310723]=-1;HEAP32[1310724]=2097152;HEAP32[1310725]=0;HEAP32[1314569]=0;HEAP32[1310720]=_time(0)&-16^1431655768;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[1310722];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[1314568];do{if((r46|0)!=0){r47=HEAP32[1314566];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L268:do{if((HEAP32[1314569]&4|0)==0){r46=HEAP32[1314464];L270:do{if((r46|0)==0){r2=181}else{r41=r46;r47=5258280;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=181;break L270}else{r47=r42}}if((r47|0)==0){r2=181;break}r41=r49-HEAP32[1314461]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=190;break}}while(0);do{if(r2==181){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[1310721];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[1314566];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[1314568];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=190;break}}while(0);L290:do{if(r2==190){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=201;break L268}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[1310722];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L290}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=201;break L268}}}while(0);HEAP32[1314569]=HEAP32[1314569]|4;r64=r53;r2=198;break}else{r64=0;r2=198}}while(0);do{if(r2==198){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=201;break}}}while(0);do{if(r2==201){r64=HEAP32[1314566]+r59|0;HEAP32[1314566]=r64;if(r64>>>0>HEAP32[1314567]>>>0){HEAP32[1314567]=r64}r64=HEAP32[1314464],r50=r64>>2;L310:do{if((r64|0)==0){r55=HEAP32[1314462];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[1314462]=r61}HEAP32[1314570]=r61;HEAP32[1314571]=r59;HEAP32[1314573]=0;HEAP32[1314467]=HEAP32[1310720];HEAP32[1314466]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+5257872|0;HEAP32[(r63+3<<2)+5257872>>2]=r56;HEAP32[(r63+2<<2)+5257872>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[1314464]=r61+r65|0;HEAP32[1314461]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[1314465]=HEAP32[1310724]}else{r55=5258280,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=213;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==213){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[1314464];r63=HEAP32[1314461]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[1314464]=r53+r69|0;HEAP32[1314461]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[1314465]=HEAP32[1310724];break L310}}while(0);if(r61>>>0<HEAP32[1314462]>>>0){HEAP32[1314462]=r61}r56=r61+r59|0;r53=5258280;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=223;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==223){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[1314464]|0)){r54=HEAP32[1314461]+r39|0;HEAP32[1314461]=r54;HEAP32[1314464]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[1314463]|0)){r54=HEAP32[1314460]+r39|0;HEAP32[1314460]=r54;HEAP32[1314463]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L355:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+5257872|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[1314462]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[1314458]=HEAP32[1314458]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[1314462]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L376:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L376}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[1314462]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+5258136|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[1314459]=HEAP32[1314459]&(1<<HEAP32[r46>>2]^-1);break L355}else{if(r47>>>0<HEAP32[1314462]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L355}}}while(0);if(r75>>>0<HEAP32[1314462]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+5257872|0;r46=HEAP32[1314458];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[1314458]=r46|r47;r81=r58;r82=(r51+2<<2)+5257872|0}else{r54=(r51+2<<2)+5257872|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[1314462]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+5258136|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[1314459];r49=1<<r83;if((r58&r49|0)==0){HEAP32[1314459]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=296;break}else{r49=r49<<1;r58=r47}}if(r2==296){if(r85>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[1314462];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=5258280,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[1314464]=r61+r90|0;HEAP32[1314461]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[1314465]=HEAP32[1310724];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[1314570];HEAP32[r57+1]=HEAP32[1314571];HEAP32[r57+2]=HEAP32[1314572];HEAP32[r57+3]=HEAP32[1314573];HEAP32[1314570]=r61;HEAP32[1314571]=r59;HEAP32[1314573]=0;HEAP32[1314572]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L474:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L474}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+5257872|0;r56=HEAP32[1314458];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[1314458]=r56|r47;r91=r63;r92=(r39+2<<2)+5257872|0}else{r57=(r39+2<<2)+5257872|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[1314462]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+5258136|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[1314459];r49=1<<r93;if((r63&r49|0)==0){HEAP32[1314459]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=331;break}else{r49=r49<<1;r63=r47}}if(r2==331){if(r95>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[1314462];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[1314461];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[1314461]=r64;r50=HEAP32[1314464];r55=r50;HEAP32[1314464]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);HEAP32[___errno_location()>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[1314462];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L527:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[1314463]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[1314460]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+5257872|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[1314458]=HEAP32[1314458]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L561:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L561}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+5258136|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[1314459]=HEAP32[1314459]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L527}else{if(r19>>>0<HEAP32[1314462]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L527}}}while(0);if(r31>>>0<HEAP32[1314462]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[1314464]|0)){r6=HEAP32[1314461]+r22|0;HEAP32[1314461]=r6;HEAP32[1314464]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[1314463]|0)){HEAP32[1314463]=0;HEAP32[1314460]=0}if(r6>>>0<=HEAP32[1314465]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[1314463]|0)){r6=HEAP32[1314460]+r22|0;HEAP32[1314460]=r6;HEAP32[1314463]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L632:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+5257872|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[1314462]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[1314458]=HEAP32[1314458]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[1314462]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L653:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L653}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[1314462]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+5258136|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[1314459]=HEAP32[1314459]&(1<<HEAP32[r7>>2]^-1);break L632}else{if(r4>>>0<HEAP32[1314462]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L632}}}while(0);if(r36>>>0<HEAP32[1314462]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[1314463]|0)){r40=r6;break}HEAP32[1314460]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+5257872|0;r5=HEAP32[1314458];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[1314458]=r5|r36;r41=r32;r42=(r31+2<<2)+5257872|0}else{r22=(r31+2<<2)+5257872|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[1314462]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+5258136|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[1314459];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[1314459]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=510;break}else{r5=r5<<1;r42=r36}}if(r3==510){if(r45>>>0<HEAP32[1314462]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[1314462];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[1314466]-1|0;HEAP32[1314466]=r21;if((r21|0)==0){r46=5258288}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[1314466]=-1;return}function __ZNKSt9bad_alloc4whatEv(r1){return 5250384}function __ZdlPv(r1){if((r1|0)==0){return}_free(r1);return}function __ZNSt9bad_allocD0Ev(r1){__ZdlPv(r1);return}function __ZNSt9bad_allocD2Ev(r1){return}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[1310720]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[1310722]=r2;HEAP32[1310721]=r2;HEAP32[1310723]=-1;HEAP32[1310724]=2097152;HEAP32[1310725]=0;HEAP32[1314569]=0;HEAP32[1310720]=_time(0)&-16^1431655768;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[1314464];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[1314461];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[1310722];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=5258280,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[1314566]=HEAP32[1314566]-r8|0;r10=HEAP32[1314464];r13=HEAP32[1314461]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[1314464]=r8+r15|0;HEAP32[1314461]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[1314465]=HEAP32[1310724];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[1314461]>>>0<=HEAP32[1314465]>>>0){r3=0;r4=r3&1;return r4}HEAP32[1314465]=-1;r3=0;r4=r3&1;return r4}function __Znwj(r1){var r2,r3,r4;r2=0;r3=(r1|0)==0?1:r1;while(1){r4=_malloc(r3);if((r4|0)!=0){r2=596;break}r1=(tempValue=HEAP32[1319406],HEAP32[1319406]=tempValue,tempValue);if((r1|0)==0){break}FUNCTION_TABLE[r1]()}if(r2==596){return r4}r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=5258332;___cxa_throw(r4,5275276,232)}function __Znaj(r1){return __Znwj(r1)}
// EMSCRIPTEN_END_FUNCS
Module["_main"] = _main;
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
/*global Module*/
/*global _malloc, _free, _memcpy*/
/*global FUNCTION_TABLE, HEAP32*/
/*global Pointer_stringify, writeStringToMemory*/
/*global __emval_register, _emval_handle_array, __emval_decref*/
function createNamedFunction(name, body) {
    /*jshint evil:true*/
    return new Function(
        "body",
        "return function " + name + "() {\n" +
        "    return body.apply(this, arguments);\n" +
        "};\n"
    )(body);
}
function _embind_repr(v) {
    var t = typeof v;
    if (t === 'object' || t === 'array' || t === 'function') {
        return v.toString();
    } else {
        return '' + v;
    }
}
var typeRegistry = {};
function validateType(type, name) {
    if (!type) {
        throw new BindingError('type "' + name + '" must have a positive integer typeid pointer');
    }
    if (undefined !== typeRegistry[type]) {
        throw new BindingError('cannot register type "' + name + '" twice');
    }
}
function __embind_register_void(voidType, name) {
    name = Pointer_stringify(name);
    validateType(voidType, name);
    typeRegistry[voidType] = {
        name: name,
        fromWireType: function() {
            return undefined;
        }
    };
}
function __embind_register_bool(boolType, name, trueValue, falseValue) {
    name = Pointer_stringify(name);
    validateType(boolType, name);
    typeRegistry[boolType] = {
        name: name,
        toWireType: function(destructors, o) {
            return o ? trueValue : falseValue;
        },
        fromWireType: function(wt) {
            return wt === trueValue;
        },
    };
}
function __embind_register_integer(primitiveType, name) {
    name = Pointer_stringify(name);
    validateType(primitiveType, name);
    typeRegistry[primitiveType] = {
        name: name,
        toWireType: function(destructors, value) {
            if (typeof value !== "number") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + name);
            }
            return value | 0;
        },
        fromWireType: function(value) {
            return value;
        }
    };
}
function __embind_register_float(primitiveType, name) {
    name = Pointer_stringify(name);
    validateType(primitiveType, name);
    typeRegistry[primitiveType] = {
        name: name,
        toWireType: function(destructors, value) {
            if (typeof value !== "number") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + name);
            }
            return value;
        },
        fromWireType: function(value) {
            return value;
        }
    };
}
function __embind_register_cstring(stringType, name) {
    name = Pointer_stringify(name);
    validateType(stringType, name);
    typeRegistry[stringType] = {
        name: name,
        toWireType: function(destructors, value) {
            var ptr = _malloc(value.length + 1);
            writeStringToMemory(value, ptr);
            destructors.push(_free);
            destructors.push(ptr);
            return ptr;
        },
        fromWireType: function(value) {
            var rv = Pointer_stringify(value);
            _free(value);
            return rv;
        }
    };
}
function __embind_register_emval(emvalType, name) {
    name = Pointer_stringify(name);
    validateType(emvalType, name);
    typeRegistry[emvalType] = {
        name: name,
        toWireType: function(destructors, value) {
            return __emval_register(value);
        },
        fromWireType: function(handle) {
            var rv = _emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv;
        }
    };
}
var BindingError = Error;
/** @expose */
Module.BindingError = BindingError;
function typeName(typeID) {
    // could use our carnal knowledge of RTTI but for now just return the pointer...
    return typeID;
}
function requireRegisteredType(type, humanName) {
    var impl = typeRegistry[type];
    if (undefined === impl) {
        throw new BindingError(humanName + " has unknown type: " + typeName(type));
    }
    return impl;
}
function requireArgumentTypes(argCount, argTypes, name) {
    var argTypeImpls = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var argType = HEAP32[(argTypes >> 2) + i];
        argTypeImpls[i] = requireRegisteredType(argType, name + " parameter " + i);
    }
    return argTypeImpls;
}
function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    }
}
function __embind_register_function(name, returnType, argCount, argTypes, invoker, fn) {
    name = Pointer_stringify(name);
    returnType = requireRegisteredType(returnType, "Function " + name + " return value");
    invoker = FUNCTION_TABLE[invoker];
    argTypes = requireArgumentTypes(argCount, argTypes, name);
    Module[name] = function() {
        if (arguments.length !== argCount) {
            throw new BindingError('emscripten binding function ' + name + ' called with ' + arguments.length + ' arguments, expected ' + argCount);
        }
        var destructors = [];
        var args = new Array(argCount + 1);
        args[0] = fn;
        for (var i = 0; i < argCount; ++i) {
            args[i + 1] = argTypes[i].toWireType(destructors, arguments[i]);
        }
        var rv = returnType.fromWireType(invoker.apply(null, args));
        runDestructors(destructors);
        return rv;
    };
}
function __embind_register_tuple(tupleType, name, constructor, destructor) {
    name = Pointer_stringify(name);
    constructor = FUNCTION_TABLE[constructor];
    destructor = FUNCTION_TABLE[destructor];
    var elements = [];
    typeRegistry[tupleType] = {
        name: name,
        elements: elements,
        fromWireType: function(ptr) {
            var len = elements.length;
            var rv = new Array(len);
            for (var i = 0; i < len; ++i) {
                rv[i] = elements[i].read(ptr);
            }
            destructor(ptr);
            return rv;
        },
        toWireType: function(destructors, o) {
            var len = elements.length;
            if (len !== o.length) {
                throw new TypeError("Incorrect number of tuple elements");
            }
            var ptr = constructor();
            for (var i = 0; i < len; ++i) {
                elements[i].write(ptr, o[i]);
            }
            destructors.push(destructor);
            destructors.push(ptr);
            return ptr;
        }
    };
}
function copyMemberPointer(memberPointer, memberPointerSize) {
    var copy = _malloc(memberPointerSize);
    if (!copy) {
        throw new Error('Failed to allocate member pointer copy');
    }
    _memcpy(copy, memberPointer, memberPointerSize);
    return copy;
}
function __embind_register_tuple_element(
    tupleType,
    elementType,
    getter,
    setter,
    memberPointerSize,
    memberPointer
) {
    tupleType = requireRegisteredType(tupleType, 'tuple');
    elementType = requireRegisteredType(elementType, "element " + tupleType.name + "[" + tupleType.elements.length + "]");
    getter = FUNCTION_TABLE[getter];
    setter = FUNCTION_TABLE[setter];
    memberPointer = copyMemberPointer(memberPointer, memberPointerSize);
    tupleType.elements.push({
        read: function(ptr) {
            return elementType.fromWireType(getter(ptr, memberPointer));
        },
        write: function(ptr, o) {
            var destructors = [];
            setter(ptr, memberPointer, elementType.toWireType(destructors, o));
            runDestructors(destructors);
        }
    });
}
function __embind_register_tuple_element_accessor(
    tupleType,
    elementType,
    staticGetter,
    getterSize,
    getter,
    staticSetter,
    setterSize,
    setter
) {
    tupleType = requireRegisteredType(tupleType, 'tuple');
    elementType = requireRegisteredType(elementType, "element " + tupleType.name + "[" + tupleType.elements.length + "]");
    staticGetter = FUNCTION_TABLE[staticGetter];
    getter = copyMemberPointer(getter, getterSize);
    staticSetter = FUNCTION_TABLE[staticSetter];
    setter = copyMemberPointer(setter, setterSize);
    tupleType.elements.push({
        read: function(ptr) {
            return elementType.fromWireType(staticGetter(ptr, HEAP32[getter >> 2]));
        },
        write: function(ptr, o) {
            var destructors = [];
            staticSetter(
                ptr,
                HEAP32[setter >> 2],
                elementType.toWireType(destructors, o));
            runDestructors(destructors);
        }
    });
}
function __embind_register_struct(
    structType,
    name,
    constructor,
    destructor
) {
    name = Pointer_stringify(name);
    constructor = FUNCTION_TABLE[constructor];
    destructor = FUNCTION_TABLE[destructor];
    typeRegistry[structType] = {
        fields: {},
        fromWireType: function(ptr) {
            var fields = this.fields;
            var rv = {};
            for (var i in fields) {
                rv[i] = fields[i].read(ptr);
            }
            destructor(ptr);
            return rv;
        },
        toWireType: function(destructors, o) {
            var fields = this.fields;
            for (var fieldName in fields) {
                if (!(fieldName in o)) {
                    throw new TypeError('Missing field');
                }
            }
            var ptr = constructor();
            for (var fieldName in fields) {
                fields[fieldName].write(ptr, o[fieldName]);
            }
            destructors.push(destructor);
            destructors.push(ptr);
            return ptr;
        }
    };
}
function __embind_register_struct_field(
    structType,
    fieldName,
    fieldType,
    getter,
    setter,
    memberPointerSize,
    memberPointer
) {
    structType = requireRegisteredType(structType, 'struct');
    fieldName = Pointer_stringify(fieldName);
    fieldType = requireRegisteredType(fieldType, 'field "' + structType.name + '.' + fieldName + '"');
    getter = FUNCTION_TABLE[getter];
    setter = FUNCTION_TABLE[setter];
    memberPointer = copyMemberPointer(memberPointer, memberPointerSize);
    structType.fields[fieldName] = {
        read: function(ptr) {
            return fieldType.fromWireType(getter(ptr, memberPointer));
        },
        write: function(ptr, o) {
            var destructors = [];
            setter(ptr, memberPointer, fieldType.toWireType(destructors, o));
            runDestructors(destructors);
        }
    };
}
function __embind_register_class(
    classType,
    name,
    destructor
) {
    name = Pointer_stringify(name);
    destructor = FUNCTION_TABLE[destructor];
    var Handle = createNamedFunction(name, function(ptr) {
        this.count = {value: 1};
        this.ptr = ptr;
    });
    Handle.prototype.clone = function() {
        if (!this.ptr) {
            throw new BindingError(classType.name + ' instance already deleted');
        }
        var clone = Object.create(Handle.prototype);
        clone.count = this.count;
        clone.ptr = this.ptr;
        clone.count.value += 1;
        return clone;
    };
    Handle.prototype.move = function() {
        var rv = this.clone();
        this.delete();
        return rv;
    };
    Handle.prototype['delete'] = function() {
        if (!this.ptr) {
            throw new BindingError(classType.name + ' instance already deleted');
        }
        this.count.value -= 1;
        if (0 === this.count.value) {
            destructor(this.ptr);
        }
        this.ptr = undefined;
    };
    var constructor = createNamedFunction(name, function() {
        var body = constructor.body;
        body.apply(this, arguments);
    });
    constructor.prototype = Object.create(Handle.prototype);
    typeRegistry[classType] = {
        name: name,
        constructor: constructor,
        Handle: Handle,
        fromWireType: function(ptr) {
            return new Handle(ptr);
        },
        toWireType: function(destructors, o) {
            return o.ptr;
        }
    };
    Module[name] = constructor;
}
function __embind_register_class_constructor(
    classType,
    argCount,
    argTypes,
    constructor
) {
    classType = requireRegisteredType(classType, 'class');
    var humanName = 'constructor ' + classType.name;
    argTypes = requireArgumentTypes(argCount, argTypes, humanName);
    constructor = FUNCTION_TABLE[constructor];
    classType.constructor.body = function() {
        if (arguments.length !== argCount) {
            throw new BindingError('emscripten binding ' + humanName + ' called with ' + arguments.length + ' arguments, expected ' + argCount);
        }
        var destructors = [];
        var args = new Array(argCount);
        for (var i = 0; i < argCount; ++i) {
            args[i] = argTypes[i].toWireType(destructors, arguments[i]);
        }
        var ptr = constructor.apply(null, args);
        runDestructors(destructors);
        classType.Handle.call(this, ptr);
    };
}
function __embind_register_class_method(
    classType,
    methodName,
    returnType,
    argCount,
    argTypes,
    invoker,
    memberFunctionSize,
    memberFunction
) {
    classType = requireRegisteredType(classType, 'class');
    methodName = Pointer_stringify(methodName);
    var humanName = classType.name + '.' + methodName;
    returnType = requireRegisteredType(returnType, 'method ' + humanName + ' return value');
    argTypes = requireArgumentTypes(argCount, argTypes, 'method ' + humanName);
    invoker = FUNCTION_TABLE[invoker];
    memberFunction = copyMemberPointer(memberFunction, memberFunctionSize);
    classType.Handle.prototype[methodName] = function() {
        if (!this.ptr) {
            throw new BindingError('cannot call emscripten binding method ' + humanName + ' on deleted object');
        }
        if (arguments.length !== argCount) {
            throw new BindingError('emscripten binding method ' + humanName + ' called with ' + arguments.length + ' arguments, expected ' + argCount);
        }
        var destructors = [];
        var args = new Array(argCount + 2);
        args[0] = this.ptr;
        args[1] = memberFunction;
        for (var i = 0; i < argCount; ++i) {
            args[i + 2] = argTypes[i].toWireType(destructors, arguments[i]);
        }
        var rv = returnType.fromWireType(invoker.apply(null, args));
        runDestructors(destructors);
        return rv;
    };
}
function __embind_register_class_classmethod(
    classType,
    methodName,
    returnType,
    argCount,
    argTypes,
    method
) {
    classType = requireRegisteredType(classType, 'class');
    methodName = Pointer_stringify(methodName);
    var humanName = classType.name + '.' + methodName;
    returnType = requireRegisteredType(returnType, 'classmethod ' + humanName + ' return value');
    argTypes = requireArgumentTypes(argCount, argTypes, 'classmethod ' + humanName);
    method = FUNCTION_TABLE[method];
    classType.constructor[methodName] = function() {
        if (arguments.length !== argCount) {
            throw new BindingError('emscripten binding method ' + humanName + ' called with ' + arguments.length + ' arguments, expected ' + argCount);
        }
        var destructors = [];
        var args = new Array(argCount);
        for (var i = 0; i < argCount; ++i) {
            args[i] = argTypes[i].toWireType(destructors, arguments[i]);
        }
        var rv = returnType.fromWireType(method.apply(null, args));
        runDestructors(destructors);
        return rv;
    };
}
function __embind_register_class_field(
    classType,
    fieldName,
    fieldType,
    getter,
    setter,
    memberPointerSize,
    memberPointer
) {
    classType = requireRegisteredType(classType, 'class');
    fieldName = Pointer_stringify(fieldName);
    var humanName = classType.name + '.' + fieldName;
    fieldType = requireRegisteredType(fieldType, 'field ' + humanName);
    getter = FUNCTION_TABLE[getter];
    setter = FUNCTION_TABLE[setter];
    memberPointer = copyMemberPointer(memberPointer, memberPointerSize);
    Object.defineProperty(classType.Handle.prototype, fieldName, {
        get: function() {
            if (!this.ptr) {
                throw new BindingError('cannot access emscripten binding field ' + humanName + ' on deleted object');
            }
            return fieldType.fromWireType(getter(this.ptr, memberPointer));
        },
        set: function(v) {
            if (!this.ptr) {
                throw new BindingError('cannot modify emscripten binding field ' + humanName + ' on deleted object');
            }
            var destructors = [];
            setter(this.ptr, memberPointer, fieldType.toWireType(destructors, v));
            runDestructors(destructors);
        },
        enumerable: true
    });
}
function __embind_register_enum(
    enumType,
    name
) {
    name = Pointer_stringify(name);
    function Enum() {
    }
    Enum.values = {};
    typeRegistry[enumType] = {
        name: name,
        constructor: Enum,
        toWireType: function(destructors, c) {
            return c.value;
        },
        fromWireType: function(c) {
            return Enum.values[c];
        },
    };
    Module[name] = Enum;
}
function __embind_register_enum_value(
    enumType,
    name,
    enumValue
) {
    enumType = requireRegisteredType(enumType, 'enum');
    name = Pointer_stringify(name);
    var Enum = enumType.constructor;
    var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(enumType.name + '_' + name, function() {})},
    });
    Enum.values[enumValue] = Value;
    Enum[name] = Value;
}
function __embind_register_interface(
    interfaceType,
    name,
    constructor,
    destructor
) {
    name = Pointer_stringify(name);
    constructor = FUNCTION_TABLE[constructor];
    destructor = FUNCTION_TABLE[destructor];
    typeRegistry[interfaceType] = {
        name: name,
        toWireType: function(destructors, o) {
            var handle = __emval_register(o);
            var ptr = constructor(handle);
            destructors.push(destructor);
            destructors.push(ptr);
            return ptr;
        },
    };
}
/*global Module*/
/*global HEAP32*/
/*global Pointer_stringify, writeStringToMemory*/
/*global requireRegisteredType*/
var _emval_handle_array = [];
var _emval_free_list = [];
// Public JS API
/** @expose */
Module.count_emval_handles = function() {
    return _emval_handle_array.length;
};
// Private C++ API
function __emval_register(value) {
    var handle = _emval_free_list.length ?
        _emval_free_list.pop() :
        _emval_handle_array.length;
    _emval_handle_array[handle] = {refcount: 1, value: value};
    return handle;
}
function __emval_incref(handle) {
    _emval_handle_array[handle].refcount += 1;
}
function __emval_decref(handle) {
    if (0 === --_emval_handle_array[handle].refcount) {
        delete _emval_handle_array[handle];
        _emval_free_list.push(handle);
        var actual_length = _emval_handle_array.length;
        while (actual_length > 0 && _emval_handle_array[actual_length - 1] === undefined) {
            --actual_length;
        }
        _emval_handle_array.length = actual_length;
    }
}
function __emval_new_object() {
    return __emval_register({});
}
function __emval_new_long(value) {
    return __emval_register(value);
}
function __emval_new_cstring(str) {
    return __emval_register(Pointer_stringify(str));
}
function __emval_get_property(handle, k) {
    k = Pointer_stringify(k);
    return __emval_register(_emval_handle_array[handle].value[k]);
}
function __emval_get_property_by_long(handle, k) {
    return __emval_register(_emval_handle_array[handle].value[k]);
}
function __emval_get_property_by_unsigned_long(handle, k) {
    return __emval_register(_emval_handle_array[handle].value[k]);
}
function __emval_set_property(handle, k, value) {
    k = Pointer_stringify(k);
    _emval_handle_array[handle].value[k] = _emval_handle_array[value].value;
}
function __emval_set_property_by_int(handle, k, value) {
    _emval_handle_array[handle].value[k] = _emval_handle_array[value].value;
}
function __emval_as(handle, returnType) {
    returnType = requireRegisteredType(returnType, 'emval::as');
    var destructors = [];
    // caller owns destructing
    return returnType.toWireType(destructors, _emval_handle_array[handle].value);
}
function __emval_call(handle, argCount, argTypes) {
    var args = Array.prototype.slice.call(arguments, 3);
    var fn = _emval_handle_array[handle].value;
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var argType = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
        a[i] = argType.fromWireType(args[i]);
    }
    var rv = fn.apply(undefined, a);
    return __emval_register(rv);
}
function __emval_call_method(handle, name, argCount, argTypes) {
    name = Pointer_stringify(name);
    var args = Array.prototype.slice.call(arguments, 4);
    var obj = _emval_handle_array[handle].value;
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var argType = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
        a[i] = argType.fromWireType(args[i]);
    }
    var rv = obj[name].apply(obj, a);
    return __emval_register(rv);
}
(function() {
function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}
Module['FS_createPath']('/', 'docs', true, true);
Module['FS_createPath']('/docs', 'ui', true, true);
Module['FS_createPath']('/docs', 'fonts', true, true);
Module['FS_createPath']('/docs', 'shaders', true, true);
Module['FS_createPath']('/docs/shaders', 'WebGL', true, true);
Module['FS_createPath']('/docs', 'cursors', true, true);
Module['FS_createPath']('/docs', 'images', true, true);
    function DataRequest() {}
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.requests[name] = this;
      },
      send: function() {}
    };
    var filePreload0 = new DataRequest();
    filePreload0.open('GET', 'options.xml', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file options.xml failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/', 'options.xml', byteArray, true, true, function() {
        Module['removeRunDependency']('fp options.xml');
      });
    };
    Module['addRunDependency']('fp options.xml');
    filePreload0.send(null);
    var filePreload1 = new DataRequest();
    filePreload1.open('GET', 'docs/ui/help.xml', true);
    filePreload1.responseType = 'arraybuffer';
    filePreload1.onload = function() {
      var arrayBuffer = filePreload1.response;
      assert(arrayBuffer, 'Loading file docs/ui/help.xml failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/ui', 'help.xml', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/ui/help.xml');
      });
    };
    Module['addRunDependency']('fp docs/ui/help.xml');
    filePreload1.send(null);
    var filePreload2 = new DataRequest();
    filePreload2.open('GET', 'docs/ui/mgFrameworkErrors.xml', true);
    filePreload2.responseType = 'arraybuffer';
    filePreload2.onload = function() {
      var arrayBuffer = filePreload2.response;
      assert(arrayBuffer, 'Loading file docs/ui/mgFrameworkErrors.xml failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/ui', 'mgFrameworkErrors.xml', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/ui/mgFrameworkErrors.xml');
      });
    };
    Module['addRunDependency']('fp docs/ui/mgFrameworkErrors.xml');
    filePreload2.send(null);
    var filePreload3 = new DataRequest();
    filePreload3.open('GET', 'docs/fonts/fonts.xml', true);
    filePreload3.responseType = 'arraybuffer';
    filePreload3.onload = function() {
      var arrayBuffer = filePreload3.response;
      assert(arrayBuffer, 'Loading file docs/fonts/fonts.xml failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/fonts', 'fonts.xml', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/fonts/fonts.xml');
      });
    };
    Module['addRunDependency']('fp docs/fonts/fonts.xml');
    filePreload3.send(null);
    var filePreload4 = new DataRequest();
    filePreload4.open('GET', 'docs/shaders/WebGL/litTexture.fs', true);
    filePreload4.responseType = 'arraybuffer';
    filePreload4.onload = function() {
      var arrayBuffer = filePreload4.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/litTexture.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'litTexture.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/litTexture.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/litTexture.fs');
    filePreload4.send(null);
    var filePreload5 = new DataRequest();
    filePreload5.open('GET', 'docs/shaders/WebGL/litTextureArray.vs', true);
    filePreload5.responseType = 'arraybuffer';
    filePreload5.onload = function() {
      var arrayBuffer = filePreload5.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/litTextureArray.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'litTextureArray.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/litTextureArray.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/litTextureArray.vs');
    filePreload5.send(null);
    var filePreload6 = new DataRequest();
    filePreload6.open('GET', 'docs/shaders/WebGL/skyfog.vs', true);
    filePreload6.responseType = 'arraybuffer';
    filePreload6.onload = function() {
      var arrayBuffer = filePreload6.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/skyfog.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'skyfog.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/skyfog.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/skyfog.vs');
    filePreload6.send(null);
    var filePreload7 = new DataRequest();
    filePreload7.open('GET', 'docs/shaders/WebGL/litTextureCube.fs', true);
    filePreload7.responseType = 'arraybuffer';
    filePreload7.onload = function() {
      var arrayBuffer = filePreload7.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/litTextureCube.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'litTextureCube.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/litTextureCube.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/litTextureCube.fs');
    filePreload7.send(null);
    var filePreload8 = new DataRequest();
    filePreload8.open('GET', 'docs/shaders/WebGL/unlitTextureArray.fs', true);
    filePreload8.responseType = 'arraybuffer';
    filePreload8.onload = function() {
      var arrayBuffer = filePreload8.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/unlitTextureArray.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'unlitTextureArray.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/unlitTextureArray.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/unlitTextureArray.fs');
    filePreload8.send(null);
    var filePreload9 = new DataRequest();
    filePreload9.open('GET', 'docs/shaders/WebGL/skyfog.fs', true);
    filePreload9.responseType = 'arraybuffer';
    filePreload9.onload = function() {
      var arrayBuffer = filePreload9.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/skyfog.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'skyfog.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/skyfog.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/skyfog.fs');
    filePreload9.send(null);
    var filePreload10 = new DataRequest();
    filePreload10.open('GET', 'docs/shaders/WebGL/unlitTextureArray.vs', true);
    filePreload10.responseType = 'arraybuffer';
    filePreload10.onload = function() {
      var arrayBuffer = filePreload10.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/unlitTextureArray.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'unlitTextureArray.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/unlitTextureArray.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/unlitTextureArray.vs');
    filePreload10.send(null);
    var filePreload11 = new DataRequest();
    filePreload11.open('GET', 'docs/shaders/WebGL/unlitTexture.vs', true);
    filePreload11.responseType = 'arraybuffer';
    filePreload11.onload = function() {
      var arrayBuffer = filePreload11.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/unlitTexture.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'unlitTexture.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/unlitTexture.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/unlitTexture.vs');
    filePreload11.send(null);
    var filePreload12 = new DataRequest();
    filePreload12.open('GET', 'docs/shaders/WebGL/litTextureCube.vs', true);
    filePreload12.responseType = 'arraybuffer';
    filePreload12.onload = function() {
      var arrayBuffer = filePreload12.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/litTextureCube.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'litTextureCube.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/litTextureCube.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/litTextureCube.vs');
    filePreload12.send(null);
    var filePreload13 = new DataRequest();
    filePreload13.open('GET', 'docs/shaders/WebGL/unlitTextureCube.fs', true);
    filePreload13.responseType = 'arraybuffer';
    filePreload13.onload = function() {
      var arrayBuffer = filePreload13.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/unlitTextureCube.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'unlitTextureCube.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/unlitTextureCube.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/unlitTextureCube.fs');
    filePreload13.send(null);
    var filePreload14 = new DataRequest();
    filePreload14.open('GET', 'docs/shaders/WebGL/litTextureArray.fs', true);
    filePreload14.responseType = 'arraybuffer';
    filePreload14.onload = function() {
      var arrayBuffer = filePreload14.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/litTextureArray.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'litTextureArray.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/litTextureArray.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/litTextureArray.fs');
    filePreload14.send(null);
    var filePreload15 = new DataRequest();
    filePreload15.open('GET', 'docs/shaders/WebGL/textureArray.fs', true);
    filePreload15.responseType = 'arraybuffer';
    filePreload15.onload = function() {
      var arrayBuffer = filePreload15.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/textureArray.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'textureArray.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/textureArray.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/textureArray.fs');
    filePreload15.send(null);
    var filePreload16 = new DataRequest();
    filePreload16.open('GET', 'docs/shaders/WebGL/unlitTextureCube.vs', true);
    filePreload16.responseType = 'arraybuffer';
    filePreload16.onload = function() {
      var arrayBuffer = filePreload16.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/unlitTextureCube.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'unlitTextureCube.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/unlitTextureCube.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/unlitTextureCube.vs');
    filePreload16.send(null);
    var filePreload17 = new DataRequest();
    filePreload17.open('GET', 'docs/shaders/WebGL/litTexture.vs', true);
    filePreload17.responseType = 'arraybuffer';
    filePreload17.onload = function() {
      var arrayBuffer = filePreload17.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/litTexture.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'litTexture.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/litTexture.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/litTexture.vs');
    filePreload17.send(null);
    var filePreload18 = new DataRequest();
    filePreload18.open('GET', 'docs/shaders/WebGL/unlitTexture.fs', true);
    filePreload18.responseType = 'arraybuffer';
    filePreload18.onload = function() {
      var arrayBuffer = filePreload18.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/unlitTexture.fs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'unlitTexture.fs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/unlitTexture.fs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/unlitTexture.fs');
    filePreload18.send(null);
    var filePreload19 = new DataRequest();
    filePreload19.open('GET', 'docs/shaders/WebGL/textureArray.vs', true);
    filePreload19.responseType = 'arraybuffer';
    filePreload19.onload = function() {
      var arrayBuffer = filePreload19.response;
      assert(arrayBuffer, 'Loading file docs/shaders/WebGL/textureArray.vs failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/shaders/WebGL', 'textureArray.vs', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/shaders/WebGL/textureArray.vs');
      });
    };
    Module['addRunDependency']('fp docs/shaders/WebGL/textureArray.vs');
    filePreload19.send(null);
    var filePreload20 = new DataRequest();
    filePreload20.open('GET', 'docs/cursors/arrowCursor.png', true);
    filePreload20.responseType = 'arraybuffer';
    filePreload20.onload = function() {
      var arrayBuffer = filePreload20.response;
      assert(arrayBuffer, 'Loading file docs/cursors/arrowCursor.png failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/cursors', 'arrowCursor.png', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/cursors/arrowCursor.png');
      });
    };
    Module['addRunDependency']('fp docs/cursors/arrowCursor.png');
    filePreload20.send(null);
    var filePreload21 = new DataRequest();
    filePreload21.open('GET', 'docs/cursors/arrowCursor.xml', true);
    filePreload21.responseType = 'arraybuffer';
    filePreload21.onload = function() {
      var arrayBuffer = filePreload21.response;
      assert(arrayBuffer, 'Loading file docs/cursors/arrowCursor.xml failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/cursors', 'arrowCursor.xml', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/cursors/arrowCursor.xml');
      });
    };
    Module['addRunDependency']('fp docs/cursors/arrowCursor.xml');
    filePreload21.send(null);
    var filePreload22 = new DataRequest();
    filePreload22.open('GET', 'docs/cursors/crossCursor.xml', true);
    filePreload22.responseType = 'arraybuffer';
    filePreload22.onload = function() {
      var arrayBuffer = filePreload22.response;
      assert(arrayBuffer, 'Loading file docs/cursors/crossCursor.xml failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/cursors', 'crossCursor.xml', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/cursors/crossCursor.xml');
      });
    };
    Module['addRunDependency']('fp docs/cursors/crossCursor.xml');
    filePreload22.send(null);
    var filePreload23 = new DataRequest();
    filePreload23.open('GET', 'docs/cursors/crossCursor.png', true);
    filePreload23.responseType = 'arraybuffer';
    filePreload23.onload = function() {
      var arrayBuffer = filePreload23.response;
      assert(arrayBuffer, 'Loading file docs/cursors/crossCursor.png failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/cursors', 'crossCursor.png', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/cursors/crossCursor.png');
      });
    };
    Module['addRunDependency']('fp docs/cursors/crossCursor.png');
    filePreload23.send(null);
    var filePreload24 = new DataRequest();
    filePreload24.open('GET', 'docs/images/face-ymin.jpg', true);
    filePreload24.responseType = 'arraybuffer';
    filePreload24.onload = function() {
      var arrayBuffer = filePreload24.response;
      assert(arrayBuffer, 'Loading file docs/images/face-ymin.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'face-ymin.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/face-ymin.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/face-ymin.jpg');
    filePreload24.send(null);
    var filePreload25 = new DataRequest();
    filePreload25.open('GET', 'docs/images/face-xmin.jpg', true);
    filePreload25.responseType = 'arraybuffer';
    filePreload25.onload = function() {
      var arrayBuffer = filePreload25.response;
      assert(arrayBuffer, 'Loading file docs/images/face-xmin.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'face-xmin.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/face-xmin.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/face-xmin.jpg');
    filePreload25.send(null);
    var filePreload26 = new DataRequest();
    filePreload26.open('GET', 'docs/images/face-zmax.jpg', true);
    filePreload26.responseType = 'arraybuffer';
    filePreload26.onload = function() {
      var arrayBuffer = filePreload26.response;
      assert(arrayBuffer, 'Loading file docs/images/face-zmax.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'face-zmax.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/face-zmax.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/face-zmax.jpg');
    filePreload26.send(null);
    var filePreload27 = new DataRequest();
    filePreload27.open('GET', 'docs/images/floor.jpg', true);
    filePreload27.responseType = 'arraybuffer';
    filePreload27.onload = function() {
      var arrayBuffer = filePreload27.response;
      assert(arrayBuffer, 'Loading file docs/images/floor.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'floor.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/floor.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/floor.jpg');
    filePreload27.send(null);
    var filePreload28 = new DataRequest();
    filePreload28.open('GET', 'docs/images/face-zmin.jpg', true);
    filePreload28.responseType = 'arraybuffer';
    filePreload28.onload = function() {
      var arrayBuffer = filePreload28.response;
      assert(arrayBuffer, 'Loading file docs/images/face-zmin.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'face-zmin.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/face-zmin.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/face-zmin.jpg');
    filePreload28.send(null);
    var filePreload29 = new DataRequest();
    filePreload29.open('GET', 'docs/images/face-xmax.jpg', true);
    filePreload29.responseType = 'arraybuffer';
    filePreload29.onload = function() {
      var arrayBuffer = filePreload29.response;
      assert(arrayBuffer, 'Loading file docs/images/face-xmax.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'face-xmax.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/face-xmax.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/face-xmax.jpg');
    filePreload29.send(null);
    var filePreload30 = new DataRequest();
    filePreload30.open('GET', 'docs/images/face-ymax.jpg', true);
    filePreload30.responseType = 'arraybuffer';
    filePreload30.onload = function() {
      var arrayBuffer = filePreload30.response;
      assert(arrayBuffer, 'Loading file docs/images/face-ymax.jpg failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/docs/images', 'face-ymax.jpg', byteArray, true, true, function() {
        Module['removeRunDependency']('fp docs/images/face-ymax.jpg');
      });
    };
    Module['addRunDependency']('fp docs/images/face-ymax.jpg');
    filePreload30.send(null);
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var dataFile = new XMLHttpRequest();
    dataFile.onprogress = function(event) {
      var url = 'Release/GuiTestAll.data';
      if (event.loaded && event.total) {
        if (!dataFile.addedTotal) {
          dataFile.addedTotal = true;
          if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
          Module.dataFileDownloads[url] = {
            loaded: event.loaded,
            total: event.total
          };
        } else {
          Module.dataFileDownloads[url].loaded = event.loaded;
        }
        var total = 0;
        var loaded = 0;
        var num = 0;
        for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
          total += data.total;
          loaded += data.loaded;
          num++;
        }
        total = Math.ceil(total * Module.expectedDataFileDownloads/num);
        Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
      } else if (!Module.dataFileDownloads) {
        Module['setStatus']('Downloading data...');
      }
    }
    dataFile.open('GET', 'GuiTestAll.data', true);
    dataFile.responseType = 'arraybuffer';
    dataFile.onload = function() {
      Module.finishedDataFileDownloads++;
      var arrayBuffer = dataFile.response;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
        curr = DataRequest.prototype.requests['options.xml'];
        curr.response = byteArray.subarray(0,656);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/ui/help.xml'];
        curr.response = byteArray.subarray(656,1269);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/ui/mgFrameworkErrors.xml'];
        curr.response = byteArray.subarray(1269,8970);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/fonts/fonts.xml'];
        curr.response = byteArray.subarray(8970,11850);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/litTexture.fs'];
        curr.response = byteArray.subarray(11850,12060);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/litTextureArray.vs'];
        curr.response = byteArray.subarray(12060,13199);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/skyfog.vs'];
        curr.response = byteArray.subarray(13199,13664);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/litTextureCube.fs'];
        curr.response = byteArray.subarray(13664,13911);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/unlitTextureArray.fs'];
        curr.response = byteArray.subarray(13911,14287);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/skyfog.fs'];
        curr.response = byteArray.subarray(14287,15174);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/unlitTextureArray.vs'];
        curr.response = byteArray.subarray(15174,16031);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/unlitTexture.vs'];
        curr.response = byteArray.subarray(16031,16403);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/litTextureCube.vs'];
        curr.response = byteArray.subarray(16403,17057);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/unlitTextureCube.fs'];
        curr.response = byteArray.subarray(17057,17270);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/litTextureArray.fs'];
        curr.response = byteArray.subarray(17270,17644);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/textureArray.fs'];
        curr.response = byteArray.subarray(17644,18005);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/unlitTextureCube.vs'];
        curr.response = byteArray.subarray(18005,18377);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/litTexture.vs'];
        curr.response = byteArray.subarray(18377,19032);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/unlitTexture.fs'];
        curr.response = byteArray.subarray(19032,19347);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/shaders/WebGL/textureArray.vs'];
        curr.response = byteArray.subarray(19347,20286);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/cursors/arrowCursor.png'];
        curr.response = byteArray.subarray(20286,20626);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/cursors/arrowCursor.xml'];
        curr.response = byteArray.subarray(20626,20700);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/cursors/crossCursor.xml'];
        curr.response = byteArray.subarray(20700,20776);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/cursors/crossCursor.png'];
        curr.response = byteArray.subarray(20776,20989);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/face-ymin.jpg'];
        curr.response = byteArray.subarray(20989,34692);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/face-xmin.jpg'];
        curr.response = byteArray.subarray(34692,47434);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/face-zmax.jpg'];
        curr.response = byteArray.subarray(47434,63423);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/floor.jpg'];
        curr.response = byteArray.subarray(63423,146032);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/face-zmin.jpg'];
        curr.response = byteArray.subarray(146032,160982);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/face-xmax.jpg'];
        curr.response = byteArray.subarray(160982,175894);
        curr.onload();
        curr = DataRequest.prototype.requests['docs/images/face-ymax.jpg'];
        curr.response = byteArray.subarray(175894,189844);
        curr.onload();
                Module['removeRunDependency']('datafile_Release/GuiTestAll.data');
    };
    Module['addRunDependency']('datafile_Release/GuiTestAll.data');
    dataFile.send(null);
    if (Module['setStatus']) Module['setStatus']('Downloading...');
})();
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}