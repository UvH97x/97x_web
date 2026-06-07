export type NavItem = { href: string; label: string; icon: string }

export const NAV_ITEMS: NavItem[] = [
  { href: '/',             label: 'Home',         icon: '/home_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg' },
  { href: '/articles',     label: 'Articles',     icon: '/article_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg' },
  { href: '/simulators',   label: 'Simulators',   icon: '/simulation_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg' },
  { href: '/applications', label: 'Applications', icon: '/apps_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg' },
  { href: '/about',        label: 'About',        icon: '/contact_support_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg' },
  { href: '/data',         label: 'Data',         icon: '/database_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg' },
]
