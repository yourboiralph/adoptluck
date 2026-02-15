"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";

type Props = {
  randWords: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function VerifyUsername({
  randWords,
  onConfirm,
  trigger,
  open,
  onOpenChange,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!randWords) return;

    await navigator.clipboard.writeText(randWords);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify your username.</AlertDialogTitle>

          <AlertDialogDescription>
            Put these words in your Roblox bio, then press Continue.
          </AlertDialogDescription>

          <div className="mt-3 rounded-md border px-3 py-2 font-mono text-sm flex items-center justify-between gap-2">
            <span className="break-words">{randWords || "…"}</span>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={!randWords}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
