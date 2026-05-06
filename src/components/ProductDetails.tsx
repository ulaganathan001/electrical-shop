import { useState, useEffect, useCallback } from 'react';
import { api, type Product } from '../lib/api';
import { Search, Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react';

export default function ProductDetails() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', buy_price: '', sell_price: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', buy_price: '', sell_price: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd() {
    if (!addForm.name.trim()) return;
    setSaving(true);
    try {
      await api.createProduct({
        name: addForm.name.trim(),
        buy_price: parseFloat(addForm.buy_price) || 0,
        sell_price: parseFloat(addForm.sell_price) || 0,
      });
      setAddForm({ name: '', buy_price: '', sell_price: '' });
      setShowAdd(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to add product:', err);
    }
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      await api.updateProduct(id, {
        name: editForm.name.trim(),
        buy_price: parseFloat(editForm.buy_price) || 0,
        sell_price: parseFloat(editForm.sell_price) || 0,
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to update product:', err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditForm({ name: p.name, buy_price: String(p.buy_price), sell_price: String(p.sell_price) });
  }

  const formatPrice = (n: number) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Product Details</h2>
          <p className="text-slate-500 text-sm mt-1">Manage buy & sell prices for all products</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-sm shadow-emerald-200"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Product Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="e.g. Wires, Switches"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Buy Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={addForm.buy_price}
                onChange={e => setAddForm(f => ({ ...f, buy_price: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Sell Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={addForm.sell_price}
                onChange={e => setAddForm(f => ({ ...f, sell_price: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => { setShowAdd(false); setAddForm({ name: '', buy_price: '', sell_price: '' }); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAdd} disabled={saving || !addForm.name.trim()} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all">
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Package size={48} strokeWidth={1.5} className="mb-3" />
            <p className="text-lg font-medium">{search ? 'No products found' : 'No products yet'}</p>
            <p className="text-sm mt-1">{search ? 'Try a different search term' : 'Add your first product to get started'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Buy Price</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sell Price</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Margin</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {editingId === p.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" autoFocus />
                        </td>
                        <td className="px-6 py-3">
                          <input type="number" step="0.01" value={editForm.buy_price} onChange={e => setEditForm(f => ({ ...f, buy_price: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                        </td>
                        <td className="px-6 py-3">
                          <input type="number" step="0.01" value={editForm.sell_price} onChange={e => setEditForm(f => ({ ...f, sell_price: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                        </td>
                        <td className="px-6 py-3 text-right text-slate-400">—</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleUpdate(p.id)} disabled={saving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Check size={16} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                        <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm">{formatPrice(p.buy_price)}</td>
                        <td className="px-6 py-4 text-right text-slate-800 font-semibold font-mono text-sm">{formatPrice(p.sell_price)}</td>
                        <td className="px-6 py-4 text-right">
                          {p.buy_price > 0 && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              ((p.sell_price - p.buy_price) / p.buy_price * 100) >= 20
                                ? 'bg-emerald-50 text-emerald-700'
                                : ((p.sell_price - p.buy_price) / p.buy_price * 100) >= 10
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {((p.sell_price - p.buy_price) / p.buy_price * 100).toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Pencil size={15} /></button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Products</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{filtered.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Buy Value</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatPrice(filtered.reduce((s, p) => s + p.buy_price, 0))}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Sell Value</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatPrice(filtered.reduce((s, p) => s + p.sell_price, 0))}</p>
          </div>
        </div>
      )}
    </div>
  );
}
