import React, { useState, useEffect } from 'react';

function Documents() {
  const [files, setFiles] = useState(() => {
    const stored = localStorage.getItem('documents');
    return stored ? JSON.parse(stored) : [];
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(files));
  }, [files]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newFile = {
        name: file.name,
        type: file.type,
        dataUrl: reader.result,
      };
      setFiles([...files, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const handlePreview = (file) => {
    setPreviewUrl(file.dataUrl);
    setSelectedName(file.name);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = selectedName;
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Document Vault</h1>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleUpload}
          className="p-2 border rounded bg-white dark:bg-gray-900"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Document List */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-2">📁 Uploaded Documents</h2>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  onClick={() => handlePreview(file)}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded border"
                >
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-2">📄 Preview</h2>
          {previewUrl ? (
            <>
              {selectedName.endsWith('.pdf') ? (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className="w-full h-96 border rounded"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded"
                />
              )}
              <button
                onClick={handleDownload}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ⬇️ Download
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">Click a file to preview it here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;
