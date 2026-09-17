import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "link"; label: string; href: string };

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > last) {
      tokens.push({ type: "text", value: text.slice(last, match.index) });
    }

    if (match[2]) {
      tokens.push({ type: "strong", value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "em", value: match[3] });
    } else if (match[4] && match[5]) {
      tokens.push({ type: "link", label: match[4], href: match[5] });
    }

    last = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (last < text.length) {
    tokens.push({ type: "text", value: text.slice(last) });
  }

  return tokens;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return parseInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    if (token.type === "text") return <span key={key}>{token.value}</span>;
    if (token.type === "strong")
      return <strong key={key}>{token.value}</strong>;
    if (token.type === "em") return <em key={key}>{token.value}</em>;

    const href = token.href;
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a
          className="font-medium text-brand underline-offset-2 hover:underline"
          href={href}
          key={key}
          rel="noopener noreferrer"
          target="_blank"
        >
          {token.label}
        </a>
      );
    }

    return (
      <Link
        className="font-medium text-brand underline-offset-2 hover:underline"
        href={href}
        key={key}
      >
        {token.label}
      </Link>
    );
  });
}

type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "p", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }

    const ol = line.match(/^\d+[.)]\s+(.+)$/);
    if (ol) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Minimal markdown → React for legal bodies (paragraphs, lists, bold, links). */
export function LegalMarkdown({ source }: { source: string }) {
  if (!source.trim()) return null;

  const blocks = parseBlocks(source);

  return (
    <div className="legal-md">
      {blocks.map((block) => {
        if (block.type === "p") {
          return (
            <p key={`p:${block.text}`}>
              {renderInline(block.text, block.text)}
            </p>
          );
        }

        const ListTag = block.type === "ul" ? "ul" : "ol";
        const listKey = `${block.type}:${block.items.join("|")}`;
        return (
          <ListTag key={listKey}>
            {block.items.map((item) => (
              <li key={item}>{renderInline(item, item)}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
