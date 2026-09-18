import Link from "next/link";
import React from "react";

function inlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-cloud-100 px-1.5 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (link) return <Link key={index} href={link[2]} className="font-medium text-ember-700 underline">{link[1]}</Link>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function MarkdownDescription({ value }: { value: string }) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  function flushList() {
    if (!list) return;
    const items = list.items.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>);
    blocks.push(list.ordered ? <ol key={blocks.length} className="my-3 list-decimal space-y-1 pl-6">{items}</ol> : <ul key={blocks.length} className="my-3 list-disc space-y-1 pl-6">{items}</ul>);
    list = null;
  }
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const orderedList = Boolean(ordered);
      if (!list || list.ordered !== orderedList) flushList();
      if (!list) list = { ordered: orderedList, items: [] };
      list.items.push((ordered ?? unordered)![1]);
      return;
    }
    flushList();
    if (!trimmed) return;
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h3" : heading[1].length === 2 ? "h4" : "h5";
      blocks.push(<Tag key={index} className="mt-4 mb-2 font-bold text-graphite-900">{inlineMarkdown(heading[2])}</Tag>);
      return;
    }
    if (trimmed === "---" || trimmed === "***") { blocks.push(<hr key={index} className="my-4 border-graphite-200" />); return; }
    if (trimmed.startsWith("> ")) { blocks.push(<blockquote key={index} className="my-3 border-l-2 border-ember-500 pl-3 italic text-graphite-600">{inlineMarkdown(trimmed.slice(2))}</blockquote>); return; }
    blocks.push(<p key={index} className="my-2">{inlineMarkdown(trimmed)}</p>);
  });
  flushList();
  return <div className="text-sm leading-relaxed text-graphite-700">{blocks}</div>;
}