/**
 * Service layer cho import ZIP chapters — gọi BE thật.
 *
 * Luồng: upload ZIP (XHR để có tiến trình upload thật) → BE trả jobId ngay
 * (xử lý bất đồng bộ qua BullMQ) → poll trạng thái job tới khi completed/failed.
 */

export type ImportResult = {
  id: string;
  slug: string;
  name: string;
  author: string;
  poster: string | null;
  status: string;
  chapterCount: number;
  categories: string[];
  tags: string[];
};

type ImportJobState = "waiting" | "active" | "completed" | "failed";
type ImportJobStatus = {
  jobId: string;
  state: ImportJobState;
  result?: ImportResult;
  error?: string;
};

function uploadZip(
  file: File,
  onUploadProgress: (ratio: number) => void
): Promise<{ jobId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onUploadProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data: { jobId?: string; message?: string };
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Phản hồi không hợp lệ từ máy chủ"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.jobId) {
        resolve({ jobId: data.jobId });
      } else {
        reject(new Error(data.message ?? "Import thất bại"));
      }
    };
    xhr.onerror = () => reject(new Error("Lỗi kết nối"));
    xhr.open("POST", "/api/novels/import");
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120; // ~3 phút — ZIP nhiều chương xử lý có thể lâu

async function pollJobStatus(
  jobId: string,
  onTick: (state: ImportJobState) => void
): Promise<ImportResult> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const res = await fetch(`/api/novels/import/jobs/${jobId}`, { cache: "no-store" });
    const status = (await res.json().catch(() => ({}))) as Partial<ImportJobStatus> & {
      message?: string;
    };

    if (!res.ok || !status.state) {
      throw new Error(status.message ?? "Không kiểm tra được trạng thái import");
    }

    onTick(status.state);

    if (status.state === "completed") {
      if (!status.result) throw new Error("Import hoàn tất nhưng thiếu dữ liệu trả về");
      return status.result;
    }
    if (status.state === "failed") {
      throw new Error(status.error ?? "Import thất bại");
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("Import quá lâu — kiểm tra lại trong trang Truyện của tôi sau ít phút");
}

/**
 * @param file             - File ZIP cần import
 * @param onUploadProgress - Callback 0→1 cho phase upload (dựa trên XHR upload event thật)
 * @param onProcessingTick - Gọi mỗi lần poll trong lúc BE đang xử lý (để FE tự chạy animation chờ)
 */
export async function importZip(
  file: File,
  onUploadProgress: (ratio: number) => void,
  onProcessingTick?: () => void
): Promise<ImportResult> {
  const { jobId } = await uploadZip(file, onUploadProgress);
  return pollJobStatus(jobId, (state) => {
    if (state === "waiting" || state === "active") onProcessingTick?.();
  });
}
