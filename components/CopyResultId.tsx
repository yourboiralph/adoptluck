

"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function CopyResultId({ value }: { value: string | number }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <button
      onClick={copy}
      className="hover:scale-110 transition cursor-pointer"
    >
      <Copy size={14} />
    </button>
  );
}
