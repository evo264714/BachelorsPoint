export const getCurrentMonthDays = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  
  export const getCurrentMonthName = () => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' });
  };
  