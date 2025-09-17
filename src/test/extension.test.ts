import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import * as cmdTlmDB from '../cmdTlmDB';

const outputChannel = vscode.window.createOutputChannel('OpenC3 Scripting Tests');

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});

suite('Regex Hell', () => {
    vscode.window.showInformationMessage('Starting regex hell suite');

    test('Command Parameter Parse', () => {
        console.log('hell');
    });
});
