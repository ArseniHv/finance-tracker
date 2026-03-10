interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  variant: 'income' | 'expense' | 'net';
}

export default function SummaryCard({ title, amount, icon, variant }: SummaryCardProps) {
  const colors = {
    income:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    expense: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
    net:     'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  const amountColor = {
    income:  'text-emerald-600 dark:text-emerald-400',
    expense: 'text-red-500 dark:text-red-400',
    net:     amount >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${colors[variant]}`}>
          {icon}
        </span>
      </div>
      <div className={`text-2xl font-bold ${amountColor[variant]}`}>
        {amount < 0 ? '-' : ''}${Math.abs(amount).toFixed(2)}
      </div>
    </div>
  );
}