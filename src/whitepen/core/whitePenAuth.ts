
import { commands, ExtensionContext, SecretStorage, window } from "vscode";
import { WHITEPEN_LOGIN } from "../common/constants/commands";
import { setContext } from "../common/vscode/vscodeCommands";
import WhitePenSecretsStore from "./whitePenSecretsStore";

export default class WhitePenAuth {


    constructor(){
    }

    public  authenticate(username: string, password: string): any{
		const secretStore = WhitePenSecretsStore.instance;


		  var axios = require('axios');
		  var data = JSON.stringify({
			query: `mutation loginUser {
			tokenAuth(username: "`+username+`", password: "`+password+`") {
			  token
			  refreshToken
			  payload
			}
		  }`,
			variables: {}
		  });

        var config = {
			method: 'post',
			url: 'https://theateam.xyz:61040/graphql/',
			headers: { 
			  'Content-Type': 'application/json', 
			},
			data : data
		};
		

        var parseJSON: any;

        let res = axios(config)
		  .then(async function (response: any){
			parseJSON = JSON.parse(JSON.stringify(response.data));	
              if(parseJSON.errors !== undefined){
				  window.showErrorMessage("Wrong Credentials! Please Try Again");
				  commands.executeCommand(WHITEPEN_LOGIN);
                throw new Error("Whoops!");
              }
			  
            //   console.log(parseJSON);
            await secretStore.storeLoginData(parseJSON.data.tokenAuth.token, parseJSON.data.tokenAuth.refreshToken, parseJSON.data.tokenAuth.payload.token_exp.toString(), parseJSON.data.tokenAuth.payload.refresh_token_exp.toString());
			setContext("loggedIn",true);
			// const output = await secretStore.getAuthTokenData();
			// console.log(output);
            // return parseJSON;
		  })
		  .catch(function (error: any) {
              console.log(error);
			return error;
		  });

    }

	public unauthenticate(): void{
		const secretStore = WhitePenSecretsStore.instance;
		secretStore.deleteAuthData();
		
	}


}