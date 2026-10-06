function createSketchbookDocument(assetBaseUrl = "/sketchbook/") {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interactive Singapore Sketchbook</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f4f4f4;
          font-family: sans-serif;
          overflow: hidden;
        }
        .placeholder {
          text-align: center;
          color: #555;
          padding: 20px;
          border: 2px dashed #ccc;
          border-radius: 8px;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 2s linear infinite;
          margin: 10px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="placeholder">
        <div class="loader"></div>
        <h2>Interactive Sketchbook</h2>
        <p>Loading authored source from <code>${assetBaseUrl}</code>...</p>
        <p><em>Placeholder document ready for verified sketchbook code.</em></p>
      </div>
    </body>
    </html>
  `;
}

// Make it available globally so gallery.js can use it
window.createSketchbookDocument = createSketchbookDocument;
