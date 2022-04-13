import { ExtensionContext } from "../common/vscode/extensionContext";
import { IBaseSnykModule } from "./interfaces";

export default abstract class BaseWhitePen implements IBaseSnykModule{
    context: ExtensionContext | undefined;

    constructor(){
        
    }
}