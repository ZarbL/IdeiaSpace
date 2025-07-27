# Translation Guide

This guide explains how to add new languages to the IdeiaSpace platform.

## Supported Languages

- Portuguese (pt-BR) - Default
- English (en-US)

## Adding a New Language

1. Create a new JSON file in `src/renderer/locales/`
2. Follow the structure of existing language files
3. Add the language option to the interface
4. Update the i18n configuration

## File Structure

```
src/renderer/locales/
├── en-US.json
├── pt-BR.json
└── [new-language].json
```

## Translation Keys

### Common Keys
- `app.title` - Application title
- `menu.file` - File menu
- `menu.edit` - Edit menu
- `menu.view` - View menu
- `menu.help` - Help menu

### Block Categories
- `blocks.logic` - Logic blocks
- `blocks.loops` - Loop blocks
- `blocks.math` - Math blocks
- `blocks.text` - Text blocks
- `blocks.variables` - Variable blocks

## Guidelines

1. Keep translations concise and clear
2. Maintain consistency with technical terms
3. Consider cultural context
4. Test all translations in the interface
