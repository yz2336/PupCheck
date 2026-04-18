import type { DogDTO } from "@/types";

export default function DogProfileCard({ dog }: { dog: DogDTO }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      {dog.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dog.photoUrl}
          alt={dog.name}
          className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-brand/20"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl font-bold text-brand ring-2 ring-brand/20">
          {dog.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-bold text-gray-900">{dog.name}</h2>
        <p className="truncate text-sm text-gray-600">{dog.breed}</p>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="rounded-full bg-cream px-2 py-0.5 font-medium text-gray-700">
            {dog.age} {dog.age === 1 ? "yr" : "yrs"}
          </span>
          <span className="rounded-full bg-cream px-2 py-0.5 font-medium text-gray-700">
            {dog.weight} lbs
          </span>
        </div>
      </div>
    </div>
  );
}
