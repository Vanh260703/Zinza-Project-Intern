"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileArchive, X, Info, CheckCircle } from "lucide-react";
import { showToast } from "@/lib/toast";

const INSTRUCTIONS = [
  "File ZIP chứa các chương theo định dạng .txt hoặc .html",
  "Tên file mỗi chương nên theo dạng: 001.txt, 002.txt,...",
  "Dung lượng tối đa 50MB",
];

function DropZone({
  file,
  onFile,
  onClear,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".zip")) onFile(dropped);
    else showToast.error("Chỉ hỗ trợ file .zip");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  if (file) {
    return (
      <div className="flex items-center gap-4 p-5 bg-stone-800/50 border border-stone-700 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <FileArchive className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-stone-200 text-sm font-medium truncate">{file.name}</p>
          <p className="text-stone-500 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-stone-700 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center gap-3 py-12 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors text-center ${
        dragging
          ? "border-amber-500/60 bg-amber-500/5"
          : "border-stone-700 hover:border-stone-600 bg-stone-800/30"
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
        dragging ? "bg-amber-500/15 border border-amber-500/20" : "bg-stone-800 border border-stone-700"
      }`}>
        <Upload className={`w-6 h-6 ${dragging ? "text-amber-400" : "text-stone-500"}`} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-stone-300 text-sm font-medium">Kéo thả file ZIP vào đây</p>
        <p className="text-stone-600 text-xs mt-1">hoặc click để chọn file</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}

export default function ImportZipForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { showToast.error("Vui lòng chọn file ZIP"); return; }
    setLoading(true);
    // TODO: gọi API upload ZIP
    await new Promise((r) => setTimeout(r, 1000));
    showToast.success("Import thành công");
    setLoading(false);
    router.push("/my-novels");
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Hướng dẫn */}
      <div className="flex flex-col gap-2 p-4 bg-stone-800/40 border border-stone-700 rounded-xl">
        <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Yêu cầu định dạng
        </div>
        <ul className="flex flex-col gap-1.5">
          {INSTRUCTIONS.map((text) => (
            <li key={text} className="flex items-start gap-2 text-stone-500 text-xs">
              <CheckCircle className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Drop zone */}
      <DropZone file={file} onFile={setFile} onClear={() => setFile(null)} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !file}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading ? "Đang import..." : "Import"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}
