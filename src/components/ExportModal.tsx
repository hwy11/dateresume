import { useState } from 'react'
import { copyMarkdown, downloadMarkdown } from '../lib/markdown'

interface ExportModalProps {
  content: string
  dateKey: string
  onClose: () => void
}

export function ExportModal({ content, dateKey, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyMarkdown(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text">导出 Markdown 预览</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-weak hover:text-text text-lg leading-none"
          >
            ×
          </button>
        </div>

        <pre className="p-4 text-xs text-text-weak overflow-auto max-h-64 whitespace-pre-wrap font-mono bg-bg/50 mx-4 mt-4 rounded-lg border border-border">
          {content}
        </pre>

        <div className="flex justify-end gap-2 p-4">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-bg text-text"
          >
            {copied ? '已复制' : '复制'}
          </button>
          <button
            type="button"
            onClick={() => downloadMarkdown(content, dateKey)}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            下载 .md
          </button>
        </div>
      </div>
    </div>
  )
}
