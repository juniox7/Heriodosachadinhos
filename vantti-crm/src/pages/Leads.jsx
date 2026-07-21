import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Plus, Search, X } from 'lucide-react';
import { exportToCSV, importFromCSV } from '../utils/csv';
import '../styles/leads.css';

const Leads = () => {
  const { leads, addLead } = useCRM();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    whatsapp: '',
    email: '',
    cidade: '',
    nicho: '',
    site: '',
    servico: '',
    valor: '',
    status: 'Lead encontrado',
    observacoes: '',
    proximoContato: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addLead({
      ...formData,
      ultimoContato: new Date().toISOString()
    });
    setIsModalOpen(false);
    // Reset form
    setFormData({
      empresa: '', responsavel: '', whatsapp: '', email: '', cidade: '', nicho: '', site: '', servico: '', valor: '', status: 'Lead encontrado', observacoes: '', proximoContato: ''
    });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? lead.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="leads-container">
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p>Gerencie seus contatos e oportunidades de negócio</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => exportToCSV(leads)}>
            Exportar
          </button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            Importar
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                if(e.target.files.length > 0) {
                  importFromCSV(e.target.files[0], leads, addLead);
                }
              }} 
            />
          </label>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Novo Lead
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="form-group search-input">
          <input 
            type="text" 
            placeholder="Buscar por empresa ou contato..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="form-group filter-select">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos os Status</option>
            <option value="Lead encontrado">Lead encontrado</option>
            <option value="Primeiro contato enviado">Primeiro contato enviado</option>
            <option value="Respondeu">Respondeu</option>
            <option value="Demonstração enviada">Demonstração enviada</option>
            <option value="Proposta enviada">Proposta enviada</option>
            <option value="Negociação">Negociação</option>
            <option value="Venda fechada">Venda fechada</option>
            <option value="Não interessado">Não interessado</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Contato</th>
              <th>WhatsApp</th>
              <th>Nicho/Cidade</th>
              <th>Status</th>
              <th>Próx. Contato</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td><strong>{lead.empresa}</strong></td>
                  <td>{lead.responsavel}</td>
                  <td>{lead.whatsapp}</td>
                  <td>{lead.nicho} - {lead.cidade}</td>
                  <td><span className="status-badge">{lead.status}</span></td>
                  <td>{lead.proximoContato ? new Date(lead.proximoContato).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', color: 'var(--text-muted)'}}>
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Lead */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cadastrar Novo Lead</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Empresa</label>
                  <input type="text" name="empresa" value={formData.empresa} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Responsável</label>
                  <input type="text" name="responsavel" value={formData.responsavel} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" name="cidade" value={formData.cidade} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Nicho</label>
                  <input type="text" name="nicho" value={formData.nicho} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Site ou Instagram</label>
                  <input type="text" name="site" value={formData.site} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Serviço Oferecido</label>
                  <input type="text" name="servico" value={formData.servico} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Valor da Proposta</label>
                  <input type="text" name="valor" value={formData.valor} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Lead encontrado">Lead encontrado</option>
                    <option value="Primeiro contato enviado">Primeiro contato enviado</option>
                    <option value="Respondeu">Respondeu</option>
                    <option value="Demonstração enviada">Demonstração enviada</option>
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Negociação">Negociação</option>
                    <option value="Venda fechada">Venda fechada</option>
                    <option value="Não interessado">Não interessado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data do Próximo Contato</label>
                  <input type="date" name="proximoContato" value={formData.proximoContato} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Observações</label>
                  <textarea name="observacoes" rows="3" value={formData.observacoes} onChange={handleInputChange}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
