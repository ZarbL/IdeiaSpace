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
 * C++ code generator for Text Print block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['text_print'] = function(block) {
  var msg = Blockly.Cpp.valueToCode(block, 'TEXT',
    Blockly.Cpp.ORDER_NONE) || '""';
  var addNewline = block.getFieldValue('ADD_NEWLINE') == 'TRUE';
  
  if (addNewline) {
    return 'Serial.println(' + msg + ');\n';
  } else {
    return 'Serial.print(' + msg + ');\n';
  }
};

/**
 * C++ code generator for Text block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['text'] = function(block) {
  var code = '"' + block.getFieldValue('TEXT') + '"';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for Text Join block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['text_join'] = function(block) {
  var argument0 = Blockly.Cpp.valueToCode(block, 'A', Blockly.Cpp.ORDER_NONE) || '""';
  var argument1 = Blockly.Cpp.valueToCode(block, 'B', Blockly.Cpp.ORDER_NONE) || '""';
  var code = 'String(' + argument0 + ') + String(' + argument1 + ')';
  return [code, Blockly.Cpp.ORDER_ADDITIVE];
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
  
  // Generate inline code where the block is positioned for educational purposes
  return varType + ' ' + varName + ' = ' + value + ';\n';
};

/**
 * C++ code generator for integer variable declaration block - Arduino style.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['int_declaration'] = function(block) {
  var varName = block.getFieldValue('VAR_NAME');
  var value = Blockly.Cpp.valueToCode(block, 'VALUE', Blockly.Cpp.ORDER_ASSIGNMENT) || '0';
  
  // Validar nome da variável
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
    console.warn('Nome de variável inválido:', varName);
    varName = 'var_' + varName.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  
  // Generate inline code where the block is positioned for educational purposes
  return 'int ' + varName + ' = ' + value + ';\n';
};

/**
 * C++ code generator for integer variable get block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['int_variable_get'] = function(block) {
  var varName = block.getFieldValue('VAR_NAME');
  
  // Validar nome da variável
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
    console.warn('Nome de variável inválido:', varName);
    varName = 'var_' + varName.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  
  return [varName, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for integer variable set block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['int_variable_set'] = function(block) {
  var varName = block.getFieldValue('VAR_NAME');
  var value = Blockly.Cpp.valueToCode(block, 'VALUE', Blockly.Cpp.ORDER_ASSIGNMENT) || '0';
  
  // Validar nome da variável
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
    console.warn('Nome de variável inválido:', varName);
    varName = 'var_' + varName.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  
  return varName + ' = ' + value + ';\n';
};

/**
 * C++ code generator for float variable declaration block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['float_declaration'] = function(block) {
  var varName = block.getFieldValue('VAR_NAME');
  var value = Blockly.Cpp.valueToCode(block, 'VALUE', Blockly.Cpp.ORDER_ASSIGNMENT) || '0.0';
  
  // Validar nome da variável
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
    console.warn('Nome de variável inválido:', varName);
    varName = 'var_' + varName.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  
  // Generate inline code where the block is positioned for educational purposes
  return 'float ' + varName + ' = ' + value + ';\n';
};

/**
 * C++ code generator for boolean variable declaration block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['bool_declaration'] = function(block) {
  var varName = block.getFieldValue('VAR_NAME');
  var value = Blockly.Cpp.valueToCode(block, 'VALUE', Blockly.Cpp.ORDER_ASSIGNMENT) || 'false';
  
  // Validar nome da variável
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
    console.warn('Nome de variável inválido:', varName);
    varName = 'var_' + varName.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  
  // Generate inline code where the block is positioned for educational purposes
  return 'bool ' + varName + ' = ' + value + ';\n';
};

/**
 * C++ code generator for String variable declaration block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['string_declaration'] = function(block) {
  var varName = block.getFieldValue('VAR_NAME');
  var value = Blockly.Cpp.valueToCode(block, 'VALUE', Blockly.Cpp.ORDER_ASSIGNMENT) || '""';
  
  // Validar nome da variável
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
    console.warn('Nome de variável inválido:', varName);
    varName = 'var_' + varName.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  
  // Generate inline code where the block is positioned for educational purposes
  return 'String ' + varName + ' = ' + value + ';\n';
};

// Gerador de código para o bloco MPU6050
Blockly.Cpp['mpu6050_read'] = function(block) {
  var axis = block.getFieldValue('MPU6050_AXIS');
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = '';
  switch(axis) {
    case 'ACCEL_X': code = 'a.acceleration.x'; break;
    case 'ACCEL_Y': code = 'a.acceleration.y'; break;
    case 'ACCEL_Z': code = 'a.acceleration.z'; break;
    case 'GYRO_X': code = 'g.gyro.x'; break;
    case 'GYRO_Y': code = 'g.gyro.y'; break;
    case 'GYRO_Z': code = 'g.gyro.z'; break;
  }
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Gerador de código para inicialização do MPU6050
Blockly.Cpp['mpu6050_init'] = function(block) {
  // Gera apenas a declaração do objeto MPU6050
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'Adafruit_MPU6050 mpu;\n';
  
  return code;
};

// Geradores específicos para cada eixo de aceleração
Blockly.Cpp['mpu6050_accel_x'] = function(block) {
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'a.acceleration.x';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_accel_y'] = function(block) {
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'a.acceleration.y';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_accel_z'] = function(block) {
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'a.acceleration.z';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Geradores específicos para cada eixo de giroscópio
Blockly.Cpp['mpu6050_gyro_x'] = function(block) {
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'g.gyro.x';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_gyro_y'] = function(block) {
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'g.gyro.y';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['mpu6050_gyro_z'] = function(block) {
  // Não gerar bibliotecas automaticamente - usuário deve usar a aba Bibliotecas
  var code = 'g.gyro.z';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * Generator for MPU6050 accelerometer range configuration.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['mpu6050_set_accel_range'] = function(block) {
  var accelRange = block.getFieldValue('ACCEL_RANGE');
  var code = 'mpu.setAccelerometerRange(' + accelRange + ');\n';
  return code;
};

/**
 * Generator for MPU6050 gyroscope range configuration.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['mpu6050_set_gyro_range'] = function(block) {
  var gyroRange = block.getFieldValue('GYRO_RANGE');
  var code = 'mpu.setGyroRange(' + gyroRange + ');\n';
  return code;
};

/**
 * Generator for MPU6050 filter bandwidth configuration.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['mpu6050_set_filter_bandwidth'] = function(block) {
  var filterBandwidth = block.getFieldValue('FILTER_BANDWIDTH');
  var code = 'mpu.setFilterBandwidth(' + filterBandwidth + ');\n';
  return code;
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
// BH1750 CODE GENERATORS - Sensor de Luminosidade
// ============================================================================

// Gerador de código para inicialização do BH1750
Blockly.Cpp['bh1750_init'] = function(block) {
  var sclPin = block.getFieldValue('SCL_PIN');
  var sdaPin = block.getFieldValue('SDA_PIN');
  
  // Gera a declaração do objeto BH1750
  var code = 'BH1750 lightMeter;\n';
  
  // Configura setup automático para Wire e inicialização
  Blockly.Cpp.setups_ = Blockly.Cpp.setups_ || {};
  Blockly.Cpp.setups_['wire_begin'] = 'Wire.begin(' + sdaPin + ', ' + sclPin + ');';
  Blockly.Cpp.setups_['bh1750_begin'] = 'if (!lightMeter.begin()) {\n    Serial.println("BH1750 sensor não encontrado!");\n    while (1) {}\n  }';
  
  return code;
};

// Gerador de código para leitura de luminosidade do BH1750
Blockly.Cpp['bh1750_light_level'] = function(block) {
  // Não gerar declaração automática - deve ser feita pela biblioteca
  var code = 'lightMeter.readLightLevel()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

// Gerador de código para configuração do modo BH1750
Blockly.Cpp['bh1750_set_mode'] = function(block) {
  var mode = block.getFieldValue('MODE');
  // Não gerar declaração automática - deve ser feita pela biblioteca
  var code = 'lightMeter.configure(' + mode + ');\n';
  return code;
};

// Gerador de código para início da comunicação BH1750
Blockly.Cpp['bh1750_begin'] = function(block) {
  // Gera código para inicializar Wire e BH1750
  var code = 'Wire.begin();\n';
  code += 'lightMeter.begin();\n';
  return code;
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
  // Retorna apenas a biblioteca Adafruit_BMP180
  var code = '#include <Adafruit_BMP180.h>\n';
  code += '// Bibliotecas para sensor BMP180 (pressão, temperatura, altitude)\n\n';
  return code;
};

/**
 * C++ code generator for MPU6050 library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_mpu6050'] = function(block) {
  // Retorna apenas a biblioteca Adafruit_MPU6050
  var code = '#include <Adafruit_MPU6050.h>\n';
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
Blockly.Cpp['library_sensor'] = function(block) {
  // Retorna apenas a biblioteca Adafruit_Sensor
  var code = '#include <Adafruit_Sensor.h>\n';
  code += '// Biblioteca AdaFruit para sensores\n\n';
  return code;
};

/**
 * C++ code generator for BH1750 library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_bh1750'] = function(block) {
  // Retorna apenas a biblioteca BH1750 específica + declaração do objeto
  var code = '#include <BH1750.h>\n';
  code += '// Biblioteca para sensor BH1750 (luminosidade)\n\n';
  return code;
};

/**
 * C++ code generator for HMC5883 library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_hmc5883'] = function(block) {
  // Retorna a biblioteca HMC5883 para magnetômetro/bússola
  var code = '#include <Adafruit_HMC5883_U.h>\n';
  code += '// Biblioteca para sensor HMC5883 (magnetômetro/bússola)\n\n';
  return code;
};

/**
 * C++ code generator for Math library inclusion.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['library_math'] = function(block) {
  // Retorna a biblioteca math.h para constantes matemáticas
  var code = '#include <math.h>\n';
  code += '// Biblioteca para constantes matemáticas (PI, funções trigonométricas, etc.)\n\n';
  return code;
};

/**
 * C++ code generator for DHT sensor initialization.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['dht_init'] = function(block) {
  var dht_type = block.getFieldValue('TYPE');
  var pin = block.getFieldValue('PIN');
  
  // Gera o código na sequência dos blocos
  var code = '';
  
  // Define o tipo de sensor
  if (dht_type === 'DHT11') {
    code += '#define DHTTYPE DHT11\n';
  } else {
    code += '#define DHTTYPE DHT22\n';
  }
  
  // Define o pino e cria o objeto DHT
  code += '#define DHTPIN ' + pin + '\n';
  code += 'DHT dht(DHTPIN, DHTTYPE);\n\n';
  
  code += '// Sensor ' + dht_type + ' inicializado no pino ' + pin + '\n';
  return code;
};

/**
 * C++ code generator for DHT temperature reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['dht_temperature'] = function(block) {
  var code = 'dht.readTemperature()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for DHT humidity reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['dht_humidity'] = function(block) {
  var code = 'dht.readHumidity()';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for DHT begin initialization.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['dht_begin'] = function(block) {
  var code = 'dht.begin();\n';
  return code;
};

/**
 * C++ code generator for DHT heat index calculation.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code and the operator order.
 */
