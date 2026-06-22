/**
 * Service layer cho import ZIP chapters.
 *
 * Mock: simulate toàn bộ hai phase bằng setTimeout.
 * Real BE: thay thế bằng XHR để phase 1 có progress thật:
 *
 *   return new Promise((resolve, reject) => {
 *     const xhr = new XMLHttpRequest();
 *     xhr.upload.onprogress = (e) => {
 *       if (e.lengthComputable) onUploadProgress(e.loaded / e.total);
 *     };
 *     xhr.onload = () => {
 *       if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
 *       else reject(new Error(JSON.parse(xhr.responseText).message ?? "Import thất bại"));
 *     };
 *     xhr.onerror = () => reject(new Error("Lỗi kết nối"));
 *     xhr.open("POST", `/api/novels/${novelId}/import`);
 *     const form = new FormData();
 *     form.append("file", file);
 *     xhr.send(form);
 *   });
 */

type ImportResult = { chapters: number };

/**
 * @param file             - File ZIP cần import
 * @param novelId          - ID của truyện
 * @param onUploadProgress - Callback 0→1 cho phase upload (dùng với XHR)
 * @returns                - Số chương đã import
 */
export async function importZip(
  file: File,
  novelId: string,
  onUploadProgress: (ratio: number) => void
): Promise<ImportResult> {
  // TODO (BE): thay bằng XHR thật (xem comment trên)
  // Mock: giả lập upload trong ~1.5s
  await new Promise<void>((resolve) => {
    let ratio = 0;
    const tick = () => {
      ratio = Math.min(ratio + Math.random() * 0.08 + 0.04, 1);
      onUploadProgress(ratio);
      if (ratio >= 1) {
        resolve();
        return;
      }
      setTimeout(tick, 80);
    };
    setTimeout(tick, 50);
  });

  // Mock: giả lập server processing trong ~1.2s
  await new Promise((r) => setTimeout(r, 1200));

  return { chapters: 0 }; // mock — BE sẽ trả số chương thật
}
