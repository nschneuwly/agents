import type { LangGraphStateType } from '../state/langGraphState'

export const langGraphText = async (
	_state: LangGraphStateType,
): Promise<Partial<LangGraphStateType>> => ({
	outputMessage: 'This is a placeholder text for the LangGraph node.',
})