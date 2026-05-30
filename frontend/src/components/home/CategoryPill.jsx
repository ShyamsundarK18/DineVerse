export default function CategoryPill({ category, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0
      ${
        isActive
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-300/40 scale-105"
          : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
      }`}
    >
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </button>
  );
}
