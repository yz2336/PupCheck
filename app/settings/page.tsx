"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import ImageUploader from "@/components/ImageUploader";
import { COMMON_BREEDS, type DogDTO } from "@/types";

export default function SettingsPage() {
  const { data: session, update } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    photo: null as string | null,
  });
  const [addingDog, setAddingDog] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  useEffect(() => {
    fetch("/api/dogs")
      .then((r) => r.json())
      .then((data: DogDTO[]) => {
        if (Array.isArray(data)) setDogs(data);
      });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPw || undefined,
          newPassword: newPw || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Update failed.");
        return;
      }
      toast.success("Profile updated.");
      setCurrentPw("");
      setNewPw("");
      await update({ name: data.name, email: data.email });
    } finally {
      setSavingProfile(false);
    }
  }

  async function addDog(e: React.FormEvent) {
    e.preventDefault();
    if (!newDog.name || !newDog.breed || !newDog.age || !newDog.weight) {
      toast.error("Please fill in all fields.");
      return;
    }
    setAddingDog(true);
    try {
      const res = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDog.name,
          breed: newDog.breed,
          age: Number(newDog.age),
          weight: Number(newDog.weight),
          photoDataUrl: newDog.photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add dog.");
        return;
      }
      setDogs((prev) => [...prev, data]);
      setNewDog({ name: "", breed: "", age: "", weight: "", photo: null });
      toast.success(`${data.name} added!`);
    } finally {
      setAddingDog(false);
    }
  }

  async function deleteDog(id: string, dogName: string) {
    if (!confirm(`Delete ${dogName}? This also removes all scans and chats.`)) return;
    const res = await fetch(`/api/dogs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Delete failed.");
      return;
    }
    setDogs((prev) => prev.filter((d) => d.id !== id));
    toast.success(`${dogName} removed.`);
  }

  async function updateDog(id: string, patch: Partial<DogDTO>) {
    const res = await fetch(`/api/dogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Update failed.");
      return;
    }
    setDogs((prev) => prev.map((d) => (d.id === id ? data : d)));
    toast.success("Dog updated.");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Your profile
          </h2>
          <form onSubmit={saveProfile} className="card mt-2 space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                className="input mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <details className="rounded-xl border border-gray-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                Change password
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="label">Current password</label>
                  <input
                    type="password"
                    className="input mt-1"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">New password</label>
                  <input
                    type="password"
                    className="input mt-1"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                </div>
              </div>
            </details>

            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Your dogs ({dogs.length})
          </h2>
          <ul className="mt-2 space-y-3">
            {dogs.map((d) => (
              <DogRow
                key={d.id}
                dog={d}
                onSave={(patch) => updateDog(d.id, patch)}
                onDelete={() => deleteDog(d.id, d.name)}
              />
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Add another dog
          </h2>
          <form onSubmit={addDog} className="card mt-2 space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                className="input mt-1"
                value={newDog.name}
                onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Breed</label>
              <input
                list="settings-breeds"
                className="input mt-1"
                value={newDog.breed}
                onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
              />
              <datalist id="settings-breeds">
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
                  className="input mt-1"
                  value={newDog.age}
                  onChange={(e) => setNewDog({ ...newDog, age: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input mt-1"
                  value={newDog.weight}
                  onChange={(e) => setNewDog({ ...newDog, weight: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Photo (optional)</label>
              <div className="mt-1">
                <ImageUploader onChange={(url) => setNewDog((n) => ({ ...n, photo: url }))} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={addingDog}>
              {addingDog ? "Adding..." : "Add dog"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Your data
          </h2>
          <div className="card mt-2 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">Export</div>
                <div className="text-xs text-gray-500">
                  Download a full JSON copy of your profile, dogs, scans, and
                  chats.
                </div>
              </div>
              <a
                href="/api/export"
                download
                className="shrink-0 rounded-xl border border-brand/20 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
              >
                📥 Download JSON
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8 border-t border-black/5 pt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-secondary w-full"
          >
            Sign out
          </button>
        </section>
      </main>
    </>
  );
}

function DogRow({
  dog,
  onSave,
  onDelete,
}: {
  dog: DogDTO;
  onSave: (patch: { name?: string; breed?: string; age?: number; weight?: number }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: dog.name,
    breed: dog.breed,
    age: String(dog.age),
    weight: String(dog.weight),
  });
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function createShare() {
    const res = await fetch(`/api/dogs/${dog.id}/share`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create link.");
      return;
    }
    const url = `${window.location.origin}/share/${data.shareSlug}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard.");
    } catch {
      toast.success("Share link ready.");
    }
  }

  async function revokeShare() {
    if (!confirm("Revoke the share link? Anyone using it will lose access.")) return;
    const res = await fetch(`/api/dogs/${dog.id}/share`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to revoke link.");
      return;
    }
    setShareUrl(null);
    toast.success("Link revoked.");
  }

  if (!editing) {
    return (
      <li className="card space-y-2">
        <div className="flex items-center gap-3">
          {dog.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dog.photoUrl} alt={dog.name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
              {dog.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-gray-900">{dog.name}</div>
            <div className="truncate text-xs text-gray-500">
              {dog.breed} · {dog.age} yrs · {dog.weight} lbs
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5"
          >
            Edit
          </button>
          <button
            onClick={createShare}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            Share
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-severity-red hover:bg-severity-red/5"
          >
            Delete
          </button>
        </div>
        {shareUrl && (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs">
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Copied.");
              }}
              className="rounded-lg bg-brand px-2 py-1 font-semibold text-white"
            >
              Copy
            </button>
            <button
              onClick={revokeShare}
              className="rounded-lg px-2 py-1 font-semibold text-severity-red"
            >
              Revoke
            </button>
          </div>
        )}
      </li>
    );
  }

  return (
    <li className="card space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input
            className="input mt-1"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Breed</label>
          <input
            list="settings-breeds"
            className="input mt-1"
            value={draft.breed}
            onChange={(e) => setDraft({ ...draft, breed: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            step="0.1"
            className="input mt-1"
            value={draft.age}
            onChange={(e) => setDraft({ ...draft, age: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Weight</label>
          <input
            type="number"
            step="0.1"
            className="input mt-1"
            value={draft.weight}
            onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            onSave({
              name: draft.name,
              breed: draft.breed,
              age: Number(draft.age),
              weight: Number(draft.weight),
            });
            setEditing(false);
          }}
          className="btn-primary"
        >
          Save
        </button>
        <button onClick={() => setEditing(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </li>
  );
}
