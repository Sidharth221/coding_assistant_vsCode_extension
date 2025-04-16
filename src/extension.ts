// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';
import axios from 'axios';

const GROQ_API_KEY = '';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('ai-extension-api',() =>{
		const panel = vscode.window.createWebviewPanel(
			'deepchat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{enableScripts: true}
		);

		panel.webview.html = getWebViewContent();

		const editor = vscode.window.activeTextEditor;

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		// vscode.window.showErrorMessage(selectedText);
		

		if (selectedText){
			(async () => {
				

				const response = await axios.post(
					'https://api.groq.com/openai/v1/chat/completions',
					{
					model: 'Llama3-8b-8192',
					messages: [
						{ role: 'system', content: 'You are a helpful coding assistant.' },
						{ role: 'user', content: `Explain the following code:\n\n${selectedText}` }
					]
					},
					{
					headers: {
						'Authorization': `Bearer ${GROQ_API_KEY}`,
						'Content-Type': 'application/json'
					}
					}
				);

				

				const answer = response.data.choices[0].message.content;	
				panel.webview.postMessage({ command: 'chatResponse', text: answer});
				
				
		    })()

		}

		panel.webview.onDidReceiveMessage(async (message: any) => {
			if (message.command === 'chat'){
				const userPrompt = message.text;
				let responseText = '';
				
				const response = await axios.post(
					'https://api.groq.com/openai/v1/chat/completions',
					{
					model: 'Llama3-8b-8192',
					messages: [
						{ role: 'system', content: 'You are a helpful coding assistant.' },
						{ role: 'user', content: userPrompt }
					]
					},
					{
					headers: {
						'Authorization': `Bearer ${GROQ_API_KEY}`,
						'Content-Type': 'application/json'
					}
					}
				);

				

				const answer = response.data.choices[0].message.content;	
				panel.webview.postMessage({ command: 'chatResponse', text: answer});
                    
				
				
			}
		});
	});

	context.subscriptions.push(disposable);

	
}

function getWebViewContent(): string {
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
export function deactivate() {}




