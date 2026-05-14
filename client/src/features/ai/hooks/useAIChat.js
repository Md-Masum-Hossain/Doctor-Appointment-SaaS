import { useState, useCallback, useRef, useEffect } from 'react'
import { aiApi } from '../services/aiApi'

export const useAIChat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messagesRef = useRef([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const toConversationPayload = useCallback((chatMessages) => {
    return chatMessages
      .filter((message) => message.type === 'user' || message.type === 'ai')
      .map((message) => ({
        role: message.type === 'ai' ? 'assistant' : 'user',
        content: message.content,
      }))
  }, [])

  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim()) return

      const trimmedMessage = userMessage.trim()

      // Add user message to chat
      const userMsg = {
        id: Date.now() + Math.random(),
        type: 'user',
        content: trimmedMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)

      try {
        const conversation = [...messagesRef.current, userMsg]
        const response = await aiApi.sendConversation(toConversationPayload(conversation))

        const aiMessage = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: response.reply,
          intent: response.intent,
          medicalInsights: response.medicalInsights || null,
          showMedicalUI: Boolean(response.medicalInsights),
          recommendedSpecialization: response.medicalInsights?.recommendedSpecialization || '',
          emergency: Boolean(response.medicalInsights?.emergency),
          tips: response.medicalInsights?.tips || [],
          possibleCauses: response.medicalInsights?.possibleCauses || [],
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
      } catch (err) {
        const errorMsg = {
          id: Date.now() + Math.random(),
          type: 'error',
          content: err.response?.data?.message || 'Failed to get AI response. Please try again.',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMsg])
        setError(err.response?.data?.message || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const selectQuickSymptom = useCallback(
    (symptom) => {
      const message = `I have ${symptom.toLowerCase()}`
      sendMessage(message)
    },
    [sendMessage],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    selectQuickSymptom,
    messagesEndRef,
    inputRef,
  }
}
