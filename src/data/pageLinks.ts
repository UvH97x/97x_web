/*
  * /src/data/pageLinks.ts
*/

import { PageLink } from "../types/UvHTypes";

export const PageLinks: PageLink[] = [
  {
    href: "/",
    label: "Home",
    sublinks: [
      { href: "/articles", label: "Articles", sublinks: [] },
      { href: "/applications", label: "Apps", sublinks: [] }
    ],
    icon: "/home.svg",
  },
  {
    href: "/applications",
    label: "Apps",
    sublinks: [
      { href: "/applications/todo", label: "Todo", sublinks: [] }
    ],
    icon: "/apps.svg",
  },
  {
    href: "/articles",
    label: "Articles",
    sublinks: [],
    icon: "/articles.svg",
  },
  {
    href: "/simulators",
    label: "Simulators",
    sublinks: [],
    icon: "/simulators.svg",
  },
];