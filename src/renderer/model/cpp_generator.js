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

// Verificar se Blockly está disponível
if (typeof Blockly === 'undefined') {
  throw new Error('Blockly não está disponível');
}

// Verificar se Blockly.Generator está disponível
if (typeof Blockly.Generator === 'undefined') {
  // Criar um gerador básico se necessário
  Blockly.Generator = function(name) {
    this.name_ = name;
  };
  
  Blockly.Generator.prototype.workspaceToCode = function(workspace) {
    return '// Gerador básico - implementação simplificada\n';
  };
}

if (!Blockly.Cpp) {
  try {
    Blockly.Cpp = new Blockly.Generator('C++');
  } catch (error) {
    // Fallback: criar objeto básico
    Blockly.Cpp = {
      name_: 'C++',
      init: function() {
        this.includes_ = {};
        this.definitions_ = {};
        this.functionNames_ = {};
        this.variableDeclarations_ = {};
      },
      workspaceToCode: function(workspace) {
        return '// Gerador C++ básico\n';
      }
    };
  }
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
  Blockly.Cpp.variableDeclarations_ = Object.create(null);
  Blockly.Cpp.setups_ = Object.create(null);
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Cpp.finish = function(code) {
  // Create the includes section.
  var includes = [];
  for (var name in Blockly.Cpp.includes_) {
    includes.push(Blockly.Cpp.includes_[name]);
  }
  var includesText = includes.length ? includes.join('\n') + '\n\n' : '';

  // Create the definitions section (objects, constants, etc.).
  var definitions = [];
  for (var name in Blockly.Cpp.definitions_) {
    definitions.push(Blockly.Cpp.definitions_[name]);
  }
  var definitionsText = definitions.length ? definitions.join('\n') + '\n\n' : '';

  // Create variable declarations section - DEVE VIR ANTES DO CÓDIGO PRINCIPAL.
  var variableDeclarations = [];
  for (var name in Blockly.Cpp.variableDeclarations_) {
    variableDeclarations.push(Blockly.Cpp.variableDeclarations_[name]);
  }
  var variableDeclarationsText = variableDeclarations.length ? variableDeclarations.join('\n') + '\n\n' : '';

  // Create the functions section.
  var functions = [];
  for (var name in Blockly.Cpp.functionNames_) {
    functions.push(Blockly.Cpp.functionNames_[name]);
  }
  var functionsText = functions.length ? functions.join('\n\n') + '\n\n' : '';

  // Ordem correta: includes → definitions → variáveis globais → funções → setup/loop
  var finalCode = '';
  
  if (!code || code.trim() === '') {
    // Se não há código, mostrar mensagem orientativa
    finalCode = includesText + definitionsText + variableDeclarationsText + functionsText + 
                '// Arraste os blocos "void setup()" e "void loop()" da aba "Loops" para criar seu programa\n';
  } else {
    // Ordem correta: includes → definitions → variáveis → funções → código principal (setup/loop)
    finalCode = includesText + definitionsText + variableDeclarationsText + functionsText + code;
  }

  return finalCode;
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
 * Indent string by 2 spaces.
 */
Blockly.Cpp.INDENT = '  ';

/**
 * Add a prefix to each line.
 * @param {string} text The text to modify.
 * @param {string} prefix The prefix to add.
 * @return {string} The modified text.
 */
Blockly.Cpp.prefixLines = function(text, prefix) {
  return prefix + text.replace(/\n/g, '\n' + prefix);
};

/**
 * Generate code for a statement block.
 * @param {Blockly.Block} block The block to generate code for.
 * @param {string} name The input name for the statement.
 * @return {string} Generated code.
 */
Blockly.Cpp.statementToCode = function(block, name) {
  var targetBlock = block.getInputTargetBlock(name);
  var code = Blockly.Cpp.blockToCode(targetBlock);
  if (!code) {
    return '';
  }
  if (typeof code === 'string') {
    return code;
  }
  throw 'Expecting code from statement block, but got array.';
};

/**
 * Generate code for a value block.
 * @param {Blockly.Block} block The block to generate code for.
 * @param {string} name The input name for the value.
 * @param {number} order The order of operations for the code.
 * @return {string} Generated code.
 */
Blockly.Cpp.valueToCode = function(block, name, order) {
  if (isNaN(order)) {
    throw 'Expecting valid order for valueToCode, got: ' + order;
  }
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return '';
  }
  var tuple = Blockly.Cpp.blockToCode(targetBlock);
  if (typeof tuple === 'string') {
    // Promote string to tuple.
    tuple = [tuple, Blockly.Cpp.ORDER_ATOMIC];
  }
  var code = tuple[0];
  var innerOrder = tuple[1];
  if (!code) {
    return '';
  }
  // Wrap the code in parentheses if the outer operation has higher precedence.
  if (innerOrder && order <= innerOrder) {
    code = '(' + code + ')';
  }
  return code;
};

/**
 * Collect all nested comments.
 * @param {Blockly.Block} block The block to collect comments from.
 * @return {string} All nested comments.
 */
Blockly.Cpp.allNestedComments = function(block) {
  var comments = [];
  var comment = block.getCommentText();
  if (comment) {
    comments.push(comment);
  }
  // Recursively collect comments from child blocks
  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    if (input.connection && input.connection.targetBlock()) {
      var childComments = Blockly.Cpp.allNestedComments(input.connection.targetBlock());
      if (childComments) {
        comments.push(childComments);
      }
    }
  }
  return comments.join('\n');
};

