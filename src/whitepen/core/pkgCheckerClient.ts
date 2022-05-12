import { Console } from 'console';
import * as vscode from 'vscode';
import { CVE, CveNodeProvider } from './cveDependencies';
import { Dependency } from './nodeDependencies';
import { checkTokenTime } from './whitePenAuth';
import WhitePenSecretsStore from './whitePenSecretsStore';
// import AuthSettings from "./authProvider";
const {default : axios} = require('axios');

export async function isPackageVuln(manager:string, label: string, version: string): Promise<boolean>{
  // AuthSettings.init(context);
     const settings = WhitePenSecretsStore.instance;
      await checkTokenTime(settings);
        let parsedVersion = version;
        let parsedLabel = label;

        if(parsedLabel.charAt(0) === "@"){
          parsedLabel = label.substring(1);
        }
        if(parsedVersion.charAt(0) === '^' || parsedVersion.charAt(0) === '~'){
          parsedVersion = version.substring(1);
        }
       
        var data = JSON.stringify({
            query: `query{
            PackageChecker(manager:"`+manager+`", package:"`+label+`", version:"`+parsedVersion+`"){
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
          const token = await settings.getAuthTokenData();
          var config = {
            method: 'post',
            url: 'https://pkgchecker.whitepen.io/o2e2j0mecgu/',
            headers: { 
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Authorization': 'Bearer ' + token,
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
          
        return Promise.resolve(value);
  }


export async function getCVES(manager: string, label: string, version: string): Promise<any>{
        let parsedVersion = version;
        if(parsedVersion.charAt(0) === '^' || parsedVersion.charAt(0) === '~'){
          parsedVersion = version.substring(1);
        }
        const settings = WhitePenSecretsStore.instance;
        await checkTokenTime(settings);
        var data = JSON.stringify({
            query: `query{
            PackageChecker(manager:"`+manager+`", package:"`+label+`", version:"`+parsedVersion+`"){
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
          const token = await authToken.getAuthTokenData();
          var config = {
            method: 'post',
            url: 'https://pkgchecker.whitepen.io/o2e2j0mecgu/',
            headers: { 
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Authorization': 'Bearer '+ token,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Content-Type': 'application/json',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'Cookie': 'csrftoken=L0HRVDNKyhomy9Q3JOc4lQ2DMRPkgfhwo6Hqv57pK0fRzz9j86tvuuT0Y7OFryzL'
            },
            data : data
          };
          //add verfication 
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
          
         return Promise.resolve(value);
          
          
}
