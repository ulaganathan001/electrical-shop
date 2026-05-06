const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getProducts: () => request<Product[]>("/products"),
  createProduct: (data: { name: string; buy_price: number; sell_price: number }) =>
    request<{ id: string }>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: { name: string; buy_price: number; sell_price: number }) =>
    request<{ success: boolean }>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/products/${id}`, { method: "DELETE" }),

  getStockEntries: (year?: number) =>
    request<StockEntry[]>(year ? `/stock?year=${year}` : "/stock"),
  getStockYears: () => request<number[]>("/stock/years"),
  createStockEntry: (data: { product_id: string; quantity: number; buy_price: number; year: number }) =>
    request<{ id: string }>("/stock", { method: "POST", body: JSON.stringify(data) }),
  deleteStockEntry: (id: string) =>
    request<{ success: boolean }>(`/stock/${id}`, { method: "DELETE" }),
};

export interface Product {
  id: string;
  name: string;
  buy_price: number;
  sell_price: number;
  created_at: string;
}

export interface StockEntry {
  id: string;
  product_id: string;
  quantity: number;
  buy_price: number;
  year: number;
  created_at: string;
  product_name: string;
}
