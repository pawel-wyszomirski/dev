const { 
  Search, PlayCircle, MessageCircle, Bot, Calendar,
  Brain, BookOpen, Users, Rocket, Settings, Sun, Moon,
  Video, Palette, FileText, FlaskConical, Plus, X,
  Blocks, Database, NotebookPen, LayoutGrid, Download, Upload,
  Pencil
} = lucide;

const MinimalTab = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userLinks, setUserLinks] = useState(() => {
    const saved = localStorage.getItem('userLinks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    description: '',
    category: 'other'
  });
  const [editingLink, setEditingLink] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Zapisywanie linków do localStorage
  useEffect(() => {
    localStorage.setItem('userLinks', JSON.stringify(userLinks));
  }, [userLinks]);

  const addNewLink = () => {
    if (!newLink.name || !newLink.url) return;

    const icon = determineIcon(newLink.url);
    setUserLinks([...userLinks, { ...newLink, icon }]);
    setNewLink({ name: '', url: '', description: '', category: 'other' });
  };

  const startEditing = (link, index) => {
    setEditingLink({ ...link });
    setEditingIndex(index);
  };

  const saveEdit = () => {
    if (!editingLink || editingIndex === null) return;
    
    const updatedLinks = userLinks.map((link, index) => 
      index === editingIndex ? { ...editingLink, icon: determineIcon(editingLink.url) } : link
    );
    
    setUserLinks(updatedLinks);
    setEditingLink(null);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setEditingIndex(null);
  };

  const removeLink = (index) => {
    const updatedLinks = userLinks.filter((_, i) => i !== index);
    setUserLinks(updatedLinks);
    if (editingIndex === index) {
      setEditingLink(null);
      setEditingIndex(null);
    }
  };

  // Zbieramy wszystkie aplikacje w jedną tablicę dla wyszukiwania
  const getAllApps = () => {
    const apps = [...mainTools];
    Object.entries(groups).forEach(([category, items]) => {
      items.forEach(item => {
        apps.push({
          ...item,
          category
        });
      });
    });
    return apps;
  };

  // Funkcja wyszukiwania
  // Dodaj linki użytkownika do wyników wyszukiwania
  const searchApps = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const apps = [...getAllApps(), ...userLinks];
    const normalizedQuery = query.toLowerCase();
    
    const results = apps.filter(app => {
      const name = app.name.toLowerCase();
      const category = app.category?.toLowerCase() || '';
      const description = app.description?.toLowerCase() || '';
      
      return name.includes(normalizedQuery) || 
             category.includes(normalizedQuery) ||
             description.includes(normalizedQuery);
    }).map(app => ({
      ...app,
      score: app.name.toLowerCase().startsWith(normalizedQuery) ? 2 : 1
    }));

    results.sort((a, b) => b.score - a.score);
    setSearchResults(results);
  };

  // Obsługa skrótów klawiszowych
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + / aby otworzyć wyszukiwarkę
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
      
      // Alt + litera (A-I) dla pierwszych 9 wyników
      if (e.altKey && searchResults.length > 0) {
        const key = e.key.toUpperCase();
        const index = key.charCodeAt(0) - 65; // A=0, B=1, etc.
        if (index >= 0 && index < 9 && index < searchResults.length) {
          e.preventDefault();
          const result = searchResults[index];
          if (result.url) {
            window.location.href = result.url;
          }
          setSearchQuery('');
          setSearchResults([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults]);

  // Obsługa zmian w polu wyszukiwania
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchApps(query);
  };
  
  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Save/load shortcuts
  const saveToJson = () => {
    const data = {
      mainTools,
      groups,
      theme: isDark ? 'dark' : 'light',
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newtab-backup.json';
    a.click();
  };

  const loadFromJson = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          // Implement data loading logic here
          setIsDark(data.theme === 'dark');
          // Update shortcuts and groups
        } catch (error) {
          console.error('Error parsing backup file:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  const mainTools = [
    { name: 'Start', icon: PlayCircle, url: 'https://ubiquitous-stardust-46ccaa.netlify.app/' },
    { name: 'ChatGPT', icon: MessageCircle, url: 'https://chatgpt.com/' },
    { name: 'Claude', icon: Bot, url: 'https://claude.ai/new' },
    { name: 'Kalendarz', icon: Calendar, url: 'https://calendar.google.com/' }
  ];
  
  const groups = {
    'AI': [
      { name: 'Laifik.GPT', icon: Bot },
      { name: 'Decydor', icon: Brain },
      { name: 'Sumor', icon: FileText },
      { name: 'Perplexity', icon: Search }
    ],
    'Narzędzia': [
      { name: 'II mózg', icon: Brain },
      { name: 'Materiały', icon: Database },
      { name: 'Notatki', icon: NotebookPen },
      { name: 'Grupa', icon: Users }
    ],
    'Media': [
      { name: 'Veed', icon: Video },
      { name: 'HeyGen', icon: Blocks },
      { name: 'Gamma', icon: LayoutGrid },
      { name: 'Ideogram', icon: Palette }
    ]
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-200 ${
      isDark 
        ? 'bg-gray-950 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-2xl mx-auto pt-16">
        {/* Search Bar */}
        <div className="relative mb-8 group">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Szukaj lub wpisz adres"
            className={`w-full border-0 rounded-lg p-4 pl-12 
                     outline-none focus:ring-1
                     text-lg transition-all ${
                       isDark 
                         ? 'bg-gray-900 focus:ring-gray-700' 
                         : 'bg-white focus:ring-gray-200'
                     }`}
            onFocus={() => setIsExpanded(true)}
          />
          
          {/* Wyniki wyszukiwania */}
          {searchQuery && (
            <div className={`absolute left-0 right-0 mt-2 py-2 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto
              ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (result.url) window.location.href = result.url;
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className={`w-full px-4 py-3 flex items-center space-x-3 text-left
                      ${isDark 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-50'}`}
                  >
                    {result.icon && (
                      <result.icon className={`w-5 h-5 
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}`} 
                      />
                    )}
                    <div className="flex-1">
                      <div className={`text-sm font-medium
                        ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {result.name}
                      </div>
                      {result.category && (
                        <div className={`text-xs
                          ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {result.category}
                        </div>
                      )}
                    </div>
                    {index < 9 && (
                      <div className="text-xs text-gray-500">
                        Alt + {String.fromCharCode(65 + index)}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className={`px-4 py-3 text-sm
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Brak wyników dla "{searchQuery}"
                </div>
              )}
            </div>
          )}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
                          text-gray-500 w-5 h-5" />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 
                        text-gray-500 text-sm opacity-0 group-hover:opacity-100">
            Alt + /
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {mainTools.map((tool, i) => (
            <a
              key={i}
              href={tool.url}
              className="flex flex-col items-center p-4 rounded-lg
                       bg-gray-900 hover:bg-gray-800 transition-all
                       group relative"
            >
              <tool.icon className="w-6 h-6 mb-2 text-gray-400 
                                group-hover:text-gray-200 transition-colors" />
              <span className="text-sm text-gray-300">{tool.name}</span>
              <span className="absolute top-2 right-2 text-xs text-gray-500 
                            opacity-0 group-hover:opacity-100">
                {i + 1}
              </span>
            </a>
          ))}
        </div>

        {/* Expandable Groups */}
        {isExpanded && (
          <div className="space-y-6 animate-fadeIn">
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="space-y-2">
                <div className="text-sm text-gray-500 px-1">{groupName}</div>
                <div className="grid grid-cols-4 gap-2">
                  {items.map((item, i) => (
                    <button
                      key={i}
                      className="flex items-center p-3 rounded-lg
                               bg-gray-900 hover:bg-gray-800 transition-all
                               group"
                    >
                      <item.icon className="w-5 h-5 mr-2 text-gray-400 
                                        group-hover:text-gray-200" />
                      <span className="text-sm text-gray-300 
                                   group-hover:text-gray-100">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Settings Panel */}
        {showSettings && (
          <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50`}>
            <div className={`relative w-96 p-6 rounded-lg ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } shadow-lg`}>
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-lg font-medium mb-6">Ustawienia</h2>
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between mb-6">
                <span>Motyw</span>
                <button
                  onClick={() => {
                    setIsDark(!isDark);
                    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
                  }}
                  className={`p-2 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  } hover:opacity-80 transition-opacity`}
                >
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>

              {/* Edit Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <span>Tryb edycji</span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-2 rounded-lg ${
                    editMode 
                      ? (isDark ? 'bg-blue-600' : 'bg-blue-500')
                      : (isDark ? 'bg-gray-800' : 'bg-gray-100')
                  } hover:opacity-80 transition-opacity`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Edit Mode Panel */}
              {editMode && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nazwa"
                      value={newLink.name}
                      onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                      className={`w-full p-2 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                      className={`w-full p-2 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Opis (pomoże w wyszukiwaniu)"
                      value={newLink.description}
                      onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                      className={`w-full p-2 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    />
                    <select
                      value={newLink.category}
                      onChange={(e) => setNewLink({...newLink, category: e.target.value})}
                      className={`w-full p-2 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <option value="other">Wybierz kategorię</option>
                      <option value="AI">AI</option>
                      <option value="Narzędzia">Narzędzia</option>
                      <option value="Media">Media</option>
                      <option value="Inne">Inne</option>
                    </select>
                    <button
                      onClick={addNewLink}
                      className={`w-full p-2 rounded-lg ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white transition-colors`}
                    >
                      Dodaj link
                    </button>
                  </div>

                  {/* Lista dodanych linków */}
                  <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-medium mb-2">Twoje linki:</h3>
                    {userLinks.map((link, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isDark ? 'bg-gray-800' : 'bg-gray-100'
                        }`}
                      >
                        {editingIndex === index ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingLink.name}
                              onChange={(e) => setEditingLink({
                                ...editingLink,
                                name: e.target.value
                              })}
                              className={`w-full p-1 rounded ${
                                isDark 
                                  ? 'bg-gray-700 text-gray-100' 
                                  : 'bg-white text-gray-900'
                              }`}
                            />
                            <input
                              type="url"
                              value={editingLink.url}
                              onChange={(e) => setEditingLink({
                                ...editingLink,
                                url: e.target.value
                              })}
                              className={`w-full p-1 rounded ${
                                isDark 
                                  ? 'bg-gray-700 text-gray-100' 
                                  : 'bg-white text-gray-900'
                              }`}
                            />
                            <input
                              type="text"
                              value={editingLink.description}
                              onChange={(e) => setEditingLink({
                                ...editingLink,
                                description: e.target.value
                              })}
                              className={`w-full p-1 rounded ${
                                isDark 
                                  ? 'bg-gray-700 text-gray-100' 
                                  : 'bg-white text-gray-900'
                              }`}
                            />
                            <select
                              value={editingLink.category}
                              onChange={(e) => setEditingLink({
                                ...editingLink,
                                category: e.target.value
                              })}
                              className={`w-full p-1 rounded ${
                                isDark 
                                  ? 'bg-gray-700 text-gray-100' 
                                  : 'bg-white text-gray-900'
                              }`}
                            >
                              <option value="other">Wybierz kategorię</option>
                              <option value="AI">AI</option>
                              <option value="Narzędzia">Narzędzia</option>
                              <option value="Media">Media</option>
                              <option value="Inne">Inne</option>
                            </select>
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEdit}
                                className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                              >
                                Zapisz
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="font-medium">{link.name}</div>
                              <div className="text-sm text-gray-500">
                                {link.description}
                              </div>
                              <div className="text-xs text-gray-500">
                                {link.category}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditing(link, index)}
                                className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeLink(index)}
                                className="p-1 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Backup Options */}
              <div className="space-y-3">
                <button
                  onClick={saveToJson}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  } hover:opacity-80 transition-opacity`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  <span>Eksportuj ustawienia</span>
                </button>

                <label className={`flex items-center w-full p-3 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                } hover:opacity-80 transition-opacity cursor-pointer`}>
                  <Upload className="w-5 h-5 mr-2" />
                  <span>Importuj ustawienia</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={loadFromJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className={`fixed bottom-4 right-4 p-3 rounded-full 
            ${isDark ? 'bg-gray-900' : 'bg-white'} 
            hover:opacity-80 transition-opacity shadow-lg`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Add custom animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

// Dodaj tę funkcję przed const MinimalTab = () => {
  const determineIcon = (url) => {
    if (!url) return Search; // domyślna ikona
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt')) return MessageCircle;
      if (hostname.includes('claude.ai')) return Bot;
      if (hostname.includes('calendar')) return Calendar;
      if (hostname.includes('video') || hostname.includes('veed')) return Video;
      if (hostname.includes('gamma')) return LayoutGrid;
      if (hostname.includes('notion')) return NotebookPen;
      if (hostname.includes('docs') || hostname.includes('drive')) return FileText;
      
      return Search; // domyślna ikona dla nierozpoznanych URL-i
    } catch {
      return Search; // w przypadku nieprawidłowego URL
    }
  };

ReactDOM.render(<MinimalTab />, document.getElementById('root'));