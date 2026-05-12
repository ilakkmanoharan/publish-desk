"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";

const MENU_W = 240;
const GAP = 10;
const VIEWPORT_PAD = 12;
const MD_BREAK = 768;

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
        stroke="currentColor"
        strokeWidth="1.75"
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

function computeDesktopPopoverPosition(
  trigger: DOMRect,
  menuWidth: number,
  menuHeight: number
): { top: number; left: number } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // Prefer opening to the left of the trigger (inward from the right rail) so the panel stays off the title column.
  let left = trigger.left - GAP - menuWidth;
  if (left < VIEWPORT_PAD) {
    left = trigger.right + GAP;
  }
  if (left + menuWidth > vw - VIEWPORT_PAD) {
    left = Math.max(VIEWPORT_PAD, vw - VIEWPORT_PAD - menuWidth);
  }

  let top = trigger.top + trigger.height / 2 - menuHeight / 2;
  if (top < VIEWPORT_PAD) top = VIEWPORT_PAD;
  if (top + menuHeight > vh - VIEWPORT_PAD) {
    top = Math.max(VIEWPORT_PAD, vh - VIEWPORT_PAD - menuHeight);
  }

  return { top, left };
}

function IconBluesky() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-[#7A7268]">
      <path
        fill="currentColor"
        d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.22-4.294 1.098-6.499-2.816-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-[#7A7268]">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-[#7A7268]">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function IconThreads() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden className="text-[#7A7268]">
      <path
        fill="currentColor"
        d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.087 3.509 5.345.447 1.615.622 3.375.622 5.557v1.178c-.024 2.182-.199 3.942-.646 5.557-.651 2.258-1.832 4.055-3.509 5.345-1.783 1.373-4.08 2.078-6.826 2.098zm-.014-2.296c2.929-.02 5.313-.82 7.23-2.298 1.378-1.06 2.35-2.54 2.92-4.4.39-1.41.55-2.98.573-4.92V12.01c-.023-1.94-.183-3.51-.573-4.92-.57-1.86-1.542-3.34-2.92-4.4-1.917-1.478-4.301-2.278-7.23-2.298-3.035.022-5.4.84-7.28 2.298-1.378 1.06-2.35 2.54-2.92 4.4-.39 1.41-.55 2.98-.573 4.92v1.178c.023 1.94.183 3.51.573 4.92.57 1.86 1.542 3.34 2.92 4.4 1.88 1.458 4.245 2.276 7.28 2.298z"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden className="text-[#7A7268]">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function IconPdf() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#7A7268]">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15h6M9 11h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type MenuRowProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  refEl: (el: HTMLButtonElement | null) => void;
};

function MenuRow({ icon, label, onClick, onKeyDown, refEl }: MenuRowProps) {
  return (
    <button
      type="button"
      ref={refEl}
      role="menuitem"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="article-share-menu__item flex min-h-[44px] w-full items-center gap-3 rounded-[10px] px-[14px] py-2.5 text-left font-sans text-[13px] font-medium leading-snug tracking-[0.01em] text-[#3D3830] transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[#F4EFE6] focus-visible:bg-[#F4EFE6] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#B8956A]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FEFDFB]"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

type Props = {
  title: string;
};

export function ArticleShareMenu({ title }: Props) {
  const menuId = useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const search = searchParams.toString();
  const pageUrl = origin ? buildShareUrl(origin, pathname, search) : "";
  const encodedUrl = pageUrl ? encodeURIComponent(pageUrl) : "";
  const textForSocial = `${title}${pageUrl ? ` ${pageUrl}` : ""}`;
  const encodedText = encodeURIComponent(textForSocial);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_BREAK - 1}px)`);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const repositionDesktop = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = desktopPanelRef.current;
    if (!trigger || isMobile) return;
    const tr = trigger.getBoundingClientRect();
    const h = panel?.offsetHeight ?? 300;
    setPopoverPos(computeDesktopPopoverPosition(tr, MENU_W, h));
  }, [isMobile]);

  useLayoutEffect(() => {
    if (!open || isMobile) {
      setPopoverPos(null);
      return;
    }
    repositionDesktop();
    const id = window.requestAnimationFrame(repositionDesktop);
    return () => window.cancelAnimationFrame(id);
  }, [open, isMobile, repositionDesktop, copied]);

  useEffect(() => {
    if (!open) return;
    function onScrollResize() {
      if (isMobile) return;
      repositionDesktop();
    }
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open, isMobile, repositionDesktop]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (desktopPanelRef.current?.contains(t)) return;
      if (mobilePanelRef.current?.contains(t)) return;
      close();
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

  useEffect(() => {
    if (!open) return;
    if (!isMobile && !popoverPos) return;
    const id = window.requestAnimationFrame(() => {
      itemRefs.current[0]?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, isMobile, popoverPos]);

  const itemCount = 7;

  const onMenuKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (index + 1) % itemCount;
        itemRefs.current[next]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (index - 1 + itemCount) % itemCount;
        itemRefs.current[prev]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        itemRefs.current[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        itemRefs.current[itemCount - 1]?.focus();
      }
    },
    [itemCount]
  );

  const setItemRef = (i: number) => (el: HTMLButtonElement | null) => {
    itemRefs.current[i] = el;
  };

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

  const [pdfGenerating, setPdfGenerating] = useState(false);

  const generatePdf = useCallback(() => {
    setPdfGenerating(true);
    close();
    requestAnimationFrame(() => {
      window.print();
      setPdfGenerating(false);
    });
  }, [close]);

  const menuSurfaceClass =
    "rounded-2xl border border-[rgba(92,78,62,0.14)] bg-[#FEFDFB] p-2 shadow-[0_12px_40px_-8px_rgba(45,38,30,0.18),0_4px_14px_-4px_rgba(45,38,30,0.1)]";

  const desktopPopover =
    open &&
    !isMobile &&
    mounted &&
    createPortal(
      <div
        ref={desktopPanelRef}
        id={menuId}
        role="menu"
        aria-label="Share article"
        style={{
          position: "fixed",
          top: popoverPos?.top ?? 0,
          left: popoverPos?.left ?? 0,
          width: MENU_W,
          zIndex: 10050,
          opacity: popoverPos ? 1 : 0,
          pointerEvents: popoverPos ? "auto" : "none",
        }}
        className={`${menuSurfaceClass}${popoverPos ? " article-share-popover-enter" : ""}`}
      >
        <MenuRow
          refEl={setItemRef(0)}
          icon={<IconLink />}
          label={copied ? "Copied!" : "Copy link"}
          onClick={() => void copyLink()}
          onKeyDown={onMenuKeyDown(0)}
        />
        <div className="mx-2 my-1.5 h-px bg-[rgba(92,78,62,0.1)]" role="separator" />
        <MenuRow
          refEl={setItemRef(1)}
          icon={<IconBluesky />}
          label="Share on Bluesky"
          onClick={shareBluesky}
          onKeyDown={onMenuKeyDown(1)}
        />
        <MenuRow
          refEl={setItemRef(2)}
          icon={<IconFacebook />}
          label="Share on Facebook"
          onClick={shareFacebook}
          onKeyDown={onMenuKeyDown(2)}
        />
        <MenuRow
          refEl={setItemRef(3)}
          icon={<IconLinkedIn />}
          label="Share on LinkedIn"
          onClick={shareLinkedIn}
          onKeyDown={onMenuKeyDown(3)}
        />
        <MenuRow
          refEl={setItemRef(4)}
          icon={<IconThreads />}
          label="Share on Threads"
          onClick={shareThreads}
          onKeyDown={onMenuKeyDown(4)}
        />
        <MenuRow
          refEl={setItemRef(5)}
          icon={<IconX />}
          label="Share on X"
          onClick={shareX}
          onKeyDown={onMenuKeyDown(5)}
        />
        <div className="mx-2 my-1.5 h-px bg-[rgba(92,78,62,0.1)]" role="separator" />
        <MenuRow
          refEl={setItemRef(6)}
          icon={<IconPdf />}
          label={pdfGenerating ? "Generating PDF…" : "Generate PDF"}
          onClick={generatePdf}
          onKeyDown={onMenuKeyDown(6)}
        />
      </div>,
      document.body
    );

  const mobileSheet =
    open &&
    isMobile &&
    mounted &&
    createPortal(
      <>
        <button
          type="button"
          aria-label="Close share menu"
          className="article-share-backdrop-enter fixed inset-0 z-[10040] bg-[rgba(45,38,30,0.35)] backdrop-blur-[2px]"
          onClick={close}
        />
        <div
          ref={mobilePanelRef}
          id={menuId}
          role="menu"
          aria-label="Share article"
          className={`article-share-sheet-enter fixed inset-x-0 bottom-0 z-[10050] max-h-[min(78vh,520px)] overflow-y-auto rounded-t-2xl ${menuSurfaceClass} px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3`}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgba(92,78,62,0.2)]" aria-hidden />
          <MenuRow
            refEl={setItemRef(0)}
            icon={<IconLink />}
            label={copied ? "Copied!" : "Copy link"}
            onClick={() => void copyLink()}
            onKeyDown={onMenuKeyDown(0)}
          />
          <div className="mx-2 my-1.5 h-px bg-[rgba(92,78,62,0.1)]" role="separator" />
          <MenuRow
            refEl={setItemRef(1)}
            icon={<IconBluesky />}
            label="Share on Bluesky"
            onClick={shareBluesky}
            onKeyDown={onMenuKeyDown(1)}
          />
          <MenuRow
            refEl={setItemRef(2)}
            icon={<IconFacebook />}
            label="Share on Facebook"
            onClick={shareFacebook}
            onKeyDown={onMenuKeyDown(2)}
          />
          <MenuRow
            refEl={setItemRef(3)}
            icon={<IconLinkedIn />}
            label="Share on LinkedIn"
            onClick={shareLinkedIn}
            onKeyDown={onMenuKeyDown(3)}
          />
          <MenuRow
            refEl={setItemRef(4)}
            icon={<IconThreads />}
            label="Share on Threads"
            onClick={shareThreads}
            onKeyDown={onMenuKeyDown(4)}
          />
          <MenuRow
            refEl={setItemRef(5)}
            icon={<IconX />}
            label="Share on X"
            onClick={shareX}
            onKeyDown={onMenuKeyDown(5)}
          />
          <div className="mx-2 my-1.5 h-px bg-[rgba(92,78,62,0.1)]" role="separator" />
          <MenuRow
            refEl={setItemRef(6)}
            icon={<IconPdf />}
            label={pdfGenerating ? "Generating PDF…" : "Generate PDF"}
            onClick={generatePdf}
            onKeyDown={onMenuKeyDown(6)}
          />
        </div>
      </>,
      document.body
    );

  return (
    <div ref={wrapRef} className="relative inline-flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        className="article-share-trigger group inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-[#C9B8A4] bg-[#FDFBF7] px-[14px] font-sans text-[13px] font-medium tracking-wide text-[#5C5248] shadow-[0_2px_8px_-2px_rgba(45,38,30,0.12),0_1px_2px_rgba(45,38,30,0.06)] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:border-[#A89885] hover:bg-[#FAF6F0] hover:shadow-[0_6px_20px_-4px_rgba(45,38,30,0.14),0_2px_6px_rgba(45,38,30,0.08)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#B8956A]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] lg:px-4"
        aria-label="Share article"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <IconShare className="shrink-0 text-[#6B6258] transition-colors duration-200 group-hover:text-[#3D3830]" aria-hidden />
        <span className="hidden lg:inline" aria-hidden>
          Share
        </span>
      </button>

      {desktopPopover}
      {mobileSheet}
    </div>
  );
}
