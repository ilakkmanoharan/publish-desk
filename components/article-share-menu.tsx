"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildShareUrl(origin: string, pathname: string, search: string) {
  const q = search ? `?${search}` : "";
  return `${origin}${pathname}${q}`;
}

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

function MenuRow({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted">{icon}</span>
      {label}
    </button>
  );
}

/** Social logos as simple SVG marks (neutral gray, Medium-like). */
function IconBluesky() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-muted">
      <path
        fill="currentColor"
        d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.22-4.294 1.098-6.499-2.816-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-muted">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-muted">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function IconThreads() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-muted">
      <path
        fill="currentColor"
        d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.087 3.509 5.345.447 1.615.622 3.375.622 5.557v1.178c-.024 2.182-.199 3.942-.646 5.557-.651 2.258-1.832 4.055-3.509 5.345-1.783 1.373-4.08 2.078-6.826 2.098zm-.014-2.296c2.929-.02 5.313-.82 7.23-2.298 1.378-1.06 2.35-2.54 2.92-4.4.39-1.41.55-2.98.573-4.92V12.01c-.023-1.94-.183-3.51-.573-4.92-.57-1.86-1.542-3.34-2.92-4.4-1.917-1.478-4.301-2.278-7.23-2.298-3.035.022-5.4.84-7.28 2.298-1.378 1.06-2.35 2.54-2.92 4.4-.39 1.41-.55 2.98-.573 4.92v1.178c.023 1.94.183 3.51.573 4.92.57 1.86 1.542 3.34 2.92 4.4 1.88 1.458 4.245 2.276 7.28 2.298z"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden className="text-muted">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

type Props = {
  /** Article title for pre-filled social posts */
  title: string;
  /** Magazine-style: center the control under the headline */
  variant?: "default" | "magazine";
};

export function ArticleShareMenu({ title, variant = "default" }: Props) {
  const menuId = useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const search = searchParams.toString();
  const pageUrl = origin ? buildShareUrl(origin, pathname, search) : "";
  const encodedUrl = pageUrl ? encodeURIComponent(pageUrl) : "";
  const textForSocial = `${title}${pageUrl ? ` ${pageUrl}` : ""}`;
  const encodedText = encodeURIComponent(textForSocial);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  async function copyLink() {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const shareX = () => {
    if (!encodedUrl) return;
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`
    );
    close();
  };

  const shareFacebook = () => {
    if (!encodedUrl) return;
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
    close();
  };

  const shareLinkedIn = () => {
    if (!encodedUrl) return;
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
    close();
  };

  const shareBluesky = () => {
    openShareWindow(`https://bsky.app/intent/compose?text=${encodedText}`);
    close();
  };

  const shareThreads = () => {
    openShareWindow(`https://www.threads.net/intent/post?text=${encodedText}`);
    close();
  };

  const align =
    variant === "magazine" ? "justify-center" : "justify-start";

  return (
    <div ref={wrapRef} className={`relative flex ${align}`}>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-muted/30 hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent/40"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        title="Share article"
      >
        <IconShare className="shrink-0" />
        <span className="sr-only">Share</span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Share article"
          className={`absolute top-full z-30 mt-2 min-w-[220px] rounded-xl border border-border bg-card py-1.5 shadow-lg ring-1 ring-black/5 ${
            variant === "magazine" ? "left-1/2 -translate-x-1/2" : "left-0"
          }`}
        >
          <MenuRow
            icon={<IconLink />}
            label={copied ? "Copied!" : "Copy link"}
            onClick={() => void copyLink()}
          />
          <div className="my-1.5 h-px bg-border" role="separator" />
          <MenuRow icon={<IconBluesky />} label="Share on Bluesky" onClick={shareBluesky} />
          <MenuRow icon={<IconFacebook />} label="Share on Facebook" onClick={shareFacebook} />
          <MenuRow icon={<IconLinkedIn />} label="Share on LinkedIn" onClick={shareLinkedIn} />
          <MenuRow icon={<IconThreads />} label="Share on Threads" onClick={shareThreads} />
          <MenuRow icon={<IconX />} label="Share on X" onClick={shareX} />
        </div>
      )}
    </div>
  );
}
