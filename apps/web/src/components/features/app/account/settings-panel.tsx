import type { ReactNode } from "react";

export function SettingsPanel({
  children,
  title,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h2 className="mb-5 font-semibold text-lg tracking-tight">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
