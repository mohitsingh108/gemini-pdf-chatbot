"use client"

import type React from "react"
import { useChat } from "@ai-sdk/react"
import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Send, Paperclip, Bot, User, Plus, MessageSquare, Sparkles, FileText, Menu, X } from "lucide-react"
import Image from "next/image"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

export default function Chat() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | undefined>(undefined)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: "/api/chat",
  })

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions")
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
        }))
        setChatSessions(sessions)
      } catch (error) {
        console.error("Error loading chat sessions:", error)
        localStorage.removeItem("chatSessions")
      }
    }
  }, [])

  // Generate title from first message
  const generateTitle = useCallback((firstMessage: string) => {
    if (!firstMessage) return "New Chat"
    return firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage
  }, [])

  // Save sessions to localStorage
  const saveSessions = useCallback((sessions: ChatSession[]) => {
    try {
      localStorage.setItem("chatSessions", JSON.stringify(sessions))
    } catch (error) {
      console.error("Error saving chat sessions:", error)
    }
  }, [])

  // Update current session with new messages
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      setChatSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) => {
          if (session.id === currentSessionId) {
            const title = session.title === "New Chat" ? generateTitle(messages[0]?.content || "") : session.title
            return { ...session, messages: [...messages], title }
          }
          return session
        })

        // Save to localStorage
        saveSessions(updatedSessions)
        return updatedSessions
      })
    }
  }, [messages, currentSessionId, generateTitle, saveSessions])

  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }

    setChatSessions((prevSessions) => {
      const updatedSessions = [newSession, ...prevSessions]
      saveSessions(updatedSessions)
      return updatedSessions
    })

    setCurrentSessionId(newSession.id)
    setMessages([])
    setFiles(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [setMessages, saveSessions])

  const loadChatSession = useCallback(
    (sessionId: string) => {
      const session = chatSessions.find((s) => s.id === sessionId)
      if (session) {
        setCurrentSessionId(sessionId)
        setMessages(session.messages)
      }
    },
    [chatSessions, setMessages],
  )

  const deleteChatSession = useCallback(
    (sessionId: string) => {
      setChatSessions((prevSessions) => {
        const updatedSessions = prevSessions.filter((s) => s.id !== sessionId)
        saveSessions(updatedSessions)
        return updatedSessions
      })

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setMessages([])
      }
    },
    [currentSessionId, setMessages, saveSessions],
  )

  const handleReset = useCallback(() => {
    if (currentSessionId) {
      deleteChatSession(currentSessionId)
    } else {
      setMessages([])
    }
    setFiles(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [currentSessionId, deleteChatSession, setMessages])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files)
    }
  }, [])

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      // Create new session if none exists and there's input
      if (!currentSessionId && input.trim()) {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
        }

        setChatSessions((prevSessions) => {
          const updatedSessions = [newSession, ...prevSessions]
          saveSessions(updatedSessions)
          return updatedSessions
        })

        setCurrentSessionId(newSession.id)
      }

      handleSubmit(event, {
        experimental_attachments: files,
      })

      setFiles(undefined)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [currentSessionId, input, handleSubmit, files, saveSessions],
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out overflow-hidden bg-white/80 backdrop-blur-sm border-r border-slate-200/60 flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-slate-200/60 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Gemini Chat</h2>
                  <p className="text-xs text-blue-100">AI Assistant</p>
                </div>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 font-medium text-sm">Chat History</span>
                <Button onClick={createNewChat} size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-100">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                      onClick={() => loadChatSession(session.id)}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-slate-500" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium text-slate-800">{session.title}</div>
                          <div className="text-xs text-slate-500">{session.createdAt.toLocaleDateString()}</div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChatSession(session.id)
                          }}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {chatSessions.length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-sm">No chat history yet</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-200/60 p-4">
            <div className="text-xs text-slate-500 text-center">Powered by Google Gemini</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                onClick={() => setSidebarOpen(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Gemini PDF Chat
                </h1>
                <p className="text-sm text-slate-500">AI-powered document assistant</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
            Reset Chat
          </Button>
        </header>

        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 shadow-xl">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to Gemini PDF Chat</h2>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Upload a PDF and start asking questions about its content, or just chat normally with our AI
                    assistant.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-md transition-shadow">
                      <FileText className="w-8 h-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold text-slate-800 mb-1">PDF Analysis</h3>
                      <p className="text-sm text-slate-600">Upload and analyze PDF documents with AI</p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-md transition-shadow">
                      <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
                      <h3 className="font-semibold text-slate-800 mb-1">Smart Chat</h3>
                      <p className="text-sm text-slate-600">Have intelligent conversations with Gemini AI</p>
                    </Card>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-4 max-w-3xl ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700"
                      }`}
                    >
                      {message.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>

                    <Card
                      className={`p-4 shadow-lg border-0 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          : "bg-white border border-slate-200/60"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                      {/* Display attachments */}
                      {message.experimental_attachments && (
                        <div className="mt-4 space-y-3">
                          {message.experimental_attachments
                            .filter(
                              (attachment) =>
                                attachment?.contentType?.startsWith("image/") ||
                                attachment?.contentType?.startsWith("application/pdf"),
                            )
                            .map((attachment, index) =>
                              attachment.contentType?.startsWith("image/") ? (
                                <Image
                                  key={`${message.id}-${index}`}
                                  src={attachment.url || "/placeholder.svg"}
                                  width={300}
                                  height={200}
                                  alt={attachment.name ?? `attachment-${index}`}
                                  className="rounded-lg border shadow-sm"
                                />
                              ) : attachment.contentType?.startsWith("application/pdf") ? (
                                <div
                                  key={`${message.id}-${index}`}
                                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-5 h-5 text-red-600" />
                                    <p className="font-medium text-slate-700">
                                      {attachment.name ?? `PDF Document ${index + 1}`}
                                    </p>
                                  </div>
                                  <iframe
                                    src={attachment.url}
                                    width="100%"
                                    height="400"
                                    title={attachment.name ?? `attachment-${index}`}
                                    className="rounded border shadow-sm"
                                  />
                                </div>
                              ) : null,
                            )}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* File Upload */}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  className="hidden"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  Upload Files
                </Button>
                {files && files.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{files.length} file(s) selected</span>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about your PDF or chat normally..."
                  className="flex-1 h-12 px-4 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() && !files}
                  className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
