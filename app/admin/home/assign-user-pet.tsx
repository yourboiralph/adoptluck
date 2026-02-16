"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type User = {
  id: string;
  email?: string | null;
  username?: string | null;
  name?: string | null;
};

type PetType = {
  id: string;
  name: string;
  variant?: string | null;
  image?: string | null;
};

export default function AssignUserPet({
  users,
  pets,
}: {
  users: User[];
  pets: PetType[];
}) {
  const [userQuery, setUserQuery] = useState("");
  const [petQuery, setPetQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // multi-select pets
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  // how many duplicates to add for each selected pet id
  const [petQtyById, setPetQtyById] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users.slice(0, 12);
    return users
      .filter((u) => {
        const hay = `${u.email ?? ""} ${u.username ?? ""} ${u.name ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 20);
  }, [users, userQuery]);

  const filteredPets = useMemo(() => {
    const q = petQuery.trim().toLowerCase();
    if (!q) return pets.slice(0, 12);
    return pets
      .filter((p) => {
        const hay = `${p.name} ${p.variant ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 30);
  }, [pets, petQuery]);

  const selectedPets = useMemo(() => {
    const set = new Set(selectedPetIds);
    return pets.filter((p) => set.has(p.id));
  }, [pets, selectedPetIds]);

  function togglePet(petId: string) {
    setSelectedPetIds((prev) => {
      const exists = prev.includes(petId);
      const next = exists ? prev.filter((id) => id !== petId) : [...prev, petId];

      // set default qty = 1 on first select
      if (!exists) {
        setPetQtyById((q) => ({ ...q, [petId]: q[petId] ?? 1 }));
      }

      return next;
    });
  }

  function setQty(petId: string, qty: number) {
    const safe = Number.isFinite(qty) ? Math.max(1, Math.min(999, qty)) : 1;
    setPetQtyById((prev) => ({ ...prev, [petId]: safe }));
  }

  async function assign() {
    setMsg(null);

    if (!selectedUser?.id) return setMsg("Select a user first.");
    if (selectedPetIds.length === 0) return setMsg("Select at least 1 pet.");

    // Expand duplicates using qty (allows duplicates intentionally)
    const petTypeIds: string[] = [];
    for (const petId of selectedPetIds) {
      const qty = petQtyById[petId] ?? 1;
      for (let i = 0; i < qty; i++) petTypeIds.push(petId);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pets/addpetstouser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          petTypeIds, // ✅ matches the bulk API
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.message ?? "Failed to assign pets.");
        return;
      }

      const label = selectedUser.email ?? selectedUser.username ?? selectedUser.id;
      setMsg(`✅ Assigned ${petTypeIds.length} pet(s) to ${label}`);

      // optional reset after success
      setSelectedPetIds([]);
      setPetQtyById({});
      // keep selectedUser selected (usually nice for admins)
    } catch (e) {
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* USERS */}
      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search by email / username / name..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />

          <div className="border rounded-md max-h-72 overflow-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No users found.</div>
            ) : (
              filteredUsers.map((u) => {
                const active = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-accent ${
                      active ? "bg-accent" : ""
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {u.username ?? u.name ?? "User"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u.email ?? u.id}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {selectedUser && (
            <div className="text-sm">
              <span className="text-muted-foreground">Selected:</span>{" "}
              <span className="font-medium">
                {selectedUser.email ?? selectedUser.username ?? selectedUser.id}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PETS */}
      <Card>
        <CardHeader>
          <CardTitle>Select Pet(s)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search pet name / variant..."
            value={petQuery}
            onChange={(e) => setPetQuery(e.target.value)}
          />

          <div className="border rounded-md max-h-72 overflow-auto">
            {filteredPets.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No pets found.</div>
            ) : (
              filteredPets.map((p) => {
                const active = selectedPetIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePet(p.id)}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-accent ${
                      active ? "bg-accent" : ""
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {p.name}{" "}
                      {p.variant ? (
                        <span className="text-xs text-muted-foreground">
                          ({p.variant})
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected list + qty */}
          {selectedPets.length > 0 ? (
            <div className="space-y-2 border rounded-md p-3">
              <div className="text-sm font-medium">Selected pets</div>
              <div className="space-y-2">
                {selectedPets.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <div className="text-sm">
                      {p.name} {p.variant ? `(${p.variant})` : ""}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">qty</span>
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        value={petQtyById[p.id] ?? 1}
                        onChange={(e) => setQty(p.id, Number(e.target.value))}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => togglePet(p.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="pt-2 flex items-center gap-3">
            <Button onClick={assign} disabled={loading}>
              {loading ? "Assigning..." : "Assign Pet(s)"}
            </Button>
            {msg ? <div className="text-sm">{msg}</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
