import { ExtensionContext } from "../common/vscode/extensionContext";
import { ExtensionContext as VSCodeExtensionContext } from "../common/vscode/types";

export interface IBaseSnykModule {
//   readonly loadingBadge: ILoadingBadge;
//   statusBarItem: IStatusBarItem;
//   contextService: IContextService;
//   openerService: IOpenerService;
//   viewManagerService: IViewManagerService;
//   snykCode: ISnykCodeService;

  // Abstract methods
//   runScan(): Promise<void>;
//   runCodeScan(manual?: boolean): Promise<void>;
//   runOssScan(manual?: boolean): Promise<void>;
}

export interface ISnykLib {
//   enableCode(): Promise<void>;
//   checkAdvancedMode(): Promise<void>;
}

export interface IExtension extends IBaseSnykModule, ISnykLib {
  context: ExtensionContext | undefined;
  activate(context: VSCodeExtensionContext): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type errorType = Error | any;
