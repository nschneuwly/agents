// Defines the graph for the Location Services Agent,
// which includes an LLM node and a tool calling node.
// The agent is designed to handle geospatial queries and
// operations using ArcGIS services.

import { START, END, StateGraph } from '@langchain/langgraph/web';
import type { AgentRegistration } from '@arcgis/ai-components/utils/index.js';
import { LangGraphState, type LangGraphStateType } from '../state/langGraphState';
import { langGraphText } from '../nodes/langGraphText';


const createLangGraphAgentGraph = (): StateGraph<LangGraphStateType> =>
  new StateGraph(LangGraphState)
    .addNode('text', langGraphText)
    .addEdge(START, 'text')
    .addEdge('text', END) as StateGraph<LangGraphStateType>;


export const LangGraphAgent: AgentRegistration = {
  id: 'langGraph',
  name: 'Lang Graph',
  description: "Agent description here",
  createGraph: createLangGraphAgentGraph,
  workspace: LangGraphState,
};
