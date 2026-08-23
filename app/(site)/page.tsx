"use client";

import ContentCutTwoToneIcon from "@mui/icons-material/ContentCutTwoTone";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useShortUrl } from "@/hooks/useShortUrl";
import { useSession } from "next-auth/react";
import z from "zod";
import { toast } from "sonner";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import QrCode2Outlined from "@mui/icons-material/QrCode2Outlined";
import { QRCodeDialog } from "@/components/QRCodeDialog";

const urlSchema = z.url();

export default function Home() {
  const { shortUrl, isLoading, newUrl } = useShortUrl();
  const [url, setUrl] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const { data: session } = useSession();
  const lastSubmittedRef = useRef("");
  const isValidUrl = useMemo(
    () => urlSchema.safeParse(url.trim()).success,
    [url]
  );

  const submitDisabled = isLoading || !isValidUrl;

  
  const submittingRef = useRef(false);

  const handleShorten = async () => {
    const trimmedUrl = url.trim();
  
    if (submittingRef.current || isLoading) {
      console.log("exit");
      return;
    }
  
    if (!session) {
      toast.error("Please login to shorten your URL", {
        position: "top-center",
      });
      return;
    }
  
    if (!isValidUrl) {
      toast.error("Enter a valid URL");
      return;
    }
  
    if (lastSubmittedRef.current === trimmedUrl) {
      toast.info("URL already shortened");
      return;
    }
  
    try {
      submittingRef.current = true;
        lastSubmittedRef.current = trimmedUrl;
  
      await shortUrl(trimmedUrl);
    } catch {
      lastSubmittedRef.current = "";
      toast.error("Failed to shorten URL");
    } finally {
      setTimeout(() => {
        submittingRef.current = false;
      }, 500);
    }
  };

  return (
    <div className="bg-[#0b1326] text-slate-100">
      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-32">
        <section className="mx-auto mb-24 max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Simple, fast URL shortening.
          </h1>
          <p className="mx-auto mb-12 max-w-xl text-lg text-slate-300">
            The core tools you need to create, share, and track your links with
            zero friction.
          </p>

          <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-2 backdrop-blur-md md:flex-row">
            <input
            autoFocus
              type="url"
              placeholder="Paste your long URL here..."
              value={url}
                autoComplete="off"
              onChange={(e) => setUrl(e.target.value)}
              className="  h-12 w-full rounded-md border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400"
            />
            <Button
              onClick={handleShorten}
              
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleShorten();
                }
              }}
              disabled={submitDisabled}
              className="h-12 rounded-lg bg-indigo-500 px-8 text-white hover:bg-indigo-400 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Spinner className="size-4" />
                  Shortening...
                </>
              ) : (
                <>
                  Shorten Now
                  <ContentCutTwoToneIcon />
                </>
              )}
            </Button>
          </div>
          <div className="mt-6 w-full">
            {newUrl ? (
              <div className="rounded-2xl border border-white/10 bg-[#171f33]/70 backdrop-blur-xl p-6">
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
                  ✅ YOUR SHORTENED URL IS READY
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 font-mono text-lg sm:text-xl text-[#c0c1ff] break-all">
                    <a
                      href={newUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      // onClick={() => {
                      //   console.log(newUrl);
                      // }}
                    >
                      {newUrl}
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(newUrl);
                        toast.success("Copied to clipboard!");
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                    >
                      <ContentCopyOutlined sx={{ fontSize: 20 }} />
                      Copy
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => window.open(newUrl, "_blank")}
                      className="border-white/20 hover:bg-white/5 cursor-pointer"
                    >
                      Visit
                      <OpenInNewOutlined sx={{ fontSize: 18 }} />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-zinc-400 hover:text-white"
                    onClick={() => setQrOpen(true)}
                  >
                    <QrCode2Outlined sx={{ fontSize: 18 }} className="mr-1" />
                    Show QR Code
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center py-8 text-zinc-500">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  Shortening your link...
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-zinc-500">
                Your shortened URL will appear here
              </div>
            )}
            <QRCodeDialog
              open={qrOpen}
              onOpenChange={setQrOpen}
              url={newUrl}
              shortCode={newUrl ? newUrl.split("/").pop() : undefined}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
