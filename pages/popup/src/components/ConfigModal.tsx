import { Icons } from './Icons';
import { useState, useEffect } from 'react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { apiToken: string; databaseId: string }) => void;
}

export const ConfigModal = ({ isOpen, onClose, onSave }: ConfigModalProps) => {
  const [apiToken, setApiToken] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load existing configuration
      chrome.storage.local.get(['notionApiToken', 'notionDatabaseId'], result => {
        if (result.notionApiToken) setApiToken(result.notionApiToken);
        if (result.notionDatabaseId) setDatabaseId(result.notionDatabaseId);
      });
    }
  }, [isOpen]);

  // Auto-save API token as user types
  const handleApiTokenChange = async (value: string) => {
    setApiToken(value);
    // Save immediately to prevent data loss
    if (value.trim()) {
      try {
        await chrome.storage.local.set({ notionApiToken: value });
      } catch (err) {
        console.error('Failed to save API token:', err);
      }
    }
  };

  // Auto-save database ID as user types
  const handleDatabaseIdChange = async (value: string) => {
    setDatabaseId(value);
    // Save immediately to prevent data loss
    if (value.trim()) {
      try {
        await chrome.storage.local.set({ notionDatabaseId: value });
      } catch (err) {
        console.error('Failed to save database ID:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!apiToken.trim() || !databaseId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Test the API token and database ID
      const testResponse = await fetch('https://api.notion.com/v1/databases/' + databaseId, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Invalid API token. Please check your integration token.');
        } else if (testResponse.status === 404) {
          throw new Error('Database not found. Please check your database ID and ensure the integration has access.');
        } else {
          throw new Error(`API error: ${testResponse.status} ${testResponse.statusText}`);
        }
      }

      // Configuration is already saved, just notify parent
      onSave({ apiToken, databaseId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate credentials');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Icons.Notion />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              <p className="text-sm text-gray-600">Set up your Notion integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          <div>
            <label htmlFor="apiToken" className="mb-2 block text-sm font-medium text-gray-700">
              Notion API Token
            </label>
            <input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={e => handleApiTokenChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="secret_..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Get this from{' '}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline">
                Notion Integrations
              </a>
            </p>
          </div>

          <div>
            <label htmlFor="databaseId" className="mb-2 block text-sm font-medium text-gray-700">
              Notion Database ID
            </label>
            <input
              id="databaseId"
              type="text"
              value={databaseId}
              onChange={e => handleDatabaseIdChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            />
            <p className="mt-1 text-xs text-gray-500">Found in your database URL after the last slash</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center space-x-2">
                <Icons.Error className="text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start space-x-3">
              <Icons.Story className="mt-0.5 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="mb-1 font-medium">How to get these values:</p>
                <ol className="list-inside list-decimal space-y-1 text-xs">
                  <li>
                    Create an integration at{' '}
                    <a
                      href="https://www.notion.so/my-integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline">
                      notion.so/my-integrations
                    </a>
                  </li>
                  <li>Share your database with the integration</li>
                  <li>Copy the database ID from the URL</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Auto-save notice */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-green-800">
                <strong>Auto-save enabled:</strong> Your configuration is saved automatically as you type, so you won't
                lose your progress if the popup closes.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 rounded-b-lg border-t bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !apiToken.trim() || !databaseId.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? 'Validating...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
