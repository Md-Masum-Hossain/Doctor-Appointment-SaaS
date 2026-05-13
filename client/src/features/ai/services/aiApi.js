import apiClient from '../../../services/apiClient'

export const aiApi = {
  async sendMessage(message) {
    return aiApi.sendConversation([
      {
        role: 'user',
        content: message,
      },
    ])
  },

  async sendConversation(messages) {
    const response = await apiClient.post('/ai/chat', {
      messages,
    })

    return response.data?.data || response.data
  },
}