Blockly.Cpp['dht_heat_index'] = function(block) {
  var temperature = Blockly.Cpp.valueToCode(block, 'TEMPERATURE', Blockly.Cpp.ORDER_ATOMIC) || '0';
  var humidity = Blockly.Cpp.valueToCode(block, 'HUMIDITY', Blockly.Cpp.ORDER_ATOMIC) || '0';
  var unit = Blockly.Cpp.valueToCode(block, 'UNIT', Blockly.Cpp.ORDER_ATOMIC) || 'false';
  
  var code = 'dht.computeHeatIndex(' + temperature + ', ' + humidity + ', ' + unit + ')';
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
 * C++ code generator for void displaySensorDetails() function.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['void_display'] = function(block) {
  var displayCode = Blockly.Cpp.statementToCode(block, 'DISPLAY_CODE');
  var code = 'void displaySensorDetails(void) {\n' + displayCode + '}\n\n';
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

/**
 * C++ code generator for !Serial condition check.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order of operations.
 */
Blockly.Cpp['serial_not'] = function(block) {
  // Retorna !Serial como condição booleana
  var code = '!Serial';
  return [code, Blockly.Cpp.ORDER_LOGICAL_NOT];
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
    'library_math',
    'library_sensor',
    'library_bmp180',
    'library_bh1750',
    'library_mpu6050',
    'library_dht',
    'library_hmc5883'
  ];
  
  libraryGenerators.forEach(function(generatorName) {
    if (!Blockly.Cpp[generatorName]) {
      console.error('❌ Gerador não encontrado:', generatorName);
    } else {
      console.log('✅ Gerador OK:', generatorName);
    }
  });
}

/**
 * Verify all HMC5883 generators are properly defined
 */
function ensureHMC5883Generators() {
  console.log('🧭 Verificando geradores HMC5883...');
  
  // Lista de todos os geradores HMC5883
  var hmc5883Generators = [
    'hmc5883_init',
    'hmc5883_begin',
    'hmc5883_mag_x',
    'hmc5883_mag_y',
    'hmc5883_mag_z',
    'hmc5883_heading',
    'hmc5883_set_gain',
    'hmc5883_event_declare',
    'hmc5883_get_event',
    'hmc5883_declination',
    'hmc5883_direction_text',
    'hmc5883_sensor_object',
    'hmc5883_field_strength',
    'hmc5883_sensor_info',
    'hmc5883_display_sensor'
  ];
  
  hmc5883Generators.forEach(function(generatorName) {
    if (!Blockly.Cpp[generatorName]) {
      console.error('❌ Gerador HMC5883 não encontrado:', generatorName);
    } else {
      console.log('✅ Gerador HMC5883 OK:', generatorName);
    }
  });
}

// Chamar verificação quando o documento estiver pronto
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      ensureLibraryGenerators();
      ensureHMC5883Generators();
    }, 100);
  });
}

