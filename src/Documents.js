// src/Documents.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Eye, Download, Trash2, ArrowUp, ArrowDown, BadgePercent, X, Loader } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'turbinixDocuments';
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 10; // Limit file size to 10MB for localStorage
const TAX_KEYWORDS = ['w2', 'w-2', '1099', '1040', 'schedule c', 'schedule se', 'tax return', 'k-1', 'k1']; // Case-insensitive

// --- Helper Functions ---
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatUploadDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const isTaxDocument = (fileName) => {
    if (!fileName) return false;
    const lowerCaseName = fileName.toLowerCase();
    return TAX_KEYWORDS.some(keyword => lowerCaseName.includes(keyword));
};

// Simulate parsing based on filename keywords
const getMockTaxData = (fileName) => {
    const lcName = fileName.toLowerCase();
    if (lcName.includes('w2') || lcName.includes('w-2')) {
        return {
            formType: 'W-2 (Simulated)',
            fields: [
                { label: 'Wages, Tips, Other Comp.', value: formatCurrency(Math.random() * 100000 + 40000) },
                { label: 'Federal Income Tax Withheld', value: formatCurrency(Math.random() * 15000 + 3000) },
                { label: 'Social Security Tax Withheld', value: formatCurrency(Math.random() * 6000 + 1000) },
                { label: 'State Income Tax Withheld', value: formatCurrency(Math.random() * 5000 + 500) },
            ]
        };
    }
    if (lcName.includes('1099')) {
         const types = ['NEC', 'MISC', 'INT', 'DIV'];
         const type = types[Math.floor(Math.random()*types.length)];
         return {
             formType: `1099-${type} (Simulated)`,
             fields: [
                { label: type === 'NEC' ? 'Nonemployee Compensation' : (type === 'INT' ? 'Interest Income' : (type === 'DIV' ? 'Total Ordinary Dividends' : 'Miscellaneous Income')), value: formatCurrency(Math.random() * 25000 + 1000) },
                { label: 'Federal Income Tax Withheld', value: formatCurrency(Math.random() * 1000) },
             ]
         };
    }
     if (lcName.includes('1040') || lcName.includes('tax return')) {
         return {
             formType: '1040 (Simulated Summary)',
             fields: [
                 { label: 'Adjusted Gross Income (AGI)', value: formatCurrency(Math.random() * 150000 + 30000) },
                 { label: 'Total Tax Liability', value: formatCurrency(Math.random() * 20000 + 1000) },
                 { label: 'Total Payments', value: formatCurrency(Math.random() * 22000 + 1500) },
                 { label: 'Refund / Amount Owed', value: formatCurrency((Math.random() * 6000 - 3000)) },
             ]
         };
     }
     if (lcName.includes('schedule c') || lcName.includes('schedule se')) {
         return {
             formType: 'Schedule C/SE (Simulated)',
             fields: [
                 { label: 'Gross Receipts or Sales', value: formatCurrency(Math.random() * 80000 + 5000) },
                 { label: 'Total Expenses', value: formatCurrency(Math.random() * 40000 + 2000) },
                 { label: 'Net Profit or (Loss)', value: formatCurrency(Math.random() * 40000 + 1000) },
                 { label: 'Net Earnings from Self-Employment', value: formatCurrency(Math.random() * 38000 + 1000) },
             ]
         };
     }
    return { formType: 'General Tax Document (Simulated)', fields: [] }; // Default fallback
};


