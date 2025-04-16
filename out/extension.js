"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const GROQ_API_KEY = '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';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    const disposable = vscode.commands.registerCommand('ai-extension-api', () => {
        const panel = vscode.window.createWebviewPanel('deepchat', 'Deep Seek Chat', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebViewContent();
        const editor = vscode.window.activeTextEditor;
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        // vscode.window.showErrorMessage(selectedText);
        if (selectedText) {
            (async () => {
                const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: 'Llama3-8b-8192',
                    messages: [
                        { role: 'system', content: 'You are a helpful coding assistant.' },
                        { role: 'user', content: `Explain the following code:\n\n${selectedText}` }
                    ]
                }, {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                const answer = response.data.choices[0].message.content;
                panel.webview.postMessage({ command: 'chatResponse', text: answer });
            })();
        }
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = '';
                const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: 'Llama3-8b-8192',
                    messages: [
                        { role: 'system', content: 'You are a helpful coding assistant.' },
                        { role: 'user', content: userPrompt }
                    ]
                }, {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                const answer = response.data.choices[0].message.content;
                panel.webview.postMessage({ command: 'chatResponse', text: answer });
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebViewContent() {
    return `
	  <!DOCTYPE html>
	  <html>
	
	  <head>
	    <meta charset = "UTF-8" />
		<style>
		  #response {border: 1px solid #ccc; margin-top 1rem; padding: 0.5rem; min-height: 100px}
		</style>  
		<title>Page Title</title>
	  </head>
	
	  <body>
		<h2>Welcome</h2>
		<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br/>
		<button id="askBtn">Ask something</button>
		<div id="response"></div>
	

		<script>
		  const vscode = acquireVsCodeApi();

		  document.getElementById('askBtn').addEventListener('click', () =>{
		    const text = document.getElementById('prompt').value;
			vscode.postMessage({command:'chat', text });
		  });

		  window.addEventListener('message', event => {
		    const {command, text} = event.data;
			if (command === 'chatResponse') {
			  document.getElementById('response').innerText = text;
			}
		  })
		</script>  
	  </body>
	
	  </html>
	`;
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map