// Verificação imediata também
setTimeout(function() {
  ensureLibraryGenerators();
  ensureHMC5883Generators();
}, 50);

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

/**
 * Generator for Boolean block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['math_boolean'] = function(block) {
  var boolValue = block.getFieldValue('BOOL_VALUE');
  var code = boolValue;
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * Generator for Pi mathematical constant block.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['math_pi'] = function(block) {
  var piValue = block.getFieldValue('PI_VALUE');
  var code = piValue;
  // Não gerar biblioteca automaticamente - usuário deve usar a aba Bibliotecas
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * Generator for MPU6050 sensors event variables declaration.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['mpu6050_sensors_event'] = function(block) {
  var code = 'sensors_event_t a, g, temp;\n';
  return code;
};

/**
 * Generator for MPU6050 get event function.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['mpu6050_get_event'] = function(block) {
  var code = 'mpu.getEvent(&a, &g, &temp);\n';
  return code;
};

// ============================================================================
// GERADORES C++ PARA BLOCOS HMC5883 - MAGNETÔMETRO/BÚSSOLA
// ============================================================================

/**
 * C++ code generator for HMC5883 initialization.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_init'] = function(block) {
  var scl_pin = block.getFieldValue('SCL_PIN');
  var sda_pin = block.getFieldValue('SDA_PIN');
  
  var code = '// Inicialização HMC5883 - Pinos SCL: ' + scl_pin + ', SDA: ' + sda_pin + '\n';
  //code += 'Wire.begin(' + sda_pin + ', ' + scl_pin + ');\n';
  code += 'Adafruit_HMC5883_Unified mag = Adafruit_HMC5883_Unified(12345);\n';
  return code;
};

/**
 * C++ code generator for HMC5883 begin.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_begin'] = function(block) {
  var code = 'if(!mag.begin()) {\n';
  code += '  Serial.println("Erro: HMC5883 não detectado!");\n';
  code += '  while(1);\n';
  code += '}\n';
  return code;
};

/**
 * C++ code generator for HMC5883 magnetic field X reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_mag_x'] = function(block) {
  var code = 'event.magnetic.x';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for HMC5883 magnetic field Y reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_mag_y'] = function(block) {
  var code = 'event.magnetic.y';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for HMC5883 magnetic field Z reading.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_mag_z'] = function(block) {
  var code = 'event.magnetic.z';
  return [code, Blockly.Cpp.ORDER_ATOMIC];
};

/**
 * C++ code generator for HMC5883 compass heading calculation.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_heading'] = function(block) {
  var code = '(atan2(event.magnetic.y, event.magnetic.x) * 180 / M_PI)';
  return [code, Blockly.Cpp.ORDER_MULTIPLICATIVE];
};

/**
 * C++ code generator for HMC5883 gain setting.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_set_gain'] = function(block) {
  var gain = block.getFieldValue('GAIN');
  var code = 'mag.setMagGain(' + gain + ');\n';
  return code;
};

/**
 * C++ code generator for HMC5883 event declaration.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_event_declare'] = function(block) {
  var code = 'sensors_event_t event;\n';
  return code;
};

/**
 * C++ code generator for HMC5883 get event.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_get_event'] = function(block) {
  var code = 'mag.getEvent(&event);\n';
  return code;
};

/**
 * C++ code generator for magnetic declination angle.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_declination'] = function(block) {
  var declination = block.getFieldValue('DECLINATION');
  var code = '(' + declination + ' * M_PI / 180.0)';
  return [code, Blockly.Cpp.ORDER_MULTIPLICATIVE];
};

/**
 * C++ code generator for compass direction text.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_direction_text'] = function(block) {
  var heading = Blockly.Cpp.valueToCode(block, 'HEADING', Blockly.Cpp.ORDER_NONE) || '0';
  
  var code = '((' + heading + ' >= 337.5 || ' + heading + ' < 22.5) ? "N" : ' +
             '(' + heading + ' >= 22.5 && ' + heading + ' < 67.5) ? "NE" : ' +
             '(' + heading + ' >= 67.5 && ' + heading + ' < 112.5) ? "E" : ' +
             '(' + heading + ' >= 112.5 && ' + heading + ' < 157.5) ? "SE" : ' +
             '(' + heading + ' >= 157.5 && ' + heading + ' < 202.5) ? "S" : ' +
             '(' + heading + ' >= 202.5 && ' + heading + ' < 247.5) ? "SW" : ' +
             '(' + heading + ' >= 247.5 && ' + heading + ' < 292.5) ? "W" : "NW")';
  
  return [code, Blockly.Cpp.ORDER_CONDITIONAL];
};

/**
 * C++ code generator for HMC5883 sensor object declaration.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_sensor_object'] = function(block) {
    var code = 'sensor_t sensor;\n';
    code += 'mag.getSensor(&sensor);\n';
  return code;
};

/**
 * C++ code generator for magnetic field strength calculation.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_field_strength'] = function(block) {
  var code = 'sqrt(pow(event.magnetic.x, 2) + pow(event.magnetic.y, 2) + pow(event.magnetic.z, 2))';
  return [code, Blockly.Cpp.ORDER_UNARY_PREFIX];
};

/**
 * C++ code generator for HMC5883 sensor information.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Generated C++ code with order.
 */
Blockly.Cpp['hmc5883_sensor_info'] = function(block) {
  var infoType = block.getFieldValue('INFO_TYPE');
  var code = '';
  
  switch(infoType) {
    case 'sensor_name':
      code = 'sensor.name';
      break;
    case 'sensor_version':
      code = 'sensor.version';
      break;
    case 'sensor_id':
      code = 'sensor.sensor_id';
      break;
    case 'sensor_min_value':
      code = 'sensor.min_value';
      break;
    case 'sensor_max_value':
      code = 'sensor.max_value';
      break;
    case 'sensor_resolution':
      code = 'sensor.resolution';
      break;
    default:
      code = 'sensor.name';
  }
  
  return [code, Blockly.Cpp.ORDER_MEMBER];
};

/**
 * C++ code generator for HMC5883 display sensor details.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Generated C++ code.
 */
Blockly.Cpp['hmc5883_display_sensor'] = function(block) {
  var code = 'displaySensorDetails();\n';
  return code;
};

// Fim dos geradores HMC5883