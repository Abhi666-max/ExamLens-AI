import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-zinc-100">ExamLens AI</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block">
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/login?mode=signup" className="text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-full transition-all">
              Sign up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
