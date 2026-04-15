import { Init1693835579790 } from './1693835579790-Init.js'
import { ModifyChatFlow1693920824108 } from './1693920824108-ModifyChatFlow.js'
import { ModifyChatMessage1693921865247 } from './1693921865247-ModifyChatMessage.js'
import { ModifyCredential1693923551694 } from './1693923551694-ModifyCredential.js'
import { ModifyTool1693924207475 } from './1693924207475-ModifyTool.js'
import { AddApiConfig1694090982460 } from './1694090982460-AddApiConfig.js'
import { AddAnalytic1694432361423 } from './1694432361423-AddAnalytic.js'
import { AddChatHistory1694657778173 } from './1694657778173-AddChatHistory.js'
import { AddAssistantEntity1699325775451 } from './1699325775451-AddAssistantEntity.js'
import { AddUsedToolsToChatMessage1699481607341 } from './1699481607341-AddUsedToolsToChatMessage.js'
import { AddCategoryToChatFlow1699900910291 } from './1699900910291-AddCategoryToChatFlow.js'
import { AddFileAnnotationsToChatMessage1700271021237 } from './1700271021237-AddFileAnnotationsToChatMessage.js'
import { AddFileUploadsToChatMessage1701788586491 } from './1701788586491-AddFileUploadsToChatMessage.js'
import { AddVariableEntity1699325775451 } from './1702200925471-AddVariableEntity.js'
import { AddSpeechToText1706364937060 } from './1706364937060-AddSpeechToText.js'
import { AddFeedback1707213619308 } from './1707213619308-AddFeedback.js'
import { AddUpsertHistoryEntity1709814301358 } from './1709814301358-AddUpsertHistoryEntity.js'
import { AddLead1710832117612 } from './1710832117612-AddLead.js'
import { AddLeadToChatMessage1711537986113 } from './1711537986113-AddLeadToChatMessage.js'
import { AddDocumentStore1711637331047 } from './1711637331047-AddDocumentStore.js'
import { AddEvaluation1714548873039 } from './1714548873039-AddEvaluation.js'
import { AddDatasets1714548903384 } from './1714548903384-AddDataset.js'
import { AddAgentReasoningToChatMessage1714679514451 } from './1714679514451-AddAgentReasoningToChatMessage.js'
import { AddEvaluator1714808591644 } from './1714808591644-AddEvaluator.js'
import { AddVectorStoreConfigToDocStore1715861032479 } from './1715861032479-AddVectorStoreConfigToDocStore.js'
import { AddTypeToChatFlow1716300000000 } from './1716300000000-AddTypeToChatFlow.js'
import { AddApiKey1720230151480 } from './1720230151480-AddApiKey.js'
import { AddActionToChatMessage1721078251523 } from './1721078251523-AddActionToChatMessage.js'
import { AddCustomTemplate1725629836652 } from './1725629836652-AddCustomTemplate.js'
import { AddArtifactsToChatMessage1726156258465 } from './1726156258465-AddArtifactsToChatMessage.js'
import { AddFollowUpPrompts1726666294213 } from './1726666294213-AddFollowUpPrompts.js'
import { AddTypeToAssistant1733011290987 } from './1733011290987-AddTypeToAssistant.js'
import { AddSeqNoToDatasetRow1733752119696 } from './1733752119696-AddSeqNoToDatasetRow.js'
import { AddExecutionEntity1738090872625 } from './1738090872625-AddExecutionEntity.js'
import { FixOpenSourceAssistantTable1743758056188 } from './1743758056188-FixOpenSourceAssistantTable.js'
import { AddErrorToEvaluationRun1744964560174 } from './1744964560174-AddErrorToEvaluationRun.js'
import { AddTextToSpeechToChatFlow1754986486669 } from './1754986486669-AddTextToSpeechToChatFlow.js'
import { ModifyChatflowType1755066758601 } from './1755066758601-ModifyChatflowType.js'
import { AddTextToSpeechToChatFlow1759419136055 } from './1759419136055-AddTextToSpeechToChatFlow.js'
import { AddChatFlowNameIndex1759424923093 } from './1759424923093-AddChatFlowNameIndex.js'
import { AddTenantIdToEvaluatorAndEvaluation1761000000000 } from './1761000000000-AddTenantIdToEvaluatorAndEvaluation.js'
import { AddTenantIdToDataset1761100000000 } from './1761100000000-AddTenantIdToDataset.js'
import { AddAuthUser1761312000000 } from './1761312000000-AddAuthUser.js'
import { AddWorkspaceInviteSupport1761500000000 } from './1761500000000-AddWorkspaceInviteSupport.js'

export const sqliteMigrations = [
    Init1693835579790,
    ModifyChatFlow1693920824108,
    ModifyChatMessage1693921865247,
    ModifyCredential1693923551694,
    ModifyTool1693924207475,
    AddApiConfig1694090982460,
    AddAnalytic1694432361423,
    AddChatHistory1694657778173,
    AddAssistantEntity1699325775451,
    AddUsedToolsToChatMessage1699481607341,
    AddCategoryToChatFlow1699900910291,
    AddFileAnnotationsToChatMessage1700271021237,
    AddVariableEntity1699325775451,
    AddFileUploadsToChatMessage1701788586491,
    AddSpeechToText1706364937060,
    AddUpsertHistoryEntity1709814301358,
    AddEvaluation1714548873039,
    AddDatasets1714548903384,
    AddEvaluator1714808591644,
    AddFeedback1707213619308,
    AddDocumentStore1711637331047,
    AddLead1710832117612,
    AddLeadToChatMessage1711537986113,
    AddAgentReasoningToChatMessage1714679514451,
    AddVectorStoreConfigToDocStore1715861032479,
    AddTypeToChatFlow1716300000000,
    AddApiKey1720230151480,
    AddActionToChatMessage1721078251523,
    AddArtifactsToChatMessage1726156258465,
    AddFollowUpPrompts1726666294213,
    AddTypeToAssistant1733011290987,
    AddCustomTemplate1725629836652,

    AddSeqNoToDatasetRow1733752119696,

    AddExecutionEntity1738090872625,
    FixOpenSourceAssistantTable1743758056188,
    AddErrorToEvaluationRun1744964560174,
    AddTextToSpeechToChatFlow1754986486669,
    ModifyChatflowType1755066758601,
    AddTextToSpeechToChatFlow1759419136055,
    AddChatFlowNameIndex1759424923093,
    AddTenantIdToEvaluatorAndEvaluation1761000000000,
    AddTenantIdToDataset1761100000000,
    AddAuthUser1761312000000,
    AddWorkspaceInviteSupport1761500000000
]
