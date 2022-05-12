
import { commands, ExtensionContext, SecretStorage, window } from "vscode";
import { WHITEPEN_LOGIN, WHITEPEN_LOGOUT } from "../common/constants/commands";
import { setContext } from "../common/vscode/vscodeCommands";
import WhitePenLogin from "./login";
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
			url: 'https://pkgchecker.whitepen.io/o2e2j0mecgu/',
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
			console.log(parseJSON.data.tokenAuth.token);
            await secretStore.storeLoginData(parseJSON.data.tokenAuth.token, parseJSON.data.tokenAuth.refreshToken, parseJSON.data.tokenAuth.payload.exp.toString(), parseJSON.data.tokenAuth.payload.refresh_token_exp.toString(), "true");
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

	public async unauthenticate(): Promise<void>{
		const secretStore = WhitePenSecretsStore.instance;
		await secretStore.storeLoginData("", "", "", "", "false");
		setContext("loggedIn",false);
	}


}

export async function checkTokenTime(settings: WhitePenSecretsStore){
	const secretStore = WhitePenSecretsStore.instance;
	var now = new Date();
	var tokenDate = await settings.getAuthTokenExpData();
	var refreshTokenDate  = await settings.getAuthRefTokenExpData();
	var addMinutes = now.setMinutes(now.getMinutes() + 10);
	let token:string = await settings.getAuthTokenData() || '';
	var refreshToken = await settings.getAuthRefTokenData();
	var nowDate = addMinutes/1000;
	//not valid token but valid refresh token
	if(token === ''){
		commands.executeCommand(WHITEPEN_LOGOUT);
		window.showInformationMessage("Please Login!");
	}
	if(Number(nowDate) >= Number(tokenDate) && Number(nowDate) < Number(refreshTokenDate)) {
	  console.log("not valid");
	  var axios = require('axios');
	  var data = JSON.stringify({
		query: `mutation refreshToken {
		refreshToken(refreshToken: "`+refreshToken+`") {
			payload
			token
			refreshToken
		}
	  }`,
		variables: {}
	  });
	  var config = {
		method: 'post',
		url: 'https://pkgchecker.whitepen.io/o2e2j0mecgu/',
		headers: { 
		  'Content-Type': 'application/json',
		},
		data : data
	  };
	  
	  let res = axios(config)
	  .then(async function (response: any){
		const parseJson = JSON.parse(JSON.stringify(response.data));
		await secretStore.storeLoginData(parseJson.data.refreshToken.token, parseJson.data.refreshToken.refreshToken, parseJson.data.refreshToken.payload.exp.toString(), parseJson.data.refreshToken.payload.refresh_token_exp.toString(), "true");
		
	  })
	  .catch(function (error: any) {
		console.log(error);
	  });
	 
  }
	//not valid either token and refresh token
	else if(Number(nowDate) >= Number(tokenDate) && Number(nowDate) > Number(refreshTokenDate)){
		const secretStore = WhitePenSecretsStore.instance;
		await secretStore.storeLoginData("", "", "", "", "false");
		setContext("loggedIn", false);
		window.showInformationMessage("Session Expired! Please Login Again :)");
	  }

  }