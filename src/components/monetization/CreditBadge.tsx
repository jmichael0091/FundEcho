import React from 'react';
import { Coins, Plus } from 'lucide-react';
import { useMonetization } from '../../context/MonetizationContext';

export interface CreditBadgeProps {
  className?: string;
  onClick?: () => void;
  showAddButton?: boolean;
}

export const CreditBadge: React.FC<CreditBadgeProps> = ({
  className = '',
  onClick,
  showAddButton = true
}) => {
  const { credits, isPremium, openCreditModal } = useMonetization();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openCreditModal();
    }
  };

  return (
    <button
      type="button"
      id="monetization-credit-badge"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all text-xs font-bold shadow-2xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${className}`}
      title={isPremium ? `Unlimited AI usage (Included in Premium) • ${credits.balance} reserve credits` : `Current balance: ${credits.balance} credits. Click to manage.`}
      aria-label={`Credit Balance: ${credits.balance}`}
    >
      <span className="flex items-center justify-center h-4 w-4 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400">
        <Coins className="w-3.5 h-3.5" />
      </span>
      
      <span className="whitespace-nowrap">
        Credits: <span className="font-extrabold">{credits.balance}</span>
      </span>

      {showAddButton && (
        <span className="h-4 w-4 rounded-md bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all text-[10px]">
          <Plus className="w-3 h-3" />
        </span>
      )}
    </button>
  );
};
