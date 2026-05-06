import { useState, useEffect, useCallback } from 'react';
import { api, type Product, type StockEntry } from '../lib/api';
import { Plus, X, Check, Warehouse, ChevronDown } from 'lucide-react';

interface StockEntryWithTotal extends StockEntry {
  total: number;
}

export default function YearWiseStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<StockEntryWithTotal[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ product_id: '', quantity: '', buy_price: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStockEntries(selectedYear);
      const mapped: StockEntryWithTotal[] = data.map(e => ({
        ...e,
        total: e.quantity * Number(e.buy_price),
      }));
      setEntries(mapped);
    } catch (err) {
      console.error('Failed to fetch stock entries:', err);
    }
    setLoading(false);
  }, [selectedYear]);

  const fetchYears = useCallback(async () => {
    try {
      const years = await api.getStockYears();
      if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());
      setAvailableYears(years);
    } catch (err) {
      console.error('Failed to fetch years:', err);
      setAvailableYears([new Date().getFullYear()]);
    }
  }, []);

  useEffect(() => { fetchProducts(); fetchYears(); }, [fetchProducts, fetchYears]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function handleAdd() {
    if (!addForm.product_id || !addForm.quantity) return;
    setSaving(true);
    try {
      await api.createStockEntry({
        product_id: addForm.product_id,
        quantity: parseInt(addForm.quantity) || 0,
        buy_price: parseFloat(addForm.buy_price) || 0,
        year: selectedYear,
      });
      setAddForm({ product_id: '', quantity: '', buy_price: '' });
      setShowAdd(false);
      fetchEntries();
      fetchYears();
    } catch (err) {
      console.error('Failed to add stock entry:', err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteStockEntry(id);
      fetchEntries();
      fetchYears();
    } catch (err) {
      console.error('Failed to delete stock entry:', err);
    }
  }

  const formatPrice = (n: number) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const totalQuantity = entries.reduce((s, e) => s + e.quantity, 0);
  const totalValue = entries.reduce((s, e) => s + e.total, 0);

  const yearOptions = availableYears.length > 0
    ? availableYears
    : [new Date().getFullYear()];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Year-wise Stock</h2>
          <p className="text-slate-500 text-sm mt-1">Track inventory batches by year</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer transition-all"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-sm shadow-emerald-200"
          >
            <Plus size={18} /> Add Stock
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Stock Entry — {selectedYear}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Product</label>
              <select
                value={addForm.product_id}
                onChange={e => {
                  const p = products.find(pr => pr.id === e.target.value);
                  setAddForm(f => ({ ...f, product_id: e.target.value, buy_price: p ? String(p.buy_price) : f.buy_price }));
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Quantity</label>
              <input
                type="number"
                value={addForm.quantity}
                onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Buy Price per Unit (₹)</label>
              <input
                type="number"
                step="0.01"
                value={addForm.buy_price}
                onChange={e => setAddForm(f => ({ ...f, buy_price: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>
          {addForm.quantity && addForm.buy_price && (
            <p className="mt-3 text-sm text-slate-500">
              Total: <span className="font-semibold text-slate-800">{formatPrice(parseInt(addForm.quantity) * parseFloat(addForm.buy_price))}</span>
            </p>
          )}
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => { setShowAdd(false); setAddForm({ product_id: '', quantity: '', buy_price: '' }); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !addForm.product_id || !addForm.quantity} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Warehouse size={48} strokeWidth={1.5} className="mb-3" />
            <p className="text-lg font-medium">No stock entries for {selectedYear}</p>
            <p className="text-sm mt-1">Add stock entries to track inventory for this year</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Buy Price / Unit</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{e.product_name}</td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm">{e.quantity}</td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm">{formatPrice(e.buy_price)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800 font-mono text-sm">{formatPrice(e.total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td className="px-6 py-4 font-bold text-slate-800">Total</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 font-mono">{totalQuantity}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-700 font-mono text-sm">{formatPrice(totalValue)}</td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Entries</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{entries.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Quantity</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalQuantity.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Stock Value</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatPrice(totalValue)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