/**
 * Declare a variable with auto type detection.
 * @param {string} varName The variable name.
 * @param {string} value The initial value (optional).
 * @return {string} The variable name.
 * @private
 */
Blockly.Cpp.declareVariable_ = function(varName, value) {
  if (!Blockly.Cpp.variableDeclarations_[varName]) {
    var declaration;
    if (value) {
      // Try to detect type from value
      if (value === 'true' || value === 'false') {
        declaration = 'bool ' + varName + ' = ' + value + ';';
      } else if (/^".*"$/.test(value)) {
        Blockly.Cpp.includes_['string'] = '#include <string>';
        declaration = 'std::string ' + varName + ' = ' + value + ';';
      } else if (/^\d+\.\d+$/.test(value)) {
        declaration = 'double ' + varName + ' = ' + value + ';';
      } else if (/^\d+$/.test(value)) {
        declaration = 'int ' + varName + ' = ' + value + ';';
      } else {
        // Default to auto type
        declaration = 'auto ' + varName + ' = ' + value + ';';
      }
    } else {
      // Default to int if no value provided
      declaration = 'int ' + varName + ' = 0;';
    }
    Blockly.Cpp.variableDeclarations_[varName] = declaration;
  }
  return varName;
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
    console.error('❌ Gerador não encontrado para bloco:', block.type);
    console.log('🔍 Geradores disponíveis:', Object.keys(Blockly.Cpp).filter(key => typeof Blockly.Cpp[key] === 'function' && key.startsWith('library_')));
    throw 'Language "C++" does not know how to generate code for block type "' + block.type + '".';
  }

  var code = func.call(block, block);
  
  if (Array.isArray(code)) {
    // Value blocks return tuples of code and operator order.
    return [code[0], code[1]];
  }
  
  // Para statement blocks, usar scrub_ para conectar com próximos blocos
  if (typeof code === 'string') {
    return Blockly.Cpp.scrub_(block, code);
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

  // Initialize the code generator
  Blockly.Cpp.init();

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

  // Join the code and finish with proper Arduino structure
  var allCode = code.join('\n');
  var finishedCode = Blockly.Cpp.finish(allCode);

  // Clean up temporary data.
  if (Blockly.Cpp.variableDB_) {
    Blockly.Cpp.variableDB_.reset();
  }

  return finishedCode;
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
    until ? Blockly.Cpp.ORDER_UNARY_PREFIX :
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
  var msg = Blockly.Cpp.valueToCode(block, 'TEXT',
    Blockly.Cpp.ORDER_NONE) || '""';
  return 'Serial.println(' + msg + ');\n';
};

