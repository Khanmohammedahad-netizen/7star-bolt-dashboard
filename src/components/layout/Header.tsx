import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  companyName: string;
  userName: string;
  onLogout: () => void;
}

export function Header({ companyName, userName, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{companyName}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User size={18} />
          <span>{userName}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
