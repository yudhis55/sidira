import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TestFormPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all rooms for testing
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("name");

  if (error) {
    return <div>Error loading rooms: {error.message}</div>;
  }

  // Get all items for testing
  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select(`
      *,
      rooms(name)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  if (itemsError) {
    return <div>Error loading items: {itemsError.message}</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Test Form Inventory</h1>
        <p className="text-muted-foreground">
          Halaman ini untuk testing form inventory
        </p>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Rooms ({rooms?.length || 0})</h2>
          {rooms && rooms.length > 0 ? (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center gap-4 p-3 border rounded">
                  <span className="text-2xl">{room.icon}</span>
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No rooms found</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Items (Last 10)</h2>
          {items && items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Room: {item.rooms?.name} | Category: {item.category} | Condition: {item.condition}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} {item.unit} | Year: {item.year || '-'} | Merk: {item.merk || '-'} | Type: {item.type || '-'}
                      </p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      ID: {item.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No items found</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            {rooms && rooms.length > 0 && (
              <>
                <a
                  href={`/inventaris/${rooms[0].id}/items/new`}
                  className="block p-3 border rounded hover:bg-muted transition-colors"
                >
                  ➕ Add new item to "{rooms[0].name}"
                </a>
                <a
                  href={`/inventaris/${rooms[0].id}`}
                  className="block p-3 border rounded hover:bg-muted transition-colors"
                >
                  📋 View room "{rooms[0].name}"
                </a>
              </>
            )}
            <a
              href="/inventaris"
              className="block p-3 border rounded hover:bg-muted transition-colors"
            >
              ← Back to inventory list
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
