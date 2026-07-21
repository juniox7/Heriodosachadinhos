import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { MessageSquare } from 'lucide-react';
import '../styles/funnel.css';

const STAGES = [
  'Lead encontrado',
  'Primeiro contato enviado',
  'Respondeu',
  'Demonstração enviada',
  'Proposta enviada',
  'Negociação',
  'Venda fechada',
  'Não interessado'
];

const Funnel = () => {
  const { leads, updateLead } = useCRM();
  
  // Local state for dragging
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (draggedLeadId) {
      updateLead(draggedLeadId, { status: targetStatus });
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="funnel-container">
      <div className="page-header">
        <div>
          <h1>Funil de Vendas</h1>
          <p>Arraste os cards para avançar os leads na jornada</p>
        </div>
      </div>

      <div className="kanban-board">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage);
          
          return (
            <div 
              key={stage} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="kanban-column-header">
                <span>{stage}</span>
                <span className="count">{stageLeads.length}</span>
              </div>
              <div className="kanban-cards">
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                  >
                    <div className="empresa">{lead.empresa}</div>
                    <div className="responsavel">{lead.responsavel || lead.nicho}</div>
                    <div className="kanban-card-footer">
                      <span style={{ color: 'var(--text-muted)' }}>{lead.whatsapp}</span>
                      <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="card-action">
                        <MessageSquare size={14} /> Chamar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Funnel;