/**
 * C++ code generator for Variables Get block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['variables_get'] = function(block) {
  var fieldValue = block.getFieldValue('VAR');
  
  // Tentar obter o nome real da variável a partir do workspace
  var realVariableName = fieldValue;
  
  try {
    // Se fieldValue é um ID, tentar obter o nome real
    if (block.workspace) {
      const variable = block.workspace.getVariableById(fieldValue);
      if (variable && variable.name) {
        realVariableName = variable.name;
      }
    }
    
    // Se ainda não temos um nome válido, tentar outras abordagens
    if (realVariableName === fieldValue) {
      const field = block.getField('VAR');
      if (field && field.getText) {
        const fieldText = field.getText();
        if (fieldText && fieldText !== fieldValue) {
          realVariableName = fieldText;
        }
      }
    }
    
  } catch (error) {
    // Silencioso em caso de erro, usar fieldValue como fallback
  }
  
  // Usar o nome real diretamente para variáveis simples
  var varName = realVariableName;
  
  // Apenas sanitizar se realmente necessário (nomes inválidos para C++)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(realVariableName)) {
    varName = Blockly.Cpp.variableDB_.getName(fieldValue, Blockly.Variables.NAME_TYPE);
  }
  
  // Ensure variable is declared
  Blockly.Cpp.declareVariable_(varName);
  
  return [varName, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for Variables Set block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['variables_set'] = function(block) {
  var fieldValue = block.getFieldValue('VAR');
  
  // Usar a mesma lógica do variables_get para obter o nome real
  var realVariableName = fieldValue;
  
  try {
    if (block.workspace) {
      const variable = block.workspace.getVariableById(fieldValue);
      if (variable && variable.name) {
        realVariableName = variable.name;
      }
    }
  } catch (error) {
    // Silencioso em caso de erro
  }
  
  // Usar o nome real diretamente para variáveis simples
  var varName = realVariableName;
  
  // Apenas sanitizar se realmente necessário (nomes inválidos para C++)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(realVariableName)) {
    varName = Blockly.Cpp.variableDB_.getName(fieldValue, Blockly.Variables.NAME_TYPE);
  }
  
  var argument0 = Blockly.Cpp.valueToCode(block, 'VALUE',
    Blockly.Cpp.ORDER_ASSIGNMENT) || '0';
  
  // Check if this is the first assignment (declaration)
  if (!Blockly.Cpp.variableDeclarations_[varName]) {
    // Declare and initialize the variable
    Blockly.Cpp.declareVariable_(varName, argument0);
    return ''; // Declaration is handled globally, no code needed here
  } else {
    // Just assignment
    return varName + ' = ' + argument0 + ';\n';
  }
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
  var delayTime = block.getFieldValue('DELAY_TIME');
  return 'delay(' + delayTime + ');\n';
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

/**
 * C++ code generator for variable declaration block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['variable_declaration'] = function(block) {
  var varType = block.getFieldValue('TYPE');
  var originalName = block.getFieldValue('VAR');
  
  // CORREÇÃO: Usar o nome original diretamente para variáveis simples
  var varName = originalName;
  
  // Apenas sanitizar se realmente necessário (nomes inválidos para C++)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(originalName)) {
    varName = Blockly.Cpp.variableDB_.getName(originalName, Blockly.Variables.NAME_TYPE);
  }
  
  var value = Blockly.Cpp.valueToCode(block, 'VALUE',
    Blockly.Cpp.ORDER_ASSIGNMENT) || '0';
  
  // Add string include if needed
  if (varType === 'std::string') {
    Blockly.Cpp.includes_['string'] = '#include <string>';
  }
  
  // Add explicit variable declaration
  var declaration = varType + ' ' + varName + ' = ' + value + ';';
  Blockly.Cpp.variableDeclarations_[varName] = declaration;
  
  return ''; // Declaration is handled globally
};

// Gerador de código para o bloco MPU6050
Blockly.Cpp['mpu6050_read'] = function(block) {
  var axis = block.getFieldValue('MPU6050_AXIS');
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  var code = '';
  switch(axis) {
    case 'ACCEL_X': code = 'mpu.getAccelX()'; break;
    case 'ACCEL_Y': code = 'mpu.getAccelY()'; break;
    case 'ACCEL_Z': code = 'mpu.getAccelZ()'; break;
    case 'GYRO_X': code = 'mpu.getGyroX()'; break;
    case 'GYRO_Y': code = 'mpu.getGyroY()'; break;
    case 'GYRO_Z': code = 'mpu.getGyroZ()'; break;
  }
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Gerador de código para inicialização do MPU6050
Blockly.Cpp['mpu6050_init'] = function(block) {
  var sclPin = block.getFieldValue('SCL_PIN');
  var sdaPin = block.getFieldValue('SDA_PIN');
  
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['wire_begin'] = 'Wire.begin(' + sdaPin + ', ' + sclPin + ');';
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  Blockly.Cpp.setups_['mpu6050_config'] = 'mpu.setAccelSens(0);\n  mpu.setGyroSens(0);';
  
  return '';
};

// Geradores específicos para cada eixo de aceleração
Blockly.Cpp['mpu6050_accel_x'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  
  var code = 'mpu.getAccelX()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_accel_y'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  
  var code = 'mpu.getAccelY()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_accel_z'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  
  var code = 'mpu.getAccelZ()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Geradores específicos para cada eixo de giroscópio
Blockly.Cpp['mpu6050_gyro_x'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  
  var code = 'mpu.getGyroX()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_gyro_y'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  
  var code = 'mpu.getGyroY()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_gyro_z'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['mpu6050'] = '#include <MPU6050.h>';
  Blockly.Cpp.definitions_['mpu6050_obj'] = 'MPU6050 mpu;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['mpu6050_begin'] = 'mpu.begin();';
  
  var code = 'mpu.getGyroZ()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// ============================================================================
// BMP180 CODE GENERATORS - Sensor de Pressão, Temperatura e Altitude
// ============================================================================

// Gerador de código para inicialização do BMP180
Blockly.Cpp['bmp180_init'] = function(block) {
  var sclPin = block.getFieldValue('SCL_PIN');
  var sdaPin = block.getFieldValue('SDA_PIN');
  
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['bmp180'] = '#include <Adafruit_BMP085.h>';
  Blockly.Cpp.definitions_['bmp180_obj'] = 'Adafruit_BMP085 bmp;';
  
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['wire_begin'] = 'Wire.begin(' + sdaPin + ', ' + sclPin + ');';
  Blockly.Cpp.setups_['bmp180_begin'] = 'if (!bmp.begin()) {\n    Serial.println("BMP180 sensor não encontrado!");\n    while (1) {}\n  }';
  
  return '';
};

// Gerador de código para leitura de pressão do BMP180
Blockly.Cpp['bmp180_pressure'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['bmp180'] = '#include <Adafruit_BMP085.h>';
  Blockly.Cpp.definitions_['bmp180_obj'] = 'Adafruit_BMP085 bmp;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['bmp180_begin'] = 'if (!bmp.begin()) {\n    Serial.println("BMP180 sensor não encontrado!");\n    while (1) {}\n  }';
  
  var code = 'bmp.readPressure()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Gerador de código para leitura de temperatura do BMP180
Blockly.Cpp['bmp180_temperature'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['bmp180'] = '#include <Adafruit_BMP085.h>';
  Blockly.Cpp.definitions_['bmp180_obj'] = 'Adafruit_BMP085 bmp;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['bmp180_begin'] = 'if (!bmp.begin()) {\n    Serial.println("BMP180 sensor não encontrado!");\n    while (1) {}\n  }';
  
  var code = 'bmp.readTemperature()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Gerador de código para leitura de altitude do BMP180
Blockly.Cpp['bmp180_altitude'] = function(block) {
  Blockly.Cpp.includes_['wire'] = '#include <Wire.h>';
  Blockly.Cpp.includes_['bmp180'] = '#include <Adafruit_BMP085.h>';
  Blockly.Cpp.definitions_['bmp180_obj'] = 'Adafruit_BMP085 bmp;';
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['bmp180_begin'] = 'if (!bmp.begin()) {\n    Serial.println("BMP180 sensor não encontrado!");\n    while (1) {}\n  }';
  
  var code = 'bmp.readAltitude()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// ============================================================================
// LIBRARY GENERATORS - GERADORES PARA BIBLIOTECAS
// ============================================================================

/**
 * C++ code generator for BMP180 library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_bmp180'] = function(block) {
  // Retorna o código das bibliotecas diretamente visível no editor
  var code = '#include <Wire.h>\n';
  code += '#include <Adafruit_BMP085.h>\n';
  code += '// Bibliotecas para sensor BMP180 (pressão, temperatura, altitude)\n\n';
  return code;
};

/**
 * C++ code generator for MPU6050 library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_mpu6050'] = function(block) {
  // Retorna o código das bibliotecas diretamente visível no editor
  var code = '#include <Wire.h>\n';
  code += '#include <Adafruit_MPU6050.h>\n';
  code += '// Bibliotecas para sensor MPU6050 (acelerômetro e giroscópio)\n\n';
  return code;
};

/**
 * C++ code generator for DHT library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_dht'] = function(block) {
  var dht_type = block.getFieldValue('TYPE');
  
  // Retorna o código das bibliotecas diretamente visível no editor
  var code = '#include <DHT.h>\n';
  code += '// Biblioteca para sensor ' + dht_type + ' (temperatura e umidade)\n\n';
  return code;
};

/**
 * C++ code generator for Wire library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_wire'] = function(block) {
  // Retorna o código da biblioteca diretamente visível no editor
  var code = '#include <Wire.h>\n';
  code += '// Biblioteca Wire para comunicação I2C\n\n';
  return code;
};

/**
 * C++ code generator for basic Arduino libraries inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_arduino_basic'] = function(block) {
  // Retorna o código das bibliotecas diretamente visível no editor
  var code = '#include <Arduino.h>\n';
  code += '// Bibliotecas básicas do Arduino\n\n';
  return code;
};

/**
 * C++ code generator for AdaFruit library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_adafruit'] = function(block) {
  // Retorna o código das bibliotecas diretamente visível no editor
  var code = '#include <Adafruit_Sensor.h>\n';
  code += 'Adafruit_MPU6050 mpu;\n';
  code += '// Biblioteca AdaFruit para sensor MPU6050\n\n';
  return code;
};

// ============================================================================
// DHT SENSOR GENERATORS - GERADORES PARA SENSORES DHT
// ============================================================================

/**
 * C++ code generator for DHT sensor initialization.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['dht_init'] = function(block) {
  var dht_type = block.getFieldValue('TYPE');
  var pin = block.getFieldValue('PIN');
  
  // Adiciona as bibliotecas necessárias
  Blockly.Cpp.includes_['dht'] = '#include <DHT.h>';
  
  // Define o tipo de sensor
  if (dht_type === 'DHT11') {
    Blockly.Cpp.definitions_['dht_type'] = '#define DHTTYPE DHT11';
  } else {
    Blockly.Cpp.definitions_['dht_type'] = '#define DHTTYPE DHT22';
  }
  
  // Define o pino e cria o objeto DHT
  Blockly.Cpp.definitions_['dht_pin'] = '#define DHTPIN ' + pin;
  Blockly.Cpp.definitions_['dht_obj'] = 'DHT dht(DHTPIN, DHTTYPE);';
  
  // Inicializa o sensor no setup
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['dht_begin'] = 'dht.begin();';
  
  var code = '// Sensor ' + dht_type + ' inicializado no pino ' + pin + '\n';
  return code;
};

/**
 * C++ code generator for DHT temperature reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['dht_temperature'] = function(block) {
  // Garante que as bibliotecas estão incluídas
  Blockly.Cpp.includes_['dht'] = '#include <DHT.h>';
  
  var code = 'dht.readTemperature()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for DHT humidity reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['dht_humidity'] = function(block) {
  // Garante que as bibliotecas estão incluídas
  Blockly.Cpp.includes_['dht'] = '#include <DHT.h>';
  
  var code = 'dht.readHumidity()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Geradores DHT definidos com sucesso

// ============================================================================
// ARDUINO STRUCTURE GENERATORS - GERADORES PARA ESTRUTURA ARDUINO
// ============================================================================

/**
 * C++ code generator for Arduino setup function.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['arduino_setup'] = function(block) {
  var setupCode = Blockly.Cpp.statementToCode(block, 'SETUP_CODE');
  var code = 'void setup() {\n' + setupCode + '}\n\n';
  return code;
};

/**
 * C++ code generator for Arduino loop function.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['arduino_loop'] = function(block) {
  var loopCode = Blockly.Cpp.statementToCode(block, 'LOOP_CODE');
  var code = 'void loop() {\n' + loopCode + '}\n\n';
  return code;
};

/**
 * C++ code generator for Serial.begin() function.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['arduino_serial_begin'] = function(block) {
  var baudRate = block.getFieldValue('BAUD_RATE');
  var code = 'Serial.begin(' + baudRate + ');\n';
  return code;
};

// Geradores de estrutura Arduino definidos com sucesso

// ============================================================================
// VERIFICATION AND INITIALIZATION - VERIFICAÇÃO E INICIALIZAÇÃO
// ============================================================================

/**
 * Ensure all library generators are properly defined
 */
