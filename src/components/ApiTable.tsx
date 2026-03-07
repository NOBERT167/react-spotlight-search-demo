import type { ApiRow } from "@/types";
import { InlineCode } from "@/components/InlineCode";

export function ApiTable({ rows }: { rows: ApiRow[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full border-collapse font-mono text-[13px]">
        <thead>
          <tr className="bg-muted/30">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-muted-foreground font-semibold text-[11px] uppercase tracking-[.06em] border-b border-border"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={i < rows.length - 1 ? "border-b border-border" : ""}
            >
              <td className="px-4 py-3">
                <InlineCode>{r.prop}</InlineCode>
              </td>
              <td className="px-4 py-3 text-violet-600 dark:text-violet-400">
                {r.type}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {r.default ?? "—"}
              </td>
              <td className="px-4 py-3 text-foreground/70 font-sans">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
