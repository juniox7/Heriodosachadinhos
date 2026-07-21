import React from 'react';
import { useCRM } from '../context/CRMContext';
import { Users, PhoneCall, MessageCircle, FileText, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { isToday, isPast, parseISO } from 'date-fns';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { leads, tasks, sales } = useCRM();

  // Cálculos de Métricas
  const newLeads = leads.filter(l => l.status === 'Lead encontrado').length;
  const contactsMade = leads.filter(l => l.status !== 'Lead encontrado').length;
  const responded = leads.filter(l => ['Respondeu', 'Demonstração enviada', 'Proposta enviada', 'Negociação'].includes(l.status)).length;
  const proposalsSent = leads.filter(l => l.status === 'Proposta enviada').length;
  const salesClosed = sales.filter(s => s.status === 'Pago' || s.status === 'Pendente').length; // ou leads com status 'Venda fechada'

  const tasksToday = tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate))).length;
  const overdueReturns = tasks.filter(t => !t.completed && t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da sua máquina de vendas</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Users size={16} className="metric-icon" />
            <span>Leads Novos</span>
          </div>
          <div className="metric-value">{newLeads}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <PhoneCall size={16} className="metric-icon" />
            <span>Contatos Feitos</span>
          </div>
          <div className="metric-value">{contactsMade}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <MessageCircle size={16} className="metric-icon" />
            <span>Responderam</span>
          </div>
          <div className="metric-value">{responded}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <FileText size={16} className="metric-icon" />
            <span>Propostas Enviadas</span>
          </div>
          <div className="metric-value">{proposalsSent}</div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <CheckCircle size={16} style={{ color: 'var(--secondary-color)' }} />
            <span>Vendas Fechadas</span>
          </div>
          <div className="metric-value">{salesClosed}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Calendar size={16} className="metric-icon" />
            <span>Tarefas de Hoje</span>
          </div>
          <div className="metric-value">{tasksToday}</div>
        </div>

        <div className="metric-card alert">
          <div className="metric-header">
            <AlertCircle size={16} style={{ color: 'var(--danger-color)' }} />
            <span>Retornos Atrasados</span>
          </div>
          <div className="metric-value">{overdueReturns}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
