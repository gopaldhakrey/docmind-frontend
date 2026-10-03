import { useRef, useState } from "react";
import { FileUp, X, LoaderCircle } from "lucide-react";
import { uploadDocument } from "../api/documentApi";

export default function UploadBox({ onUploaded, compact = false }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(next) {
    const selected = next?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    setError("");
    setFile(selected);
  }

  async function submit() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      await uploadDocument(file);
      setFile(null);
      onUploaded?.();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Upload failed.");
    } finally { setBusy(false); }
  }

  return (
    <div
      className={`upload-box ${dragging ? "dragging" : ""} ${compact ? "compact" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files); }}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => pick(e.target.files)} />
      {!file ? (
        <>
          <div className="upload-icon"><FileUp size={21}/></div>
          <div>
            <strong>{compact ? "Add a PDF" : "Drop a PDF here"}</strong>
            <p>{compact ? "or browse from your computer" : "or click to browse · PDF only"}</p>
          </div>
        </>
      ) : (
        <div className="selected-file">
          <div className="file-icon">PDF</div>
          <div className="file-meta"><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span></div>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setFile(null); }}><X size={16}/></button>
          <button className="button primary upload-action" disabled={busy} onClick={(e) => { e.stopPropagation(); submit(); }}>
            {busy ? <LoaderCircle className="spin" size={16}/> : "Upload"}
          </button>
        </div>
      )}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
