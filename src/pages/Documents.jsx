import { useEffect, useState } from "react";
import UploadBox from "../components/UploadBox";
import DocumentList from "../components/DocumentList";
import { getMyDocuments } from "../api/documentApi";

export default function Documents() {
  const [docs,setDocs]=useState([]); const [loading,setLoading]=useState(true);
  async function load(){setLoading(true);try{const {data}=await getMyDocuments();setDocs(data?.data??data??[])}catch{setDocs([])}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  return <>
    <div className="page-head"><div><p className="eyebrow">LIBRARY</p><h1>Documents</h1><p>Manage the PDFs available to your RAG workspace.</p></div></div>
    <UploadBox onUploaded={load}/>
    <section className="panel standalone"><DocumentList documents={docs} loading={loading} onRefresh={load}/></section>
  </>;
}
