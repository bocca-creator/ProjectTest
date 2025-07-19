import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Save, Eye, Trash2, Upload, Download } from 'lucide-react';

const ThemeEditor = () => {
  const { t } = useLanguage();
  const { themes, getCurrentThemeData, changeTheme } = useTheme();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditTheme, setCurrentEditTheme] = useState(null);
  const [customThemes, setCustomThemes] = useState([]);
  const [newTheme, setNewTheme] = useState({
    name: '',
    description: '',
    category: 'Custom',
    variables: {},
    is_public: false
  });

  // Initialize with current theme data
  useEffect(() => {
    if (isEditorOpen) {
      const currentThemeData = getCurrentThemeData();
      setNewTheme({
        name: `${currentThemeData.name} Custom`,
        description: `Custom variation of ${currentThemeData.name}`,
        category: 'Custom',
        variables: { ...currentThemeData.variables },
        is_public: false
      });
    }
  }, [isEditorOpen, getCurrentThemeData]);

  const colorCategories = {
    background: {
      name: t('themes.background'),
      variables: ['--bg-primary', '--bg-secondary', '--bg-tertiary']
    },
    text: {
      name: t('themes.text'),
      variables: ['--text-primary', '--text-secondary', '--text-muted']
    },
    accent: {
      name: t('themes.accent'),
      variables: ['--accent-primary', '--accent-hover', '--accent-pressed', '--accent-bg']
    },
    borders: {
      name: 'Borders',
      variables: ['--border-primary', '--border-subtle']
    },
    effects: {
      name: 'Effects',
      variables: ['--glow-primary', '--glow-secondary']
    }
  };

  const handleColorChange = (variable, color) => {
    setNewTheme(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variable]: color
      }
    }));
  };

  const applyPreview = () => {
    // Apply theme variables temporarily for preview
    const root = document.documentElement;
    Object.entries(newTheme.variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  const resetPreview = () => {
    // Reset to current theme
    const currentTheme = getCurrentThemeData();
    const root = document.documentElement;
    Object.entries(currentTheme.variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  const saveTheme = async () => {
    try {
      // This would call the backend API to save the theme
      // For now, we'll just save to local storage as a demo
      const savedThemes = JSON.parse(localStorage.getItem('custom-themes') || '[]');
      const themeToSave = {
        ...newTheme,
        id: `custom-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      savedThemes.push(themeToSave);
      localStorage.setItem('custom-themes', JSON.stringify(savedThemes));
      setCustomThemes(savedThemes);
      
      alert(t('common.success') + ': ' + t('themes.saveTheme'));
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      alert(t('common.error') + ': Failed to save theme');
    }
  };

  const loadCustomThemes = () => {
    const savedThemes = JSON.parse(localStorage.getItem('custom-themes') || '[]');
    setCustomThemes(savedThemes);
  };

  const deleteCustomTheme = (themeId) => {
    const savedThemes = JSON.parse(localStorage.getItem('custom-themes') || '[]');
    const filteredThemes = savedThemes.filter(theme => theme.id !== themeId);
    localStorage.setItem('custom-themes', JSON.stringify(filteredThemes));
    setCustomThemes(filteredThemes);
  };

  const exportTheme = (theme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target.result);
        setNewTheme({
          ...importedTheme,
          name: importedTheme.name + ' (Imported)',
          is_public: false
        });
        setIsEditorOpen(true);
      } catch (error) {
        alert('Error importing theme: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    loadCustomThemes();
  }, []);

  return (
    <div className="theme-editor">
      {/* Theme Editor Trigger */}
      <button
        onClick={() => setIsEditorOpen(true)}
        className="theme-editor-trigger flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
      >
        <Palette size={16} />
        {t('themes.title')}
      </button>

      {/* Custom Themes List */}
      {customThemes.length > 0 && (
        <div className="custom-themes-list mt-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            {t('themes.myThemes')}
          </h3>
          <div className="themes-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customThemes.map((theme) => (
              <div
                key={theme.id}
                className="theme-card bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4"
              >
                <h4 className="font-semibold text-[var(--text-primary)]">{theme.name}</h4>
                <p className="text-sm text-[var(--text-muted)] mt-1">{theme.description}</p>
                <div className="theme-actions flex gap-2 mt-4">
                  <button
                    onClick={() => applyPreview()}
                    className="btn-small bg-[var(--accent-primary)] text-[var(--bg-primary)] px-3 py-1 rounded text-xs hover:bg-[var(--accent-hover)]"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => exportTheme(theme)}
                    className="btn-small bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-3 py-1 rounded text-xs hover:bg-[var(--border-primary)]"
                  >
                    <Download size={12} />
                  </button>
                  <button
                    onClick={() => deleteCustomTheme(theme.id)}
                    className="btn-small bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Editor Modal */}
      {isEditorOpen && (
        <div className="theme-editor-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="editor-content bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="editor-header flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {t('themes.title')}
              </h2>
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  resetPreview();
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            {/* Theme Info */}
            <div className="theme-info grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t('themes.themeName')}
                </label>
                <input
                  type="text"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t('themes.category')}
                </label>
                <input
                  type="text"
                  value={newTheme.category}
                  onChange={(e) => setNewTheme(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t('themes.themeDescription')}
                </label>
                <textarea
                  value={newTheme.description}
                  onChange={(e) => setNewTheme(prev => ({ ...prev, description: e.target.value }))}
                  rows="2"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Color Editor */}
            <div className="color-editor">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                {t('themes.colors')}
              </h3>
              
              {Object.entries(colorCategories).map(([categoryKey, category]) => (
                <div key={categoryKey} className="color-category mb-6">
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">{category.name}</h4>
                  <div className="color-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.variables.map((variable) => (
                      <div key={variable} className="color-control">
                        <label className="block text-xs text-[var(--text-muted)] mb-1">
                          {variable.replace('--', '')}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={newTheme.variables[variable] || '#000000'}
                            onChange={(e) => handleColorChange(variable, e.target.value)}
                            className="w-12 h-8 rounded border border-[var(--border-primary)]"
                          />
                          <input
                            type="text"
                            value={newTheme.variables[variable] || ''}
                            onChange={(e) => handleColorChange(variable, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)]"
                            placeholder="CSS value"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="editor-actions flex flex-wrap gap-4 mt-6 pt-6 border-t border-[var(--border-primary)]">
              <button
                onClick={applyPreview}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--accent-hover)]"
              >
                <Eye size={16} />
                {t('themes.preview')}
              </button>
              
              <button
                onClick={resetPreview}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]"
              >
                Reset
              </button>

              <button
                onClick={saveTheme}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={16} />
                {t('themes.saveTheme')}
              </button>

              <div className="flex items-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                  id="theme-import"
                />
                <label
                  htmlFor="theme-import"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--border-primary)] cursor-pointer"
                >
                  <Upload size={16} />
                  Import
                </label>
              </div>

              <div className="flex items-center ml-auto">
                <label className="flex items-center gap-2 text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={newTheme.is_public}
                    onChange={(e) => setNewTheme(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded"
                  />
                  {t('themes.makePublic')}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeEditor;