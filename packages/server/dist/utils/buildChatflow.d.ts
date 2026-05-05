import { Request } from 'express';
import { ICommonObject, IServerSideEventStreamer } from 'thub-components';
import { IExecuteFlowParams } from '../Interface';
declare const shouldAutoPlayTTS: (textToSpeechConfig: string | undefined | null) => boolean;
declare const generateTTSForResponseStream: (responseText: string, textToSpeechConfig: string | undefined, options: ICommonObject, chatId: string, chatMessageId: string, sseStreamer: IServerSideEventStreamer, abortController?: AbortController) => Promise<void>;
export declare const executeFlow: ({ componentNodes, incomingInput, chatflow, chatId, isEvaluation, evaluationRunId, appDataSource, telemetry, cachePool, sseStreamer, baseURL, isInternal, files, signal, isTool, tenantId }: IExecuteFlowParams) => Promise<any>;
/**
 * Build/Data Preperation for execute function
 * @param {Request} req
 * @param {boolean} isInternal
 */
export declare const utilBuildChatflow: (req: Request, isInternal?: boolean) => Promise<any>;
export { shouldAutoPlayTTS, generateTTSForResponseStream };
