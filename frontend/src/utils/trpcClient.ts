export async function uploadFile(file: File): Promise<string> {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:4000";
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${base}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.fileToken as string;
}
