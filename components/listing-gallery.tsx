"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryImage = {
  alt: string;
  src: string;
  type: "real" | "official";
};

export function ListingGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  if (!selectedImage) return null;

  return (
    <section>
      <div className="relative grid min-h-[520px] place-items-center overflow-hidden rounded-lg border border-blue-100 bg-[linear-gradient(145deg,#dbeafe,#fff7cc)] p-6 sm:p-10">
        <div className="absolute left-0 top-0 h-2 w-full bg-[linear-gradient(90deg,#ef4444_0_33%,#facc15_33%_66%,#2563eb_66%)]" />
        <span className="absolute left-4 top-5 inline-flex items-center gap-2 rounded-full bg-blue-950/90 px-3 py-1.5 text-xs font-black uppercase text-white">
          {selectedImage.type === "real" ? (
            <Camera className="h-4 w-4 text-yellow-300" />
          ) : (
            <Database className="h-4 w-4 text-sky-300" />
          )}
          {selectedImage.type === "real" ? "Foto real" : "Imagen oficial"}
        </span>
        <Image
          alt={selectedImage.alt}
          className={cn(
            "h-auto max-h-[610px] w-auto max-w-full drop-shadow-[0_28px_28px_rgba(30,64,175,0.25)]",
            selectedImage.type === "real" ? "rounded-md object-contain" : "object-contain"
          )}
          height={900}
          priority
          sizes="(max-width: 1024px) 80vw, 620px"
          src={selectedImage.src}
          unoptimized={selectedImage.type === "real"}
          width={900}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
        {images.map((image, index) => (
          <button
            aria-label={`Ver ${image.alt}`}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border-2 bg-white p-1 transition",
              selectedIndex === index
                ? "border-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.2)]"
                : "border-blue-100 hover:border-blue-300"
            )}
            key={`${image.src}-${index}`}
            onClick={() => setSelectedIndex(index)}
            type="button"
          >
            <Image
              alt=""
              className="object-contain"
              fill
              sizes="120px"
              src={image.src}
              unoptimized={image.type === "real"}
            />
            <span
              className={cn(
                "absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-white",
                image.type === "real" ? "bg-blue-700" : "bg-slate-700"
              )}
            >
              {image.type === "real" ? `Real ${index + 1}` : "Oficial"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
