/**
 * @license
 * Copyright 2024 IdeiaSpace
 * SPDX-License-Identifier: MIT
 */

/**
 * C++ code generator for Blockly.
 * @namespace Blockly.Cpp
 */
'use strict';

if (!Blockly.Cpp) {
  Blockly.Cpp = new Blockly.Generator('C++');
}

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Cpp.addReservedWords(
  'auto,break,case,char,const,continue,default,do,double,else,enum,extern,' +
  'float,for,goto,if,int,long,register,return,short,signed,sizeof,static,' +
  'struct,switch,typedef,union,unsigned,void,volatile,while,cout,cin,endl,' +
  'string,vector,map,set,list,queue,stack,priority_queue,algorithm,iostream,' +
  'fstream,sstream,chrono,thread,mutex,condition_variable,atomic,memory,' +
  'functional,regex,random,complex,valarray,array,tuple,pair,optional,' +
  'variant,any,function,bind,ref,cref,placeholders,make_unique,make_shared'
);

/**
 * Order of operation ENUMs.
 * C++ Operator Precedence
 */
Blockly.Cpp.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.Cpp.ORDER_UNARY_POSTFIX = 1;     // expr++ expr-- () [] .
Blockly.Cpp.ORDER_UNARY_PREFIX = 2;      // -expr !expr ~expr ++expr --expr
Blockly.Cpp.ORDER_MULTIPLICATIVE = 3;    // * / % ~/
Blockly.Cpp.ORDER_ADDITIVE = 4;          // + -
Blockly.Cpp.ORDER_SHIFT = 5;             // << >>
Blockly.Cpp.ORDER_RELATIONAL = 6;        // >= > <= <
Blockly.Cpp.ORDER_EQUALITY = 7;          // == != === !==
Blockly.Cpp.ORDER_BITWISE_AND = 8;       // &
Blockly.Cpp.ORDER_BITWISE_XOR = 9;       // ^
Blockly.Cpp.ORDER_BITWISE_OR = 10;       // |
Blockly.Cpp.ORDER_LOGICAL_AND = 11;      // &&
Blockly.Cpp.ORDER_LOGICAL_OR = 12;       // ||
Blockly.Cpp.ORDER_CONDITIONAL = 13;      // expr ? expr : expr
Blockly.Cpp.ORDER_ASSIGNMENT = 14;       // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Cpp.ORDER_NONE = 99;             // (...)

/**
 * Initialise the C++ code generator.
 */
Blockly.Cpp.init = function() {
  if (!Blockly.Cpp.variableDB_) {
    Blockly.Cpp.variableDB_ = new Blockly.Names(Blockly.Cpp.RESERVED_WORDS_);
  } else {
    Blockly.Cpp.variableDB_.reset();
  }

  Blockly.Cpp.includes_ = Object.create(null);
  Blockly.Cpp.definitions_ = Object.create(null);
  Blockly.Cpp.functionNames_ = Object.create(null);

  if (!Blockly.Cpp.variableDB_) {
    Blockly.Cpp.variableDB_ = new Blockly.Names(Blockly.Cpp.RESERVED_WORDS_);
  }
  Blockly.Cpp.variableDB_.reset();
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Cpp.finish = function(code) {
  // Indent every line.
  if (code) {
    code = Blockly.Cpp.prefixLines(code, Blockly.Cpp.INDENT);
  }

  // Create the includes section.
  var includes = [];
  for (var name in Blockly.Cpp.includes_) {
    includes.push(Blockly.Cpp.includes_[name]);
  }
  var includesText = includes.length ? includes.join('\n') + '\n\n' : '';

  // Create the definitions section.
  var definitions = [];
  for (var name in Blockly.Cpp.definitions_) {
    definitions.push(Blockly.Cpp.definitions_[name]);
  }
  var definitionsText = definitions.length ? definitions.join('\n') + '\n\n' : '';

  // Create the functions section.
  var functions = [];
  for (var name in Blockly.Cpp.functionNames_) {
    functions.push(Blockly.Cpp.functionNames_[name]);
  }
  var functionsText = functions.length ? functions.join('\n\n') + '\n\n' : '';

  // Create main function
  var mainFunction = 'int main() {\n' + Blockly.Cpp.prefixLines(code, Blockly.Cpp.INDENT) + '\n  return 0;\n}\n';

  var allCode = includesText + definitionsText + functionsText + mainFunction;
  return allCode;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Cpp.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped C++ string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} C++ string.
 * @private
 */
Blockly.Cpp.quote_ = function(string) {
  // Can't use goog.string.quote since $ must also be escaped.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/"/g, '\\"');
  return '"' + string + '"';
};

/**
 * Common tasks for generating C++ from blocks.
 * Handles comments for specified block and any connected value blocks.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The C++ code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} C++ code with comments and subsequent blocks added.
 * @private
 */
Blockly.Cpp.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Cpp.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.Cpp.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Cpp.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextCode = opt_thisOnly ? '' : Blockly.Cpp.blockToCode(block.getNextBlock());
  return commentCode + code + nextCode;
};

