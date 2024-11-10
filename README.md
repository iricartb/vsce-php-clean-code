![Icon](resources/icon.png)

# PHP Clean Code

Visual Studio Code Extension designed to help PHP developers keep their code clean, readable, and consistent

![Code](resources/code.png)

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
2. Right click and select "PHP Clean Code" or use the command palette (Ctrl+Shift+P) and search for "PHP Clean Code"

## Settings

This extension contributes the following settings:
<span style="color: yellow;">`php-clean-code.formatComments`</span>: Format comments
<span style="color: yellow;">`php-clean-code.removeMultipleEmptyLines`</span>: Removes multiple consecutive empty lines
<span style="color: yellow;">`php-clean-code.removeBlockInitEndEmptyLines`</span>: Removes empty lines inside the blocks at the beginning and at the end
<span style="color: yellow;">`php-clean-code.formatParentheses`</span>: Removes unnecessary spaces in opening and closing parentheses
<span style="color: yellow;">`php-clean-code.formatBraces`</span>: Format opening and closing braces
<span style="color: yellow;">`php-clean-code.formatFunctionParams`</span>: Format function parameters
<span style="color: yellow;">`php-clean-code.formatKeywords`</span>: Format control structures

## Requirements

* Visual Studio Code 1.75.0 or higher
* PHP files