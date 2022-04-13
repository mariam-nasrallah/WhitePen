
import { ExtensionContext, SecretStorage, window } from "vscode";
import { setContext } from "../common/vscode/vscodeCommands";
import WhitePenAuth from "./whitePenAuth";

export default class WhitePenLogin {

    private static _instance: WhitePenLogin;

    private username: string | undefined;    
    private password: string | undefined;



    constructor(private secretStorage: SecretStorage){
    }

    static init(context: ExtensionContext): void {
        /*
        Create instance of new AuthSettings.
        */
        WhitePenLogin._instance = new WhitePenLogin(context.secrets);
        
    }

    static get instance(): WhitePenLogin {
        /*
        Getter of our AuthSettings existing instance.
        */
        return WhitePenLogin._instance;
    }

    public async isLoggedIn(): Promise<string | undefined> {
        return await this.secretStorage.get("loggedIn");
    }

    public async UserLogin() : Promise<void>{
        const username = await window.showInputBox({
			placeHolder: "Enter your whitepen username",
			prompt: "WhitePen Username",
		});


		const password = await window.showInputBox({
			placeHolder: "Enter your whitepen Password",
			prompt: "WhitePen Password",
			password: true			
		});

        const whitePenAuth = new WhitePenAuth();

        if (username !== undefined && password !== undefined){
            // if (username === "admin" && password === "password"){
            //     setContext("loggedIn",true);            }
            const auth =  whitePenAuth.authenticate(username,password);
        }



    }

    public UserLogout(): void{
        const whitePenAuth = new WhitePenAuth();
        whitePenAuth.unauthenticate();
        setContext("loggedIn", false);
    }




}