"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";
import { COMMON_BREEDS } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !breed || !age || !weight) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          breed,
          age: Number(age),
          weight: Number(weight),
          photoDataUrl: photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save.");
        return;
      }
      toast.success(`${name} is all set! 🐾`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Step 1 of 1
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Tell us about your pup! 🐶
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We&rsquo;ll use this to personalize every scan and chat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Dog&rsquo;s name</label>
            <input
              type="text"
              required
              className="input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bailey"
            />
          </div>

          <div>
            <label className="label">Breed</label>
            <input
              list="breeds-list"
              required
              className="input mt-1"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Start typing..."
            />
            <datalist id="breeds-list">
              {COMMON_BREEDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Age (years)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                className="input mt-1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="3.5"
              />
            </div>
            <div>
              <label className="label">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                className="input mt-1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="45"
              />
            </div>
          </div>

          <div>
            <label className="label">Profile photo (optional)</label>
            <div className="mt-1">
              <ImageUploader
                onChange={setPhoto}
                label="Add a cute pic"
                hint="Tap to upload or take a photo"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Saving..." : "Add my dog 🐾"}
          </button>
        </form>
      </div>
    </main>
  );
}
