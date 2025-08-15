// Background script for Shortcut to Notion extension
// Handles keyboard shortcuts and other background tasks

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(command => {
  console.log('Command received:', command);

  if (command === 'open-popup') {
    // Open the popup by clicking the extension icon
    chrome.action.openPopup();
  }
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener(details => {
  console.log('Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Set up default keyboard shortcut
    chrome.commands.update({
      name: 'open-popup',
      shortcut: 'Ctrl+Shift+M', // Ctrl+Shift+M for Shortcut
    });
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender);

  if (message.type === 'GET_TAB_INFO') {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        sendResponse({
          success: true,
          tab: tabs[0],
          url: tabs[0].url,
          title: tabs[0].title,
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'EXTRACT_STORY_DATA') {
    // Handle story data extraction request
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => {
              // This function will be injected into the page
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
              const id = document.querySelector(idSelector)?.value || '';
              const type = document.querySelector(typeSelector)?.innerHTML || 'Bug';
              const state = document.querySelector(stateSelector)?.innerHTML || 'Ready for Development';

              return { story, priority, id, type, state };
            },
          },
          results => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else if (results && results[0] && results[0].result) {
              sendResponse({ success: true, data: results[0].result });
            } else {
              sendResponse({ success: false, error: 'No data extracted' });
            }
          },
        );
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(tab => {
  console.log('Extension icon clicked on tab:', tab);
  // This will open the popup automatically due to manifest configuration
});

// Log when background script loads
console.log('Shortcut to Notion background script loaded successfully');
