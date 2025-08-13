'use client';

import './globals.css';
import React from 'react';
import { trpc } from '../lib/trpc';
import { uploadFile } from '../utils/trpcClient';
import type { ValidationResponse } from '../types';

export default function Page() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<null | ValidationResponse>(null);
  const [loading, setLoading] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const fd = new FormData(formRef.current || undefined);
      const fullName = String(fd.get('fullName') || '');
      const email = String(fd.get('email') || '');
      const phone = String(fd.get('phone') || '');
      const skills = String(fd.get('skills') || '');
      const experience = String(fd.get('experience') || '');

      if (!file) {
        setStatus({ ok: false, errors: { file: "Please choose a PDF" } });
        return;
      }

      // Optional client-side MIME check
      if (file.type !== "application/pdf") {
        setStatus({ ok: false, errors: { file: "File must be a PDF" } });
        return;
      }

      // 1) Upload
      let fileToken: string;
      try {
        fileToken = await uploadFile(file);
      } catch {
        setStatus({ ok: false, errors: { file: "Upload failed. Please try again." } });
        return;
      }

      // 2) Validate & Save
      try {
        const res = await trpc.cv.validateAndSave.mutate({
          fullName, email, phone, skills, experience, fileToken
        });
        setStatus(res as ValidationResponse);
      } catch (err: any) {
        setStatus({ ok: false, errors: { server: err?.message || "Validation request failed." } });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>CV Validator</h1>
      <p className="small">Next.js + tRPC + Node + PostgreSQL</p>
      <div className="card">
        <form ref={formRef} onSubmit={onSubmit} aria-busy={loading}>
          <div className="row">
            <div>
              <label>Full name</label>
              <input name="fullName" placeholder="Jane Doe" required disabled={loading} />
            </div>
            <div>
              <label>Email</label>
              <input name="email" type="email" placeholder="jane@ex.com" required disabled={loading} />
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <label>Phone</label>
              <input name="phone" placeholder="+62..." required disabled={loading} />
            </div>
            <div>
              <label>Skills</label>
              <input name="skills" placeholder="React, Node, SQL" disabled={loading} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Experience</label>
            <textarea name="experience" rows={4} placeholder="Work history..." disabled={loading}></textarea>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Upload CV (PDF)</label><br />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={loading} className={loading ? 'btn loading' : 'btn'}>
              {loading ? (<><span className="spinner" aria-hidden="true"></span> Validating…</>) : 'Validate & Save'}
            </button>
          </div>
        </form>

        {status && (
          <div className={`status ${status.ok ? 'ok' : 'err'}`} role="status" aria-live="polite">
            {status.ok ? (
              <div>Validation passed.</div>
            ) : (
              <div>
                <div>Validation failed.</div>
                <ul>
                  {Object.entries(status.errors).map(([k,v]) => (
                    <li key={k}><b>{k}</b>: {String(v)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