function ensureLibraryGenerators() {
  console.log('🔧 Verificando geradores de biblioteca...');
  
  // Lista de geradores de biblioteca que devem existir
  var libraryGenerators = [
    'library_arduino_basic',
    'library_wire', 
    'library_bmp180',
    'library_mpu6050',
    'library_dht'
  ];
  
  libraryGenerators.forEach(function(generatorName) {
    if (!Blockly.Cpp[generatorName]) {
      console.error('❌ Gerador não encontrado:', generatorName);
    } else {
      console.log('✅ Gerador OK:', generatorName);
    }
  });
}

// Chamar verificação quando o documento estiver pronto
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(ensureLibraryGenerators, 100);
  });
}

// Verificação imediata também
setTimeout(ensureLibraryGenerators, 50);

// ============================================================================
// DELAY FUNCTION GENERATOR - GERADOR PARA BLOCO DE DELAY COM VALOR CONECTÁVEL
// ============================================================================

/**
 * C++ code generator for delay function block with connectable value.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['delay_function'] = function(block) {
  var delayTime = Blockly.Cpp.valueToCode(block, 'DELAY_TIME', Blockly.Cpp.ORDER_ATOMIC);
  if (!delayTime) {
    delayTime = '1000'; // Valor padrão se nenhum valor for conectado
  }
  return 'delay(' + delayTime + ');\n';
};