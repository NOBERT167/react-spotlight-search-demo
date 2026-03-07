import type { ApiRow } from "@/types";
import { InlineCode } from "@/components/InlineCode";

export function ApiTable({ rows }: { rows: ApiRow[] }) {
  return (
    <div className="rounded-xl border border-white/[0.07] overflow-hidden">
      <table className="w-full border-collapse font-mono text-[13px]">
        <thead>
          <tr className="bg-white/[0.03]">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-slate-500 font-semibold text-[11px] uppercase tracking-[.06em] border-b border-white/[0.06]"
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
              className={
                i < rows.length - 1 ? "border-b border-white/[0.04]" : ""
              }
            >
              <td className="px-4 py-3">
                <InlineCode>{r.prop}</InlineCode>
              </td>
              <td className="px-4 py-3 text-violet-400">{r.type}</td>
              <td className="px-4 py-3 text-slate-500">{r.default ?? "—"}</td>
              <td className="px-4 py-3 text-slate-400 font-sans">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
