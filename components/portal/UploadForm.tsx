"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import s from "@/app/upload/portal.module.css";

type Saved = { id: number; filename: string; size: number; kind: string };
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

export default function UploadForm({ token }: { token: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [kind, setKind] = useState("logo");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const input = useRef<HTMLInputElement>(null);

  function add(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 12));
    setError(null);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    add(e.dataTransfer.files);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Choose at least one file.");
      return;
    }
    const data = new FormData(e.currentTarget);
    data.delete("files");
    for (const f of files) data.append("files", f);
    setBusy(true);
    setError(null);
    setProgress(0);
    // XMLHttpRequest so the bar can follow a 60 MB upload on a phone connection
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload/${token}`);
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(ev.loaded / ev.total);
    xhr.onload = () => {
      setBusy(false);
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setSaved((prev) => [...prev, ...body.files]);
          setFiles([]);
          if (input.current) input.current.value = "";
        } else setError(body.error ?? "Upload failed. Try again.");
      } catch {
        setError("Upload failed. Try again.");
      }
    };
    xhr.onerror = () => {
      setBusy(false);
      setError("The connection dropped. Try again.");
    };
    xhr.send(data);
  }

  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.kinds} role="radiogroup" aria-label="What are you sending">
        {[
          ["logo", "Logo", "SVG, AI, PDF or a large PNG"],
          ["product", "Product", "Photos or a short clip"],
          ["other", "Other", "Anything else useful"],
        ].map(([v, t, d]) => (
          <label key={v} className={s.kind}>
            <input type="radio" name="kind" value={v} checked={kind === v} onChange={() => setKind(v)} />
            <strong>{t}</strong>
            <span>{d}</span>
          </label>
        ))}
      </div>

      <label
        className={s.drop}
        data-over={over || undefined}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input ref={input} type="file" name="files" multiple onChange={(e) => add(e.target.files)} accept=".png,.jpg,.jpeg,.webp,.svg,.gif,.heic,.tif,.tiff,.pdf,.ai,.eps,.zip,.mp4,.mov,.webm" />
        <strong>Tap to choose files</strong>
        <span>or drop them here · up to 12 files, 60 MB each</span>
      </label>

      {files.length > 0 && (
        <ul className={s.picked} aria-label="Files to send">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              {f.name}
              <span>{mb(f.size)}</span>
            </li>
          ))}
        </ul>
      )}

      <label className={s.field}>
        Anything we should know (optional)
        <textarea name="note" rows={3} placeholder="Colours to keep, what the product is, what you'd like it to do" />
      </label>

      {busy && <div className={s.progress} aria-label="Upload progress"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>}
      {error && <p className={s.error} role="alert">{error}</p>}

      <button className={s.submit} type="submit" disabled={busy}>
        {busy ? `Sending… ${Math.round(progress * 100)}%` : files.length ? `Send ${files.length} file${files.length > 1 ? "s" : ""}` : "Send files"}
      </button>

      {saved.length > 0 && (
        <div className={s.done} role="status">
          <h2>Received. Thank you.</h2>
          <p>We have these and will start on your content. You can send more with the same link.</p>
          <ul>
            {saved.map((f) => (
              <li key={f.id}>{f.filename} · {f.kind} · {mb(f.size)}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
