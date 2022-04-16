import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { setContext } from "../common/vscode/vscodeCommands";
import { CVE, CveNodeProvider } from './cveDependencies';
// import { pkgCheckerClient } from './pkgCheckerClient';
import { resourceLimits } from 'worker_threads';
import { isPackageVuln } from './pkgCheckerClient';
import { WHITEPEN_CVES } from '../common/constants/commands';
export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	// readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
	private workspaceRoot: string | undefined;
	constructor(workspaceRoot: string | undefined) {
		this.workspaceRoot = workspaceRoot;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, element.label, 'package.json')));
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
			
			if (this.pathExists(packageJsonPath)) {

				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no package.json');
				return Promise.resolve([]);
			}
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private async getDepsInPackageJson(packageJsonPath: string): Promise<any> {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			let workspace: string;

			if(this.workspaceRoot === undefined){
				workspace = "";
			}
			else {
				workspace = this.workspaceRoot;
			}
			const toDep = async (moduleName: string, version: string): Promise<any> => {
				if (this.pathExists(path.join(workspace, moduleName))) {
					return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
				} else {
							const pkgCheck = await isPackageVuln(moduleName,version);
							if(pkgCheck){
								return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
																command: WHITEPEN_CVES,
																title: 'CVE: ' + moduleName + '@' + version +'',
																arguments: [true, moduleName, version]
														});
							
							}
					return;
				}
			};
			
			const deps = packageJson.dependencies
				? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
				: [];
		
			// // const devDeps = packageJson.devDependencies
			// // 	? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
			// // 	: [];
			// // await this.sendToClient(deps);
			// // return await this.sendToClient(deps);
			// return new Promise(deps);
			return deps;

		} else {
			return [];
		}
	}

	
	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'warning.svg'),
		dark: path.join(__filename, '..', '..','resources', 'dark', 'warning.svg')
	};

	contextValue = 'dependency';
}
