document.addEventListener('DOMContentLoaded', () => {

    // Get references to all the important elements
    const urlInput = document.getElementById('scribdUrl');
    const viewBtn = document.getElementById('viewBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const alertContainer = document.getElementById('alert-container');

    // --- CHROME EXTENSION SPECIFIC CODE ---
    // Auto-fill the URL if the user is on a Scribd document page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        // Check if it's a valid Scribd document URL
        if (currentUrl && currentUrl.includes('scribd.com/document/')) {
            urlInput.value = currentUrl;
        }
    });

    /**
     * Displays an alert message to the user.
     * @param {string} message - The message to display.
     * @param {string} type - The Bootstrap alert type (e.g., 'danger', 'success').
     */
    function showAlert(message, type = 'danger') {
        alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                                        ${message}
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>`;
        // Bootstrap is not included in the JS, so we need a little help to make dismiss work
        const closeButton = alertContainer.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                alertContainer.innerHTML = '';
            });
        }
    }

    /**
     * Extracts the document ID and title from a Scribd URL.
     * @param {string} url - The full Scribd URL.
     * @returns {object|null} An object with {id, title} or null if no match.
     */
    function getScribdInfo(url) {
        const regex = /scribd\.com\/(?:doc|document|presentation)\/(\d+)\/([^/?#]+)/;
        const match = url.match(regex);
        if (match && match[1] && match[2]) {
            return { id: match[1], title: match[2] };
        }
        return null;
    }
    
    // --- EVENT LISTENERS ---

    // Handle "View in New Tab" button click
    viewBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        alertContainer.innerHTML = ''; // Clear previous alerts

        if (!url) {
            showAlert("Please provide a Scribd URL.");
            return;
        }

        const info = getScribdInfo(url);
        if (info) {
            const embedUrl = `https://www.scribd.com/embeds/${info.id}/content`;
            // Open the embed view in a new browser tab for a better experience
            chrome.tabs.create({ url: embedUrl });
        } else {
            showAlert("Invalid or unsupported Scribd URL format.");
        }
    });

    // Handle "Generate PDF Link" button click
    pdfBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        alertContainer.innerHTML = ''; // Clear previous alerts

        if (!url) {
            showAlert("Please provide a Scribd URL.");
            return;
        }

        const info = getScribdInfo(url);
        if (info) {
            // Uses the third-party service to generate a download link
            const downloadUrl = `https://compress-pdf.vietdreamhouse.com/?fileurl=https://scribd.downloader.tips/pdownload/${info.id}/${info.title}`;
            
            // Open the download link in a new tab
            chrome.tabs.create({ url: downloadUrl });
            showAlert("Your download link is opening in a new tab.", "success");
        } else {
            showAlert("Invalid or unsupported Scribd URL format. Cannot generate PDF link.");
        }
    });
});