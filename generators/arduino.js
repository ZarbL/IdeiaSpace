/**
 * @license
 * Copyright 2024 IdeiaSpace
 * SPDX-License-Identifier: MIT
 */

/**
 * Arduino code generator for Blockly.
 * @namespace Blockly.Arduino
 */

goog.provide('Blockly.Arduino');

goog.require('Blockly.Generator');

/**
 * Arduino code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Arduino = new Blockly.Generator('Arduino');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Arduino.addReservedWords(
  'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,' +
  'define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,' +
  'integer,constants,floatingpoint,unsignedbyte,byte,int,unsignedint,word,' +
  'long,unsignedlong,short,float,double,boolean,char,unsignedchar,char,' +
  'string,void,array,static,volatile,const,sizeof,pinMode,digitalWrite,' +
  'digitalRead,analogReference,analogRead,analogWrite,tone,noTone,shiftOut,' +
  'shiftIn,pulseIn,millis,micros,delay,delayMicroseconds,min,max,abs,constrain,' +
  'map,pow,sqrt,sin,cos,tan,randomSeed,random,lowByte,highByte,bitRead,bitWrite,' +
  'bitSet,bitClear,bit,attachInterrupt,detachInterrupt,interrupts,noInterrupts'
);

/**
 * Order of operation ENUMs.
 * http://arduino.cc/en/Reference/OperatorPrecedence
 */
Blockly.Arduino.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.Arduino.ORDER_UNARY_POSTFIX = 1;     // expr++ expr-- () [] .
Blockly.Arduino.ORDER_UNARY_PREFIX = 2;      // -expr !expr ~expr ++expr --expr
Blockly.Arduino.ORDER_MULTIPLICATIVE = 3;    // * / % ~/
Blockly.Arduino.ORDER_ADDITIVE = 4;          // + -
Blockly.Arduino.ORDER_SHIFT = 5;             // << >>
Blockly.Arduino.ORDER_RELATIONAL = 6;        // >= > <= <
Blockly.Arduino.ORDER_EQUALITY = 7;          // == != === !==
Blockly.Arduino.ORDER_BITWISE_AND = 8;       // &
Blockly.Arduino.ORDER_BITWISE_XOR = 9;       // ^
Blockly.Arduino.ORDER_BITWISE_OR = 10;       // |
Blockly.Arduino.ORDER_LOGICAL_AND = 11;      // &&
Blockly.Arduino.ORDER_LOGICAL_OR = 12;       // ||
Blockly.Arduino.ORDER_CONDITIONAL = 13;      // expr ? expr : expr
Blockly.Arduino.ORDER_ASSIGNMENT = 14;       // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Arduino.ORDER_NONE = 99;             // (...)

/**
 * Initialise the Arduino code generator.
 */
