import Link from "next/link";
import { ShieldOff, ShieldX, ServerCrash } from "lucide-react";

type ErrorPageProps = {
  code: 401 | 403 | 500;
  title: string;
  description: string;
  action?: { label: string; href: string };
};

const CONFIG: Record<number, { icon: React.ElementType; color: string }> = {
  401: { icon: ShieldOff, color: "amber" },
  403: { icon: ShieldX, color: "violet" },
  500: { icon: ServerCrash, color: "red" },
};

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-500/10  border-amber-500/20  text-amber-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  red: "bg-red-500/10    border-red-500/20    text-red-400",
};

const TEXT_MAP: Record<string, string> = {
  amber: "text-amber-400",
  violet: "text-violet-400",
  red: "text-red-400",
};

export default function ErrorPage({ code, title, description, action }: ErrorPageProps) {
  const { icon: Icon, color } = CONFIG[code];

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div
          className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${COLOR_MAP[color]}`}
        >
          <Icon className="w-9 h-9" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-2">
          <p className={`text-6xl font-black tracking-tight ${TEXT_MAP[color]}`}>{code}</p>
          <h1 className="text-white text-xl font-bold">{title}</h1>
          <p className="text-stone-500 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3">
          {action && (
            <Link
              href={action.href}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
            >
              {action.label}
            </Link>
          )}
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
