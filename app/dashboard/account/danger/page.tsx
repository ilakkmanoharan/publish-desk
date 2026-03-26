export default function AccountDangerPage() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="border-b border-[#E2E8F0] px-6 py-5 sm:px-8">
        <h1 className="font-sans text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">Delete your account</h1>
        <p className="mt-1.5 font-sans text-sm text-[#64748B]">Delete your account permanently.</p>
      </div>
      <div className="px-6 py-6 sm:px-8">
        <p className="font-sans text-sm font-semibold text-[#DC2626]">Warning</p>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[#64748B]">
          Deleting your account would permanently remove your access to Publish Desk and archive associated data.
          Account deletion is not enabled yet; this section shows the intended layout.
        </p>
        <button
          type="button"
          disabled
          className="mt-6 rounded-lg bg-[#EF4444] px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete my account
        </button>
      </div>
    </div>
  );
}
