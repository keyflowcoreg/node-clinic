export type MessageType =
  | 'text'
  | 'quick-replies'
  | 'clinic-card'
  | 'treatment-card'
  | 'carousel'
  | 'lead-form'
  | 'link'

export interface BotMessage {
  id: string
  type: MessageType
  text?: string
  options?: QuickReply[]
  cards?: CardData[]
  link?: { label: string; url: string }
  delay?: number
  sender: 'bot' | 'user'
}

export interface QuickReply {
  label: string
  value: string
  icon?: string
  action?: 'navigate' | 'next-step' | 'lead-form'
  url?: string
}

export interface CardData {
  type: 'clinic' | 'treatment'
  id: string
  title: string
  subtitle?: string
  image?: string
  rating?: number
  reviewCount?: number
  priceFrom?: number
  priceTo?: number
  duration?: string
  ctaLabel: string
  ctaUrl: string
}

export interface FlowStep {
  id: string
  messages: Omit<BotMessage, 'id' | 'sender'>[]
  onSelect?: Record<string, string>
}

export interface Flow {
  id: string
  steps: Record<string, FlowStep>
  entryStep: string
}

export interface ChatState {
  currentFlowId: string
  currentStepId: string
  messages: BotMessage[]
  isTyping: boolean
  isOpen: boolean
  leadCaptured: boolean
}

export function createInitialState(): ChatState {
  return {
    currentFlowId: 'welcome',
    currentStepId: 'greeting',
    messages: [],
    isTyping: false,
    isOpen: false,
    leadCaptured: false,
  }
}

export function processUserSelection(
  state: ChatState,
  selectedValue: string,
  flows: Record<string, Flow>,
): ChatState {
  const userMessage: BotMessage = {
    id: crypto.randomUUID(),
    type: 'text',
    text: selectedValue,
    sender: 'user',
  }

  const newMessages = [...state.messages, userMessage]

  if (selectedValue.startsWith('nav:')) {
    return {
      ...state,
      messages: newMessages,
      isTyping: false,
    }
  }

  if (selectedValue.startsWith('flow:')) {
    const flowId = selectedValue.slice(5)
    const flow = flows[flowId]
    if (!flow) return { ...state, messages: newMessages, isTyping: false }

    return {
      ...state,
      currentFlowId: flowId,
      currentStepId: flow.entryStep,
      messages: newMessages,
      isTyping: true,
    }
  }

  const currentFlow = flows[state.currentFlowId]
  if (!currentFlow) return { ...state, messages: newMessages, isTyping: false }

  const currentStep = currentFlow.steps[state.currentStepId]
  if (!currentStep?.onSelect) return { ...state, messages: newMessages, isTyping: false }

  const nextStepId = currentStep.onSelect[selectedValue]
  if (!nextStepId) return { ...state, messages: newMessages, isTyping: false }

  if (nextStepId.startsWith('flow:')) {
    const flowId = nextStepId.slice(5)
    const flow = flows[flowId]
    if (!flow) return { ...state, messages: newMessages, isTyping: false }

    return {
      ...state,
      currentFlowId: flowId,
      currentStepId: flow.entryStep,
      messages: newMessages,
      isTyping: true,
    }
  }

  return {
    ...state,
    currentStepId: nextStepId,
    messages: newMessages,
    isTyping: true,
  }
}

export function getStepMessages(
  flowId: string,
  stepId: string,
  flows: Record<string, Flow>,
): BotMessage[] {
  const flow = flows[flowId]
  if (!flow) return []

  const step = flow.steps[stepId]
  if (!step) return []

  return step.messages.map((msg) => ({
    ...msg,
    id: crypto.randomUUID(),
    sender: 'bot' as const,
  }))
}

export function appendMessages(state: ChatState, messages: BotMessage[]): ChatState {
  return {
    ...state,
    messages: [...state.messages, ...messages],
    isTyping: false,
  }
}
