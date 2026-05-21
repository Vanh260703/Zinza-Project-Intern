import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontFamily = "sans" | "serif" | "mono";
export type TextColor  = "white" | "muted" | "warm" | "soft";

export type ReaderSettings = {
  fontSize:   number;
  lineHeight: number;
  fontFamily: FontFamily;
  textColor:  TextColor;
};

type ReaderStore = ReaderSettings & {
  setFontSize:   (v: number)     => void;
  setLineHeight: (v: number)     => void;
  setFontFamily: (v: FontFamily) => void;
  setTextColor:  (v: TextColor)  => void;
};

export const FONT_FAMILIES: Record<FontFamily, { label: string; style: string }> = {
  sans:  { label: "Sans",  style: "ui-sans-serif, system-ui, sans-serif"          },
  serif: { label: "Serif", style: "ui-serif, Georgia, serif"                      },
  mono:  { label: "Mono",  style: "ui-monospace, 'Courier New', monospace"        },
};

export const TEXT_COLORS: Record<TextColor, { label: string; hex: string }> = {
  white: { label: "Trắng",  hex: "#e7e5e4" },
  muted: { label: "Xám",    hex: "#a8a29e" },
  warm:  { label: "Kem",    hex: "#fef3c7" },
  soft:  { label: "Xanh",   hex: "#bfdbfe" },
};

export const LINE_HEIGHTS = [1.6, 1.8, 2.0, 2.2];

export const FONT_MIN = 14;
export const FONT_MAX = 26;

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set) => ({
      fontSize:   16,
      lineHeight: 1.9,
      fontFamily: "sans",
      textColor:  "white",

      setFontSize:   (fontSize)   => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setTextColor:  (textColor)  => set({ textColor }),
    }),
    { name: "reader-settings" }
  )
);
