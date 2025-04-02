import { useLocation, Link } from 'wouter';
import { Home, BarChart2, User } from 'lucide-react';

export default function BottomNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      active: location === '/'
    },
    {
      path: '/history',
      label: 'History',
      icon: BarChart2, 
      active: location === '/history'
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      active: location === '/profile'
    }
  ];
  
  return (
    <nav className="flex justify-around bg-white p-2 shadow-lg">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className={`flex flex-col items-center p-2 ${
            item.active ? 'text-primary' : 'text-neutral-300'
          }`}>
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}
