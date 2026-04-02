import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, X, RotateCcw } from 'lucide-react'
import {
  createInitialState,
  processUserSelection,
  getStepMessages,
  appendMessages,
  type ChatState,
  type BotMessage,
} from '../../lib/chatbot-engine'
import { getFlows } from '../../lib/chatbot-flows'
import { store } from '../../services/store'
import { trackConversion } from '../../utils/analytics'
import { TypingIndicator } from './chatbot/TypingIndicator'
import { ChatBubble } from './chatbot/ChatBubble'
import { QuickReplies } from './chatbot/QuickReplies'
import { CardCarousel } from './chatbot/CardCarousel'
import { LeadCaptureForm } from './chatbot/LeadCaptureForm'

export function ChatBot() {
  const location = useLocation()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ChatState>(() => createInitialState())
  const [answeredSteps, setAnsweredSteps] = useState<Set<string>>(new Set())

  const hidden = location.pathname.includes('/book')

  const flows = getFlows()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [state.messages, state.isTyping, scrollToBottom])

  function handleOpen() {
    if (state.messages.length === 0) {
      setState(prev => ({ ...prev, isOpen: true, isTyping: true }))
      setTimeout(() => {
        setState(prev => {
          const msgs = getStepMessages('welcome', 'greeting', flows)
          return appendMessages({ ...prev }, msgs)
        })
      }, 500)
    } else {
      setState(prev => ({ ...prev, isOpen: true }))
    }
  }

  function handleClose() {
    setState(prev => ({ ...prev, isOpen: false }))
  }

  function handleRestart() {
    const fresh = createInitialState()
    fresh.isOpen = true
    fresh.isTyping = true
    setAnsweredSteps(new Set())
    setState(fresh)
    setTimeout(() => {
      setState(prev => {
        const msgs = getStepMessages('welcome', 'greeting', flows)
        return appendMessages(prev, msgs)
      })
    }, 500)
  }

  function handleSelect(value: string) {
    // Mark current step as answered
    setAnsweredSteps(prev => new Set(prev).add(`${state.currentFlowId}:${state.currentStepId}`))

    // Handle navigation actions
    if (value.startsWith('nav:')) {
      const url = value.slice(4)
      if (url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        navigate(url)
        handleClose()
      }
      return
    }

    const nextState = processUserSelection(state, value, flows)
    setState(nextState)

    if (nextState.isTyping) {
      const delay = 400 + Math.random() * 400
      setTimeout(() => {
        setState(prev => {
          const msgs = getStepMessages(prev.currentFlowId, prev.currentStepId, flows)
          return appendMessages(prev, msgs)
        })
      }, delay)
    }
  }

  function handleLinkClick(url: string) {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      navigate(url)
      handleClose()
    }
  }

  function handleLeadSubmit(data: { name: string; email: string; phone: string }) {
    store.leads.create({
      source: 'chatbot',
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
    })
    trackConversion('chatbot_lead', 1)
    setState(prev => ({ ...prev, leadCaptured: true }))

    // Show thanks step
    setAnsweredSteps(prev => new Set(prev).add(`${state.currentFlowId}:${state.currentStepId}`))
    const nextState = processUserSelection(state, 'submitted', flows)
    setState(nextState)
    if (nextState.isTyping) {
      setTimeout(() => {
        setState(prev => {
          const msgs = getStepMessages(prev.currentFlowId, prev.currentStepId, flows)
          return appendMessages(prev, msgs)
        })
      }, 500)
    }
  }

  function handleLeadSkip() {
    setAnsweredSteps(prev => new Set(prev).add(`${state.currentFlowId}:${state.currentStepId}`))
    const nextState = processUserSelection(state, 'flow:welcome', flows)
    setState(nextState)
    setTimeout(() => {
      setState(prev => {
        const msgs = getStepMessages(prev.currentFlowId, prev.currentStepId, flows)
        return appendMessages(prev, msgs)
      })
    }, 500)
  }

  function renderMessage(msg: BotMessage, index: number) {
    const stepKey = `${msg.id}`
    const isLastBotMsg = (() => {
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].sender === 'bot') return state.messages[i].id === msg.id
      }
      return false
    })()
    const isAnswered = !isLastBotMsg || state.isTyping

    switch (msg.type) {
      case 'text':
      case 'link':
        return <ChatBubble key={stepKey} message={msg} onLinkClick={handleLinkClick} />
      case 'quick-replies':
        return (
          <div key={stepKey}>
            {msg.text && <ChatBubble message={msg} onLinkClick={handleLinkClick} />}
            {msg.options && (
              <QuickReplies
                options={msg.options}
                onSelect={handleSelect}
                disabled={isAnswered}
              />
            )}
          </div>
        )
      case 'carousel':
        return (
          <div key={stepKey}>
            {msg.text && <ChatBubble message={msg} onLinkClick={handleLinkClick} />}
            {msg.cards && <CardCarousel cards={msg.cards} onCardClick={handleLinkClick} />}
          </div>
        )
      case 'lead-form':
        return (
          <div key={stepKey}>
            {msg.text && <ChatBubble message={msg} onLinkClick={handleLinkClick} />}
            {!state.leadCaptured && (
              <LeadCaptureForm onSubmit={handleLeadSubmit} onSkip={handleLeadSkip} />
            )}
          </div>
        )
      case 'clinic-card':
      case 'treatment-card':
        return (
          <div key={stepKey}>
            {msg.text && <ChatBubble message={msg} onLinkClick={handleLinkClick} />}
            {msg.cards && <CardCarousel cards={msg.cards} onCardClick={handleLinkClick} />}
          </div>
        )
      default:
        return <ChatBubble key={stepKey} message={msg} onLinkClick={handleLinkClick} />
    }
  }

  if (hidden) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence mode="wait">
        {state.isOpen ? (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-[380px] max-h-[520px] flex flex-col bg-ivory border border-silver-light/30 shadow-xl sharp-edge
              max-sm:fixed max-sm:inset-3 max-sm:w-auto max-sm:max-h-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-graphite text-ivory shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-ivory/10 flex items-center justify-center sharp-edge">
                  <span className="text-xs font-display font-semibold">N</span>
                </div>
                <span className="text-sm font-display font-medium">Node Clinic</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRestart}
                  className="p-1.5 hover:bg-ivory/10 transition-colors sharp-edge"
                  aria-label="Ricomincia"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-ivory/10 transition-colors sharp-edge"
                  aria-label="Chiudi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
              {state.messages.map((msg, i) => renderMessage(msg, i))}
              {state.isTyping && (
                <div className="flex items-start mb-3">
                  <div className="w-7 h-7 bg-graphite text-ivory flex items-center justify-center shrink-0 mr-2 mt-1 sharp-edge">
                    <span className="text-xs font-display font-semibold">N</span>
                  </div>
                  <div className="bg-ivory-dark px-4 py-2.5 sharp-edge">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-silver-light/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-silver">Assistente Node Clinic</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="chat-toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handleOpen}
            className="w-14 h-14 bg-graphite text-ivory flex items-center justify-center sharp-edge shadow-lg hover:bg-graphite-light hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Apri assistente"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
