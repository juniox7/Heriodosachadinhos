import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, CheckSquare, DollarSign, MessageSquare, Settings, PieChart } from 'lucide-react';
import '../styles/layout.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Analytics', icon: <PieChart size={20} />, path: '/analytics' },
    { name: 'Leads', icon: <Users size={20} />, path: '/leads' },
    { name: 'Funil', icon: <Kanban size={20} />, path: '/funnel' },
    { name: 'Tarefas', icon: <CheckSquare size={20} />, path: '/tasks' },
    { name: 'Vendas', icon: <DollarSign size={20} />, path: '/sales' },
    { name: 'Mensagens', icon: <MessageSquare size={20} />, path: '/messages' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">V</div>
        <h2>Vantti CRM</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link settings-btn">
          <Settings size={20} />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
