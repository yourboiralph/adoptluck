import prisma from "@/lib/prisma";
import AssignUserPet from "./assign-user-pet";


export default async function AdminHomePage() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const pets = await prisma.pet_types.findMany({
    select: { id: true, name: true, variant: true, image: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Assign Pet to User</h1>
      <AssignUserPet users={users} pets={pets} />
    </div>
  );
}
