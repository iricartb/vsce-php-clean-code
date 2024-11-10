# PHP Clean Code

A VS Code extension for formatting PHP code.

## Features

- Format comments
- Removes multiple consecutive empty lines
- Removes empty lines inside the blocks at the beginning and at the end
- Removes unnecessary spaces in opening and closing parentheses
- Format opening and closing braces
- Format function parameters
- Format control structures

## Usage

1. Open a PHP file
2. Right click and select "PHP Clean Code"
3. Or use the command palette (Ctrl+Shift+P) and search for "PHP Clean Code"

## Settings

This extension contributes the following settings:
* `php-clean-code.formatComments`: Format comments
* `php-clean-code.removeMultipleEmptyLines`: Removes multiple consecutive empty lines
* `php-clean-code.removeBlockInitEndEmptyLines`: Removes empty lines inside the blocks at the beginning and at the end
* `php-clean-code.formatParentheses`: Removes unnecessary spaces in opening and closing parentheses
* `php-clean-code.formatBraces`: Format opening and closing braces
* `php-clean-code.formatFunctionParams`: Format function parameters
* `php-clean-code.formatKeywords`: Format control structures

## Requirements

* Visual Studio Code 1.75.0 or higher
* PHP files

## Release Notes

### 1.0.0

Initial Release of PHP Clean Code

### 2.0.0

Fix several bugs and improve the extension