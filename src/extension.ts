import * as vscode from 'vscode';

interface FormatOptions {
    formatAssociativeArrayAlignment: boolean;
    formatBraces: boolean;
    formatComments: boolean;
    formatFunctionParams: boolean;
    formatKeywords: boolean;
    removeBlockInitEndEmptyLines: boolean;
    removeMultipleEmptyLines: boolean;
    removeUnnecessarySpacesParentheses: boolean;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Extensión PHP Clean Code activada');

    let disposable = vscode.commands.registerCommand('php-clean-code.format', () => {
        console.log('Comando format ejecutado');
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No hay editor activo');
            return;
        }
        
        const document = editor.document;
        const text = document.getText();
        
        console.log('Texto original:', text);

        const config = vscode.workspace.getConfiguration('php-clean-code');
        const options: FormatOptions = {
            formatAssociativeArrayAlignment: config.get('formatAssociativeArrayAlignment', true),
            formatBraces: config.get('formatBraces', true),
            formatComments: config.get('formatComments', true),
            formatFunctionParams: config.get('formatFunctionParams', true),
            formatKeywords: config.get('formatKeywords', true),
            removeBlockInitEndEmptyLines: config.get('removeBlockInitEndEmptyLines', true),
            removeMultipleEmptyLines: config.get('removeMultipleEmptyLines', true),
            removeUnnecessarySpacesParentheses: config.get('removeUnnecessarySpacesParentheses', true)
        };

        console.log('Opciones:', options);
        
        editor.edit(editBuilder => {
            const formatted = formatCode(text, options);
            console.log('Texto formateado:', formatted);
            
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            editBuilder.replace(fullRange, formatted);
        }).then(success => {
            if (success) {
                console.log('Formateo completado con éxito');
                vscode.window.showInformationMessage('Código formateado correctamente');
            } else {
                console.log('Error al formatear');
                vscode.window.showErrorMessage('Error al formatear el código');
            }
        });
    });

    context.subscriptions.push(disposable);
}

function formatCode(text: string, options: FormatOptions): string {
    let lines = text.trim().split('\n');
    
    // Formatea los comentarios
    if (options.formatComments) {
        lines = lines.map(line => {
            const indentMatch = line.match(/^\s*/);
            const indentation = indentMatch ? indentMatch[0] : '';
            return line.replace(/(?<![:\/\*])(\/\/)([^\s\t\/])/g, '$1 $2');
        });
    }
    
    // Elimina las múltiples líneas vacías consecutivas
    if (options.removeMultipleEmptyLines) {
        lines = lines.reduce((acc: string[], line: string) => {
            if (acc.length === 0 || !(line.trim() === '' && acc[acc.length - 1].trim() === '')) {
                acc.push(line);
            }
            return acc;
        }, []);
    }

    // Elimina las líneas vacías iniciales y finales de los bloques
    if (options.removeBlockInitEndEmptyLines) {
        for (let i = lines.length - 1; i >= 0; i--) {
            const currentLine = lines[i].trim();
            const prevLine = i > 0 ? lines[i - 1].trim() : '';
            const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

            if (currentLine === '' && (prevLine.endsWith('{') || nextLine.startsWith('}'))) {
                lines.splice(i, 1);
            }
        }
    }

    // Formatea arrays asociativos
    if (options.formatAssociativeArrayAlignment) {
        lines = formatAssociativeArrayBlocks(lines);
    }

    lines = lines.map(line => {
        const indentMatch = line.match(/^\s*/);
        const indentation = indentMatch ? indentMatch[0] : '';
        const trimmedLine = line.trim();

        if (/^\s*\)\s*$/.test(line)) {
            return line;
        }

        if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
            return line;
        }

        const parts = line.split(/(\/\/|\/\*|\*\/)/);
        let inComment = false;
        let inString = false;
        let stringChar = '';
        
        const formattedLine = parts.map((part, index) => {
            if (part === '/*') inComment = true;
            if (part === '*/') {
                inComment = false;
                return part;
            }
            
            if (inComment || part === '/*' || part === '*/' || part.includes('://')) {
                return part;
            }

            let formatted = '';
            for (let i = 0; i < part.length; i++) {
                const char = part[i];
                
                if ((char === '"' || char === "'") && !inString) {
                    inString = true;
                    stringChar = char;
                    formatted += char;
                    continue;
                }
                if (char === stringChar && inString) {
                    inString = false;
                    formatted += char;
                    continue;
                }
                if (inString) {
                    formatted += char;
                    continue;
                }

                formatted += char;
            }

            if (!inString) {
                // Elimina los espacios innecesarios en los paréntesis de apertura y cierre
                if (options.removeUnnecessarySpacesParentheses) {
                    formatted = formatted.replace(/\(\s+/g, '(');
                    formatted = formatted.replace(/\s+\)/g, ')');
                }

                // Formatea las llaves de apertura y cierre
                if (options.formatBraces) {
                    formatted = formatted.replace(/\)({)/g, ') $1');
                    formatted = formatted.replace(/}([^\s\t\n(:])/, '} $1');
                }

                // Formatea los parámetros de las funciones
                if (options.formatFunctionParams) {
                    formatted = formatted.replace(/\([^)]+\)/g, (match) => {
                        let inner = match.slice(1, -1);
                        inner = inner.replace(/\s*,\s*/g, ', ');
                        return `(${inner})`;
                    });
                }

                // Formatea las estructuras de control
                if (options.formatKeywords) {
                    // Formatea las estructuras de control genéricas
                    const keywords = ['if', 'else', 'elseif', 'switch', 'foreach', 'do', 'while', 'try', 'finally'];
                    keywords.forEach(keyword => {
                        const regex = new RegExp(`\\b${keyword}\\b(?!\\s)(?=\\s*[({])`, 'g');
                        formatted = formatted.replace(regex, `${keyword} `);
                    });

                    // Formatea la estructura de control for
                    formatted = formatted.replace(/\bfor\s*\([^)]+\)/g, (match) => {
                        if (match.match(/\bforeach\b/)) {
                            return match;
                        }
                        const innerMatch = match.match(/\((.*)\)/);
                        if (!innerMatch) return match;
                        
                        let inner = innerMatch[1];
                        inner = inner.replace(/\s*,\s*/g, ', ');
                        inner = inner.replace(/\s*;\s*/g, '; ');
                        return `for(${inner})`;
                    });

                    // Formatea el return
                    formatted = formatted.replace(/\breturn\b(?!\s)(?=[^\s;])/g, 'return ');
                }
            }

            return formatted;
        }).join('');

        return formattedLine.startsWith(indentation) ? formattedLine : indentation + formattedLine;
    });

    return lines.join('\n');
}

