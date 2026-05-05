import NavbarPro from "./NavbarPro";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F6F7FB] text-gray-900">
      {/* background premium (discret) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-[90px]" />
        <div className="absolute top-40 right-0 h-[520px] w-[520px] rounded-full bg-teal-300/15 blur-[90px]" />
      </div>

      <NavbarPro />

      <main className="relative mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
