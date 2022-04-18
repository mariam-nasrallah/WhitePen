import { Console } from 'console';
import * as vscode from 'vscode';
import { CVE, CveNodeProvider } from './cveDependencies';
import { Dependency } from './nodeDependencies';
import WhitePenSecretsStore from './whitePenSecretsStore';
// import AuthSettings from "./authProvider";
const {default : axios} = require('axios');

export async function isPackageVuln(label: string, version: string): Promise<boolean>{
  // AuthSettings.init(context);
  // const settings = AuthSettings.instance;
  //    let resultToken = await checkTokenTime(settings);
        let parsedVersion = version;
        if(parsedVersion.charAt(0) === '^'){
          parsedVersion = version.substring(1);
        }
       
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
            url: 'https://theateam.xyz/app1/graphql/',
            headers: { 
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Authorization': 'Bearer '+ await authToken.getAuthTokenData() ,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Cookie': 'csrftoken=L0HRVDNKyhomy9Q3JOc4lQ2DMRPkgfhwo6Hqv57pK0fRzz9j86tvuuT0Y7OFryzL'
            },
            data : data
          };
          let value = axios(config).then(async function (response: any): Promise<boolean>{ 
            const parseJson = JSON.parse(JSON.stringify(response.data));
            const pkgList = parseJson.data.PackageChecker.PkgCheckList;
            if (pkgList.length !== 0) {
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


export async function getCVES(label: string, version: string): Promise<any>{
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
            url: 'https://theateam.xyz/app1/graphql/',
            headers: { 
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Authorization': 'Bearer '+ await authToken.getAuthTokenData() ,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Cookie': 'csrftoken=L0HRVDNKyhomy9Q3JOc4lQ2DMRPkgfhwo6Hqv57pK0fRzz9j86tvuuT0Y7OFryzL'
            },
            data : data
          };
          let value = axios(config).then(async function (response: any): Promise<any>{ 
            const parseJson = JSON.parse(JSON.stringify(response.data));
            const pkgList = parseJson.data.PackageChecker.PkgCheckList;
            if (pkgList.length !== 0) {
              return pkgList;
            }
            return;
          })
          .catch(function (error: any) {
            console.log(error);
          });
          
          const resValue = async () => {
            const a = await value;
            if(a){
              return a;
            }
            return ;
          };
         return resValue();
          
          
}
