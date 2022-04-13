
import * as vscode from 'vscode';
import { ExtensionContext, SecretStorage, window } from "vscode";
import {
    WHITEPEN_START_COMMAND,
    WHITEPEN_LOGIN,
    WHITEPEN_LOGOUT,
    WHITEPEN_SCAN_DEP,
    WHITEPEN_SCAN_CODE,
    WHITEPEN_SET_TOKEN,
    WHITEPEN_CVES
} from './common/constants/commands';
import WhitePenLogin from './core/login';
import { IExtension } from './core/interfaces';
import { extensionContext } from './common/vscode/extensionContext';
import WhitePenLib from './core/whitepenLib';
import WhitePenSecretsStore from './core/whitePenSecretsStore';
import { setContext } from "./common/vscode/vscodeCommands";
import { DepNodeProvider } from './core/nodeDependencies';

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
                setContext("packageCVE",false);
            }else{
                var nodeDependenciesProvider:any ;
                nodeDependenciesProvider = new DepNodeProvider(this.rootPath, "");
                vscode.window.registerTreeDataProvider('whitepen.views.packageChecker', nodeDependenciesProvider);
                setContext("packageCVE",true);
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
                console.log("start");
            }),
            vscode.commands.registerCommand(WHITEPEN_SCAN_CODE, () => {
                console.log("start");
            }),
            vscode.commands.registerCommand(WHITEPEN_SET_TOKEN, () => {
                console.log("Set Token");
            }),
            vscode.commands.registerCommand(WHITEPEN_CVES, async (moduleName:string, version:string)=> {
                var nodeDependenciesProvider:any ;
                nodeDependenciesProvider = new DepNodeProvider(this.rootPath, moduleName);
                vscode.window.registerTreeDataProvider('whitepen.views.cveWebView', nodeDependenciesProvider);
            // const panel = vscode.window.createWebviewPanel(
            //     'Package Information',
            //     'Package Information',
            //     vscode.ViewColumn.One,
            //     {}
            //   );

              console.log(moduleName, version);
        
              // And set its HTML content
              
                // nodeDependenciesProvider = new DepNodeProvider(rootPath);
                // vscode.window.registerTreeDataProvider('whitepen.views.packageChecker', nodeDependenciesProvider);
				setContext("cves", true);
            })
        );
  }


}

export default WhitePen;

function nodeDependenciesProvider(arg0: string, nodeDependenciesProvider: any) {
    throw new Error('Function not implemented.');
}
