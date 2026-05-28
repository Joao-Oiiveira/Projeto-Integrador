export const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  
  // Preenche os dias vazios do início da semana (Domingo = 0)
  const firstDay = date.getDay();
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Preenche os dias do mês
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
};

// Formata data ISO para string YYYY-MM-DD para facilitar comparação
export const formatToDateString = (dateObj) => {
  if (!dateObj) return null;
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

export const isSameDay = (dateString1, dateString2) => {
  if (!dateString1 || !dateString2) return false;
  return dateString1.split('T')[0] === dateString2.split('T')[0];
};