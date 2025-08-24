import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showBackupOptions, setShowBackupOptions] = useState(false);

  // 心情表情符號選項
  const moodOptions = [
    { emoji: '😊', name: '開心', value: 'happy' },
    { emoji: '😢', name: '難過', value: 'sad' },
    { emoji: '😡', name: '生氣', value: 'angry' },
    { emoji: '😴', name: '疲憊', value: 'tired' },
    { emoji: '🤔', name: '困惑', value: 'confused' },
    { emoji: '😌', name: '平靜', value: 'calm' },
    { emoji: '🤩', name: '興奮', value: 'excited' },
    { emoji: '😰', name: '緊張', value: 'nervous' },
    { emoji: '😍', name: '愛慕', value: 'love' },
    { emoji: '😤', name: '驕傲', value: 'proud' }
  ];

  // 從 localStorage 載入歷史記錄
  useEffect(() => {
    const savedHistory = localStorage.getItem('dailyVibesHistory');
    if (savedHistory) {
      try {
        setMoodHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('載入記錄時發生錯誤:', error);
        setMoodHistory([]);
      }
    }
  }, []);

  // 儲存到 localStorage
  useEffect(() => {
    localStorage.setItem('dailyVibesHistory', JSON.stringify(moodHistory));
  }, [moodHistory]);

  // 提交心情記錄
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMood) {
      alert('請選擇一個心情！');
      return;
    }

    const newEntry = {
      id: Date.now(),
      mood: selectedMood,
      note: note.trim(),
      date: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMoodHistory([newEntry, ...moodHistory]);
    setSelectedMood('');
    setNote('');
  };

  // 刪除記錄
  const handleDelete = (id) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
  };

  // 取得心情顯示資訊
  const getMoodDisplay = (moodValue) => {
    return moodOptions.find(option => option.value === moodValue);
  };

  // 匯出記錄到檔案
  const exportData = () => {
    const dataStr = JSON.stringify(moodHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-vibes-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('記錄已成功匯出！');
  };

  // 匯入記錄從檔案
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          // 合併現有記錄和匯入記錄，避免重複
          const existingIds = new Set(moodHistory.map(item => item.id));
          const newRecords = importedData.filter(item => !existingIds.has(item.id));
          
          if (newRecords.length > 0) {
            setMoodHistory([...newRecords, ...moodHistory]);
            alert(`成功匯入 ${newRecords.length} 筆記錄！`);
          } else {
            alert('沒有新的記錄需要匯入。');
          }
        } else {
          alert('檔案格式不正確！');
        }
      } catch (error) {
        alert('匯入失敗：檔案格式錯誤！');
        console.error('匯入錯誤:', error);
      }
    };
    reader.readAsText(file);
    
    // 清除檔案選擇器
    event.target.value = '';
  };

  // 清除所有記錄
  const clearAllData = () => {
    if (window.confirm('確定要清除所有記錄嗎？此操作無法復原！')) {
      setMoodHistory([]);
      localStorage.removeItem('dailyVibesHistory');
      alert('所有記錄已清除！');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌟 Daily Vibes 🌟</h1>
        <p>記錄每一天的心情，追蹤你的情緒旅程</p>
        
        {/* 備份選項按鈕 */}
        <div className="backup-controls">
          <button 
            className="backup-toggle-btn"
            onClick={() => setShowBackupOptions(!showBackupOptions)}
          >
            {showBackupOptions ? '隱藏備份選項' : '顯示備份選項'} 📁
          </button>
          
          {showBackupOptions && (
            <div className="backup-options">
              <button className="export-btn" onClick={exportData}>
                📤 匯出記錄
              </button>
              <label className="import-btn">
                📥 匯入記錄
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  style={{ display: 'none' }}
                />
              </label>
              <button className="clear-btn" onClick={clearAllData}>
                🗑️ 清除所有記錄
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* 心情選擇表單 */}
        <section className="mood-form-section">
          <h2>今天的心情如何？</h2>
          <form onSubmit={handleSubmit} className="mood-form">
            <div className="mood-selector">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.value)}
                  title={mood.name}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-name">{mood.name}</span>
                </button>
              ))}
            </div>

            <div className="note-input">
              <label htmlFor="note">備註（選填）：</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="寫下今天的心情筆記..."
                rows="3"
                maxLength="200"
              />
              <span className="char-count">{note.length}/200</span>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={!selectedMood}
            >
              記錄心情 ✨
            </button>
          </form>
        </section>

        {/* 心情歷史記錄 */}
        <section className="history-section">
          <h2>心情記錄歷史 ({moodHistory.length} 筆)</h2>
          {moodHistory.length === 0 ? (
            <div className="empty-state">
              <p>還沒有任何心情記錄</p>
              <p>選擇一個心情開始記錄吧！</p>
            </div>
          ) : (
            <div className="mood-history">
              {moodHistory.map((entry) => {
                const moodDisplay = getMoodDisplay(entry.mood);
                return (
                  <div key={entry.id} className="history-item">
                    <div className="history-mood">
                      <span className="history-emoji">{moodDisplay?.emoji}</span>
                      <span className="history-mood-name">{moodDisplay?.name}</span>
                    </div>
                    <div className="history-details">
                      <p className="history-date">{entry.date}</p>
                      {entry.note && (
                        <p className="history-note">{entry.note}</p>
                      )}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(entry.id)}
                      title="刪除記錄"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>用 Daily Vibes 記錄每一天的心情變化 🌈</p>
        <p className="storage-info">
          💾 資料儲存於瀏覽器本地，關機重啟後仍會保留
        </p>
      </footer>
    </div>
  );
}

export default App;
