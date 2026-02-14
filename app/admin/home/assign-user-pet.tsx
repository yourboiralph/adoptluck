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
  const [selectedPet, setSelectedPet] = useState<PetType | null>(null);

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

  async function assign() {
    setMsg(null);

    if (!selectedUser?.id) return setMsg("Select a user first.");
    if (!selectedPet?.id) return setMsg("Select a pet first.");

    setLoading(true);
    try {
      const res = await fetch("/api/pets/addpetstouser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          petTypeId: selectedPet.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.message ?? "Failed to assign pet.");
        return;
      }

      setMsg(`✅ Assigned ${selectedPet.name} to ${selectedUser.email ?? selectedUser.username ?? selectedUser.id}`);
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
          <CardTitle>Select Pet</CardTitle>
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
                const active = selectedPet?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPet(p)}
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

          {selectedPet && (
            <div className="text-sm">
              <span className="text-muted-foreground">Selected:</span>{" "}
              <span className="font-medium">
                {selectedPet.name} {selectedPet.variant ? `(${selectedPet.variant})` : ""}
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <Button onClick={assign} disabled={loading}>
              {loading ? "Assigning..." : "Assign Pet"}
            </Button>
            {msg ? <div className="text-sm">{msg}</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
