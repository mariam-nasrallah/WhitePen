
import * as vscode from 'vscode';
import {
    WHITEPEN_START_COMMAND,
    WHITEPEN_LOGIN,
    WHITEPEN_LOGOUT,
    WHITEPEN_SCAN_DEP,
    WHITEPEN_SCAN_CODE,
    WHITEPEN_SET_TOKEN,
    WHITEPEN_VULN,
    WHITEPEN_CVES,
    WHITEPEN_CVEVIEW
} from './common/constants/commands';
import WhitePenLogin from './core/login';
import { IExtension } from './core/interfaces';
import { extensionContext } from './common/vscode/extensionContext';
import WhitePenLib from './core/whitepenLib';
import WhitePenSecretsStore from './core/whitePenSecretsStore';
import { setContext } from "./common/vscode/vscodeCommands";
import { DepNodeProvider } from './core/nodeDependencies';
import { CVE, CveNodeProvider } from './core/cveDependencies';
import { CatCodingPanel, CVEStruct } from './core/CVEWebView';

class WhitePen extends WhitePenLib implements IExtension{    
    private rootPath: string | undefined;

    public async activate(vscodeContext: vscode.ExtensionContext): Promise<void> {
        extensionContext.setContext(vscodeContext);            
        this.rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
        this.context = extensionContext;

        try {
            await this.intializeExtension(vscodeContext);
        } catch (e) {
            console.log(e);
        }
    }


    public async deactivate(): Promise<void> {
    }

    private async intializeExtension(vscodeContext: vscode.ExtensionContext){
        // vscode.window.showInformationMessage("Hello");
        WhitePenLogin.init(vscodeContext);
        WhitePenSecretsStore.init(vscodeContext);
        const secretStore = WhitePenSecretsStore.instance;
        setContext("loggedIn", false);
        setContext("packageCVE",false);

        const isLoggedIn= await secretStore.isLoggedIn();

        if(isLoggedIn === "true"){


        
            if (this.rootPath === undefined){
                vscode.window.showInformationMessage("Empty Workspace Directory!");
                setContext("vuln",false);
            }else{
                var nodeDependenciesProvider:any ;
                nodeDependenciesProvider = new DepNodeProvider(this.rootPath);
                vscode.window.registerTreeDataProvider('whitepen.views.vuln', nodeDependenciesProvider);
                setContext("vuln",true);
            }

            vscode.commands.executeCommand(WHITEPEN_SCAN_DEP);
            setContext("loggedIn", true);
        }

        this.registerCommands(vscodeContext);
    }
    

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand(WHITEPEN_START_COMMAND, () => {
                console.log("start");
            }),
            vscode.commands.registerCommand(WHITEPEN_LOGIN, () => {
                const login = WhitePenLogin.instance;
                login.UserLogin();
            }),
            vscode.commands.registerCommand(WHITEPEN_LOGOUT, () => {
                const login = WhitePenLogin.instance;
                login.UserLogout();
                // console.log("start");
            }),
            vscode.commands.registerCommand(WHITEPEN_SCAN_DEP, () => {
                vscode.commands.executeCommand(WHITEPEN_VULN);
            }),
            vscode.commands.registerCommand(WHITEPEN_SCAN_CODE, () => {
                console.log("start");
            }),
            vscode.commands.registerCommand(WHITEPEN_SET_TOKEN, () => {
                console.log("Set Token");
            }),
            vscode.commands.registerCommand(WHITEPEN_VULN, async (moduleName:string, version:string)=> {
                var nodeDependenciesProvider:any ;
                nodeDependenciesProvider = new DepNodeProvider(this.rootPath);
                vscode.window.registerTreeDataProvider('whitepen.views.vuln', nodeDependenciesProvider);               
				setContext("cves", true);
            }),
            vscode.commands.registerCommand(WHITEPEN_CVES, async (isVuln: boolean, manager: string, moduleName:string, version: string)=> {
                var cveNodeDependenciesProvider:any ;
                console.log(moduleName);
                console.log(version);
                cveNodeDependenciesProvider = new CveNodeProvider(isVuln, manager, moduleName, version);
                vscode.window.registerTreeDataProvider('whitepen.views.cves', cveNodeDependenciesProvider);             
				setContext("cves", true);
				setContext("vuln", true); 
				setContext("cveView", true); 
            }),
            vscode.commands.registerCommand(WHITEPEN_CVEVIEW, async (module: string,version: string,cveRes: CVEStruct) => {
                cveRes.module = module;
                cveRes.version = version;
			    CatCodingPanel.createOrShow(context.extensionUri, cveRes);
                console.log(CatCodingPanel.currentPanel);
            }),
        );
  }


}

export default WhitePen;

