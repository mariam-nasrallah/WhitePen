import * as vscode from 'vscode';

import { WHITEPEN_CONTEXT_PREFIX } from '../constants/commands';

export const setContext = async (key: string, value: unknown): Promise<void> => {
  await vscode.commands.executeCommand('setContext', `${WHITEPEN_CONTEXT_PREFIX}${key}`, value);
};