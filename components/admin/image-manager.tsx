"use client";

import { useRef, useState, useTransition } from "react";
import clsx from "clsx";
import {
  uploadImages,
  deleteImage,
  setCoverImage,
  reorderImages,
  replaceImage,
} from "@/actions/image-actions";

type ImageItem = {
  id: string;
  url: string;
  sort_order: number;
};

export default function ImageManager({
  propertyId,
  initialImages,
  coverImageId,
}: {
  propertyId: string;
  initialImages: ImageItem[];
  coverImageId: string | null;
}) {
  const [images, setImages] = useState(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [cover, setCover] = useState(coverImageId);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    startTransition(async () => {
      setError(undefined);
      const result = await uploadImages(propertyId, formData);
      if (result?.error) setError(result.error);
      // Server action revalidates the page, but that alone won't refresh
      // this client component's local state — a full reload keeps things
      // simple and correct for a low-frequency admin action like this.
      window.location.reload();
    });
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    startTransition(() => {
      reorderImages(propertyId, next.map((img) => img.id));
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this photo? This can't be undone.")) return;
    setImages((prev) => prev.filter((img) => img.id !== id));
    startTransition(() => {
      deleteImage(propertyId, id);
    });
  }

  function handleSetCover(id: string) {
    setCover(id);
    startTransition(() => {
      setCoverImage(propertyId, id);
    });
  }

  function handleReplace(id: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      setError(undefined);
      const result = await replaceImage(propertyId, id, formData);
      if (result?.error) setError(result.error);
      window.location.reload();
    });
  }

  return (
    <div className="max-w-3xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm transition",
          isDragOver ? "border-accent bg-accent/5" : "border-base-900/15 hover:border-base-900/30"
        )}
      >
        <p className="text-base-900/70">
          {isPending ? "Uploading…" : "Drag and drop photos here, or tap to choose from your phone"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img, index) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border border-base-900/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-32 w-full object-cover" />
              {cover === img.id && (
                <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">
                  Cover
                </span>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 bg-white/95 p-2 text-xs">
                {cover !== img.id && (
                  <button onClick={() => handleSetCover(img.id)} className="text-accent hover:underline">
                    Set cover
                  </button>
                )}
                <button onClick={() => move(index, -1)} disabled={index === 0} className="disabled:opacity-30">
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  className="disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => {
                    setReplacingId(img.id);
                    replaceInputRef.current?.click();
                  }}
                  className="hover:underline"
                >
                  Replace
                </button>
                <button onClick={() => handleDelete(img.id)} className="text-red-700 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replacingId) handleReplace(replacingId, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
