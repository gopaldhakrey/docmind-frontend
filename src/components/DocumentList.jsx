import { FileText, Trash2, RefreshCw } from "lucide-react";
import { deleteDocument } from "../api/documentApi";

function statusClass(status) {
  return String(status || "").toLowerCase().replaceAll("_", "-");
}

export default function DocumentList({ documents, loading, onRefresh }) {
  async function remove(id) {
    if (!confirm("Delete this document?")) return;
    try { await deleteDocument(id); onRefresh?.(); }
    catch (e) { alert(e.response?.data?.message || "Could not delete document."); }
  }

  if (loading) return <div className="empty-panel">Loading documents…</div>;
  if (!documents.length) return <div className="empty-panel">No documents yet. Upload your first PDF to start.</div>;

  return (
    <div className="doc-list">
      <div className="list-head">
        <span>{documents.length} document{documents.length === 1 ? "" : "s"}</span>
        <button className="icon-btn" onClick={onRefresh} title="Refresh"><RefreshCw size={16}/></button>
      </div>
      {documents.map((doc) => (
        <div className="doc-row" key={doc.id}>
          <div className="doc-file-icon"><FileText size={19}/></div>
          <div className="doc-info">
            <strong>{doc.fileName || doc.filename || "Untitled document"}</strong>
            <span>
              {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "PDF"}
              {doc.totalChunks ? ` · ${doc.totalChunks} chunks` : ""}
            </span>
          </div>
          <span className={`status ${statusClass(doc.status)}`}>{doc.status || "UNKNOWN"}</span>
          <button className="icon-btn danger" onClick={() => remove(doc.id)} title="Delete"><Trash2 size={16}/></button>
        </div>
      ))}
    </div>
  );
}
