"use client"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre({ children }) {
          return (
            <pre className="overflow-x-auto rounded-lg bg-[#1a1a2e] p-4 text-sm">
              {children}
            </pre>
          )
        },
        code({ children, className }) {
          const isInline = !className
          if (isInline) {
            return (
              <code className="rounded bg-[#1a1a2e] px-1.5 py-0.5 text-sm text-emerald-400">
                {children}
              </code>
            )
          }
          return <code className={className}>{children}</code>
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="mb-3 list-disc pl-6">{children}</ul>
        },
        ol({ children }) {
          return <ol className="mb-3 list-decimal pl-6">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-1">{children}</li>
        },
        h1({ children }) {
          return <h1 className="mb-3 text-xl font-bold">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="mb-2 text-lg font-bold">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="mb-2 text-base font-bold">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="mb-3 border-l-4 border-emerald-500 pl-4 italic text-gray-400">
              {children}
            </blockquote>
          )
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
