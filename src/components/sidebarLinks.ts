

export interface SidebarLink {
  href: string;
  label: string;
}

export const sidebarLinks: SidebarLink[] = [
  { href: '/', label: 'Home' },
  { href: '/articles', label: 'Articles' },
  { href: '/simulators', label: 'Simulators' },
  { href: '/applications', label: 'Applications' },
  { href: '/applications/todo', label: 'TodoList' },
];