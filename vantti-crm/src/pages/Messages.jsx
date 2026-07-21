import React, { useState } from 'react';
import { Copy, Check, MessageCircle, ArrowRightCircle, Video, FileText, Clock, ThumbsUp } from 'lucide-react';
import '../styles/messages.css';

const TEMPLATES = [
  {
    id: 1,
    title: 'Primeira Abordagem',
    icon: <MessageCircle size={18} className="icon" />,
    text: `Olá! Aqui é da Vantti. Tudo bem?
Notei que sua clínica tem um excelente potencial em [Cidade], mas vi que o atendimento no WhatsApp pode estar sobrecarregando a equipe.
Nós ajudamos clínicas a automatizar o agendamento de avaliações, filtrando curiosos e marcando pacientes 24h por dia.
Faz sentido para você dar uma olhada rápida em como isso funciona na prática?`
  },
  {
    id: 2,
    title: 'Follow-up (Sem Resposta)',
    icon: <ArrowRightCircle size={18} className="icon" />,
    text: `Oi, [Nome]! Passando rapidinho pra saber se você conseguiu ver a mensagem anterior.
Entendo que a rotina da clínica é corrida. Se quiser, me avise qual o melhor horário para falarmos por 5 minutinhos sobre como dobrar os agendamentos pelo WhatsApp.`
  },
  {
    id: 3,
    title: 'Envio da Demonstração',
    icon: <Video size={18} className="icon" />,
    text: `Legal, [Nome]! Conforme combinamos, segue o link com uma rápida demonstração de como a automação funciona para uma clínica odontológica:

[LINK AQUI]

Dá uma olhada e me fala se é isso que você imagina para a sua recepção.`
  },
  {
    id: 4,
    title: 'Envio da Proposta',
    icon: <FileText size={18} className="icon" />,
    text: `Tudo pronto, [Nome]! 
Segue o arquivo com a proposta comercial para a implementação da automação na sua clínica.
Coloquei todos os detalhes e prazos que discutimos. 

Qualquer dúvida específica, pode me mandar aqui. Estima um prazo para analisarem?`
  },
  {
    id: 5,
    title: 'Cobrança de Resposta (Proposta)',
    icon: <Clock size={18} className="icon" />,
    text: `Olá, [Nome], bom dia!
Conseguiram analisar a proposta que enviei na [Dia da Semana]?
Fico à disposição caso algum ponto não tenha ficado claro ou se precisarem ajustar algo para darmos o próximo passo.`
  },
  {
    id: 6,
    title: 'Mensagem de Fechamento',
    icon: <ThumbsUp size={18} className="icon" />,
    text: `Excelente notícia, [Nome]! 🎉
Fico muito feliz que vamos trabalhar juntos para turbinar os agendamentos da clínica.

Para iniciarmos os trabalhos, segue a chave PIX / Link de pagamento:
[DADOS DE PAGAMENTO]

Assim que confirmar, me envia o comprovante para eu te passar o checklist de onboarding da equipe técnica.`
  }
];

const Messages = () => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="messages-container">
      <div className="page-header">
        <div>
          <h1>Modelos de Mensagens</h1>
          <p>Copie e cole os scripts para manter o padrão de atendimento</p>
        </div>
      </div>

      <div className="messages-grid">
        {TEMPLATES.map(template => (
          <div className="message-card" key={template.id}>
            <div className="message-card-header">
              <h2>{template.icon} {template.title}</h2>
            </div>
            <div className="message-body">
              {template.text}
            </div>
            <button 
              className={`copy-btn ${copiedId === template.id ? 'copied' : ''}`}
              onClick={() => handleCopy(template.id, template.text)}
            >
              {copiedId === template.id ? (
                <><Check size={16} /> Copiado!</>
              ) : (
                <><Copy size={16} /> Copiar Mensagem</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
