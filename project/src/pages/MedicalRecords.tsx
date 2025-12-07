import React, { useState, useEffect } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/api";

interface MedicalRecord {
  _id: string;
  date: string;
  type: string;
  description: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

const MedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch("/api/medical-records");
      setRecords(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load medical records"
      );
      console.error("Error fetching medical records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.type || !newRecord.description) return;

    try {
      setSubmitting(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("date", newRecord.date);
      formData.append("type", newRecord.type);
      formData.append("description", newRecord.description);

      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      // Use fetch directly for FormData (apiFetch sets Content-Type to JSON)
      const token = localStorage.getItem("token");
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add medical record");
      }

      const created = await response.json();
      setRecords([created, ...records]);
      setNewRecord({
        date: new Date().toISOString().split("T")[0],
        type: "",
        description: "",
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add medical record"
      );
      console.error("Error adding medical record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medical record?"))
      return;

    try {
      setError(null);
      await apiFetch(`/api/medical-records/${id}`, {
        method: "DELETE",
      });
      setRecords(records.filter((record) => record._id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete medical record"
      );
      console.error("Error deleting medical record:", err);
    }
  };

  const handleViewFile = async (url: string, filename: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Open in new tab or download based on file type
      const link = document.createElement("a");
      link.href = blobUrl;
      link.target = "_blank";
      link.download = filename;

      // For PDFs and images, open in new tab; for others, download
      const extension = filename.split(".").pop()?.toLowerCase();
      const viewableTypes = ["pdf", "jpg", "jpeg", "png", "gif"];

      if (viewableTypes.includes(extension || "")) {
        // Open in new tab
        window.open(blobUrl, "_blank");
      } else {
        // Download file
        link.click();
      }

      // Clean up the blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to view file");
      console.error("Error viewing file:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <FileText className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleAddRecord} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, date: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type
              </label>
              <input
                type="text"
                value={newRecord.type}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, type: e.target.value })
                }
                placeholder="e.g., Lab Result, Prescription, Report"
                className="w-full border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newRecord.description}
              onChange={(e) =>
                setNewRecord({ ...newRecord, description: e.target.value })
              }
              className="w-full border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              className="w-full border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center w-full bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-2" />
            {submitting ? "Adding..." : "Add Record"}
          </button>
        </form>

        <div className="space-y-4">
          {records.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No medical records yet. Add your first record above.
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary-600">
                    {record.date}
                  </span>
                  <button
                    onClick={() => handleDeleteRecord(record._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-medium">{record.type}</h3>
                <p className="text-gray-600 mt-1">{record.description}</p>
                {record.attachmentName && record.attachmentUrl && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleViewFile(
                          record.attachmentUrl!,
                          record.attachmentName!
                        )
                      }
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {record.attachmentName}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
