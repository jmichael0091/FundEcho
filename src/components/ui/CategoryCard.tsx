import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Award, 
  HeartHandshake, 
  Trophy, 
  Building2, 
  FlaskConical, 
  Leaf, 
  ArrowUpRight 
} from 'lucide-react';
import { Category } from '../../types';

export interface CategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
  isSelected?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  isSelected = false,
}) => {
  const getIcon = (name: string) => {
    const props = { className: 'w-5 h-5 transition-transform duration-200 group-hover:scale-110' };
    switch (name) {
      case 'Sparkles':
        return <Sparkles {...props} className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'GraduationCap':
        return <GraduationCap {...props} className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Award':
        return <Award {...props} className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'HeartHandshake':
        return <HeartHandshake {...props} className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Trophy':
        return <Trophy {...props} className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Building2':
        return <Building2 {...props} className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'FlaskConical':
        return <FlaskConical {...props} className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'Leaf':
        return <Leaf {...props} className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Sparkles {...props} className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getBgIconTint = (accent: string) => {
    switch (accent) {
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-100 dark:border-indigo-800/60 group-hover:bg-indigo-100/80';
      case 'blue': return 'bg-blue-50 dark:bg-blue-950/70 border-blue-100 dark:border-blue-800/60 group-hover:bg-blue-100/80';
      case 'purple': return 'bg-purple-50 dark:bg-purple-950/70 border-purple-100 dark:border-purple-800/60 group-hover:bg-purple-100/80';
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-100 dark:border-emerald-800/60 group-hover:bg-emerald-100/80';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/70 border-amber-100 dark:border-amber-800/60 group-hover:bg-amber-100/80';
      case 'sky': return 'bg-sky-50 dark:bg-sky-950/70 border-sky-100 dark:border-sky-800/60 group-hover:bg-sky-100/80';
      case 'teal': return 'bg-teal-50 dark:bg-teal-950/70 border-teal-100 dark:border-teal-800/60 group-hover:bg-teal-100/80';
      case 'green': return 'bg-green-50 dark:bg-green-950/70 border-green-100 dark:border-green-800/60 group-hover:bg-green-100/80';
      default: return 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-100 dark:border-indigo-800/60 group-hover:bg-indigo-100/80';
    }
  };

  return (
    <button
      type="button"
      id={`cat-card-${category.id}`}
      onClick={() => onClick && onClick(category)}
      className={`group relative flex flex-col justify-between p-5 sm:p-6 text-left bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 w-full shadow-md shadow-slate-200/70 dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.36)] hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-1 ${
        isSelected
          ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/50 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/50'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/60'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className={`p-2.5 rounded-xl border transition-colors ${getBgIconTint(category.accentColor)}`}>
            {getIcon(category.icon)}
          </div>
          <span className="p-1 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {category.name}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {category.description}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {category.count.toLocaleString()} <span className="font-normal text-slate-500 dark:text-slate-400">listed</span>
        </span>
        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Browse &rarr;
        </span>
      </div>
    </button>
  );
};

