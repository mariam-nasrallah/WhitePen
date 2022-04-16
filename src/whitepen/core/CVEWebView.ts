
import path = require('path');
import { stringify } from 'querystring';
import * as vscode from 'vscode';

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media', 'images')],
	};
}

class CVEStruct {
    public pkgName:string;
    public installedVersion:string;
    public fixed:string;
    public title:string;
    public description:string;
    public severity:number;
    public cweIDs:string;
    public cVSS:string;
    public references:string;
    public publishedDate:string;
    public module:string|undefined;
    public version:string|undefined;

    constructor(cveRes: any){
        this.pkgName = cveRes.PkgName;
        this.installedVersion = cveRes.InstalledVersion;
        this.fixed = cveRes.Fixed;        
        this.title = cveRes.Title;
        this.description = cveRes.Description;
        this.severity = cveRes.Severity;
        this.cweIDs = cveRes.CweIDs;
        this.cVSS = cveRes.CVSS;
        this.references = cveRes.References;
        this.publishedDate = cveRes.PublishedDate;
    }
}

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CatCodingPanel | undefined;

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
    public readonly cve:CVEStruct;

	public static createOrShow(extensionUri: vscode.Uri, cveRes: CVEStruct) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CatCodingPanel.viewType,
			'WhitePen Vulnerability Scanner',
			column || vscode.ViewColumn.Two,
			getWebviewOptions(extensionUri),
		);

if (CatCodingPanel.currentPanel) {
            CatCodingPanel.currentPanel.dispose();
			// CatCodingPanel.currentPanel._panel.reveal(column);
			// CatCodingPanel.currentPanel.doRefactor();
			// return;
		}
        

		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri, cveRes);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, cveRes: CVEStruct) {
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri, cveRes);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, cveRes: CVEStruct) {
		this._panel = panel;
		this._extensionUri = extensionUri;

        this.cve = cveRes;

		// Set the webview's initial html content
		this._update();
		let ico:string = "";
		switch(this.cve.severity){
			case 1:
				ico = 'dark-low-severity.svg';
				break;
			case 2:
				ico = 'dark-medium-severity.svg';
				break;
			case 3:
				ico = 'dark-high-severity.svg';
				break;
			case 4:
				ico = 'dark-critical-severity.svg';
				break;
			default: "";

		}
        this._panel.iconPath = {
			light: vscode.Uri.file(path.join(__filename, '..', '..', 'media', 'images', ico)),
			dark: vscode.Uri.file(path.join(__filename, '..', '..','media', 'images', ico))
		};
		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		CatCodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.Two:
				this._updateForCat(webview, 'WhitePen Vulnerability Scanner');
				return;

			case vscode.ViewColumn.Three:
				this._updateForCat(webview, 'WhitePen Vulnerability Scanner');
				return;

			case vscode.ViewColumn.One:
			default:
				this._updateForCat(webview, 'WhitePen Vulnerability Scanner');
				return;
		}
	}

	private _updateForCat(webview: vscode.Webview, catName: any) {
		this._panel.title = catName;
		this._panel.webview.html = this._getHtmlForWebview(webview, "");
	}

	private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {

		const images: Record<string, string> = [
		['icon-code', 'svg'],
		['dark-critical-severity', 'svg'],
		['dark-high-severity', 'svg'],
		['dark-medium-severity', 'svg'],
		['dark-low-severity', 'svg'],
		].reduce((accumulator: Record<string, string>, [name, ext]) => {
		const uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'images', `${name}.${ext}`));
		accumulator[name] = uri.toString();
		return accumulator;
		}, {});
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		// const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'suggestion.css');

		// Uri to load styles into webview
		// const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();
        let pkgNameDiv: string|undefined;
		let html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<!--
						Use a content security policy to only allow loading images from https or from our extension directory,
						and only allow scripts that have a specific nonce.
					-->
					<meta
	  http-equiv="Content-Security-Policy"
	  content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};"
	/>
					<link href="${stylesMainUri}" rel="stylesheet">
					<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300&display=swap" rel="stylesheet">
				</head>`;
        if (this.cve.pkgName !== undefined){
            pkgNameDiv = '<h1 id="lines-of-code-counter">Package Name: </h1><h3>'
			+ this.cve.pkgName +
			 '</h3>';
        }

    html += `
			<body>
        <div class="suggestion">
          <section>
            <div class="suggestion-text"></div>
            <div class="identifiers"></div>
          </section>
            
              <h3>Vulnerable module:  &nbsp; ${this.cve.module} @ ${this.cve.version}</h3>
			  `;

		if (this.cve.title !== "") {
			  html +=`<h3> Title: &nbsp;  ${this.cve.title} </h3>
             `;
		}
		if (this.cve.severity === 1){
			html += `<h3>Severity: &nbsp;  Low </h3>`;
		}
		else if (this.cve.severity === 2){
			html += `<h3>Severity: &nbsp;  Medium </h3>`;

		}
		else if (this.cve.severity === 3){
			html += `<h3>Severity: &nbsp;  High </h3>`;

		}
		else if (this.cve.severity === 4){
			html += `<h3>Severity: &nbsp;  Critical </h3>`;

		}
		if (this.cve.fixed !== "") {
			html +=`<h3>Fixed in: &nbsp;  ${this.cve.fixed} </h3>`;
		}
		
		if(this.cve.publishedDate !== "") {
			html +=`<h3>Published Date: &nbsp;  ${this.cve.publishedDate} </h3>`;
		}

		if (this.cve.description !== "") {
			html +=`<h3>Description: &nbsp;  ${this.cve.description} </h3>`;
		}	  
			  
        if (this.cve.references !== "") {
			html +=`<h3>References: &nbsp;  ${this.cve.references} </h3>`;
		}   

          
 		return html += `</div></body></html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export  {CatCodingPanel, CVEStruct};