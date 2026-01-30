import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete client work",
      description: "Finish pending client project deliverables",
      dueDate: "2026-01-30",
      priority: "high",
      tags: ["work", "urgent"],
      completed: false,
      createdAt: "2026-01-29"
    },
    {
      id: 2,
      title: "DSA Assignment",
      description: "Complete data structures assignment",
      dueDate: "2026-02-05",
      priority: "medium",
      tags: ["study", "assignment"],
      completed: false,
      createdAt: "2026-01-29"
    },
    {
      id: 3,
      title: "Team Meeting",
      description: "Weekly team sync meeting",
      dueDate: "2026-01-31",
      priority: "low",
      tags: ["meeting"],
      completed: true,
      createdAt: "2026-01-28"
    }
  ]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    tags: []
  });
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [view, setView] = useState('all');
  const [newTag, setNewTag] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [time, setTime] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [randomQuote, setRandomQuote] = useState('');

  // Theme (dark / light)
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Update time and set random quote
  useEffect(() => {
    const motivationalQuotes = [
      "Stay productive, every task matters",
      "Keep going, you're doing great",
      "Focus on progress, stay productive",
      "One task at a time, stay productive",
      "You got this, stay productive",
      "Make today count, stay productive",
      "Keep pushing, stay productive",
      "Believe in yourself, stay productive"
    ];

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      setTime(`${displayHours}:${minutes} ${period}`);
    };
    
    // Set random quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setRandomQuote(motivationalQuotes[randomIndex]);
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load tasks
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now(),
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([task, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      tags: []
    });
    setIsAddingTask(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addTag = (e) => {
    e?.preventDefault();
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask({
        ...newTask,
        tags: [...newTask.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Filter tasks by view
  const filteredByView = tasks.filter(task => {
    if (view === 'active') return !task.completed;
    if (view === 'completed') return task.completed;
    if (view === 'high') return task.priority === 'high';
    if (view === 'medium') return task.priority === 'medium';
    if (view === 'low') return task.priority === 'low';
    return true;
  });

  // Filter tasks by date
  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return filteredByView.filter(task => {
      if (!task.dueDate) return true;
      const taskDate = new Date(task.dueDate);
      
      switch(dateFilter) {
        case 'today':
          return taskDate.toDateString() === today.toDateString();
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return taskDate >= weekStart && taskDate <= weekEnd;
        case 'month':
          return taskDate.getMonth() === today.getMonth() && 
                 taskDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Calculate weekly and monthly stats
  const getWeeklyTasks = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
  };

  const getMonthlyTasks = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
  };

  const weeklyTasks = getWeeklyTasks();
  const monthlyTasks = getMonthlyTasks();
  const weeklyCompleted = weeklyTasks.filter(t => t.completed).length;
  const monthlyCompleted = monthlyTasks.filter(t => t.completed).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app">
      {/* Top Dashboard Bar */}
      <div className="dashboard-bar">
        <div className="dashboard-left">
          <div className="time-display">{time}</div>
          <div className="greeting">
<h1>{getGreeting()}, Afsana</h1>
            <p>{randomQuote}</p>
          </div>
        </div>
        
        <div className="dashboard-right">
          <div className="dashboard-stats">
            <div className="stat-item">
              <div className="stat-number">{totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{pendingTasks}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{completedTasks}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="hamburger-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Filter by Priority"
            >
              ☰
            </button>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {showMenu && (
              <div className="priority-menu">
                <h4>Filter by Priority</h4>
                <div className={`menu-item ${view === 'high' ? 'active' : ''}`} onClick={() => { setView('high'); setShowMenu(false); }}>
                  <div className="priority-dot high"></div>
                  <span>High Priority</span>
                </div>
                <div className={`menu-item ${view === 'medium' ? 'active' : ''}`} onClick={() => { setView('medium'); setShowMenu(false); }}>
                  <div className="priority-dot medium"></div>
                  <span>Medium Priority</span>
                </div>
                <div className={`menu-item ${view === 'low' ? 'active' : ''}`} onClick={() => { setView('low'); setShowMenu(false); }}>
                  <div className="priority-dot low"></div>
                  <span>Low Priority</span>
                </div>
                
                <div className="menu-divider"></div>
                
                <div className="menu-item" onClick={() => setShowStats(!showStats)}>
                  <span> Task Overview</span>
                </div>
              </div>
            )}
            <button 
              className="new-task-btn"
              onClick={() => setIsAddingTask(true)}
            >
              + New Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Tasks</h3>
            <div className={`sidebar-item ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>
              <span>All Tasks</span>
              <span className="count">{totalTasks}</span>
            </div>
            <div className={`sidebar-item ${view === 'active' ? 'active' : ''}`} onClick={() => setView('active')}>
              <span>Active</span>
              <span className="count">{pendingTasks}</span>
            </div>
            <div className={`sidebar-item ${view === 'completed' ? 'active' : ''}`} onClick={() => setView('completed')}>
              <span>Completed</span>
              <span className="count">{completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-area">
          {/* Date Filters */}
          <div className="date-filters">
            <h2>My Tasks</h2>
            <div className="date-buttons">
              <button 
                className={`date-btn ${dateFilter === 'all' ? 'active' : ''}`} 
                onClick={() => setDateFilter('all')}
              >
                All
              </button>
              <button 
                className={`date-btn ${dateFilter === 'today' ? 'active' : ''}`} 
                onClick={() => setDateFilter('today')}
              >
                Today
              </button>
              <button 
                className={`date-btn ${dateFilter === 'week' ? 'active' : ''}`} 
                onClick={() => setDateFilter('week')}
              >
                This Week
              </button>
              <button 
                className={`date-btn ${dateFilter === 'month' ? 'active' : ''}`} 
                onClick={() => setDateFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="tasks-container">
            <div className="tasks-list">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No tasks found</h3>
                  <p>No tasks match your current filters</p>
                  <button className="create-btn" onClick={() => setIsAddingTask(true)}>
                    + Create New Task
                  </button>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-checkbox" onClick={() => toggleTask(task.id)}>
                      {task.completed ? (
                        <div className="checkbox checked">✓</div>
                      ) : (
                        <div className="checkbox"></div>
                      )}
                    </div>
                    
                    <div className="task-content">
                      <div className="task-main">
                        <div className="task-header">
                          <h4 className={`task-title ${task.completed ? 'completed' : ''}`}>
                            {task.title}
                          </h4>
                          <span className={`priority-badge ${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="task-desc">{task.description}</p>
                        
                        <div className="task-tags">
                          {task.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                          {task.dueDate && (
                            <span className="due-tag">
                               {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="task-actions">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="action-btn"
                      >
                        {task.completed ? 'Undo' : 'Complete'}
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="action-btn delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Statistics Section - After tasks */}
            {showStats && (
              <div className="stats-section">
                <div className="section-header">
                  <h3>Tasks Overview</h3>
                  <button className="toggle-btn" onClick={() => setShowStats(false)}>
                    Hide Stats
                  </button>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <h4>Weekly Performance</h4>
                      <span className="stat-badge">This Week</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-row">
                        <span>Tasks Created:</span>
                        <span className="stat-value">{weeklyTasks.length}</span>
                      </div>
                      <div className="stat-row">
                        <span>Completed:</span>
                        <span className="stat-value success">{weeklyCompleted}</span>
                      </div>
                      <div className="stat-row">
                        <span>Completion Rate:</span>
                        <span className="stat-value">
                          {weeklyTasks.length > 0 
                            ? `${Math.round((weeklyCompleted / weeklyTasks.length) * 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <h4>Monthly Performance</h4>
                      <span className="stat-badge">This Month</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-row">
                        <span>Tasks Created:</span>
                        <span className="stat-value">{monthlyTasks.length}</span>
                      </div>
                      <div className="stat-row">
                        <span>Completed:</span>
                        <span className="stat-value success">{monthlyCompleted}</span>
                      </div>
                      <div className="stat-row">
                        <span>Completion Rate:</span>
                        <span className="stat-value">
                          {monthlyTasks.length > 0 
                            ? `${Math.round((monthlyCompleted / monthlyTasks.length) * 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <h4>Priority Breakdown</h4>
                      <span className="stat-badge">Active Tasks</span>
                    </div>
                    <div className="stat-content">
                      <div className="stat-row">
                        <span className="priority-indicator high"></span>
                        <span>High:</span>
                        <span className="stat-value">{tasks.filter(t => t.priority === 'high' && !t.completed).length}</span>
                      </div>
                      <div className="stat-row">
                        <span className="priority-indicator medium"></span>
                        <span>Medium:</span>
                        <span className="stat-value">{tasks.filter(t => t.priority === 'medium' && !t.completed).length}</span>
                      </div>
                      <div className="stat-row">
                        <span className="priority-indicator low"></span>
                        <span>Low:</span>
                        <span className="stat-value">{tasks.filter(t => t.priority === 'low' && !t.completed).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card highlight">
                    <div className="stat-header">
                      <h4>Productivity Score</h4>
                    </div>
                    <div className="stat-content">
                      <div className="score-display">
                        <div className="score-circle">
                          <span className="score-value">
                            {totalTasks > 0 
                              ? Math.round((completedTasks / totalTasks) * 100)
                              : 0
                            }%
                          </span>
                        </div>
                        <div className="score-info">
                          <p>Overall completion rate</p>
                          <span className="score-trend up">+5% this week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Task</h2>
              <button className="close-btn" onClick={() => setIsAddingTask(false)}>×</button>
            </div>
            
            <form onSubmit={addTask} className="task-form">
              <div className="form-group">
                <label>TITLE</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>DESCRIPTION</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Enter task description"
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>DUE DATE</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>PRIORITY</label>
                  <div className="priority-select">
                    {['low', 'medium', 'high'].map(priority => (
                      <button
                        key={priority}
                        type="button"
                        className={`priority-btn ${newTask.priority === priority ? 'active' : ''}`}
                        onClick={() => setNewTask({...newTask, priority})}
                      >
                        {priority.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>TAGS</label>
                <div className="tags-input">
                  <div className="tags-container">
                    {newTask.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="tag-input"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button type="button" onClick={addTag} className="add-tag-btn">+</button>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsAddingTask(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;