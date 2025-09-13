export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-200">BookVerse</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <nav aria-label="Footer navigation" className="flex gap-4">
          <a href="#" className="hover:text-sky-600">About</a>
          <a href="#" className="hover:text-sky-600">Terms</a>
          <a href="#" className="hover:text-sky-600">Privacy</a>
        </nav>
      </div>
    </footer>
  );
}
