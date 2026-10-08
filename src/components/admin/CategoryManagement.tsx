import React, { useState } from 'react';
import { 
  PlusCircle, 
  Layers, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Tag,
  Palette,
  X
} from 'lucide-react';
import { Category, Opportunity } from '../../types';
import { Button } from '../ui/Button';
import { AdminConfirmationModal } from './AdminConfirmationModal';

export interface CategoryManagementProps {
  categories: Category[];
  opportunities: Opportunity[];
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const COLOR_OPTIONS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-violet-500',
];

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  opportunities,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('bg-indigo-500');
  const [icon, setIcon] = useState('Briefcase');
  const [error, setError] = useState('');

  // Delete Confirmation
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setAccentColor('bg-indigo-500');
    setIcon('Briefcase');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setAccentColor(category.accentColor || 'bg-indigo-500');
    setIcon(category.icon || 'Briefcase');
    setError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    if (!slug.trim()) {
      setError('Category slug identifier is required.');
      return;
    }

    const currentCount = opportunities.filter((o) => o.category === name.trim()).length;

    const newCategory: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || `Funding programs and grants for ${name.trim()}`,
      accentColor: accentColor,
      icon: icon || 'Briefcase',
      count: editingCategory ? editingCategory.count : currentCount,
    };

    onSaveCategory(newCategory);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.categoryId) {
      onDeleteCategory(deleteModal.categoryId);
    }
    setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Category Management
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define funding classification sectors, adjust slugs, customize accent badges, and organize discovery filters.
          </p>
        </div>

        <Button
          id="admin-add-category-btn"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add New Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const liveCount = opportunities.filter((o) => o.category === category.name).length;

          return (
            <div
              key={category.id}
              id={`category-card-${category.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full ${category.accentColor || 'bg-indigo-500'}`} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {liveCount} {liveCount === 1 ? 'Program' : 'Programs'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>

                <div className="text-[10px] font-mono text-slate-400">
                  Slug: <span className="text-slate-600 dark:text-slate-300">/{category.slug}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(category)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: true,
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="category-name-input"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Artificial Intelligence & Robotics"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  URL Slug Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="category-slug-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., ai-robotics"
                  className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Grants, venture competitions, and research fellowships in AI and robotics."
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Accent Color Dot
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      className={`w-7 h-7 rounded-full ${c} border-2 transition-transform ${
                        accentColor === c ? 'scale-110 border-slate-900 dark:border-white shadow-md' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deleteModal.categoryName}"? Opportunities previously associated with this category will remain in the catalog.`}
        confirmLabel="Delete Category"
        variant="danger"
      />
    </div>
  );
};
