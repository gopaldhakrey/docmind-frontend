import { useEffect, useState } from "react";
import { ArrowRight, FileText, MessageSquare, Search, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import UploadBox from "../components/UploadBox";
import DocumentList from "../components/DocumentList";
import { getMyDocuments } from "../api/documentApi";

export default function Dashboard() {
  const [docs,setDocs] = useState([]);
  const [loading,setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const {data}=await getMyDocuments(); setDocs(data?.data ?? data ?? []); }
    catch { setDocs([]); } finally { setLoading(false); }
  }
  useEffect(()=>{load()},[]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Turn documents into answers.</h1>
          <p>Upload a PDF, then ask questions grounded in its actual content.</p>
        </div>
        <Link className="button primary" to="/chat">Ask a question <ArrowRight size={17}/></Link>
      </section>

      <div className="stats">
        <div className="stat"><FileText size={19}/><span><b>{docs.length}</b> documents</span></div>
        <div className="stat"><MessageSquare size={19}/><span><b>RAG</b> powered answers</span></div>
        <div className="stat"><Search size={19}/><span><b>Semantic</b> retrieval</span></div>
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="section-head"><div><p className="eyebrow">LIBRARY</p><h2>Your documents</h2></div><Link to="/documents">View all</Link></div>
          <DocumentList documents={docs.slice(0,5)} loading={loading} onRefresh={load}/>
        </section>
        <section className="panel">
          <div className="section-head"><div><p className="eyebrow">INGEST</p><h2>Add a document</h2></div><UploadCloud size={19}/></div>
          <UploadBox onUploaded={load} compact/>
        </section>
      </div>
    </>
  );
}
