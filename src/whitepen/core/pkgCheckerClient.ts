import { Console } from 'console';
import * as vscode from 'vscode';
import WhitePenSecretsStore from './whitePenSecretsStore';
// import AuthSettings from "./authProvider";
const {default : axios} = require('axios');

export async function pkgCheckerClient(label: string, version: string): Promise<boolean>{
  // AuthSettings.init(context);
  // const settings = AuthSettings.instance;
  //    let resultToken = await checkTokenTime(settings);
        const parsedVersion = version.substring(1);
       
        var data = JSON.stringify({
            query: `query{
            PackageChecker(manager:"npm", package:"`+label+`", version:"`+parsedVersion+`"){
              PkgCheckList{
                CVEId
                  PkgName
                  InstalledVersion
                  Fixed
                  Title
                  Description
                  Severity
                  CweIDs
                  CVSS
                  References
                  PublishedDate
              }
            }
          }`,
            variables: {}
          });
          const authToken = WhitePenSecretsStore.instance;
          var config = {
            method: 'post',
            url: 'http://theateam.xyz:61040/graphql/',
            headers: { 
              'Authorization': 'Bearer '+ await authToken.getAuthTokenData() ,
              'Content-Type': 'application/json',
              'Cookie': 'csrftoken=L0HRVDNKyhomy9Q3JOc4lQ2DMRPkgfhwo6Hqv57pK0fRzz9j86tvuuT0Y7OFryzL'
            },
            // proxy: {
            //   host: '192.168.8.111',
            //   port: 8088,
            // },
            data : data
          };
          let value = axios(config).then(async function (response: any): Promise<boolean>{ 
            const parseJson = JSON.parse(JSON.stringify(response.data));
            console.log(parseJson);
            const pkgList = parseJson.data.PackageChecker.PkgCheckList;
            if (pkgList.length !== 0) {
                // const answer =  await vscode.window.showInformationMessage("Detected Vulnerability at package "+ pkgList[0].PkgName, "Show Information", "Later");
                // if(answer === "Show Information") {
                    
                // }
                return true;
            }
            return false;
          })
          .catch(function (error: any) {
            console.log(error);
          });
          
          const resValue = async () => {
            const a = await value;
            if(a){
              return true;
            }
            return false;
          };
         return resValue();

}


// export async function checkTokenTime(settings: AuthSettings): Promise<String> {
//   var now = new Date();
//   var tokenDate = await settings.getAuthTokenExpData();
//   var refreshTokenDate  = await settings.getAuthRefTokenExpData();
//   var addMinutes = now.setMinutes(now.getMinutes() + 10);
//   let token:string = await settings.getAuthTokenData() || '';
//   var refreshToken = await settings.getAuthRefTokenExpData();
//   var nowDate = addMinutes/1000;
//   //not valid token but valid refresh token
//   if(Number(nowDate) >= Number(tokenDate) && Number(nowDate) < Number(refreshTokenDate)) {
//     console.log("not valid");
//     var axios = require('axios');
//     var data = JSON.stringify({
//       query: `mutation refreshToken {
//       refreshToken(refreshToken: "`+refreshToken+`") {
//         token
//       }
//     }`,
//       variables: {}
//     });
//     var config = {
//       method: 'post',
//       url: 'http://theateam.xyz:61040/graphql/',
//       headers: { 
//         'Content-Type': 'application/json',
//       },
//       data : data
//     };
    
//     let res = axios(config)
//     .then(function (response: any):Promise<String> {
//       const parseJson = JSON.parse(JSON.stringify(response.data));
//       return parseJson.data.refreshToken.token;
      
//     })
//     .catch(function (error: any) {
//       console.log(error);
//     });
//    return Promise.resolve(res);
// }
//   //not valid either token and refresh token
//   else if(Number(nowDate) >= Number(tokenDate) && Number(nowDate) > Number(refreshTokenDate)){
//     console.log("needs login");
//     var axios = require('axios');
// var data = JSON.stringify({
//   query: `mutation loginUser {
//   tokenAuth(username: "user84", password: "user65") {
//     token
//     refreshToken
//     payload
//   }
// }`,
//   variables: {}
// });

// var config = {
//   method: 'post',
//   url: 'http://theateam.xyz:61040/graphql/',
//   headers: { 
//     'Content-Type': 'application/json',
//   },
//   data : data
// };

// let res = axios(config)
// .then(function (response: any): Promise<String> {
//   const parseJson = JSON.parse(JSON.stringify(response.data));

//   return parseJson.data.tokenAuth.token;
// })
// .catch(function (error: any) {
//   console.log(error);
// });
// // console.log(Promise.resolve(res));
// return Promise.resolve(res);
// }

// //valid token
// return Promise.resolve(token);
// }