/**
 * Generate code for the specified block (and connected blocks).
 * @param {Blockly.Block} block Block to generate code from.
 * @return {string} Generated code.
 */
Blockly.Cpp.blockToCode = function(block) {
  if (!block) {
    return '';
  }
  if (block.disabled) {
    return '';
  }

  var func = Blockly.Cpp[block.type];
  if (!func) {
    throw 'Language "C++" does not know how to generate code for block type "' + block.type + '".';
  }

  var code = func.call(block, block);
  if (Array.isArray(code)) {
    // Value blocks return tuples of code and operator order.
    return [code[0], code[1]];
  }
  return code;
};

/**
 * Generate code for all blocks in the workspace to the specified language.
 * @param {string} name Language name (e.g. 'C++').
 * @return {string} Generated code.
 */
Blockly.Cpp.workspaceToCode = function(workspace) {
  if (!workspace) {
    return '';
  }

  var code = [];
  var blocks = workspace.getTopBlocks(true);

  // Generate code for all blocks.
  for (var x = 0, block; block = blocks[x]; x++) {
    var line = Blockly.Cpp.blockToCode(block);
    if (Array.isArray(line)) {
      // Value blocks return tuples of code and operator order.
      // Top-level blocks don't care about operator order.
      line = line[0];
    }
    if (line) {
      code.push(line);
    }
  }

  // Clean up temporary data.
  if (Blockly.Cpp.variableDB_) {
    Blockly.Cpp.variableDB_.reset();
  }

  return code.join('\n');
};

// ============================================================================
// BLOCK GENERATORS
// ============================================================================

