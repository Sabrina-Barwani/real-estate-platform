"use client";

import { useState } from "react";
import clsx from "clsx";

export default function Gallery({ images }: { images: { id: string; url: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-base-900/5 text-base-900/40">
        No photos yet
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsFullscreen(true)}
        className="block w-full overflow-hidden rounded-2xl bg-base-900/5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex].url}
          alt=""
          className="aspect-[16/9] w-full object-cover"
        />
      </button>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              className={clsx(
                "aspect-square overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-accent" : "border-transparent"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 text-2xl text-white"
            aria-label="Close"
          >
            ×
          </button>
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i - 1 + images.length) % images.length);
              }}
              className="absolute left-4 text-3xl text-white"
              aria-label="Previous"
            >
              ‹
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex].url}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i + 1) % images.length);
              }}
              className="absolute right-4 text-3xl text-white"
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
