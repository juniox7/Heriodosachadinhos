import React from 'react';
import { useCRM } from '../context/CRMContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import '../styles/dashboard.css'; // Usando estilos reaproveitáveis do dashboard

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

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#3B82F6', '#6B7280'];

const Analytics = () => {
  const { leads, sales } = useCRM();

  // Preparando dados para o Gráfico de Funil
  const funnelData = STAGES.map((stage) => ({
    name: stage,
    quantidade: leads.filter(l => l.status === stage).length
  })).filter(item => item.quantidade > 0);

  // Preparando dados para Gráfico de Vendas
  const salesData = [
    { name: 'Recebido (Pago)', value: sales.filter(s => s.status === 'Pago').reduce((acc, curr) => acc + (parseFloat(curr.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0), 0) },
    { name: 'A Receber (Pendente)', value: sales.filter(s => s.status === 'Pendente').reduce((acc, curr) => acc + (parseFloat(curr.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0), 0) }
  ];

  const totalLeads = leads.length;
  const conversoes = leads.filter(l => l.status === 'Venda fechada').length;
  const taxaConversao = totalLeads > 0 ? ((conversoes / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1>Analytics & Inteligência</h1>
          <p>Métricas detalhadas de conversão e receita</p>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <Users size={16} className="metric-icon" />
            <span>Total de Leads</span>
          </div>
          <div className="metric-value">{totalLeads}</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <TrendingUp size={16} className="metric-icon" />
            <span>Taxa de Conversão</span>
          </div>
          <div className="metric-value">{taxaConversao}%</div>
        </div>
        <div className="metric-card success">
          <div className="metric-header">
            <DollarSign size={16} style={{ color: 'var(--secondary-color)' }} />
            <span>Receita Projetada (Total)</span>
          </div>
          <div className="metric-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salesData[0].value + salesData[1].value)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Gráfico 1: Funil */}
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary-color)" /> Distribuição do Funil
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" />
                <YAxis dataKey="name" type="category" width={120} stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="quantidade" fill="var(--primary-color)" radius={[0, 4, 4, 0]} barSize={24}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Receita */}
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <DollarSign size={20} color="var(--secondary-color)" /> Status Financeiro
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="var(--secondary-color)" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip 
                  formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--secondary-color)', borderRadius: '50%' }}></div> Recebido
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div> Pendente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
