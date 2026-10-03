import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, FileText } from "lucide-react";
import { similaritySearch } from "../api/chatApi";

export default function Search() {
  const [query,setQuery]=useState(""); const [topK,setTopK]=useState(5); const [results,setResults]=useState(null); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function run(e){e?.preventDefault();if(!query.trim())return;setBusy(true);setError("");try{const {data}=await similaritySearch({query:query.trim(),topK:Number(topK),similaritySearch:true});setResults(data?.data??data)}catch(err){setError(err.response?.data?.message||"Search failed.")}finally{setBusy(false)}}
  return <>
    <div className="page-head"><div><p className="eyebrow">RETRIEVAL</p><h1>Semantic search</h1><p>Inspect the passages the RAG layer can retrieve from your library.</p></div></div>
    <form className="search-form" onSubmit={run}><SearchIcon size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for a concept, phrase, or fact…"/><select value={topK} onChange={e=>setTopK(e.target.value)}><option value="3">Top 3</option><option value="5">Top 5</option><option value="10">Top 10</option></select><button className="button primary" disabled={busy}>{busy?"Searching…":"Search"}</button></form>
    {error&&<div className="error-text">{error}</div>}
    {results&&<section className="panel standalone"><div className="section-head"><div><p className="eyebrow">RESULTS</p><h2>{results.totalMatches ?? results.matches?.length ?? 0} matches</h2></div><SlidersHorizontal size={18}/></div><div className="search-results">
      {(results.matches||[]).map((r,i)=><article className="result" key={r.id||i}><div className="result-icon"><FileText size={17}/></div><div><div className="result-meta"><strong>{r.fileName||r.filename||"Document"}</strong>{r.similarityScore!=null&&<span>{Math.round(r.similarityScore*100)}% similarity</span>}</div><p>{r.snippet||r.content||"No preview available."}</p><small>{r.pageNumber?`Page ${r.pageNumber}`:""} {r.chunkIndex!=null?` · Chunk ${r.chunkIndex}`:""}</small></div></article>)}
    </div></section>}
  </>;
}
