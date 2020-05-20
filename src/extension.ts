// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {window, env, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, Uri, Range, commands, TextEditor, languages, Hover} from 'vscode';
import * as path from 'path';
import { totalmem } from 'os';

//let ucd, enc;

function encodeDec(decs: number[], func: (number) => string) {
    let res = '';
    for (var i in decs) res += func(decs[i]);
    return res;
}

function encodeHex(hexs: string[], func: (string) => string) {
    let res = '';
    for (var i in hexs) res += func(hexs[i]);
    return res;
}

function toUTF8(code: number) {
    if (code <= 0x7f) return '\\x' + toHex(code, 2);
    if (code <= 0x7ff) return '\\x' + toHex((code >> 6) | 0xc0, 2) + '\\x' + toHex((code & 0x3f) | 0x80, 2);
    if (code <= 0xffff) return '\\x' + toHex((code >> 12) | 0xe0, 2) + 
        '\\x' + toHex(((code >> 6) & 0x3f) | 0x80, 2) + '\\x' + toHex((code & 0x3f) | 0x80, 2);
    return '\\x' + toHex((code >> 18) | 0xf0, 2) + '\\x' + toHex(((code >> 12) & 0x3f) | 0x80, 2) +
        '\\x' + toHex(((code >> 6) & 0x3f) | 0x80, 2) + '\\x' + toHex((code & 0x3f) | 0x80, 2);

    //if (code >= 0x10000) return '\\x' + toHex((n & 0x07) | 0xf0, 2) + res;
    //if (code >= 0x800) return '\\x' + toHex((n & 0x0f) | 0xe0, 2) + res;
    //return '\\x' + toHex((n & 0x1f) | 0xc0, 2) + res;
}

const cidRangeData = {
    'aj': [8283, 8358, 8719, 9353, 15443, 20316, 23057, 23059],
    'ac': [14098, 17407, 17600, 18845, 18964, 19087, 19155, 19178],
    'ag': [7716, 9896, 22126, 22352, 29063, 30283],
    'aks': [9332, 18154, 18351],
    'ak': [3058, 4636, 11450, 11730, 11877, 12234, 14237, 18857, 22479, 22896]
};

function cidRange(ro, cid) {
    for (var i=0; i<cidRangeData[ro].length; i++) {
        if (cid <= cidRangeData[ro][i]) return i+'';
    }
}


// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
    let charCodeDisplay = new CharCodeDisplay();
    let controller = new CharCodeController(charCodeDisplay);

    const ucd = require(context.asAbsolutePath(path.join('resource', 'ucd.json')));
    const enc = require(context.asAbsolutePath(path.join('resource', 'encodings.json')));

    let makeCodeHover = function(title: string, u: string, type: string) {
        u = u.toUpperCase();
        let c = String.fromCodePoint(parseInt(u, 16));
        let n = null;
        if (ucd.codes[u]) {
            n = ucd.codes[u];
        } else {
            for (var rn in ucd.ranges) {
                if (u >= ucd.ranges[rn][0] && u <= ucd.ranges[rn][1]) n = rn;
            }
        }
        return new Hover(`${title} **${c}**\n\nU+${u} in *${type}*\n\n**${n}**`);
    };

    let createCharNameList = function() {
        var res = [];
        var tmp = {};
        for (var c in ucd.codes) tmp[c] = ucd.codes[c];
        for (var c in enc) {
            if (! enc[c].nn) continue;
            if (tmp[c]) tmp[c] += ' / ' + enc[c].nn; else tmp[c] = enc[c].nn;
        }
        
        for (var c in tmp) if (c.length == 4)
            res.push({label: tmp[c] + ' (' + String.fromCodePoint(parseInt(c, 16)) + ')', description: 'U+' + c});
        for (var c in tmp) if (c.length == 5)
            res.push({label: tmp[c] + ' (' + String.fromCodePoint(parseInt(c, 16)) + ')', description: 'U+' + c});
        return res;
    };

    const charNames = createCharNameList();
    //console.log(charNames.length);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(charCodeDisplay);

    context.subscriptions.push(
        commands.registerCommand('cursorCharcode.detailUnicodeInfo', async () => {
            if (charCodeDisplay.unicodeDecList.length == 0) return;


            let chars = charCodeDisplay.characters;
            let decs = charCodeDisplay.unicodeDecList;
            let hexs = charCodeDisplay.unicodeHexList;

            //surrogate pairs
            let sdecs = [];
            let shexs = [];
            for (let i=0; i < chars.length; i++) {
                let code = chars.charCodeAt(i);
                sdecs.push(code);
                shexs.push(toHex(code, 4));
            }
            
            let list = [
                { label: encodeHex(hexs, (u) => 'U+' + u + ' '), description: 'Unicode' },
                { label: encodeDec(decs, (u) => toUTF8(u)), description: 'UTF-8' },
                { label: encodeHex(shexs, (u) => '\\u' + u), description: 'UTF-16' },
                { label: encodeDec(decs, (u) => '&#' + u + ';'), description: 'HTML Entity Reference' },
                //{ label: encodeHex(hexs, (u) => '&#x' + u + ';'), description: 'Entity Reference' },
                { label: encodeURIComponent(chars), description: 'URL Encode' }
            ];

            let nameList = encodeHex(hexs, (u) => {
                if (ucd.codes[u]) return ' / ' + ucd.codes[u];
                for (var rn in ucd.ranges) {
                    if (u >= ucd.ranges[rn][0] && u <= ucd.ranges[rn][1]) return ' / ' + rn;
                }
            });
            list.push({ label: nameList.substring(3), description: 'Unicode Name' });

            var h = hexs[0];
            if (enc[h]) {
                if (enc[h].b5) list.push({ label: '0x' + enc[h].b5, description: 'Big5' });
                if (enc[h].mb) list.push({ label: '0x' + enc[h].mb, description: 'Big5 (Mac)' });
                if (enc[h].hk) list.push({ label: '0x' + enc[h].hk, description: 'Big5-HKSCS' });
                if (enc[h].ua) list.push({ label: '0x' + enc[h].ua, description: 'Big5-UAO' });
                if (enc[h].sj) list.push({ label: '0x' + enc[h].sj, description: 'ShiftJIS' });
                if (enc[h].mj) list.push({ label: '0x' + enc[h].mj, description: 'ShiftJIS (Mac)' });
                if (enc[h].gb) list.push({ label: '0x' + enc[h].gb, description: 'GBK' });
                if (enc[h].ks) list.push({ label: '0x' + enc[h].ks, description: 'KS (Wansung)' });
                if (enc[h].aj) list.push({ label: '/' + enc[h].aj, description: 'Adobe-Japan1-' + cidRange('aj', enc[h].aj) });
                if (enc[h].ajn) list.push({ label: '/' + enc[h].ajn, description: 'Adobe-Japan1-' + cidRange('aj', enc[h].ajn) + 'N' });
                if (enc[h].ac) list.push({ label: '/' + enc[h].ac, description: 'Adobe-CNS1-' + cidRange('ac', enc[h].ac) });
                if (enc[h].ag) list.push({ label: '/' + enc[h].ag, description: 'Adobe-GB1-' + cidRange('ag', enc[h].ag) });
                if (enc[h].ak) list.push({ label: '/' + enc[h].ak, description: 'Adobe-KR-' + cidRange('ak', enc[h].ak) });
                if (enc[h].aks) list.push({ label: '/' + enc[h].aks, description: 'Adobe-Korea1-' + cidRange('aks', enc[h].aks) });
            }

            let glist = encodeHex(hexs, (u) => {
                if (enc[u] && enc[u].nn) return ', ' + enc[u].nn;
                if (u.length == 4 && u >= 'FE00' && u <= 'FE0f') return '';     // Variation Selectors (SVS)
                if (u.length == 5 &&u >= 'E0100' && u <= 'E01EF') return '';    // Variation Selectors Supplement (IVS)
                return u.length == 4 ? ', uni' + u : ', u' + u;
            });
            list.push({ label: glist.substring(2), description: 'Glyphs Nice Name' });
            //for (var i in hexs) {
            //    list.push({ label: "More about U+" + hexs[i] + "...", description: 'Open Browser' });
            //}

            //window.showInformationMessage(charCodeDisplay.hexCode);
            let val = await window.showQuickPick(list, {placeHolder: 'Select to copy'});
            if (val) {
                if (val.description == 'Glyphs Nice Name') {
                    env.clipboard.writeText(val.label.replace(/, /g, "\n"));
                //} else if (val.description == 'Open Browser') {
                //    if (val.label.match(/U\+([0-9A-F]+)/)) 
                //        commands.executeCommand('avscode.open', Uri.parse('https://unicode-table.com/en/' + RegExp.$1));
                } else {
                    env.clipboard.writeText(val.label);
                }
            }
        })
    );

    context.subscriptions.push(
        commands.registerCommand('cursorCharcode.queryUnicodeChar', async () => {
            let val = await window.showQuickPick(charNames, {placeHolder: 'Input keywords to search character'});
            if (val) {
                var editor = window.activeTextEditor;
                editor.edit(function(edit) {
                    edit.delete(editor.selection);
                }).then(function() {
                    editor.edit(function(edit) {
                        edit.insert(editor.selection.start, String.fromCodePoint(parseInt(val.description.substring(2), 16)));
                    });
                });
            }
        })
    );

    context.subscriptions.push(
        languages.registerHoverProvider('*', {
            provideHover(document, position, token) {
                let r = document.getWordRangeAtPosition(position, /&#([0-9A-Fa-fx]+);/i);
                let w = null;
                if (r) {
                    w = document.getText(r);
                    if (w.match(/&#(\d+);/)) {
                        let u = parseInt(RegExp.$1, 10);
                        return makeCodeHover(`&amp;#${u};`, toHex(u, 4), 'HTML Entity Reference (Decimal)');
                    } else if (w.match(/&#x([0-9A-F]+);/)) {
                        let u = RegExp.$1;
                        return makeCodeHover(`&amp;#x${u};`, u, 'HTML Entity Reference (HEX)');
                    } 
                }

                r = document.getWordRangeAtPosition(position, /U\+([0-9A-Fa-f]{4,5})/);
                if (r) {
                    //w = document.getText(r);
                    //if (w.match(/U\+([0-9A-F]{4,5})/i)) {
                    let u = RegExp.$1;
                    return makeCodeHover('U+'+u, u, 'Unicode');
                    //}
                }

                r = document.getWordRangeAtPosition(position, /\\x([2-7][0-9A-Fa-f])/);
                if (r) {
                    //w = document.getText(r);
                    let u = RegExp.$1;
                    return makeCodeHover(`\\x${u}`, '00'+u, 'ASCII');
                }
                
                r = document.getWordRangeAtPosition(position, /\\x[C-Fc-f][0-9A-Fa-f](\\x[89ABab][0-9A-Fa-f])+/);
                if (r) {
                    w = document.getText(r);
                    if (w.match(/\\x(F[0-7])\\x([89AB][0-9A-F])\\x([89AB][0-9A-F])\\x([89AB][0-9A-F])/i)) { // UTF-8 (4byte)
                        let b1 = RegExp.$1;
                        let b2 = RegExp.$2;
                        let b3 = RegExp.$3;
                        let b4 = RegExp.$4;
                        let u = ((parseInt(b1, 16) & 0x07) << 18) | ((parseInt(b2, 16) & 0x3f) << 12) | ((parseInt(b3, 16) & 0x3f) << 6) | (parseInt(b4, 16) & 0x3f);
                        return makeCodeHover(`\\x${b1}\\x${b2}\\x${b3}\\x${b4}`, u.toString(16), 'UTF-8');
                    } else if (w.match(/\\x([EF][0-9A-F])\\x([89AB][0-9A-F])\\x([89AB][0-9A-F])/i)) { // UTF-8 (3byte)
                        let b1 = RegExp.$1;
                        let b2 = RegExp.$2;
                        let b3 = RegExp.$3;
                        let u = ((parseInt(b1, 16) & 0x0f) << 12) | ((parseInt(b2, 16) & 0x3f) << 6) | (parseInt(b3, 16) & 0x3f);
                        return makeCodeHover(`\\x${b1}\\x${b2}\\x${b3}`, toHex(u, 4), 'UTF-8');
                    } else if (w.match(/\\x([CD][0-9A-F])\\x([89AB][0-9A-F])/i)) { // UTF-8 (2byte)
                        let b1 = RegExp.$1;
                        let b2 = RegExp.$2;
                        let u = ((parseInt(b1, 16) & 0x1f) << 6) | (parseInt(b2, 16) & 0x3f);
                        return makeCodeHover(`\\x${b1}\\x${b2}`, toHex(u, 4), 'UTF-8');
                    } 
                }

                r = document.getWordRangeAtPosition(position, /\\u([Dd][89ABab][0-9A-Fa-f]{2})\\u([Dd][C-Fa-f][0-9A-Fa-f]{2})/);
                if (r) {
                    //w = document.getText(r);
                    let b1 = RegExp.$1;
                    let b2 = RegExp.$2;
                    let u = (((parseInt(b1, 16) & 0x3ff) << 10)) + (parseInt(b2, 16) & 0x3ff) + 0x10000;
                    return makeCodeHover(`\\u${b1}\\u${b2}`, u.toString(16), 'UTF-16 Surrogate Pairs');
                }

                r = document.getWordRangeAtPosition(position, /\\u([0-9A-Fa-f]{4})/);
                if (r) {
                    //w = document.getText(r);
                    let u = RegExp.$1;
                    return makeCodeHover(`\\u${u}`, toHex(parseInt(u, 16), 4), 'UTF-16 BMP');
                }

                r = document.getWordRangeAtPosition(position, /\\U([0-9A-Fa-f]{8})/);
                if (r) {
                    //w = document.getText(r);
                    let u = RegExp.$1;
                    return makeCodeHover(`\\U${u}`, u, 'UTF-32');
                }
                
                return null;
            }
        })
    );
}

function toHex(num: number, padLength: number) {
    let s = num.toString(16).toUpperCase();
    return s.length >= padLength ? s : '0'.repeat(padLength - s.length) + s;
}

function checkSubchar(c: number) {

    // To be done
    // To implement by Grapheme Cluster Boundaries (UAX#29)
    // http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
    // Mn  https://www.compart.com/en/unicode/category/Mn

    if (c >=  0x0300 && c <=  0x036f) return true;        // Combining character
    if (c >=  0xfe00 && c <=  0xfe0f) return true;        // Variation Selectors (SVS)
    if (c >= 0x1f3fb && c <= 0x1f3ff) return true;        // Emoji Modifier Fitzpatrick
    if (c >= 0xe0100 && c <= 0xe01ef) return true;        // Variation Selectors Supplement (IVS)

    if (c >=  0x0483 && c <=  0x0487) return true;        // Combining Cyrillic
    if (c >=  0x0591 && c <=  0x05c7) return true;        // Combining Hebrew

    if (c ==  0x0e31)                 return true;        // Thai
    if (c >=  0x0e33 && c <=  0x0e3a) return true;        // Thai
    if (c >=  0x0e47 && c <=  0x0e4e) return true;        // Thai

    if (c >=  0x180b && c <=  0x180d) return true;        // Mongolian Variation Selectors (FVS)
    if (c >=  0x1ab0 && c <=  0x1aff) return true;        // Combining Diacritical Marks Extended
    if (c >=  0x1dc0 && c <=  0x1dff) return true;        // Combining Diacritical Marks Supplement
    if (c >=  0x20d0 && c <=  0x20ff) return true;        // Combining Diacritical Marks for Symbols
    if (c >=  0xfe20 && c <=  0xfe2f) return true;        // Combining Half Marks
    
    return false;
}

class CharCodeDisplay {
    private _statusBarItem: StatusBarItem;
    //private _charRange: Range;
    //private _character: string;
    //private _hexCode: string;
    private _characters: string;
    private _unicodeDecList: number[];
    private _unicodeHexList: string[];

    /**
     * Returns the range of the character in the active editor.
     */
    //public get charRange() { return this._charRange; }

    public get characters() { return this._characters; }
    public get unicodeDecList() { return this._unicodeDecList; }
    public get unicodeHexList() { return this._unicodeHexList; }

    public updateCharacterCode(editor?: TextEditor) {
        if(!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        // Get the current text editor
        if(!editor) {
            editor = window.activeTextEditor;
        }

        if(!editor || !editor.selection || !editor.document) {
            this._statusBarItem.hide();
            return;
        }

        let cursorPos = editor.selection.active;
        let pos = cursorPos;

        let charDecList = [];
        let tryNext = true;
        let joinerOn = false;

        do {
            // taking 2 chars instead of one allows to handle surrogate pairs correctly
            let textRange = new Range(pos, pos.translate(0, 2));
            let text = editor.document.getText(textRange);
            if (!text) break;
            let charDec = text.codePointAt(0);
            if (!charDecList) break;

            if (charDecList.length > 0) {
                if (charDec == 0x200d) {        // // zero width joiner
                    joinerOn = true;
                } else if (joinerOn) {
                    joinerOn = false;
                } else if (!checkSubchar(charDec)) {
                    tryNext = false;
                    break;
                }
            }
            charDecList.push(charDec);
            
            pos = pos.translate(0, charDec < 65536 ? 1 : 2);
        } while (tryNext);

        if (charDecList.length == 0) {
            this._statusBarItem.hide();
            return;
        }

        // Update the status bar
        let msg = '';
        let unis = [];
        for (var i in charDecList) {
            let hex = toHex(charDecList[i], 4);
            msg += ' U+' + hex;
            unis.push(hex);
        }

        this._characters = editor.document.getText(new Range(cursorPos, pos));;
        this._unicodeDecList = charDecList;
        this._unicodeHexList = unis;

        this._statusBarItem.text = `$(file-binary) ${msg}`;
        this._statusBarItem.command = 'cursorCharcode.detailUnicodeInfo';
        this._statusBarItem.show();
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class CharCodeController {
    private _display: CharCodeDisplay;
    private _disposable: Disposable;

    constructor(display: CharCodeDisplay) {
        this._display = display;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        this._display.updateCharacterCode();
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._display.updateCharacterCode();
    }
}