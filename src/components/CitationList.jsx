import { BookOpen, ExternalLink } from "lucide-react";

export default function CitationList({ citations = [] }) {
  if (!citations.length) return null;
  return (
    <div className="citations">
      <div className="citation-heading"><BookOpen size={15}/> Sources</div>
      {citations.map((c, i) => (
        <div className="citation" key={`${c.documentId}-${c.chunkIndex}-${i}`}>
          <div className="citation-top">
            <strong>{c.fileName || "Document"}</strong>
            <span>{typeof c.similarityScore === "number" ? `${Math.round(c.similarityScore * 100)}% match` : ""}</span>
          </div>
          <p>{c.snippet || "Relevant document passage."}</p>
          <small>
            {c.pageNumber ? `Page ${c.pageNumber}` : c.chunkIndex != null ? `Chunk ${c.chunkIndex}` : ""}
            <ExternalLink size={12}/>
          </small>
        </div>
      ))}
    </div>
  );
}
