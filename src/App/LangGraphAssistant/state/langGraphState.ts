import { Annotation } from '@langchain/langgraph/web'
import { createAgentRuntimeState } from '@arcgis/ai-components/utils/index.js'


export const LangGraphState = Annotation.Root({
  ...createAgentRuntimeState(),


})


export type LangGraphStateType = typeof LangGraphState.State