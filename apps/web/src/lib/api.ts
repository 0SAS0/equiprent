const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://equiprent.me:3001";

export async function apiFetch<T>(
	endpoint: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		credentials: "include", // ← kluczowe dla sesji
		headers: {
			"Content-Type": "application/json",
			Origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://equiprent.me:3000",
			...options?.headers,
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message ?? "API Error");
	}

	return response.json();
}
