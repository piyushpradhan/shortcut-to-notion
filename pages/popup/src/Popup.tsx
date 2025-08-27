import '@src/Popup.css';
import Settings from './Settings';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, notionSettingsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useEffect, useState } from 'react';

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const { notionApiKey, notionDatabaseId } = useStorage(notionSettingsStorage);
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');
  const [formData, setFormData] = useState({
    story: '',
    priority: '',
    id: '',
    type: '',
    state: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const accessWebpageDOM = async () => {
    try {
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

      if (!tab.id) return;

      // Execute script in the webpage context to access DOM
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const storySelector =
            '#story-dialog-parent > div > div.content.story-container > div.scrollable-content > div > div > div > div.title-container > h2'; // Main heading
          const prioritySelector =
            '#story-dialog-parent > div > div.content.story-container > div.scrollable-content > div > div > div > div.async-details > div.right-column.r_react > div > div:nth-child(20) > div > div > div > div > div.css-mkkf9p.emkynbd0 > div.css-mcez24.e1o1j54b0 > span'; // Priority indicators
          const idSelector =
            '#story-dialog-parent > div > div.content.story-container > div.scrollable-content > div > div > div > div.async-details > div.right-column.r_react > div > div.attribute.story-id > button > span > input'; // ID elements
          const typeSelector = '#story-dialog-story-type-dropdown > span.value'; // Type/category elements
          const stateSelector = '#story-dialog-state-dropdown > div > div > div > div > span.value > span'; // State/status elements

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
        console.log('Webpage DOM data:', webpageData);

        // Update form state with extracted data
        setFormData({
          story: webpageData.story || '',
          priority: webpageData.priority || '',
          id: webpageData.id || '',
          type: webpageData.type || '',
          state: webpageData.state || '',
        });

        // Also update the input fields
        const storyInput = document.getElementById('story') as HTMLInputElement;
        const priorityInput = document.getElementById('priority') as HTMLInputElement;
        const idInput = document.getElementById('taskId') as HTMLInputElement;
        const typeInput = document.getElementById('type') as HTMLInputElement;
        const stateInput = document.getElementById('state') as HTMLInputElement;

        if (storyInput && webpageData.story) storyInput.value = webpageData.story;
        if (priorityInput && webpageData.priority) priorityInput.value = webpageData.priority;
        if (idInput && webpageData.id) idInput.value = webpageData.id;
        if (typeInput && webpageData.type) typeInput.value = webpageData.type;
        if (stateInput && webpageData.state) stateInput.value = webpageData.state;
      }
    } catch (error) {
      console.error('Error accessing webpage DOM:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission to Notion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if settings are configured
    if (!notionApiKey || !notionDatabaseId) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
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
          database_id: notionDatabaseId,
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

        const searchResponse = await fetch('https://api.notion.com/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            query: formData.story,
            filter: {
              property: 'object',
              value: 'page',
            },
          }),
        });

        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();

          console.log({ searchResults });

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
            Authorization: `Bearer ${notionApiKey}`,
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
            Authorization: `Bearer ${notionApiKey}`,
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify(notionData),
        });
      }

      if (response.ok) {
        setSubmitStatus('success');
        // Clear form after successful submission
        setFormData({ story: '', priority: '', id: '', type: '', state: '' });

        // Clear input fields
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => (input.value = ''));

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

  useEffect(() => {
    accessWebpageDOM();
  }, []);

  const renderMainContent = () => (
    <div className="space-y-4">
      <h2 className={cn('mb-4 text-lg font-semibold', isLight ? 'text-gray-800' : 'text-gray-100')}>Story Details</h2>

      {!notionApiKey || !notionDatabaseId ? (
        <div className="rounded-lg border border-yellow-400 bg-yellow-100 p-3 text-yellow-700">
          Please configure your Notion settings first. Go to the Settings tab to add your API key and database ID.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="story"
                className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
                Story
              </label>
              <input
                id="story"
                type="text"
                value={formData.story}
                onChange={e => handleInputChange('story', e.target.value)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
                )}
                placeholder="Enter story description"
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
                Priority
              </label>
              <input
                id="priority"
                type="text"
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
                )}
                placeholder="High/Medium/Low"
              />
            </div>

            <div>
              <label
                htmlFor="taskId"
                className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
                ID
              </label>
              <input
                id="taskId"
                type="text"
                value={formData.id}
                onChange={e => handleInputChange('id', e.target.value)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
                )}
                placeholder="Task ID"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
                Type
              </label>
              <input
                id="type"
                type="text"
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value)}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLight
                    ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
                )}
                placeholder="Bug/Feature/Story"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="state"
              className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : 'text-gray-300')}>
              State
            </label>
            <input
              id="state"
              type="text"
              value={formData.state}
              onChange={e => handleInputChange('state', e.target.value)}
              className={cn(
                'w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLight
                  ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  : 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400',
              )}
              placeholder="To Do/In Progress/Done"
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="rounded-lg border border-green-400 bg-green-100 p-3 text-green-700">
              Task saved successfully to Notion!
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
              Error saving task. Please try again.
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-lg px-4 py-2 font-medium shadow transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50',
                isLight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
              )}>
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className={cn('px-6 py-4', isLight ? 'bg-white' : 'bg-gray-700')}>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('main')}
            className={cn(
              'border-b-2 px-1 py-2 text-sm font-medium transition-colors',
              activeTab === 'main'
                ? isLight
                  ? 'border-blue-500 text-blue-600'
                  : 'border-blue-400 text-blue-300'
                : isLight
                  ? 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300',
            )}>
            Main
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'border-b-2 px-1 py-2 text-sm font-medium transition-colors',
              activeTab === 'settings'
                ? isLight
                  ? 'border-blue-500 text-blue-600'
                  : 'border-blue-400 text-blue-300'
                : isLight
                  ? 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300',
            )}>
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'main' ? renderMainContent() : <Settings isLight={isLight} />}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
