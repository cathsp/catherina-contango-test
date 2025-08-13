'use client';

import './globals.css';
import React from 'react';
import { trpc } from '../lib/trpc';
import { uploadFile } from '../utils/trpcClient';
import type { ValidationResponse } from '../types';

export default function Page() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<null | ValidationResponse>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
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
    const fileToken = await uploadFile(file);

    const res = await trpc.cv.validateAndSave.mutate({
      fullName, email, phone, skills, experience, fileToken
    });
    setStatus(res as ValidationResponse);
  }

  return (
    <div className="container">
      <h1>CV Validator</h1>
      <p className="small">Next.js + tRPC + Node + PostgreSQL</p>
      <div className="card">
        <form ref={formRef} onSubmit={onSubmit}>
          <div className="row">
            <div>
              <label>Full name</label>
              <input name="fullName" placeholder="Jane Doe" required />
            </div>
            <div>
              <label>Email</label>
              <input name="email" type="email" placeholder="jane@ex.com" required />
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <div>
              <label>Phone</label>
              <input name="phone" placeholder="+62..." required />
            </div>
            <div>
              <label>Skills</label>
              <input name="skills" placeholder="React, Node, SQL" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Experience</label>
            <textarea name="experience" rows={4} placeholder="Work history..."></textarea>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Upload CV (PDF)</label><br />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit">Validate & Save</button>
          </div>
        </form>
        {status && (
          <div className={`status ${status.ok ? 'ok' : 'err'}`}>
            {status.ok ? (
              <div>✅ Validation passed. Saved with ID: {status.id}</div>
            ) : (
              <div>
                <div>❌ Validation failed.</div>
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
