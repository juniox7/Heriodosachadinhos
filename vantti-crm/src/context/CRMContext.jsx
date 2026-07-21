import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CRMContext = createContext();

export const useCRM = () => {
  return useContext(CRMContext);
};

export const CRMProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, tasksRes, salesRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('sales').select('*').order('created_at', { ascending: false })
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (salesRes.data) setSales(salesRes.data);
      
      // Auto-migrate if Supabase is empty but LocalStorage has the 27 leads
      const localLeads = localStorage.getItem('@VanttiCRM:leads');
      if (leadsRes.data && leadsRes.data.length === 0 && localLeads) {
        const parsed = JSON.parse(localLeads);
        if (parsed.length > 0) {
          // Remove custom ids to let Supabase generate UUIDs (or map them, but for simplicity let's insert)
          const leadsToInsert = parsed.map(l => {
            const { id, history, createdAt, ...rest } = l;
            return rest;
          });
          const { data } = await supabase.from('leads').insert(leadsToInsert).select();
          if (data) setLeads(data);
        }
      }

    } catch (error) {
      console.error("Erro ao buscar dados do Supabase:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Ações - Leads
  const addLead = async (leadData) => {
    // Generate UUID if not provided by Supabase initially (though Supabase does it)
    const { data, error } = await supabase.from('leads').insert([leadData]).select();
    if (!error && data) {
      setLeads([...leads, data[0]]);
      return data[0];
    }
    console.error(error);
  };

  const updateLead = async (id, updatedData) => {
    // Otimista
    setLeads(leads.map(lead => lead.id === id ? { ...lead, ...updatedData } : lead));
    const { error } = await supabase.from('leads').update(updatedData).eq('id', id);
    if (error) fetchData(); // Reverte em caso de erro
  };

  const addHistoryToLead = async (leadId, historyEntry) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const newHistory = [...(lead.history || []), { ...historyEntry, date: new Date().toISOString() }];
    updateLead(leadId, { history: newHistory });
  };

  // Ações - Tarefas
  const addTask = async (taskData) => {
    const { data, error } = await supabase.from('tasks').insert([taskData]).select();
    if (!error && data) {
      setTasks([...tasks, data[0]]);
      return data[0];
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.completed;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
    await supabase.from('tasks').update({ completed: newStatus }).eq('id', taskId);
  };

  const updateTask = async (taskId, updatedData) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updatedData } : t));
    await supabase.from('tasks').update(updatedData).eq('id', taskId);
  };

  // Ações - Vendas
  const addSale = async (saleData) => {
    const { data, error } = await supabase.from('sales').insert([saleData]).select();
    if (!error && data) {
      setSales([...sales, data[0]]);
      return data[0];
    }
  };

  const updateSale = async (saleId, updatedData) => {
    setSales(sales.map(s => s.id === saleId ? { ...s, ...updatedData } : s));
    await supabase.from('sales').update(updatedData).eq('id', saleId);
  };

  const value = {
    leads,
    tasks,
    sales,
    addLead,
    updateLead,
    addHistoryToLead,
    addTask,
    toggleTask,
    updateTask,
    addSale,
    updateSale,
    isLoaded
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};