/**
 * C++ code generator for Logic (IF/ELSE) block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['controls_if'] = function(block) {
  var n = 0;
  var code = '', branchCode, conditionCode;
  do {
    conditionCode = Blockly.Cpp.valueToCode(block, 'IF' + n,
      Blockly.Cpp.ORDER_NONE) || 'false';
    branchCode = Blockly.Cpp.statementToCode(block, 'DO' + n);
    code += (n == 0 ? 'if (' : 'else if (') + conditionCode + ') {\n' + branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    branchCode = Blockly.Cpp.statementToCode(block, 'ELSE');
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

/**
 * C++ code generator for Logic Compare block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['logic_compare'] = function(block) {
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Cpp.ORDER_RELATIONAL;
  var argument0 = Blockly.Cpp.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Cpp.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

/**
 * C++ code generator for Logic Operation block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['logic_operation'] = function(block) {
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Cpp.ORDER_LOGICAL_AND :
      Blockly.Cpp.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Cpp.valueToCode(block, 'A', order) || 'false';
  var argument1 = Blockly.Cpp.valueToCode(block, 'B', order) || 'false';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

/**
 * C++ code generator for Logic Boolean block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['logic_boolean'] = function(block) {
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for Controls Repeat block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['controls_repeat_ext'] = function(block) {
  var repeats = Blockly.Cpp.valueToCode(block, 'TIMES',
    Blockly.Cpp.ORDER_ASSIGNMENT) || '0';
  var branch = Blockly.Cpp.statementToCode(block, 'DO');
  var code = 'for (int i = 0; i < ' + repeats + '; i++) {\n' + branch + '}\n';
  return code;
};

/**
 * C++ code generator for Controls While Until block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['controls_whileUntil'] = function(block) {
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Cpp.valueToCode(block, 'BOOL',
    until ? Blockly.Cpp.ORDER_LOGICAL_NOT :
    Blockly.Cpp.ORDER_NONE) || 'false';
  var branch = Blockly.Cpp.statementToCode(block, 'DO');
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

/**
 * C++ code generator for Math Number block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['math_number'] = function(block) {
  var code = String(block.getFieldValue('NUM'));
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for Math Arithmetic block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['math_arithmetic'] = function(block) {
  var OPERATORS = {
    'ADD': [' + ', Blockly.Cpp.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.Cpp.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.Cpp.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.Cpp.ORDER_MULTIPLICATIVE],
    'POWER': ['', Blockly.Cpp.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Cpp.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Cpp.valueToCode(block, 'B', order) || '0';
  var code;
  if (operator == '') {
    // Power operator requires a function call.
    code = 'pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Cpp.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

/**
 * C++ code generator for Text block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['text'] = function(block) {
  var code = Blockly.Cpp.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for Text Print block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['text_print'] = function(block) {
  Blockly.Cpp.includes_['iostream'] = '#include <iostream>';
  var msg = Blockly.Cpp.valueToCode(block, 'TEXT',
    Blockly.Cpp.ORDER_NONE) || '""';
  return 'std::cout << ' + msg + ' << std::endl;\n';
};

/**
 * C++ code generator for Variables Get block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['variables_get'] = function(block) {
  var varName = Blockly.Cpp.variableDB_.getName(block.getFieldValue('VAR'),
    Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for Variables Set block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['variables_set'] = function(block) {
  var varName = Blockly.Cpp.variableDB_.getName(block.getFieldValue('VAR'),
    Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Cpp.valueToCode(block, 'VALUE',
    Blockly.Cpp.ORDER_ASSIGNMENT) || '0';
  return varName + ' = ' + argument0 + ';\n';
};

/**
 * C++ code generator for Procedures Defnoreturn block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['procedures_defnoreturn'] = function(block) {
  var funcName = Blockly.Cpp.variableDB_.getName(block.getFieldValue('NAME'),
    Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Cpp.statementToCode(block, 'STACK');
  var code = 'void ' + funcName + '() {\n' + branch + '}\n';
  return code;
};

/**
 * C++ code generator for Procedures Callnoreturn block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['procedures_callnoreturn'] = function(block) {
  var funcName = Blockly.Cpp.variableDB_.getName(block.getFieldValue('NAME'),
    Blockly.Procedures.NAME_TYPE);
  return funcName + '();\n';
};

// ============================================================================
// CUSTOM BLOCKS FOR C++
// ============================================================================

/**
 * C++ code generator for delay block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['delay_block'] = function(block) {
  Blockly.Cpp.includes_['chrono'] = '#include <chrono>';
  Blockly.Cpp.includes_['thread'] = '#include <thread>';
  var delayTime = block.getFieldValue('DELAY_TIME');
  return 'std::this_thread::sleep_for(std::chrono::milliseconds(' + delayTime + '));\n';
};

/**
 * C++ code generator for digital write block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var state = block.getFieldValue('STATE');
  return `digitalWrite(${pin}, ${state});\n`;
};

/**
 * C++ code generator for digital read block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return [`digitalRead(${pin})`, Blockly.Cpp.ORDER_ATOMIC];
}; 