/**
 * Kiwi Tab Background Service Worker
 * Handles cross-origin fetches for the extension (bypasses CORS)
 */

// Message handler for fetch requests from the new tab page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_URL') {
    fetchUrl(request.url, request.options)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Handle extension icon click - open a new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({});
});

/**
 * Fetch a URL from the background script (bypasses CORS)
 */
async function fetchUrl(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  // Check content type to determine response format
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    return { type: 'json', data: await response.json() };
  } else {
    return { type: 'text', data: await response.text() };
  }
}
