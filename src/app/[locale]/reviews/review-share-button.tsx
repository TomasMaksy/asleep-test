"use client";

import { useState } from "react";
import { ReviewShareSheet } from "@/app/[locale]/reviews/review-share-sheet";

export function ReviewShareButton({ label }: { label: string }) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex h-12 min-w-[168px] cursor-pointer items-center justify-center rounded-full bg-brand px-6 text-base text-white transition-colors hover:bg-[#2456a0]"
        onClick={() => setShareOpen(true)}
        type="button"
      >
        {label}
      </button>
      <ReviewShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