Blockly.Arduino.init = function() {
  if (!Blockly.Arduino.variableDB_) {
    Blockly.Arduino.variableDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
  } else {
    Blockly.Arduino.variableDB_.reset();
  }

  Blockly.Arduino.includes_ = Object.create(null);
  Blockly.Arduino.definitions_ = Object.create(null);
  Blockly.Arduino.setups_ = Object.create(null);
  Blockly.Arduino.functionNames_ = Object.create(null);

  if (!Blockly.Arduino.variableDB_) {
    Blockly.Arduino.variableDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
  }
  Blockly.Arduino.variableDB_.reset();
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Arduino.finish = function(code) {
  // Indent every line.
  if (code) {
    code = Blockly.Arduino.prefixLines(code, Blockly.Arduino.INDENT);
  }

  // Create the includes section.
  var includes = [];
  for (var name in Blockly.Arduino.includes_) {
    includes.push(Blockly.Arduino.includes_[name]);
  }
  var includesText = includes.length ? includes.join('\n') + '\n\n' : '';

  // Create the definitions section.
  var definitions = [];
  for (var name in Blockly.Arduino.definitions_) {
    definitions.push(Blockly.Arduino.definitions_[name]);
  }
  var definitionsText = definitions.length ? definitions.join('\n') + '\n\n' : '';

  // Create the setup section.
  var setups = [];
  for (var name in Blockly.Arduino.setups_) {
    setups.push(Blockly.Arduino.setups_[name]);
  }
  var setupText = '';
  if (setups.length) {
    setupText = 'void setup() {\n' + Blockly.Arduino.prefixLines(setups.join('\n'), Blockly.Arduino.INDENT) + '\n}\n\n';
  }

  // Create the functions section.
  var functions = [];
  for (var name in Blockly.Arduino.functionNames_) {
    functions.push(Blockly.Arduino.functionNames_[name]);
  }
  var functionsText = functions.length ? functions.join('\n\n') + '\n\n' : '';

  var allCode = includesText + definitionsText + setupText + functionsText + code;
  return allCode;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Arduino.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Arduino string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Arduino string.
 * @private
 */
Blockly.Arduino.quote_ = function(string) {
  // Can't use goog.string.quote since $ must also be escaped.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, "\\'");
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Arduino from blocks.
 * Handles comments for specified block and any connected value blocks.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Arduino code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Arduino code with comments and subsequent blocks added.
 * @private
 */
Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Arduino.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.Arduino.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Arduino.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextCode = opt_thisOnly ? '' : Blockly.Arduino.blockToCode(block.getNextBlock());
  return commentCode + code + nextCode;
};

/**
 * Generate code for the specified block (and connected blocks).
 * @param {Blockly.Block} block Block to generate code from.
 * @return {string} Generated code.
 */
Blockly.Arduino.blockToCode = function(block) {
  if (!block) {
    return '';
  }
  if (block.disabled) {
    return '';
  }

  var func = Blockly.Arduino[block.type];
  if (!func) {
    throw 'Language "Arduino" does not know how to generate code for block type "' + block.type + '".';
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
 * @param {string} name Language name (e.g. 'Arduino').
 * @return {string} Generated code.
 */
Blockly.Arduino.workspaceToCode = function(workspace) {
  if (!workspace) {
    return '';
  }

  var code = [];
  var blocks = workspace.getTopBlocks(true);

  // Generate code for all blocks.
  for (var x = 0, block; block = blocks[x]; x++) {
    var line = Blockly.Arduino.blockToCode(block);
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
  if (Blockly.Arduino.variableDB_) {
    Blockly.Arduino.variableDB_.reset();
  }

  return code.join('\n');
};

// ============================================================================
// BLOCK GENERATORS
// ============================================================================

/**
 * Arduino code generator for Logic (IF/ELSE) block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['controls_if'] = function(block) {
  var n = 0;
  var code = '', branchCode, conditionCode;
  do {
    conditionCode = Blockly.Arduino.valueToCode(block, 'IF' + n,
      Blockly.Arduino.ORDER_NONE) || 'false';
    branchCode = Blockly.Arduino.statementToCode(block, 'DO' + n);
    code += (n == 0 ? 'if (' : 'else if (') + conditionCode + ') {\n' + branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    branchCode = Blockly.Arduino.statementToCode(block, 'ELSE');
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

/**
 * Arduino code generator for Logic Compare block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['logic_compare'] = function(block) {
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Arduino.ORDER_RELATIONAL;
  var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

/**
 * Arduino code generator for Logic Operation block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['logic_operation'] = function(block) {
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Arduino.ORDER_LOGICAL_AND :
      Blockly.Arduino.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || 'false';
  var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || 'false';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

/**
 * Arduino code generator for Logic Boolean block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['logic_boolean'] = function(block) {
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for Controls Repeat block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['controls_repeat_ext'] = function(block) {
  var repeats = Blockly.Arduino.valueToCode(block, 'TIMES',
    Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  var branch = Blockly.Arduino.statementToCode(block, 'DO');
  var code = 'for (int i = 0; i < ' + repeats + '; i++) {\n' + branch + '}\n';
  return code;
};

/**
 * Arduino code generator for Controls While Until block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['controls_whileUntil'] = function(block) {
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Arduino.valueToCode(block, 'BOOL',
    until ? Blockly.Arduino.ORDER_LOGICAL_NOT :
    Blockly.Arduino.ORDER_NONE) || 'false';
  var branch = Blockly.Arduino.statementToCode(block, 'DO');
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

/**
 * Arduino code generator for Math Number block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['math_number'] = function(block) {
  var code = String(block.getFieldValue('NUM'));
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for Math Arithmetic block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['math_arithmetic'] = function(block) {
  var OPERATORS = {
    'ADD': [' + ', Blockly.Arduino.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.Arduino.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
    'POWER': ['', Blockly.Arduino.ORDER_NONE]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
  var code;
  if (operator == '') {
    // Power operator requires a function call.
    code = 'pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

/**
 * Arduino code generator for Text block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['text'] = function(block) {
  var code = Blockly.Arduino.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for Text Print block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['text_print'] = function(block) {
  var msg = Blockly.Arduino.valueToCode(block, 'TEXT',
    Blockly.Arduino.ORDER_NONE) || '""';
  return 'Serial.println(' + msg + ');\n';
};

/**
 * Arduino code generator for Variables Get block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['variables_get'] = function(block) {
  var varName = Blockly.Arduino.variableDB_.getName(block.getFieldValue('VAR'),
    Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for Variables Set block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['variables_set'] = function(block) {
  var varName = Blockly.Arduino.variableDB_.getName(block.getFieldValue('VAR'),
    Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE',
    Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
  return varName + ' = ' + argument0 + ';\n';
};

/**
 * Arduino code generator for Procedures Defnoreturn block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['procedures_defnoreturn'] = function(block) {
  var funcName = Blockly.Arduino.variableDB_.getName(block.getFieldValue('NAME'),
    Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Arduino.statementToCode(block, 'STACK');
  var code = 'void ' + funcName + '() {\n' + branch + '}\n';
  return code;
};

/**
 * Arduino code generator for Procedures Callnoreturn block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['procedures_callnoreturn'] = function(block) {
  var funcName = Blockly.Arduino.variableDB_.getName(block.getFieldValue('NAME'),
    Blockly.Procedures.NAME_TYPE);
  return funcName + '();\n';
};

// ============================================================================
// CUSTOM BLOCKS FOR ESP32
// ============================================================================

/**
 * Arduino code generator for DHT initialization block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['init_dht'] = function(block) {
  const pin = block.getFieldValue('PIN');
  Blockly.Arduino.includes_['dht'] = '#include <Adafruit_Sensor.h>\n#include <DHT.h>\n#include <DHT_U.h>';
  Blockly.Arduino.definitions_['dht_obj'] = `#define DHTPIN ${pin}\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);`;
  Blockly.Arduino.setups_['dht_begin'] = 'dht.begin();';
  return '';
};

/**
 * Arduino code generator for DHT temperature reading block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['read_temp'] = function() {
  return ['dht.readTemperature()', Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for DHT humidity reading block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['read_humi'] = function() {
  return ['dht.readHumidity()', Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for MPU6050 initialization block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['init_mpu'] = function() {
  Blockly.Arduino.includes_['mpu'] = '#include <Wire.h>\n#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>';
  Blockly.Arduino.definitions_['mpu_obj'] = 'Adafruit_MPU6050 mpu;';
  Blockly.Arduino.setups_['mpu_begin'] = 'Wire.begin();\n  mpu.begin();';
  return '';
};

/**
 * Arduino code generator for MPU6050 reading block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['read_mpu'] = function() {
  Blockly.Arduino.setups_['mpu_event'] = 'sensors_event_t a, g, temp;';
  Blockly.Arduino.setups_['mpu_get_event'] = 'mpu.getEvent(&a, &g, &temp);';
  return ['a.acceleration.x', Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for digital write block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var state = block.getFieldValue('STATE');
  return `digitalWrite(${pin}, ${state});\n`;
};

/**
 * Arduino code generator for digital read block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated Arduino code and the operator order.
 */
Blockly.Arduino['digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return [`digitalRead(${pin})`, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Arduino code generator for delay block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated Arduino code.
 */
Blockly.Arduino['delay_block'] = function(block) {
  var delayTime = block.getFieldValue('DELAY_TIME');
  return `delay(${delayTime});\n`;
}; 