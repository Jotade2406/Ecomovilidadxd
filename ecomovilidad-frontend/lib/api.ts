// ─── Cliente HTTP centralizado con Authorization automática ────────
// Todas las llamadas al backend DEBEN pasar por aquí para garantizar
// que el header Authorization: Bearer <token> se adjunte siempre.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5034';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function clearAuthAndRedirect(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  window.location.href = '/login';
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 → si había token guardado es sesión expirada → redirigir
    //       si no había token es fallo de login → devolver error del servidor
    if (response.status === 401) {
      if (getToken()) {
        clearAuthAndRedirect();
        return { data: null, error: 'Sesión expirada', status: 401 };
      }
      const errData = await response.json().catch(() => null);
      const errorMessage = errData?.message || errData?.title || 'Credenciales incorrectas';
      return { data: null, error: errorMessage, status: 401 };
    }

    // 204 No Content (ej: DELETE exitoso)
    if (response.status === 204) {
      return { data: null, error: null, status: 204 };
    }

    // Intentar parsear JSON
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message || data?.title || `Error HTTP ${response.status}`;
      return { data: null, error: errorMessage, status: response.status };
    }

    return { data: data as T, error: null, status: response.status };
  } catch {
    return { data: null, error: 'Error de conexión con el servidor', status: 0 };
  }
}

export const api = {
  get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};
