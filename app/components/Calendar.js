import React, { useState, useEffect } from 'react';

const Calendar = ({ onDateSelect }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 = January
  const currentDay = currentDate.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(currentDay);

  const [highlightMonth, setHighlightMonth] = useState(false);
  const [highlightDate, setHighlightDate] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthClick = (index) => {
    setSelectedMonth(index);
    setHighlightMonth(true);
    setHighlightDate(false); // Reset date highlight when changing the month
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setHighlightDate(true);
  };

  // Use useEffect to call onDateSelect whenever year, month, or day changes
  useEffect(() => {
    if (onDateSelect) {
      onDateSelect(selectedYear, selectedMonth, selectedDate);
    }
  }, [selectedYear, selectedMonth, selectedDate, onDateSelect]);

  return (
    <>
      {/* Year Selection */}
      <div style={{ backgroundColor: '#333', color: '#fff', padding: '20px', borderRadius: '4px', width: '400px' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Year:</label>
          <select 
            value={selectedYear} 
            onChange={handleYearChange}
            style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '5px', borderRadius: '4px', fontSize: '16px', textAlign: 'center' }}
          >
            {Array.from({ length: currentYear - 1919 }, (_, i) => (
              <option key={i} value={currentYear - i}>{currentYear - i}</option>
            ))}
          </select>
        </div>

        {/* Month Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
          {months.map((month, index) => (
            <div 
              key={index} 
              onClick={() => handleMonthClick(index)}
              style={{ 
                cursor: 'pointer',
                color: selectedMonth === index && highlightMonth ? '#88c550' : '#fff',
                fontWeight: selectedMonth === index && highlightMonth ? 'bold' : 'normal',
                fontSize: '16px',
              }}
            >
              {month}
            </div>
          ))}
        </div>
      </div>

      <br/>

      {/* Date Selection */}
      <div style={{ backgroundColor: '#333', color: '#fff', padding: '20px', borderRadius: '4px', width: '400px', marginLeft: '-1px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{months[selectedMonth]} {selectedYear}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px', textAlign: 'center' }}>
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div 
              key={i} 
              onClick={() => handleDateClick(i + 1)}
              style={{
                cursor: 'pointer',
                color: selectedDate === i + 1 && highlightDate ? '#88c550' : '#fff',
                fontWeight: selectedDate === i + 1 && highlightDate ? 'bold' : 'normal',
                fontSize: '16px',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Calendar;
