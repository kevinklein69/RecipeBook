"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onResult: (productName: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [phase, setPhase] = useState<"scanning" | "loading" | "not-found" | "camera-error">(
    "scanning"
  );
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let controls: { stop: () => void } | null = null;
    let resolved = false;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (cancelled) return;
        const reader = new BrowserMultiFormatReader();

        const c = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current!,
          async (result) => {
            if (!result || resolved) return;
            resolved = true;
            controls?.stop();
            setPhase("loading");

            try {
              const barcode = result.getText();
              const res = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
              );
              const data = await res.json();
              const name =
                data.status === 1
                  ? (data.product.product_name_de || data.product.product_name || "").trim()
                  : "";
              if (name) {
                onResultRef.current(name);
              } else {
                setPhase("not-found");
              }
            } catch {
              setPhase("not-found");
            }
          }
        );

        if (resolved) {
          c.stop();
        } else {
          controls = c;
        }
      } catch (err) {
        if (cancelled) return;
        // AbortError is ZXing's internal retry mechanism — it handles it itself
        if (err instanceof Error && err.name === "AbortError") return;
        setErrorDetail(err instanceof Error ? err.message : String(err));
        setPhase("camera-error");
      }
    }

    start();

    return () => {
      cancelled = true;
      resolved = true;
      controls?.stop();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Barcode scannen</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="relative aspect-[4/3] w-full bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-36 w-56">
              <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-white" />
              <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-white" />
              <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-white" />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 text-center">
          {phase === "scanning" && (
            <p className="text-sm text-slate-500">
              Kamera auf den Barcode des Produkts richten
            </p>
          )}
          {phase === "loading" && (
            <p className="text-sm text-slate-500">Produkt wird gesucht…</p>
          )}
          {phase === "not-found" && (
            <div>
              <p className="text-sm text-red-500">
                Produkt nicht in der Datenbank gefunden.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-sm font-medium text-brand-600 hover:underline"
              >
                Schließen
              </button>
            </div>
          )}
          {phase === "camera-error" && (
            <div>
              <p className="text-sm text-red-500">Kamera konnte nicht geöffnet werden.</p>
              {errorDetail && (
                <p className="mt-1 text-xs text-slate-400 break-all">{errorDetail}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
