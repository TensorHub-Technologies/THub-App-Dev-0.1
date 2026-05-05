import { CoworkExecutor, createCoworkExecutor } from './CoworkExecutor'

// Backward-compatible exports for existing imports/tests.
export { CoworkExecutor as CoworkOrchestratorService, createCoworkExecutor as createCoworkOrchestrator }

export default {
    createCoworkOrchestrator: createCoworkExecutor,
    CoworkOrchestratorService: CoworkExecutor
}
