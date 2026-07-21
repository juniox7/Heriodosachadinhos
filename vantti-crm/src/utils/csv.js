export const exportToCSV = (leads) => {
  const headers = ['Empresa', 'Responsavel', 'WhatsApp', 'Email', 'Cidade', 'Nicho', 'Site', 'Servico', 'Valor', 'Status', 'Observacoes', 'ProximoContato'];
  const csvRows = [];
  
  // Headers
  csvRows.push(headers.join(','));
  
  // Rows
  for (const lead of leads) {
    const values = headers.map(header => {
      const field = header.charAt(0).toLowerCase() + header.slice(1);
      const val = lead[field] || '';
      // Escape commas and quotes
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvData = csvRows.join('\n');
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'leads_vantti.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const importFromCSV = (file, existingLeads, addLead) => {
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const rows = text.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) return; // No data
    
    // Simples extração separando por vírgula (considerando aspas simples)
    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    
    let importedCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
      // Regex para capturar valores entre aspas ou separados por vírgula
      const row = rows[i];
      const rowValues = [];
      let currentVal = '';
      let insideQuotes = false;
      
      for (let j = 0; j < row.length; j++) {
        const char = row[j];
        if (char === '"' && row[j+1] === '"') {
          currentVal += '"';
          j++;
        } else if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          rowValues.push(currentVal);
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      rowValues.push(currentVal);
      
      const newLead = {};
      headers.forEach((header, index) => {
        let key = header;
        if(key === 'responsavel') key = 'responsavel';
        if(key === 'proximocontato') key = 'proximoContato';
        newLead[key] = rowValues[index] ? rowValues[index].trim() : '';
      });
      
      // Evitar duplicidade pelo WhatsApp ou Empresa
      const isDuplicate = existingLeads.some(l => 
        (l.whatsapp && l.whatsapp === newLead.whatsapp) || 
        (l.empresa.toLowerCase() === newLead.empresa.toLowerCase())
      );
      
      if (!isDuplicate && newLead.empresa) {
        if(!newLead.status) newLead.status = 'Lead encontrado';
        addLead(newLead);
        importedCount++;
      }
    }
    
    alert(`${importedCount} leads importados com sucesso! (Duplicatas foram ignoradas)`);
  };
  reader.readAsText(file);
};
