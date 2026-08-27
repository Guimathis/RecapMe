const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Erro ao realizar requisição';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.title || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}
