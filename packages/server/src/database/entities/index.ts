import { ChatFlow } from './ChatFlow.js'
import { ChatMessage } from './ChatMessage.js'
import { ChatMessageFeedback } from './ChatMessageFeedback.js'
import { Credential } from './Credential.js'
import { Tool } from './Tool.js'
import { Assistant } from './Assistant.js'
import { Variable } from './Variable.js'
import { DocumentStore } from './DocumentStore.js'
import { DocumentStoreFileChunk } from './DocumentStoreFileChunk.js'
import { Lead } from './Lead.js'
import { UpsertHistory } from './UpsertHistory.js'
import { Dataset } from './Dataset.js'
import { DatasetRow } from './DatasetRow.js'
import { EvaluationRun } from './EvaluationRun.js'
import { Evaluation } from './Evaluation.js'
import { Evaluator } from './Evaluator.js'
import { ApiKey } from './ApiKey.js'
import { CustomTemplate } from './CustomTemplate.js'
import { Execution } from './Execution.js'
import { User } from './User.js'
import { Workspace } from './Workspace.js'
import { WorkspaceUser } from './WorkspaceUser.js'
import { WorkspaceInvite } from './WorkspaceInvite.js'

export const entities = {
    ChatFlow,
    ChatMessage,
    ChatMessageFeedback,
    Credential,
    Tool,
    Assistant,
    Variable,
    UpsertHistory,
    DocumentStore,
    DocumentStoreFileChunk,
    Lead,
    Dataset,
    DatasetRow,
    Evaluation,
    EvaluationRun,
    Evaluator,
    ApiKey,
    User,
    Workspace,
    WorkspaceUser,
    WorkspaceInvite,

    CustomTemplate,
    Execution
}