function Documents() {
  const [files, setFiles] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    try {
      // Add isTaxDoc property during load if missing
      const parsed = stored ? JSON.parse(stored) : [];
      return parsed.map(file => ({
        ...file,
        isTaxDoc: file.isTaxDoc ?? isTaxDocument(file.name) // Add classification if missing
      }));
    } catch (e) {
      console.error("Failed to parse documents from localStorage:", e);
      return [];
    }
  });

  const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'descending' });
  const [filterType, setFilterType] = useState('all'); // 'all', 'tax', 'other'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for Tax Details Modal
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [selectedTaxFile, setSelectedTaxFile] = useState(null);

  // --- Persist files to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files));
    } catch (e) {
      console.error("Error saving documents to localStorage (maybe storage limit exceeded?):", e);
      setError("Could not save file list. Storage might be full.");
    }
  }, [files]);

  // --- File Handling Callbacks ---
  const handleFileUpload = useCallback((event) => {
    setError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed: PDF, DOCX, JPG, PNG.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
       setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
       return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = () => {
      const newFile = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: Date.now(),
        dataUrl: reader.result,
        isTaxDoc: isTaxDocument(file.name) // Classify on upload
      };
      setFiles(prevFiles => [...prevFiles, newFile]);
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError("Failed to read file.");
      setIsLoading(false);
    }

    reader.readAsDataURL(file);
    event.target.value = null;
  }, []);

  const handleDeleteFile = useCallback((idToDelete) => {
      // Check if modal is open and deleting the currently viewed file
      if (isTaxModalOpen && selectedTaxFile?.id === idToDelete) {
          if (window.confirm(`Are you sure you want to delete "${selectedTaxFile.name}"? This action cannot be undone.`)) {
              setIsTaxModalOpen(false); // Close modal first
              setSelectedTaxFile(null);
              setFiles(prevFiles => prevFiles.filter(file => file.id !== idToDelete));
          }
      } else {
         // Find the file name for confirmation message
         const fileToDelete = files.find(file => file.id === idToDelete);
         if (fileToDelete && window.confirm(`Are you sure you want to delete "${fileToDelete.name}"? This action cannot be undone.`)) {
            setFiles(prevFiles => prevFiles.filter(file => file.id !== idToDelete));
         }
      }
  }, [files, isTaxModalOpen, selectedTaxFile]);


  const handlePreviewFile = useCallback((dataUrl) => {
    window.open(dataUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleDownloadFile = useCallback((file) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // --- Modal Control ---
  const handleOpenTaxModal = useCallback((file) => {
      setSelectedTaxFile(file);
      setIsTaxModalOpen(true);
  }, []);

  const handleCloseTaxModal = useCallback(() => {
      setIsTaxModalOpen(false);
      setSelectedTaxFile(null); // Clear selection on close
  }, []);


  // --- Filtering and Sorting Logic ---
  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;
    if (filterType === 'tax') {
      filtered = files.filter(file => file.isTaxDoc);
    } else if (filterType === 'other') {
      filtered = files.filter(file => !file.isTaxDoc);
    }

    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        let comparison = 0;
        if (valA > valB) {
            comparison = 1;
        } else if (valA < valB) {
            comparison = -1;
        }
        return sortConfig.direction === 'descending' ? comparison * -1 : comparison;
      });
    }
    return filtered;
  }, [files, filterType, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1 inline-block" /> : <ArrowDown size={14} className="ml-1 inline-block" />;
  };

  // --- Components ---

  // Updated Document Card
  const DocumentCard = ({ file, onPreview, onDelete, onDownload, onTaxClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      layout
      className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-lg dark:hover:border-sky-700/40 hover:border-blue-400/40 transition-all duration-200 group flex flex-col sm:flex-row sm:items-center ${file.isTaxDoc ? 'cursor-pointer' : ''}`}
      onClick={file.isTaxDoc ? () => onTaxClick(file) : undefined} // Click opens modal only for tax docs
    >
      <FileText className="w-8 h-8 text-blue-500 dark:text-sky-500 mr-4 flex-shrink-0 mb-3 sm:mb-0" />
      <div className="flex-grow overflow-hidden mr-4">
        <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors" title={file.name}>
              {file.name}
            </p>
            {file.isTaxDoc && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Tax Form
                </span>
            )}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {formatUploadDate(file.uploadDate)} &middot; {formatFileSize(file.size)}
        </p>
      </div>
      {/* Actions are now primarily in the modal for tax docs */}
      <div className="flex items-center space-x-1 mt-3 sm:mt-0 flex-shrink-0">
        {!file.isTaxDoc && ( // Show preview only for non-tax docs in the list
             <button
                onClick={(e) => { e.stopPropagation(); onPreview(file.dataUrl); }}
                title="Preview"
                className="p-1.5 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
             >
                <Eye size={16} />
             </button>
        )}
        {/* Download and Delete always available */}
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(file); }} // Prevent card click
          title="Download"
          className="p-1.5 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <Download size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(file.id); }} // Prevent card click
          title="Delete"
          className="p-1.5 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );


  // --- Tax Details Modal Component ---
  const TaxDetailsModal = ({ file, isOpen, onClose, onPreview, onDownload, onDelete }) => {
      const mockData = useMemo(() => getMockTaxData(file?.name || ''), [file]);

      if (!isOpen || !file) return null;

      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl w-full max-w-xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-700 relative overflow-hidden" // Added overflow hidden
          >
                {/* Glowing background effect */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-20 dark:opacity-30">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-teal-400 rounded-full filter blur-3xl animate-pulse-glow"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-500 rounded-full filter blur-3xl animate-pulse-glow animation-delay-2000"></div>
                </div>

                <div className="relative z-10"> {/* Content wrapper */}
                    {/* Header */}
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                            <BadgePercent className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                                Tax Document Details
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-100 transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Document Info */}
                    <div className="mb-5 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {formatUploadDate(file.uploadDate)} &middot; {formatFileSize(file.size)} &middot; {mockData.formType}
                        </p>
                    </div>

                    {/* Simulated Extracted Data */}
                    <div className="mb-5">
                        <h3 className="text-base font-semibold mb-2 text-zinc-700 dark:text-zinc-300">Key Information (Simulated)</h3>
                        {mockData.fields.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {mockData.fields.map((field, index) => (
                                <div key={index} className="bg-white dark:bg-zinc-800/70 backdrop-blur-sm rounded-lg p-3 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{field.label}</p>
                                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">{field.value}</p>
                                </div>
                            ))}
                            </div>
                        ) : (
                             <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">Could not simulate data for this document type.</p>
                        )}
                        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-4 italic">
                            Document parsing is simulated. Full AI extraction coming soon.
                        </p>
                    </div>


                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-700 gap-3">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onPreview(file.dataUrl)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                            >
                                <Eye size={14} /> Preview
                            </button>
                            <button
                                onClick={() => onDownload(file)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                            >
                                <Download size={14} /> Download
                            </button>
                        </div>
                        <button
                            onClick={() => onDelete(file.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors w-full sm:w-auto justify-center"
                        >
                           <Trash2 size={14} /> Delete Document
                        </button>
                    </div>
                </div> {/* End content wrapper */}
          </motion.div>
        </div>
      );
  };


  // --- Main Render ---
  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Header and Upload Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Document Center
          </h1>
          <label className="relative inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer hover:from-blue-700 hover:to-blue-600 transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-zinc-950">
            <UploadCloud size={18} className="mr-2" />
            <span>Upload File</span>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept={ALLOWED_FILE_TYPES.join(',')}
              disabled={isLoading}
            />
          </label>
        </div>

         {/* Loading Indicator */}
         {isLoading && (
            <div className="text-center py-3 text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                <Loader size={16} className="animate-spin" /> Processing upload...
            </div>
         )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 text-red-800 dark:text-red-300 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
             {/* Filters */}
             <div className="flex space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                 {['all', 'tax', 'other'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 capitalize ${filterType === type ? "bg-white text-zinc-800 dark:bg-black dark:text-white shadow" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                    >
                       {type === 'tax' ? 'Tax Docs' : type}
                    </button>
                 ))}
             </div>
            {/* Sorting */}
            {files.length > 1 && (
                <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 gap-2">
                    <span>Sort by:</span>
                     <button
                         onClick={() => requestSort('name')}
                         className={`px-2 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${sortConfig.key === 'name' ? 'font-medium text-zinc-700 dark:text-zinc-200' : ''}`}
                     >
                         Name {getSortIcon('name')}
                     </button>
                     <button
                         onClick={() => requestSort('uploadDate')}
                         className={`px-2 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${sortConfig.key === 'uploadDate' ? 'font-medium text-zinc-700 dark:text-zinc-200' : ''}`}
                     >
                         Date {getSortIcon('uploadDate')}
                     </button>
                </div>
            )}
        </div>


        {/* Document List or Empty State */}
        <div className="space-y-4">
          {filteredAndSortedFiles.length === 0 && !isLoading ? (
            <div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <FileText size={48} className="mx-auto text-zinc-400 dark:text-zinc-600 mb-4" />
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                  {filterType === 'all' ? 'No documents uploaded yet.' :
                   filterType === 'tax' ? 'No Tax Documents found.' :
                   'No other documents found.'}
              </p>
               <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                    {filterType === 'all' ? 'Click "Upload File" to add your first document.' :
                     filterType === 'tax' ? 'Upload files named W2, 1099, etc. or switch filter.' :
                     'Upload more documents or switch filter.'}
               </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredAndSortedFiles.map(file => (
                <DocumentCard
                  key={file.id}
                  file={file}
                  onPreview={handlePreviewFile}
                  onDownload={handleDownloadFile}
                  onDelete={handleDeleteFile}
                  onTaxClick={handleOpenTaxModal} // Pass handler for tax docs
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Tax Details Modal Rendering */}
      <AnimatePresence>
          {isTaxModalOpen && selectedTaxFile && (
              <TaxDetailsModal
                  isOpen={isTaxModalOpen}
                  file={selectedTaxFile}
                  onClose={handleCloseTaxModal}
                  onPreview={handlePreviewFile}
                  onDownload={handleDownloadFile}
                  onDelete={handleDeleteFile}
              />
          )}
      </AnimatePresence>

    </div>
  );
}

export default Documents;