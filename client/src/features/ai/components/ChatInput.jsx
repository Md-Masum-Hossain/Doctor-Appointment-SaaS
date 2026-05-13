import { useState, useRef, useEffect } from 'react'
import { Send, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { THEME_COLORS } from '../../../constants/theme'

export function ChatInput({ value, onChange, onSendMessage, isLoading, placeholder }) {
  const textareaRef = useRef(null)
  const message = value ?? ''

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      onChange?.('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isReady = message.trim() && !isLoading

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky bottom-0 border-t border-slate-200 bg-white/90 px-4 py-4 shadow-[0_-20px_50px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-2 transition-all duration-200"
        style={{
          boxShadow: isReady ? `0 0 0 2px ${THEME_COLORS.primary}20` : 'none',
        }}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Describe your symptoms, sleep, stress, or wellness question...'}
          rows={1}
          disabled={isLoading}
          enterKeyHint="send"
          autoComplete="off"
          className="min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 outline-none placeholder-slate-400 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
        />
        <motion.button
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          whileHover={isReady ? { scale: 1.05 } : {}}
          whileTap={isReady ? { scale: 0.95 } : {}}
          className="my-auto flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200"
          style={{
            backgroundColor: isReady ? THEME_COLORS.primary : '#E5E7EB',
            cursor: isReady ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              <Loader size={20} color="white" />
            </motion.div>
          ) : (
            <Send size={20} color={message.trim() && !isLoading ? 'white' : '#9CA3AF'} />
          )}
        </motion.button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        Press <kbd className="rounded bg-gray-200 px-2 py-0.5">Enter</kbd> to send • <kbd className="rounded bg-gray-200 px-2 py-0.5">Shift + Enter</kbd> for new line
      </p>
    </motion.div>
  )
}
