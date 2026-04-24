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
];
