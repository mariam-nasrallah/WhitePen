import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { setContext } from "../common/vscode/vscodeCommands";
// import { pkgCheckerClient } from './pkgCheckerClient';
import { resourceLimits } from 'worker_threads';
import { getCVES } from './pkgCheckerClient';
export class CveNodeProvider implements vscode.TreeDataProvider<CVE> {


	private _onDidChangeTreeData: vscode.EventEmitter<CVE | undefined | void> = new vscode.EventEmitter<CVE | undefined | void>();
	// readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
	private isVuln: boolean;
	private module: string;
	private version: string;
	constructor(isVuln: boolean,module: string, version: string) {
		this.isVuln = isVuln;
		this.module = module;
		this.version = version;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: any): vscode.TreeItem {
		return element;
	}

	getChildren(element?: any): Thenable<CVE[]> {
		if (this.isVuln){
			return Promise.resolve(this.getCVEPackage());

		}else{
			return Promise.resolve([]);
		}
		// if (this.module) {

        //       this.cves.forEach( (value: any) => {
		// 		let cve = Promise.resolve(this.getCVEJson(value));				
		// 	  });
		// 	// vscode.window.showInformationMessage('No dependency in empty workspace');
		// }else{

		// }
	}

	private async getCVEPackage(): Promise<any> {
		const toDep = (isVuln: boolean, module: string, version: string): CVE => {
				if (!isVuln) {
					return new CVE("", version, vscode.TreeItemCollapsibleState.Collapsed);
				} else {
					return new CVE(module, version, vscode.TreeItemCollapsibleState.None, {
						command: 'whitepen.webview',
						title: 'Select CVE',
						arguments: [module, version]
					});
				}
			};
			const pkgCheck = await getCVES(this.module,this.version);
			let cves: CVE[] =[];

			pkgCheck.forEach(
				function(cve: any){
					const res = toDep(true, cve.Title, "");
					cves.push(res);
				}
			)
					// console.log(pkgCheck);


			// const cves = Object.keys("").map(
			// 	cve => toDep(true, "batatatata", this.version)
			// );

			return cves;
	}

	

}

export class CVE extends vscode.TreeItem {

	constructor(
		public title: string,
		public readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		// public cveID: string,
		public readonly command?: vscode.Command,
	) {
		super(title, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'download.svg'),
		dark: path.join(__filename, '..', '..','resources', 'dark', 'download.svg')
	};

	contextValue = 'dependency';
}
