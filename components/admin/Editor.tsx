"use client";

import { useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import s from "@/app/admin/admin.module.css";
import prose from "@/app/articles/articles.module.css";

// The article body editor: what you see is the article page's own prose style. The HTML is mirrored into a
// hidden field so the surrounding form posts it like any other input.
type Props = { name: string; html: string };

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

// defined outside the editor so React keeps the same button elements across re-renders (focus, hover, tooltips)
function B({ label, active, onClick, children, disabled }: { label: string; active?: boolean; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={s.tool}
      data-active={active || undefined}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      // keep the editor focused and its selection intact while the button is clicked
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

export default function Editor({ name, html }: Props) {
  const [value, setValue] = useState(html);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        codeBlock: false,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing. Paste text, add headings, lists, quotes, links and pictures from the bar above." }),
    ],
    content: html,
    editorProps: { attributes: { class: `${prose.prose} ${s.editorSurface}` } },
    onUpdate: ({ editor }) => setValue(editor.isEmpty ? "" : editor.getHTML()),
  });

  const setLink = () => {
    if (!editor) return;
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address", current ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const uploadImage = async (file: File) => {
    if (!editor) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/articles/image", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      const alt = window.prompt("Describe the picture for screen readers", file.name.replace(/\.[a-z0-9]+$/i, "")) ?? "";
      editor.chain().focus().setImage({ src: data.url, alt }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className={s.editorWrap}>
      <input type="hidden" name={name} value={value} />
      <div className={s.toolbar} role="toolbar" aria-label="Formatting">
        {editor && (
          <>
            <B label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><span className={s.toolText}>H2</span></B>
            <B label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><span className={s.toolText}>H3</span></B>
            <B label="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><span className={s.toolText}>¶</span></B>
            <i className={s.toolGap} />
            <B label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><span className={`${s.toolText} ${s.toolBold}`}>B</span></B>
            <B label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><span className={`${s.toolText} ${s.toolItalic}`}>I</span></B>
            <B label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><span className={`${s.toolText} ${s.toolStrike}`}>S</span></B>
            <i className={s.toolGap} />
            <B label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><Icon d="M5 4h8M5 8h8M5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" /></B>
            <B label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><Icon d="M6 4h8M6 8h8M6 12h8M2 3.5l1-.5v3M2 9.5h2l-2 2.5h2" /></B>
            <B label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Icon d="M3 10V7a3 3 0 0 1 3-3M9 10V7a3 3 0 0 1 3-3M3 10h2v2H3zM9 10h2v2H9z" /></B>
            <B label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Icon d="M2 8h12" /></B>
            <i className={s.toolGap} />
            <B label="Link" active={editor.isActive("link")} onClick={setLink}><Icon d="M6.5 9.5l3-3M7 11l-1.2 1.2a2.3 2.3 0 0 1-3.2-3.2L4 7.8M9 5l1.2-1.2a2.3 2.3 0 0 1 3.2 3.2L12 8.2" /></B>
            <B label="Picture" onClick={() => fileInput.current?.click()} disabled={uploading}><Icon d="M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10.5 6h.01" /></B>
            <i className={s.toolGap} />
            <B label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Icon d="M6 5L3 8l3 3M3 8h6a3 3 0 0 1 0 6H8" /></B>
            <B label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Icon d="M10 5l3 3-3 3M13 8H7a3 3 0 0 0 0 6h1" /></B>
            {uploading && <span className={s.toolNote}>Uploading…</span>}
          </>
        )}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadImage(f);
        }}
      />
      <EditorContent editor={editor} />
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
}
