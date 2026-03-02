// Force all /auth pages to be dynamic (not statically prerendered)
// so Supabase client isn't called at build time
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
