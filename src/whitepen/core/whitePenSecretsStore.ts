
import { ExtensionContext, SecretStorage, window } from "vscode";

export default class WhitePenSecretsStore {
    
    private static _instance: WhitePenSecretsStore;

    constructor(private secretStorage: SecretStorage){
    }

    static init(context: ExtensionContext): void {
        /*
        Create instance of new AuthSettings.
        */
        WhitePenSecretsStore._instance = new WhitePenSecretsStore(context.secrets);
        
    }

    static get instance(): WhitePenSecretsStore {
        /*
        Getter of our AuthSettings existing instance.
        */
        return WhitePenSecretsStore._instance;
    }
    

    async storeLoginData(token: string, refreshToken: string, tokenExpDate: string, refreshTokenExpDate: string, isLoggedIn: string ): Promise<void> {
        /*
        Update values in bugout_auth secret storage.
        */
        if (token) {
            this.secretStorage.store("token", token);
        }
        this.secretStorage.store("refresh_token", refreshToken);
        this.secretStorage.store("token_exp_date", tokenExpDate);
        this.secretStorage.store("refresh_token_exp_date", refreshTokenExpDate);
        this.secretStorage.store("loggedIn", isLoggedIn);

    }


    async getAuthTokenData(): Promise<string | undefined> {
        /*
        Retrieve data from secret storage.
        */
        return await this.secretStorage.get("token");
    }
    async getAuthRefTokenData(): Promise<string | undefined> {
        /*
        Retrieve data from secret storage.
        */
        return await this.secretStorage.get("refresh_token");
    }

    async isLoggedIn(): Promise<string | undefined>{
        return await this.secretStorage.get("loggedIn");
    }

    async getAuthTokenExpData(): Promise<string | undefined> {
        /*
        Retrieve data from secret storage.
        */
        return await this.secretStorage.get("token_exp_date");
    }
    async getAuthRefTokenExpData(): Promise<string | undefined> {
        /*
        Retrieve data from secret storage.
        */
        return await this.secretStorage.get("refresh_token_exp_date");
    }

    async deleteAuthData(): Promise<void> {
        await this.secretStorage.delete("token");
        await this.secretStorage.delete("refresh_token");
        await this.secretStorage.delete("token_exp_date");
        await this.secretStorage.delete("refresh_token_exp_date");
        await this.secretStorage.store("loggedIn", "false");
    }

    async setCVE(cve:any): Promise<void>{
        await this.secretStorage.store("CVE","lodash");
    }
}