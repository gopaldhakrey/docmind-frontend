import { useEffect, useRef, useState } from "react";
import { Send, Square, FileText, RotateCcw } from "lucide-react";
import { getMyDocuments } from "../api/documentApi";
import { askQuestion, streamQuestion } from "../api/chatApi";
import ChatMessage from "../components/ChatMessage";

const suggestions = ["Summarize the key points", "What are the main conclusions?", "Find the most important dates", "Explain this document simply"];

export default function Chat() {
  const [docs,setDocs]=useState([]);
  const [selected,setSelected]=useState("");
  const [question,setQuestion]=useState("");
  const [messages,setMessages]=useState([]);
  const [busy,setBusy]=useState(false);
  const [streaming,setStreaming]=useState(true);
  const [conversationId,setConversationId]=useState("");
  const bottom=useRef(null);

  useEffect(()=>{getMyDocuments().then(({data})=>setDocs(data?.data??data??[])).catch(()=>{})},[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"})},[messages]);

  function reset(){setMessages([]);setConversationId("");setQuestion("")}

  async function send() {
    const q=question.trim(); if(!q||busy)return;
    setQuestion(""); setMessages(m=>[...m,{role:"user",content:q}]); setBusy(true);
    const payload={question:q,documentId:selected||null,topK:5,minSimilarity:0.0,conversationId:conversationId||null};
    if(streaming){
      const id=crypto.randomUUID();
      setMessages(m=>[...m,{id,role:"assistant",content:"",citations:[]}]);
      try{
        await streamQuestion(payload,(chunk)=>{
          if(chunk.startsWith("{")){
            try{
              const parsed=JSON.parse(chunk);
              if(parsed.conversationId)setConversationId(parsed.conversationId);
              if(parsed.answer){
                setMessages(m=>m.map(x=>x.id===id?{...x,content:x.content+parsed.answer,citations:parsed.citations||x.citations}:x));
              }
              return;
            }catch{}
          }
          setMessages(m=>m.map(x=>x.id===id?{...x,content:x.content+chunk}:x));
        });
      }catch(e){setMessages(m=>[...m,{role:"assistant",content:`Sorry, I couldn't complete that request. ${e.message}`,citations:[]}])}
    } else {
      try{
        const {data}=await askQuestion(payload); const result=data?.data??data;
        setConversationId(result.conversationId||"");
        setMessages(m=>[...m,{role:"assistant",content:result.answer||"",citations:result.citations||[]}]);
      }catch(e){setMessages(m=>[...m,{role:"assistant",content:e.response?.data?.message||"Something went wrong.",citations:[]}])}
    }
    setBusy(false);
  }

  return (
    <div className="chat-page">
      <div className="chat-head">
        <div><p className="eyebrow">RAG ASSISTANT</p><h1>Ask your documents.</h1><p>Answers are generated from retrieved passages in your library.</p></div>
        <div className="chat-actions"><label className="toggle"><input type="checkbox" checked={streaming} onChange={e=>setStreaming(e.target.checked)}/><span>Streaming</span></label><button className="button subtle" onClick={reset}><RotateCcw size={15}/> New</button></div>
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <p className="eyebrow">DOCUMENT SCOPE</p>
          <select value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">All documents</option>
            {docs.map(d=><option key={d.id} value={d.id}>{d.fileName||d.filename||d.id}</option>)}
          </select>
          <div className="scope-note"><FileText size={16}/><span>{selected ? "Questions will use the selected PDF." : "Questions can search your whole library."}</span></div>
        </aside>

        <section className="chat-card">
          <div className="messages">
            {!messages.length && <div className="chat-empty"><div className="empty-mark">D</div><h2>What would you like to know?</h2><p>Ask a question about the documents you've uploaded.</p><div className="suggestions">{suggestions.map(s=><button key={s} onClick={()=>setQuestion(s)}>{s}</button>)}</div></div>}
            {messages.map((m,i)=><ChatMessage key={m.id||i} message={m}/>)}<div ref={bottom}/>
          </div>
          <div className="composer">
            <textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask something about your documents…" rows={1}/>
            <button className="send-btn" onClick={send} disabled={busy||!question.trim()}>{busy?<Square size={17}/>:<Send size={17}/>}</button>
          </div>
          <small className="composer-hint">Enter to send · Shift + Enter for a new line</small>
        </section>
      </div>
    </div>
  );
}
