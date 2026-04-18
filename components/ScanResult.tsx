import type { ScanDTO } from "@/types";
import SeverityBadge from "./SeverityBadge";

const URGENCY_LABEL: Record<string, string> = {
  routine: "Routine — keep an eye on it",
  soon: "See a vet soon",
  urgent: "See a vet urgently",
};

export default function ScanResult({ scan }: { scan: ScanDTO }) {
  const { aiResult, imageUrl, scanType } = scan;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Scan"
          className="max-h-72 w-full object-cover"
        />
      )}
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={aiResult.severity} />
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {scanType}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">{aiResult.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {aiResult.summary}
          </p>
        </div>

        {aiResult.concerns.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              What I noticed
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
              {aiResult.concerns.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-severity-yellow">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {aiResult.recommendations.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recommendations
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
              {aiResult.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-brand">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {aiResult.shouldSeeVet && (
          <div className="rounded-xl border border-severity-red/30 bg-severity-red/5 p-3 text-sm">
            <div className="font-semibold text-severity-red">
              🩺 {URGENCY_LABEL[aiResult.urgency] ?? "Vet visit recommended"}
            </div>
          </div>
        )}

        <p className="border-t border-black/5 pt-3 text-xs text-gray-400">
          PupCheck AI is a screening assistant, not a replacement for your
          veterinarian.
        </p>
      </div>
    </div>
  );
}
