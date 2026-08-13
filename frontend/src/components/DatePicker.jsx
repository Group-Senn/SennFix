import React, { useState, useEffect, useRef } from 'react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

function DatePicker({ value, onChange, label = 'Fecha de Nacimiento' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value + 'T00:00:00') : new Date(2000, 0, 1));
  const containerRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generar días del mes
  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Rellenar días del mes anterior
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    const totalDays = lastDay.getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    return days;
  };

  const handleDayClick = (date) => {
    // Formatear localmente como YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${y}-${m}-${d}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const handleYearChange = (e) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };

  const handleMonthChange = (e) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };

  const selectedDateStr = value ? new Date(value + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'DD/MM/AAAA';

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1940; y--) {
    years.push(y);
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-sm font-bold text-primary/80 dark:text-slate-300 block mb-2">{label} <span className="text-red-500">*</span></label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-background-light dark:bg-slate-700 text-primary dark:text-slate-100 border border-transparent focus:ring-2 focus:ring-primary text-left transition-all active:scale-98"
      >
        <span>{selectedDateStr}</span>
        <span className="material-symbols-outlined text-primary/40 dark:text-slate-400">calendar_month</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-primary/10 dark:border-slate-700 transition-all transform origin-top-left scale-100">
          <div className="flex justify-between items-center mb-4 gap-1">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 text-primary dark:text-slate-200"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="flex gap-1">
              <select
                value={month}
                onChange={handleMonthChange}
                className="bg-transparent text-primary dark:text-slate-100 font-bold text-sm border-none focus:ring-0 p-1 rounded hover:bg-primary/5 dark:hover:bg-slate-700"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={handleYearChange}
                className="bg-transparent text-primary dark:text-slate-100 font-bold text-sm border-none focus:ring-0 p-1 rounded hover:bg-primary/5 dark:hover:bg-slate-700"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 rounded-full hover:bg-primary/10 dark:hover:bg-slate-700 text-primary dark:text-slate-200"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-primary/40 dark:text-slate-400 mb-2">
            {DAYS_OF_WEEK.map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, idx) => {
              const y = day.date.getFullYear();
              const m = String(day.date.getMonth() + 1).padStart(2, '0');
              const d = String(day.date.getDate()).padStart(2, '0');
              const formatted = `${y}-${m}-${d}`;
              const isSelected = value === formatted;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day.date)}
                  className={`
                    h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all
                    ${day.isCurrentMonth ? 'text-primary dark:text-slate-100' : 'text-primary/30 dark:text-slate-600'}
                    ${isSelected ? 'bg-primary text-white dark:bg-teal-500 dark:text-slate-900 font-bold' : 'hover:bg-primary/10 dark:hover:bg-slate-700'}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
