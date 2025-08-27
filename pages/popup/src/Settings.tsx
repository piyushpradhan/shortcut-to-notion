import { useStorage } from '@extension/shared';
import { notionSettingsStorage } from '@extension/storage';
import { cn } from '@extension/ui';
import { useState } from 'react';

interface SettingsProps {
  isLight: boolean;
}

const Settings = ({ isLight }: SettingsProps) => {
  const { notionApiKey, notionDatabaseId } = useStorage(notionSettingsStorage);
  const [localSettings, setLocalSettings] = useState({
    notionApiKey: notionApiKey || '',
    notionDatabaseId: notionDatabaseId || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof typeof localSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await notionSettingsStorage.updateSettings(localSettings);
      setSaveStatus('success');

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('success'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');

      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className={cn('text-lg font-semibold', isLight ? 'text-gray-800' : 'text-gray-100')}>Notion Settings</h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="notionApiKey"
            className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
            Notion API Key
          </label>
          <input
            id="notionApiKey"
            type="password"
            value={localSettings.notionApiKey}
            onChange={e => handleInputChange('notionApiKey', e.target.value)}
            className={cn(
              'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
              isLight
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
            )}
            placeholder="Enter your Notion API key"
          />
          <p className={cn('mt-1 text-xs', isLight ? 'text-gray-500' : 'text-gray-400')}>
            Get your API key from{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline">
              Notion Integrations
            </a>
          </p>
        </div>

        <div>
          <label
            htmlFor="notionDatabaseId"
            className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
            Notion Database ID
          </label>
          <input
            id="notionDatabaseId"
            type="text"
            value={localSettings.notionDatabaseId}
            onChange={e => handleInputChange('notionDatabaseId', e.target.value)}
            className={cn(
              'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
              isLight
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
            )}
            placeholder="Enter your Notion database ID"
          />
          <p className={cn('mt-1 text-xs', isLight ? 'text-gray-500' : 'text-gray-400')}>
            The database ID is in the URL when you open your Notion database
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="rounded-lg border border-green-400 bg-green-100 p-3 text-green-700">
          Settings saved successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
          Error saving settings. Please try again.
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'w-full rounded-lg px-4 py-2 font-medium shadow transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50',
            isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
          )}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
