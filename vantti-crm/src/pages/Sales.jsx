import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Plus, X, DollarSign } from 'lucide-react';
import '../styles/sales.css';

const Sales = () => {
  const { sales, leads, addSale } = useCRM();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    leadId: '',
    servico: '',
    valor: '',
    formaPagamento: 'PIX',
    dataPagamento: '',
    status: 'Pago',
    dataEntrega: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const lead = leads.find(l => l.id === formData.leadId);
    addSale({
      ...formData,
      cliente: lead ? lead.empresa : 'Cliente Avulso'
    });
    setIsModalOpen(false);
    setFormData({ leadId: '', servico: '', valor: '', formaPagamento: 'PIX', dataPagamento: '', status: 'Pago', dataEntrega: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalSales = sales.length;
  const totalRevenue = sales.filter(s => s.status === 'Pago').reduce((acc, curr) => {
    const val = parseFloat(curr.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    return acc + val;
  }, 0);
  const pendingRevenue = sales.filter(s => s.status === 'Pendente').reduce((acc, curr) => {
    const val = parseFloat(curr.valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="sales-container">
      <div className="page-header">
        <div>
          <h1>Controle de Vendas</h1>
          <p>Acompanhe seu faturamento e entregas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Nova Venda
        </button>
      </div>

      <div className="sales-summary">
        <div className="summary-card">
          <span className="label">Vendas Fechadas</span>
          <span className="value">{totalSales}</span>
        </div>
        <div className="summary-card success">
          <span className="label">Receita (Pago)</span>
          <span className="value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </span>
        </div>
        <div className="summary-card">
          <span className="label">A Receber (Pendente)</span>
          <span className="value" style={{ color: '#F59E0B' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingRevenue)}
          </span>
        </div>
      </div>

      <div className="table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Data Entrega</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map(sale => (
                <tr key={sale.id}>
                  <td><strong>{sale.cliente}</strong></td>
                  <td>{sale.servico}</td>
                  <td>{sale.valor}</td>
                  <td>{sale.formaPagamento} <br/><small style={{color: 'var(--text-muted)'}}>{sale.dataPagamento ? new Date(sale.dataPagamento).toLocaleDateString() : ''}</small></td>
                  <td><span className={`status-badge ${sale.status.toLowerCase()}`}>{sale.status}</span></td>
                  <td>{sale.dataEntrega ? new Date(sale.dataEntrega).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', color: 'var(--text-muted)'}}>
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Registrar Nova Venda</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Cliente / Lead</label>
                  <select name="leadId" value={formData.leadId} onChange={handleInputChange} required>
                    <option value="">Selecione o lead que fechou...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.empresa} ({l.responsavel || l.nicho})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Serviço Vendido</label>
                  <input type="text" name="servico" value={formData.servico} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input type="text" name="valor" placeholder="Ex: 1500,00" value={formData.valor} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Forma de Pagamento</label>
                  <select name="formaPagamento" value={formData.formaPagamento} onChange={handleInputChange}>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status do Pagamento</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data de Pagamento</label>
                  <input type="date" name="dataPagamento" value={formData.dataPagamento} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Data Prevista de Entrega</label>
                  <input type="date" name="dataEntrega" value={formData.dataEntrega} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Venda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
