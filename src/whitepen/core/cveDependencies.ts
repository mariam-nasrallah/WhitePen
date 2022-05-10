import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { setContext } from "../common/vscode/vscodeCommands";
// import { pkgCheckerClient } from './pkgCheckerClient';
import { resourceLimits } from 'worker_threads';
import { getCVES } from './pkgCheckerClient';
import { WHITEPEN_CVEVIEW } from '../common/constants/commands';
import { CVEStruct } from './CVEWebView';
export class CveNodeProvider implements vscode.TreeDataProvider<CVE> {


	private _onDidChangeTreeData: vscode.EventEmitter<CVE | undefined | void> = new vscode.EventEmitter<CVE | undefined | void>();
	// readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
	private isVuln: boolean;
	private manager: string;
	private module: string;
	private version: string;
	constructor(isVuln: boolean, manager: string, module: string, version: string) {
		this.isVuln = isVuln;
		this.manager = manager;
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
		
	}

	private async getCVEPackage(): Promise<any> {
		const toDep = (isVuln: boolean, cveRes: CVEStruct): CVE => {
				if (!isVuln) {
					return new CVE("", 0, vscode.TreeItemCollapsibleState.Collapsed);
				} else {
					var severity: number = Number(cveRes.severity);
					return new CVE(cveRes.title, severity, vscode.TreeItemCollapsibleState.None, {
						command: WHITEPEN_CVEVIEW,
						title: 'Select CVE',
						arguments: [this.module,this.version,cveRes]
					});
				}
			};
			console.log(this.version);
			console.log(this.manager);
			console.log(this.module);
			const pkgCheck = await getCVES(this.manager, this.module, this.version);
			let cves: CVE[] =[];
			console.log(pkgCheck);
			pkgCheck.forEach(
				function(cve: any){
					const cveRes = new CVEStruct(cve);
					const res = toDep(true, cveRes);
					cves.push(res);
				}
			);

			return cves;
	}

	

}

export class CVE extends vscode.TreeItem {

	constructor(
		public title: string,
		public severity: number,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		// public cveID: string,
		public readonly command?: vscode.Command,
	) {
		super(title, collapsibleState);
		
		this.severity = severity;


		

		this.tooltip = `${this.title}`;
	}

	private sevIcon(severity:number): string{
		switch(this.severity){
			case 1:
				return "unknown.svg";
			case 2:
				return "low.svg";
			case 3:
				return "medium.svg";
			case 4:
				return "high.svg";
			case 5:
				return "critical.svg";
			default:
				return "";
		}
	}


	iconPath = {
		light: path.join(__filename, '..', '..', 'resources',  this.sevIcon(this.severity)),
		dark: path.join(__filename, '..', '..','resources',  this.sevIcon(this.severity))
	};

	contextValue = 'dependency';
}
