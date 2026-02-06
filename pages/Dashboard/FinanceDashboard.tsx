import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Modal from '../../components/Modal';

interface Package {
  id: string;
  name: string;
  type: 'apc' | 'journal_subscription' | 'article_purchase' | 'membership';
  price: number;
  currency: string;
  description: string;
  duration_months: number | null;
  is_active: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  created_at: string;
  description: string;
  user: {
    full_name: string;
    email: string;
  } | null;
  book_id: string | null;
  manuscript_id: string | null;
  book?: { title: string } | null;
  manuscript?: { title: string } | null;
}

const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'orders'>('packages');

  // Packages State
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    type: 'apc',
    price: '',
    currency: 'USD',
    description: '',
    duration_months: '',
    is_active: true
  });

  useEffect(() => {
    fetchPackages();
    fetchOrders();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('publication_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
                    *,
                    user:profiles(full_name, email),
                    book:books(title),
                    manuscript:manuscripts(title)
                `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // @ts-ignore
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      if (!window.confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) return;

      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      ));
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      type: pkg.type,
      price: pkg.price.toString(),
      currency: pkg.currency,
      description: pkg.description || '',
      duration_months: pkg.duration_months ? pkg.duration_months.toString() : '',
      is_active: pkg.is_active
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
    setFormData({
      name: '',
      type: 'apc',
      price: '',
      currency: 'USD',
      description: '',
      duration_months: '',
      is_active: true
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price),
        currency: formData.currency,
        description: formData.description,
        duration_months: formData.duration_months ? parseInt(formData.duration_months) : null,
        is_active: formData.is_active
      };

      if (selectedPackage) {
        const { error } = await supabase
          .from('publication_packages')
          .update(payload)
          .eq('id', selectedPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('publication_packages')
          .insert(payload);
        if (error) throw error;
      }

      await fetchPackages();
      handleClose();
    } catch (error: any) {
      console.error('Error saving package:', error);
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-background-light overflow-y-auto">
      <main className="mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-slate-900 text-3xl font-black font-serif tracking-tight mb-2">Financial Administration</h1>
            <p className="text-slate-500 text-base">Manage publication fees, subscriptions, and pricing packages.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'packages' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
          >
            Pricing Packages
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'orders' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
          >
            Orders & Transactions
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'packages' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="border-b border-slate-200 px-6 py-5 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pricing Packages</h3>
                <p className="text-slate-500 text-sm">Set up APCs, subscriptions, and other fees.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add</span> New Package
              </button>
            </div>

            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {packagesLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                    ) : packages.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No packages defined yet. Create one to get started.</td></tr>
                    ) : (
                      packages.map(pkg => (
                        <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 text-sm">{pkg.name}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{pkg.description}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${pkg.type === 'apc' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              pkg.type === 'journal_subscription' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                              {pkg.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">{pkg.currency} {pkg.price.toFixed(2)}</span>
                            {pkg.duration_months && <span className="text-slate-500 text-xs ml-1">/ {pkg.duration_months}mo</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${pkg.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                              <span className={`w-2 h-2 rounded-full ${pkg.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                              {pkg.is_active ? 'Active' : 'Archived'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleEdit(pkg)}
                              className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Orders Tab
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="border-b border-slate-200 px-6 py-5 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-slate-500 text-sm">View all payments and order history.</p>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ordersLoading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">{order.user?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{order.user?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-700 font-bold truncate max-w-xs" title={order.description}>{order.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-black text-slate-500 uppercase tracking-widest">{order.type.replace('_', ' ')}</span>
                              {(order.book || order.manuscript) && (
                                <span className="text-xs text-primary font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">link</span>
                                  {order.book?.title || order.manuscript?.title}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                            {order.currency} {order.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border-none focus:ring-1 focus:ring-offset-1 cursor-pointer outline-none ${order.status === 'completed' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                                order.status === 'pending' ? 'bg-amber-100 text-amber-700 focus:ring-amber-500' :
                                  'bg-red-100 text-red-700 focus:ring-red-500'
                                }`}
                            >
                              <option value="pending">PENDING</option>
                              <option value="completed">COMPLETED</option>
                              <option value="failed">FAILED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={selectedPackage ? "Edit Package" : "Create Pricing Package"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Package Name <span className="text-red-500">*</span></label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring"
              placeholder="e.g. Standard Article Processing Charge"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select
                name="type"
                value={formData.type}
                // @ts-ignore
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring bg-white"
              >
                <option value="apc">Article Processing Charge (APC)</option>
                <option value="journal_subscription">Journal Subscription</option>
                <option value="article_purchase">Article Purchase</option>
                <option value="membership">Membership</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">{formData.currency}</span>
                <input
                  required
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full h-10 pl-12 pr-3 rounded-lg border border-slate-300 focus:primary-ring"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {formData.type === 'journal_subscription' || formData.type === 'membership' ? (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Duration (Months)</label>
              <input
                name="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:primary-ring"
                placeholder="e.g. 12 for annual"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-300 focus:primary-ring resize-none"
              placeholder="What does this package include?"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="size-5 text-primary rounded border-slate-300 focus:ring-primary"
              />
              <div>
                <span className="block font-bold text-slate-900 text-sm">Active</span>
                <span className="block text-xs text-slate-500">Visible for selection in the system</span>
              </div>
            </label>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              {submitting ? 'Saving...' : 'Save Package'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceDashboard;