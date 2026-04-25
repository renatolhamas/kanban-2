export interface MessageMock {
  id: string;
  text: string;
  sender: 'contact' | 'user';
  time: string;
}

export const mockMessages: MessageMock[] = [
  { id: '1', text: "Olá! Como posso ajudar?", sender: 'contact', time: "10:30" },
  { id: '2', text: "Gostaria de saber o preço do plano premium.", sender: 'user', time: "10:31" },
  { id: '3', text: "Claro! Nosso plano premium custa R$ 99/mês e inclui todas as funcionalidades.", sender: 'contact', time: "10:32" },
  { id: '4', text: "Excelente. Como faço para assinar?", sender: 'user', time: "10:33" },
  { id: '5', text: "Vou te enviar o link agora mesmo.", sender: 'contact', time: "10:34" },
  { id: '6', text: "Aproveitando, quais as formas de pagamento?", sender: 'user', time: "10:35" },
  { id: '7', text: "Aceitamos PIX, Cartão de Crédito e Boleto Bancário.", sender: 'contact', time: "10:36" },
  { id: '8', text: "O PIX tem desconto?", sender: 'user', time: "10:37" },
  { id: '9', text: "Sim! No PIX você tem 10% de desconto adicional.", sender: 'contact', time: "10:38" },
  { id: '10', text: "Perfeito, vou querer pelo PIX então.", sender: 'user', time: "10:39" },
];
