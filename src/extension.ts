
import * as vscode from 'vscode';
import WhitePen from './whitepen/extension';

const extension = new WhitePen();

export function activate(context: vscode.ExtensionContext): void {
  console.log('Activating WhitePen');
  void extension.activate(context);
}
export function deactivate(): void {
  console.log('Deactivating WhitePen');
  void extension.deactivate();
}

export function getExtension(): WhitePen {
  return extension;
}