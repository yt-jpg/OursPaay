import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export class AIChatService {
  private confidenceThreshold = 0.7;

  async generateResponse(message: string, userId: string): Promise<{
    content: string;
    confidence: number;
    context: any;
    requiresHuman: boolean;
  }> {
    try {
      // Get user context for better responses
      const user = await storage.getUser(userId);
      const charges = await storage.getCharges(userId);
      const wallet = await storage.getWallet(userId);

      // Build context for AI
      const context = {
        userRole: user?.role,
        activeCharges: charges.filter(c => c.status === 'pending').length,
        walletBalance: wallet.balance,
        recentActivity: charges.slice(0, 3),
      };

      const systemPrompt = this.buildSystemPrompt(context);

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_completion_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      // Calculate confidence based on response content
      const confidence = this.calculateConfidence(message, aiResponse);
      
      return {
        content: aiResponse.response || "Desculpe, não consegui processar sua pergunta.",
        confidence,
        context: aiResponse.context,
        requiresHuman: confidence < this.confidenceThreshold,
      };

    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Fallback response
      return {
        content: "Desculpe, estou com dificuldades técnicas. Você gostaria de falar com um atendente humano?",
        confidence: 0,
        context: { error: true },
        requiresHuman: true,
      };
    }
  }

  private buildSystemPrompt(context: any): string {
    return `
Você é um assistente IA especializado em cobranças e pagamentos da plataforma OursPaay.

CONTEXTO DO USUÁRIO:
- Papel: ${context.userRole}
- Cobranças ativas: ${context.activeCharges}
- Saldo da carteira: R$ ${context.walletBalance}

INSTRUÇÕES:
1. Responda sempre em português brasileiro
2. Seja útil, preciso e profissional
3. Para questões específicas de conta, forneça informações baseadas no contexto
4. Para questões complexas ou que envolvam transações, sugira contato humano
5. Mantenha respostas concisas mas completas

TÓPICOS QUE VOCÊ PODE AJUDAR:
- Como criar cobranças
- Métodos de pagamento disponíveis
- Funcionamento da carteira digital
- Programa de indicações
- Dúvidas sobre taxas e prazos
- Problemas técnicos básicos

RESPONDA EM JSON:
{
  "response": "sua resposta aqui",
  "confidence": 0.8,
  "context": {
    "topic": "identificado",
    "action_required": false
  },
  "suggestions": ["sugestão 1", "sugestão 2"]
}
`;
  }

  private calculateConfidence(userMessage: string, aiResponse: any): number {
    // Simple confidence calculation based on response content
    const message = userMessage.toLowerCase();
    let confidence = 0.5;

    // FAQ topics with high confidence
    const highConfidenceTopics = [
      'como criar', 'como fazer', 'o que é', 'qual é',
      'métodos de pagamento', 'pix', 'boleto', 'cartão',
      'carteira digital', 'saldo', 'cashback',
      'indicação', 'referral', 'programa de indicação'
    ];

    // Medium confidence topics
    const mediumConfidenceTopics = [
      'problema', 'erro', 'não funciona', 'ajuda',
      'suporte', 'dúvida', 'taxa', 'prazo'
    ];

    // Low confidence topics (require human)
    const lowConfidenceTopics = [
      'cancelar', 'estornar', 'reembolso', 'disputa',
      'legal', 'jurídico', 'contrato', 'multa'
    ];

    if (highConfidenceTopics.some(topic => message.includes(topic))) {
      confidence = 0.9;
    } else if (mediumConfidenceTopics.some(topic => message.includes(topic))) {
      confidence = 0.6;
    } else if (lowConfidenceTopics.some(topic => message.includes(topic))) {
      confidence = 0.3;
    }

    // Adjust based on response quality
    if (aiResponse.response && aiResponse.response.length > 50) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  async escalateToHuman(conversationId: string, userId: string, reason: string): Promise<void> {
    // Create notification for support team
    const supportUsers = await this.getSupportUsers();
    
    for (const supportUser of supportUsers) {
      await storage.createNotification({
        userId: supportUser.id,
        type: 'message',
        title: 'Chat escalado para atendimento humano',
        content: `Conversa ${conversationId} escalada: ${reason}`,
        data: { conversationId, originalUserId: userId, reason },
      });
    }

    // Add system message to conversation
    await storage.createMessage({
      conversationId,
      senderType: 'system',
      content: 'Conversa transferida para atendimento humano. Um agente entrará em contato em breve.',
      messageType: 'text',
    });
  }

  private async getSupportUsers() {
    // This would query users with support role
    // For now, return empty array as placeholder
    return [];
  }

  async getQuickReplies(context: any): Promise<string[]> {
    const commonReplies = [
      "Como posso criar uma nova cobrança?",
      "Quais métodos de pagamento estão disponíveis?",
      "Como funciona o programa de indicações?",
      "Como sacar dinheiro da carteira?",
      "Preciso falar com um atendente",
    ];

    // Could be enhanced to provide contextual quick replies
    return commonReplies;
  }
}

export const aiChatService = new AIChatService();
