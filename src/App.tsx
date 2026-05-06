import { useState } from 'react';
import ProductDetails from './components/ProductDetails';
import YearWiseStock from './components/YearWiseStock';
import { Package, Warehouse, Zap } from 'lucide-react';

type Tab = 'products' | 'stock';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">ElectroShop</h1>
                <p className="text-[11px] text-slate-400 leading-tight">Inventory Manager</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveTab('products')}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Package size={17} />
              Product Details
              {activeTab === 'products' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'stock'
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Warehouse size={17} />
              Year-wise Stock
              {activeTab === 'stock' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' ? <ProductDetails /> : <YearWiseStock />}
      </main>
    </div>
  );
}