function formatAssociativeArrayBlocks(lines: string[]): string[] {
    let inArray = false;
    let arrayStartIndex = -1;
    let currentBlockKeys: string[] = [];
    let maxKeyLength = 0;

    const result = [...lines];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detectar inicio de array
        if (line.endsWith('[') || line.match(/array\s*\($/i)) {
            inArray = true;
            arrayStartIndex = i;
            currentBlockKeys = [];
            maxKeyLength = 0;
            continue;
        }

        // Detectar fin de array
        if (inArray && (line.startsWith(']') || line.startsWith(')'))) {
            // Aplicar formato al bloque actual
            if (currentBlockKeys.length > 0) {
                for (let j = arrayStartIndex + 1; j < i; j++) {
                    const currentLine = result[j];
                    const keyMatch = currentLine.match(/^\s*((['"])([^'"=>]+)\2|[^'"=>]+)\s*=>/);
                    
                    if (keyMatch) {
                        const indentationMatch = currentLine.match(/^\s*/);
                        const indentation = indentationMatch ? indentationMatch[0] : '';
                        const fullKey = keyMatch[1];  // Incluye las comillas si existen
                        const keyContent = keyMatch[3] || keyMatch[1];  // Contenido sin comillas
                        const afterArrow = currentLine.split('=>')[1];
                        
                        // Crear el padding necesario
                        const padding = ' '.repeat(maxKeyLength - keyContent.trim().length);
                        result[j] = `${indentation}${fullKey}${padding} =>${afterArrow}`;
                    }
                }
            }
            
            inArray = false;
            arrayStartIndex = -1;
            continue;
        }

        // Procesar líneas dentro del array
        if (inArray && line.includes('=>')) {
            const keyMatch = line.match(/^\s*((['"])([^'"=>]+)\2|[^'"=>]+)\s*=>/);
            if (keyMatch) {
                const keyContent = keyMatch[3] || keyMatch[1];  // Contenido sin comillas
                currentBlockKeys.push(keyContent.trim());
                maxKeyLength = Math.max(maxKeyLength, keyContent.trim().length);
            }
        }
    }

    return result;
}

export function deactivate() {}