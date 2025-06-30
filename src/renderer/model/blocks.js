/**
 * @license
 * Copyright 2024 IdeiaSpace
 * SPDX-License-Identifier: MIT
 */

/**
 * Custom blocks for C++ code generation.
 * @namespace Blockly.Blocks
 */

goog.provide('Blockly.Blocks');

goog.require('Blockly.Blocks');

// ============================================================================
// CUSTOM BLOCKS FOR C++
// ============================================================================

/**
 * Block for delay functionality.
 * @this {Blockly.Block}
 */
Blockly.Blocks['delay_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("delay")
        .appendField(new Blockly.FieldNumber(1000, 0, 60000, 100), "DELAY_TIME")
        .appendField("milliseconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Delay execution for specified milliseconds");
    this.setHelpUrl("");
  }
};

/**
 * Block for digital write functionality.
 * @this {Blockly.Block}
 */
Blockly.Blocks['digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("digital write pin")
        .appendField(new Blockly.FieldDropdown([
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["5", "5"],
          ["6", "6"],
          ["7", "7"],
          ["8", "8"],
          ["9", "9"],
          ["10", "10"],
          ["11", "11"],
          ["12", "12"],
          ["13", "13"]
        ]), "PIN")
        .appendField("to")
        .appendField(new Blockly.FieldDropdown([
          ["HIGH", "HIGH"],
          ["LOW", "LOW"]
        ]), "STATE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Set digital pin to HIGH or LOW");
    this.setHelpUrl("");
  }
};

/**
 * Block for digital read functionality.
 * @this {Blockly.Block}
 */
Blockly.Blocks['digital_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("digital read pin")
        .appendField(new Blockly.FieldDropdown([
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["5", "5"],
          ["6", "6"],
          ["7", "7"],
          ["8", "8"],
          ["9", "9"],
          ["10", "10"],
          ["11", "11"],
          ["12", "12"],
          ["13", "13"]
        ]), "PIN");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("Read digital pin value (HIGH or LOW)");
    this.setHelpUrl("");
  }
};

/**
 * Block for variable declaration with type.
 * @this {Blockly.Block}
 */
Blockly.Blocks['variable_declaration'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("declarar")
        .appendField(new Blockly.FieldDropdown([
          ["int", "int"],
          ["double", "double"],
          ["string", "std::string"],
          ["bool", "bool"]
        ]), "TYPE")
        .appendField(new Blockly.FieldVariable("variavel"), "VAR");
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("=");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Declara uma nova variável com tipo específico");
    this.setHelpUrl("");
  }
};

/**
 * Block for reading MPU6050 sensor values.
 * @this {Blockly.Block}
 */
Blockly.Blocks['mpu6050_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Ler MPU6050')
        .appendField(new Blockly.FieldDropdown([
          ['Aceleração X', 'ACCEL_X'],
          ['Aceleração Y', 'ACCEL_Y'],
          ['Aceleração Z', 'ACCEL_Z'],
          ['Giro X', 'GYRO_X'],
          ['Giro Y', 'GYRO_Y'],
          ['Giro Z', 'GYRO_Z']
        ]), 'MPU6050_AXIS');
    this.setOutput(true, 'Number');
    this.setColour(210);
    this.setTooltip('Lê um valor do sensor MPU6050');
    this.setHelpUrl('https://bipes.net.br');
  }
};