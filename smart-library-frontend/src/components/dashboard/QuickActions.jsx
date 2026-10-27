import { Link } from 'react-router-dom';

export default function QuickActions({ icon = 'arrow_forward', label = '', path = '#', color = 'from-primary to-secondary' }) {
  return (
    <Link
      to={path}
      className={`group flex flex-col items-start gap-md rounded-xl bg-gradient-to-br ${color} p-lg text-on-primary shadow-sm transition hover:shadow-md hover:-translate-y-0.5`}
    >
      <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 material-symbols-outlined text-[28px] transition group-hover:scale-110">
        {icon}
      </span>
      <div className="flex items-center justify-between w-full">
        <span className="text-body-md font-semibold">{label}</span>
        <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
      </div>
    </Link>
  );
}