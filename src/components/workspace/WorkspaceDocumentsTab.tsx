import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  File,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Plus,
  AlertCircle,
  Download,
  Eye,
  Shield,
} from 'lucide-react';
import { ApplicationDocument, DocumentPreparationStatus } from '../../types/firebase';
import {
  uploadApplicationDocument,
  validateDocumentFile,
  deleteApplicationDocumentFromStorage,
} from '../../services/firebase/documentStorageService';

interface WorkspaceDocumentsTabProps {
  applicationId: string;
  userId: string;
  documents: ApplicationDocument[];
  onUpdateDocuments: (newDocs: ApplicationDocument[]) => void;
  isSaving: boolean;
}

export const WorkspaceDocumentsTab: React.FC<WorkspaceDocumentsTabProps> = ({
  applicationId,
  userId,
  documents,
  onUpdateDocuments,
  isSaving,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetSlotId, setTargetSlotId] = useState<string | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotName, setNewSlotName] = useState('');
  const [newSlotNotes, setNewSlotNotes] = useState('');
  const [newSlotRequired, setNewSlotRequired] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status counters
  const countNeeded = documents.filter((d) => d.status === 'Needed').length;
  const countPreparing = documents.filter((d) => d.status === 'Preparing').length;
  const countReady = documents.filter((d) => d.status === 'Ready').length;
  const countUploaded = documents.filter((d) => d.status === 'Uploaded').length;

  const handleFileProcess = async (file: File, slotId?: string) => {
    setUploadError(null);
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setUploadError(validationError.message);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const result = await uploadApplicationDocument(
        file,
        userId,
        applicationId,
        (progress) => setUploadProgress(progress)
      );

      const now = new Date().toISOString();

      if (slotId) {
        // Attach to existing slot
        const updated = documents.map((doc) => {
          if (doc.id === slotId) {
            return {
              ...doc,
              name: result.fileName,
              type: result.mimeType,
              size: result.fileSize,
              storagePath: result.storagePath,
              downloadUrl: result.downloadUrl,
              uploadedAt: now,
              status: 'Uploaded' as DocumentPreparationStatus,
            };
          }
          return doc;
        });
        onUpdateDocuments(updated);
      } else {
        // Create new document entry
        const newDoc: ApplicationDocument = {
          id: `doc_${Date.now()}`,
          userId,
          applicationId,
          name: result.fileName,
          type: result.mimeType,
          size: result.fileSize,
          storagePath: result.storagePath,
          downloadUrl: result.downloadUrl,
          uploadedAt: now,
          status: 'Uploaded',
          required: true,
        };
        onUpdateDocuments([...documents, newDoc]);
      }
    } catch (err: any) {
      console.error('[WorkspaceDocumentsTab] Upload error:', err);
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTargetSlotId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0], targetSlotId || undefined);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], targetSlotId || undefined);
    }
  };

  const handleStatusChange = (docId: string, newStatus: DocumentPreparationStatus) => {
    const updated = documents.map((doc) => {
      if (doc.id === docId) {
        return { ...doc, status: newStatus };
      }
      return doc;
    });
    onUpdateDocuments(updated);
  };

  const handleDeleteDocument = async (doc: ApplicationDocument) => {
    if (window.confirm(`Remove "${doc.name}" from application workspace?`)) {
      if (doc.storagePath) {
        await deleteApplicationDocumentFromStorage(doc.storagePath);
      }
      const updated = documents.filter((d) => d.id !== doc.id);
      onUpdateDocuments(updated);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotName.trim()) return;

    const newDoc: ApplicationDocument = {
      id: `doc_slot_${Date.now()}`,
      userId,
      applicationId,
      name: newSlotName.trim(),
      type: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      status: 'Needed',
      required: newSlotRequired,
      notes: newSlotNotes.trim() || undefined,
    };

    onUpdateDocuments([...documents, newDoc]);
    setNewSlotName('');
    setNewSlotNotes('');
    setIsAddingSlot(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusColor = (status: DocumentPreparationStatus) => {
    switch (status) {
      case 'Uploaded':
        return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Ready':
        return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Preparing':
        return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Needed':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header & Status Pipeline */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Document Preparation & Storage
            </h3>
            {isSaving && (
              <span className="text-[11px] text-slate-400 italic animate-pulse">
                Saving to Cloud...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize, upload, and track institutional documents required for grant submission.
          </p>
        </div>

        <button
          id="workspace-add-doc-slot-btn"
          onClick={() => setIsAddingSlot(!isAddingSlot)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Document Slot
        </button>
      </div>

      {/* Pipeline Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Needed</span>
          <span className="text-xl font-bold text-slate-700 dark:text-slate-300">{countNeeded}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-amber-600 dark:text-amber-400 block">In Preparation</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{countPreparing}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-blue-600 dark:text-blue-400 block">Ready to Attach</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{countReady}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block">Uploaded</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{countUploaded}</span>
        </div>
      </div>

      {/* Add Custom Document Slot Form */}
      {isAddingSlot && (
        <form
          id="workspace-add-doc-slot-form"
          onSubmit={handleAddSlot}
          className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-4"
        >
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Required Document Slot
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Name / Requirement Title *
            </label>
            <input
              type="text"
              id="new-doc-name-input"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              placeholder="e.g., Funder Specific Certificate of Compliance"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instructions or Format Notes (Optional)
            </label>
            <input
              type="text"
              id="new-doc-notes-input"
              value={newSlotNotes}
              onChange={(e) => setNewSlotNotes(e.target.value)}
              placeholder="e.g., PDF format, signed by executive director"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="new-doc-required-checkbox"
              checked={newSlotRequired}
              onChange={(e) => setNewSlotRequired(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="new-doc-required-checkbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Mandatory Document for this application
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingSlot(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-new-doc-slot-btn"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Create Slot
            </button>
          </div>
        </form>
      )}

      {/* Drag and Drop General Upload Zone */}
      <div
        id="workspace-doc-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          setTargetSlotId(null);
          fileInputRef.current?.click();
        }}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-400'
        }`}
      >
        <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Drag and drop your document here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supported: PDF, DOC, DOCX, JPG, PNG (Max 10 MB per file). Secured with Firebase Storage access rules.
        </p>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1.5">
            <span>Uploading Document to Secured Storage...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No documents defined for this application yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Add document slots or drop files into the zone above.
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const hasUploadedFile = !!doc.downloadUrl || doc.status === 'Uploaded';

            return (
              <div
                key={doc.id}
                id={`doc-card-${doc.id}`}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      hasUploadedFile
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {hasUploadedFile ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <File className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {doc.name}
                      </span>
                      {doc.required && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                          Required
                        </span>
                      )}
                      {doc.size && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({formatFileSize(doc.size)})
                        </span>
                      )}
                    </div>

                    {doc.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {doc.notes}
                      </p>
                    )}

                    {doc.uploadedAt && hasUploadedFile && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls: Status selector, Upload/Replace, View, Delete */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Status Dropdown */}
                  <select
                    id={`doc-status-select-${doc.id}`}
                    value={doc.status}
                    onChange={(e) =>
                      handleStatusChange(doc.id, e.target.value as DocumentPreparationStatus)
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(
                      doc.status
                    )} cursor-pointer`}
                  >
                    <option value="Needed">Needed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Uploaded">Uploaded</option>
                  </select>

                  {/* Upload / Replace Button */}
                  <button
                    id={`doc-upload-btn-${doc.id}`}
                    onClick={() => {
                      setTargetSlotId(doc.id);
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {hasUploadedFile ? 'Replace' : 'Upload'}
                  </button>

                  {/* View / Download if file exists */}
                  {doc.downloadUrl && (
                    <a
                      id={`doc-view-btn-${doc.id}`}
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View / Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}

                  {/* Delete Button */}
                  <button
                    id={`doc-delete-btn-${doc.id}`}
                    onClick={() => handleDeleteDocument(doc)}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove Document Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ownership & Security Notice */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-500">
        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          Attachment Security: Documents are isolated by owner UID and protected by Firebase Storage security rules. Only you and authorized institutional reviewers have access.
        </span>
      </div>
    </div>
  );
};
