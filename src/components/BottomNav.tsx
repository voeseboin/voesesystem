import { LayoutDashboard, ShoppingCart, Package, DollarSign } from 'lucide-react';

type Section = 'dashboard' | 'ventas' | 'productos' | 'gastos';

interface BottomNavProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
}

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'productos', label: 'Stock', icon: Package },
  { id: 'gastos', label: 'Gastos', icon: DollarSign },
];

export function BottomNav({ activeSection, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg z-50 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
