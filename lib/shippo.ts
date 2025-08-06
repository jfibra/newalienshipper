// Shippo address validation utility

// Client-side: call our own API route for address validation
export async function validateAddress(address: any) {
  const response = await fetch("/api/validate-address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to validate address");
  }
  return response.json();
}
