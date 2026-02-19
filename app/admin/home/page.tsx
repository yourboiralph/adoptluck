import prisma from "@/lib/prisma";
import AssignUserPet from "./assign-user-pet";
import { auth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/auth-actions";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";


export default async function AdminHomePage() {


  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  if(session?.user.role !== "Admin" && session?.user.role !== "Owner"){
    redirect("/")
  }

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
