"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = void 0;
const ChatFlow_1 = require("./ChatFlow");
const ChatMessage_1 = require("./ChatMessage");
const ChatMessageFeedback_1 = require("./ChatMessageFeedback");
const Credential_1 = require("./Credential");
const Tool_1 = require("./Tool");
const Assistant_1 = require("./Assistant");
const Variable_1 = require("./Variable");
const DocumentStore_1 = require("./DocumentStore");
const DocumentStoreFileChunk_1 = require("./DocumentStoreFileChunk");
const Lead_1 = require("./Lead");
const UpsertHistory_1 = require("./UpsertHistory");
const Dataset_1 = require("./Dataset");
const DatasetRow_1 = require("./DatasetRow");
const EvaluationRun_1 = require("./EvaluationRun");
const Evaluation_1 = require("./Evaluation");
const Evaluator_1 = require("./Evaluator");
const ApiKey_1 = require("./ApiKey");
const CustomTemplate_1 = require("./CustomTemplate");
const Execution_1 = require("./Execution");
const User_1 = require("./User");
const Workspace_1 = require("./Workspace");
const WorkspaceUser_1 = require("./WorkspaceUser");
const WorkspaceInvite_1 = require("./WorkspaceInvite");
exports.entities = {
    ChatFlow: ChatFlow_1.ChatFlow,
    ChatMessage: ChatMessage_1.ChatMessage,
    ChatMessageFeedback: ChatMessageFeedback_1.ChatMessageFeedback,
    Credential: Credential_1.Credential,
    Tool: Tool_1.Tool,
    Assistant: Assistant_1.Assistant,
    Variable: Variable_1.Variable,
    UpsertHistory: UpsertHistory_1.UpsertHistory,
    DocumentStore: DocumentStore_1.DocumentStore,
    DocumentStoreFileChunk: DocumentStoreFileChunk_1.DocumentStoreFileChunk,
    Lead: Lead_1.Lead,
    Dataset: Dataset_1.Dataset,
    DatasetRow: DatasetRow_1.DatasetRow,
    Evaluation: Evaluation_1.Evaluation,
    EvaluationRun: EvaluationRun_1.EvaluationRun,
    Evaluator: Evaluator_1.Evaluator,
    ApiKey: ApiKey_1.ApiKey,
    User: User_1.User,
    Workspace: Workspace_1.Workspace,
    WorkspaceUser: WorkspaceUser_1.WorkspaceUser,
    WorkspaceInvite: WorkspaceInvite_1.WorkspaceInvite,
    CustomTemplate: CustomTemplate_1.CustomTemplate,
    Execution: Execution_1.Execution
};
//# sourceMappingURL=index.js.map