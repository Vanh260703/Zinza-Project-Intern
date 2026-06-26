export interface ParsedOverview {
  name: string;
  author: string;
  status: string;
  categories: string[];
  tags: string[];
  description: string;
}

export function parseOverview(content: string): ParsedOverview {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const fields: Record<string, string> = {};
  const descLines: string[] = [];
  let inDesc = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'Tóm tắt:') {
      inDesc = true;
      continue;
    }
    if (inDesc) {
      descLines.push(line);
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.substring(0, colonIdx).trim();
    const value = trimmed.substring(colonIdx + 1).trim();
    if (key) fields[key] = value;
  }

  const splitList = (raw: string) =>
    !raw || raw === '—'
      ? []
      : raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

  return {
    name: fields['Tên truyện'] ?? '',
    author: fields['Tác giả'] ?? '',
    status: fields['Trạng thái'] ?? '',
    categories: splitList(fields['Thể loại'] ?? ''),
    tags: splitList(fields['Tags'] ?? ''),
    description: descLines.join('\n').trim(),
  };
}
