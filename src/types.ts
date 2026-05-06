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
  products?: { name: string };
}

export interface StockEntryWithProduct extends StockEntry {
  product_name: string;
  total: number;
}
