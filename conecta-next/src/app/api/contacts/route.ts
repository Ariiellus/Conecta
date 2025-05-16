import { NextResponse } from "next/server";

let contacts = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St",
    notes: "Friend from college",
    favorite: false,
  },
  // Add more mock contacts as needed
];

export async function GET() {
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const newContact = await request.json();
  newContact.id = contacts.length + 1;
  contacts.push(newContact);
  return NextResponse.json(newContact);
}

export async function PUT(request: Request) {
  const updatedContact = await request.json();
  const index = contacts.findIndex((c) => c.id === updatedContact.id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updatedContact };
    return NextResponse.json(contacts[index]);
  }
  return NextResponse.json({ error: "Contact not found" }, { status: 404 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  contacts = contacts.filter((c) => c.id !== id);
  return NextResponse.json({ success: true });
} 