import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Calendar, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import { isToday, isPast, isFuture, parseISO } from 'date-fns';
import '../styles/tasks.css';

const Tasks = () => {
  const { tasks, leads, addTask, toggleTask } = useCRM();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    leadId: '',
    dueDate: '',
    priority: 'Média'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(formData);
    setIsModalOpen(false);
    setFormData({ title: '', leadId: '', dueDate: '', priority: 'Média' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Listas segmentadas
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)));
  const todayTasks = tasks.filter(t => !t.completed && t.dueDate && isToday(parseISO(t.dueDate)));
  const futureTasks = tasks.filter(t => !t.completed && t.dueDate && isFuture(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)));

  const TaskCard = ({ task }) => {
    const lead = leads.find(l => l.id === task.leadId);
    
    return (
      <div className={`task-card ${task.completed ? 'completed' : ''}`}>
        <input 
          type="checkbox" 
          className="task-checkbox" 
          checked={task.completed} 
          onChange={() => toggleTask(task.id)}
        />
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {lead && <div className="task-lead">Relacionado: {lead.empresa}</div>}
          <div className="task-meta">
            <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
            <span>Vencimento: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem data'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tasks-container">
      <div className="page-header">
        <div>
          <h1>Tarefas</h1>
          <p>Organize suas próximas ações para não esquecer nenhum lead</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      <div className="tasks-grid">
        <div className="tasks-section alert">
          <h2><AlertTriangle size={18} /> Atrasadas ({overdueTasks.length})</h2>
          <div className="tasks-list">
            {overdueTasks.length > 0 ? (
              overdueTasks.map(t => <TaskCard key={t.id} task={t} />)
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma tarefa atrasada.</p>
            )}
          </div>
        </div>

        <div className="tasks-section">
          <h2><Clock size={18} /> Hoje ({todayTasks.length})</h2>
          <div className="tasks-list">
            {todayTasks.length > 0 ? (
              todayTasks.map(t => <TaskCard key={t.id} task={t} />)
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma tarefa para hoje.</p>
            )}
          </div>
        </div>

        <div className="tasks-section">
          <h2><Calendar size={18} /> Futuras ({futureTasks.length})</h2>
          <div className="tasks-list">
            {futureTasks.length > 0 ? (
              futureTasks.map(t => <TaskCard key={t.id} task={t} />)
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma tarefa futura agendada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Adicionar Tarefa</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="form-group">
                  <label>Ação (Ex: Enviar proposta, cobrar resposta)</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Lead Relacionado (Opcional)</label>
                  <select name="leadId" value={formData.leadId} onChange={handleInputChange}>
                    <option value="">Selecione um lead...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.empresa} ({l.responsavel || l.nicho})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Data de Vencimento</label>
                  <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Prioridade</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
