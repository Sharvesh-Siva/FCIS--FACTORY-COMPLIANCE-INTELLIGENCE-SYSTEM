import React, { useState } from 'react';
import { Cpu, Plus, Search, Filter, Layers, CheckCircle2, AlertTriangle, Calendar, Building, X } from 'lucide-react';
import { repo } from '../../services/storageRepository';
import { Product } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const ProductsModule: React.FC = () => {
  const state = repo.getState();
  const products = state.products;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New product form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState('Power Electronics');
  const [newStandard, setNewStandard] = useState('IS 13252 (Part 1):2010');
  const [newDesc, setNewDesc] = useState('');

  const filtered = products.filter(
    (p) =>
      p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.modelNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode && newName) {
      const created = repo.addProduct({
        productCode: newCode,
        productName: newName,
        modelNumber: newModel || `${newCode}-M01`,
        category: newCategory,
        description: newDesc || 'Manufactured commercial electronics assembly.',
        factoryId: state.organisation.factories[0].id,
        productionLine: state.organisation.factories[0].productionLines[0],
        applicableStandards: [newStandard],
        reviewStatus: 'Ready',
        recordOwner: repo.getActiveUser().name,
      });
      setSelectedProduct(created);
      setModalOpen(false);
      setNewCode('');
      setNewName('');
      setNewModel('');
      setNewDesc('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-700" />
            <h2 className="text-xl font-bold text-slate-900">Products & Product Models Register</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Electronics models registered under factory units with applicable standards and linked batches.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#0b2545] hover:bg-sky-900 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products by code (e.g. PA-12), model, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Products List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Registered Products ({filtered.length})
          </div>
          {filtered.map((prod) => {
            const isSelected = selectedProduct?.id === prod.id;
            const batchesCount = state.batches.filter((b) => b.productId === prod.id).length;
            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-[#0b2545]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200/80 px-1.5 py-0.5 rounded">
                      {prod.productCode}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{prod.productName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Model: {prod.modelNumber}</p>
                  </div>
                  <StatusBadge status={prod.reviewStatus} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Category: {prod.category}</span>
                  <span className="font-semibold text-slate-700">{batchesCount} Batches</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Product Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          {selectedProduct ? (
            <>
              <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b2545] text-white">
                      {selectedProduct.productCode}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {selectedProduct.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedProduct.productName}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedProduct.description}</p>
                </div>
                <StatusBadge status={selectedProduct.reviewStatus} />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Model Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedProduct.modelNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Product Category:</span>
                  <span className="font-semibold text-slate-900">{selectedProduct.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Production Line:</span>
                  <span className="text-slate-900">{selectedProduct.productionLine}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Record Owner:</span>
                  <span className="text-slate-900">{selectedProduct.recordOwner}</span>
                </div>
              </div>

              {/* Applicable Standards */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Applicable Standards & Mandates
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.applicableStandards.map((std) => (
                    <span
                      key={std}
                      className="px-2.5 py-1 rounded bg-sky-50 text-sky-900 border border-sky-300 text-xs font-mono font-medium"
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>

              {/* Linked Production Batches */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Linked Production Batches
                </h4>
                <div className="space-y-2">
                  {state.batches
                    .filter((b) => b.productId === selectedProduct.id)
                    .map((batch) => {
                      const tests = state.tests.filter((t) => t.batchId === batch.id);
                      return (
                        <div
                          key={batch.id}
                          className="p-3 rounded border border-slate-200 bg-white text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{batch.batchNumber}</span>
                              <StatusBadge status={batch.inspectionStatus} size="sm" />
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Mfg: {batch.manufacturingDate} • Lot Size: {batch.quantity.toLocaleString()} units
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-slate-600">{tests.length} Quality Tests</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select a product to view technical details and linked batches.
            </div>
          )}
        </div>
      </div>

      {/* Register Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Register New Product Model</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PA-48"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. DC-PA48-1000M"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 48V 1A Isolated Power Supply"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="Power Electronics / SMPS">Power Electronics / SMPS</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="Industrial Power Supplies">Industrial Power Supplies</option>
                    <option value="Lighting Electronics">Lighting Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Standard Reference</label>
                  <input
                    type="text"
                    value={newStandard}
                    onChange={(e) => setNewStandard(e.target.value)}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief functional description..."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0b2545] hover:bg-sky-900 text-white font-semibold rounded shadow-xs"
                >
                  Save Product Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
