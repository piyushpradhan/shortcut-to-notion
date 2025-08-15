import '@src/Popup.css';
import { ConfigModal } from './components/ConfigModal';
import { Icons } from './components/Icons';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useState } from 'react';

interface NotionConfig {
  apiToken: string;
  databaseId: string;
}

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const [formData, setFormData] = useState({
    story: '',
    priority: '',
    id: '',
    type: '',
    state: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [notionConfig, setNotionConfig] = useState<NotionConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configError, setConfigError] = useState('');

  // Load configuration on mount
  useEffect(() => {
    loadNotionConfig();
  }, []);

  const loadNotionConfig = async () => {
    try {
      const result = await chrome.storage.local.get(['notionApiToken', 'notionDatabaseId']);
      if (result.notionApiToken && result.notionDatabaseId) {
        setNotionConfig({
          apiToken: result.notionApiToken,
          databaseId: result.notionDatabaseId,
        });
        setConfigError('');
      } else if (result.notionApiToken || result.notionDatabaseId) {
        // Partial configuration found
        setConfigError('Configuration incomplete. Please complete your Notion integration setup.');
        setShowConfigModal(true);
      } else {
        setConfigError('Notion configuration not found. Please configure your integration.');
      }
    } catch {
      setConfigError('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigSave = (config: NotionConfig) => {
    setNotionConfig(config);
    setConfigError('');
    setShowConfigModal(false);
  };

  const accessWebpageDOM = async () => {
    try {
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

      if (!tab.id) {
        setIsLoading(false);
        return;
      }

      // Execute script in the webpage context to access DOM
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const storySelector =
            '#story-dialog-parent > div > div.content.story-container > div.scrollable-content > div > div > div > div.title-container > h2';
          const prioritySelector =
            '#story-dialog-parent > div > div.content.story-container > div.scrollable-content > div > div > div > div.async-details > div.right-column.r_react > div > div:nth-child(20) > div > div > div > div > div.css-mkkf9p.emkynbd0 > div.css-mcez24.e1o1j54b0 > span';
          const idSelector =
            '#story-dialog-parent > div > div.content.story-container > div.scrollable-content > div > div > div > div.async-details > div.right-column.r_react > div > div.attribute.story-id > button > span > input';
          const typeSelector = '#story-dialog-story-type-dropdown > span.value';
          const stateSelector = '#story-dialog-state-dropdown > div > div > div > div > span.value > span';

          const story = document.querySelector(storySelector)?.innerHTML || document.title || '';
          const priority = document.querySelector(prioritySelector)?.innerHTML || 'P5';
          // @ts-expect-error -- value attribute is not present on type Element
          const id = document.querySelector(idSelector)?.value || '';
          const type = document.querySelector(typeSelector)?.innerHTML || 'Bug';
          const state = document.querySelector(stateSelector)?.innerHTML || 'Ready for Development';

          return {
            story: story,
            priority: priority,
            id: id,
            type: type,
            state: state,
          };
        },
      });

      if (results && results[0] && results[0].result) {
        const webpageData = results[0].result;
        // Update form state with extracted data
        setFormData({
          story: webpageData.story || '',
          priority: webpageData.priority || '',
          id: webpageData.id || '',
          type: webpageData.type || '',
          state: webpageData.state || '',
        });
      }
    } catch (error) {
      console.error('Error accessing webpage DOM:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission to Notion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notionConfig) {
      setConfigError('Please configure your Notion integration first');
      setShowConfigModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Get current tab info for context
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

      // Prepare the data for Notion
      const notionData = {
        parent: {
          database_id: notionConfig.databaseId,
        },
        properties: {
          Task: {
            title: [
              {
                text: {
                  content: formData.story,
                },
              },
            ],
          },
          'Priority Level': {
            select: {
              name: formData.priority,
            },
          },
          ID: {
            rich_text: [
              {
                text: {
                  content: formData.id,
                },
              },
            ],
          },
          Type: {
            select: {
              name: formData.type,
            },
          },
          Status: {
            status: {
              name: formData.state,
            },
          },
          URL: {
            url: tab?.url || '',
          },
          CreatedAt: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      };

      // Search for existing page by ID first
      let existingPageId = null;
      if (formData.id) {
        console.log('Searching for existing page by ID...');

        const searchResponse = await fetch(`https://api.notion.com/v1/databases/${notionConfig.databaseId}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CEB_NOTION_API_TOKEN}`,
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            filter: {
              property: 'ID',
              rich_text: {
                equals: formData.id,
              },
            },
          }),
        });

        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();

          if (searchResults.results && searchResults.results.length > 0) {
            existingPageId = searchResults.results[0].id;
            console.log('Found existing page:', existingPageId);
          } else {
            console.log('No existing page found, will create new one');
          }
        }
      }

      // Make the appropriate API call based on search results
      let response;
      if (existingPageId) {
        // Update existing page
        console.log('Updating existing page...');
        response = await fetch(`https://api.notion.com/v1/pages/${existingPageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${notionConfig.apiToken}`,
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            properties: notionData.properties,
          }),
        });
      } else {
        // Create new page
        console.log('Creating new page...');
        response = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${notionConfig.apiToken}`,
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify(notionData),
        });
      }

      if (response.ok) {
        setSubmitStatus('success');
        // Clear form after successful submission
        setFormData({ story: '', priority: '', id: '', type: '', state: '' });

        // Reset status after 3 seconds
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting to Notion:', error);
      setSubmitStatus('error');
      // Reset error status after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
      handleSubmit(formEvent);
    }
  };

  useEffect(() => {
    accessWebpageDOM();
  }, []);

  if (isLoading) {
    return (
      <div className={cn('flex min-h-[600px] items-center justify-center', isLight ? 'bg-gray-50' : 'bg-gray-900')}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className={cn('text-sm', isLight ? 'text-gray-600' : 'text-gray-400')}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-[600px]', isLight ? 'bg-white' : 'bg-gray-900')}>
      {/* Header */}
      <div className={cn('border-b px-6 py-4', isLight ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('rounded-lg p-2', isLight ? 'bg-blue-100' : 'bg-blue-900')}>
              <Icons.Notion />
            </div>
            <div>
              <h1 className={cn('text-lg font-semibold', isLight ? 'text-gray-900' : 'text-white')}>
                Shortcut to Notion
              </h1>
              <p className={cn('text-sm', isLight ? 'text-gray-600' : 'text-gray-400')}>Sync your stories seamlessly</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className={cn('rounded-lg p-2 transition-colors', isLight ? 'hover:bg-gray-200' : 'hover:bg-gray-700')}
            title="Configure Notion Integration">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Configuration Error */}
      {configError && (
        <div
          className={cn(
            'mx-6 mt-4 rounded-lg border p-4',
            isLight ? 'border-yellow-200 bg-yellow-50' : 'border-yellow-700 bg-yellow-900/20',
          )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icons.Error className={cn('text-yellow-600', isLight ? 'text-yellow-600' : 'text-yellow-400')} />
              <span className={cn('text-sm font-medium', isLight ? 'text-yellow-800' : 'text-yellow-200')}>
                {configError}
              </span>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                isLight
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-yellow-800 text-yellow-200 hover:bg-yellow-700',
              )}>
              Configure
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <form className="space-y-4" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          {/* Story Title */}
          <div>
            <label
              htmlFor="story"
              className={cn(
                'mb-3 flex items-center space-x-2 text-sm font-medium',
                isLight ? 'text-gray-700' : 'text-gray-300',
              )}>
              <Icons.Story />
              <span>Story Title</span>
            </label>
            <input
              id="story"
              type="text"
              value={formData.story}
              onChange={e => handleInputChange('story', e.target.value)}
              className={cn(
                'h-10 w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLight
                  ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400'
                  : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 hover:border-gray-500',
              )}
              placeholder="Enter story description"
              required
            />
          </div>

          {/* Grid for other fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className={cn(
                  'mb-3 flex items-center space-x-2 text-sm font-medium',
                  isLight ? 'text-gray-700' : 'text-gray-300',
                )}>
                <Icons.Priority />
                <span>Priority</span>
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    : 'border-gray-600 bg-gray-800 text-gray-100 hover:border-gray-500',
                )}>
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
                <option value="P5">P5</option>
              </select>
            </div>

            {/* ID */}
            <div>
              <label
                htmlFor="taskId"
                className={cn(
                  'mb-3 flex items-center space-x-2 text-sm font-medium',
                  isLight ? 'text-gray-700' : 'text-gray-300',
                )}>
                <Icons.ID />
                <span>Story ID</span>
              </label>
              <input
                id="taskId"
                type="text"
                value={formData.id}
                onChange={e => handleInputChange('id', e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400'
                    : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 hover:border-gray-500',
                )}
                placeholder="e.g., CH-123"
              />
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className={cn(
                  'mb-3 flex items-center space-x-2 text-sm font-medium',
                  isLight ? 'text-gray-700' : 'text-gray-300',
                )}>
                <Icons.Type />
                <span>Type</span>
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    : 'border-gray-600 bg-gray-800 text-gray-100 hover:border-gray-500',
                )}>
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
                <option value="Task">Task</option>
                <option value="Epic">Epic</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="state"
                className={cn(
                  'mb-3 flex items-center space-x-2 text-sm font-medium',
                  isLight ? 'text-gray-700' : 'text-gray-300',
                )}>
                <Icons.State />
                <span>Status</span>
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={e => handleInputChange('state', e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    : 'border-gray-600 bg-gray-800 text-gray-100 hover:border-gray-500',
                )}>
                <option value="Ready for Development">Ready for Development</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div
              className={cn(
                'rounded-lg border p-4',
                isLight ? 'border-green-200 bg-green-50' : 'border-green-700 bg-green-900/20',
              )}>
              <div className="flex items-center space-x-2">
                <Icons.Success className="text-green-600" />
                <span className={cn('font-medium', isLight ? 'text-green-800' : 'text-green-200')}>
                  Task saved successfully to Notion!
                </span>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div
              className={cn(
                'rounded-lg border p-4',
                isLight ? 'border-red-200 bg-red-50' : 'border-red-700 bg-red-900/20',
              )}>
              <div className="flex items-center space-x-2">
                <Icons.Error className="text-red-600" />
                <span className={cn('font-medium', isLight ? 'text-red-800' : 'text-red-200')}>
                  Error saving task. Please try again.
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !notionConfig}
            className={cn(
              'w-full rounded-lg px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50',
              isLight
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700',
            )}>
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                <span>Saving to Notion...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Icons.Notion />
                <span>{notionConfig ? 'Save to Notion' : 'Configure First'}</span>
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Configuration Modal */}
      <ConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} onSave={handleConfigSave} />
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
