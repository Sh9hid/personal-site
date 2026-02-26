export interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'action';
}

export const commands: Command[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Go to homepage',
    action: () => window.location.href = '/',
    keywords: ['home', 'start', 'main'],
    category: 'navigation'
  },
  {
    id: 'books',
    label: 'Books',
    description: 'Browse books shelf',
    action: () => window.location.href = '/books',
    keywords: ['books', 'reading', 'library', 'shelf'],
    category: 'navigation'
  },
  {
    id: 'builds',
    label: 'Builds',
    description: 'View build logs',
    action: () => window.location.href = '/builds',
    keywords: ['builds', 'logs', 'projects', 'development'],
    category: 'navigation'
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'View projects',
    action: () => window.location.href = '/projects',
    keywords: ['projects', 'work', 'portfolio'],
    category: 'navigation'
  },
  {
    id: 'reading',
    label: 'Reading',
    description: 'Currently reading',
    action: () => window.location.href = '/reading',
    keywords: ['reading', 'currently', 'progress'],
    category: 'navigation'
  },
  {
    id: 'stack',
    label: 'Stack',
    description: 'Tech stack',
    action: () => window.location.href = '/stack',
    keywords: ['stack', 'tech', 'technology', 'tools'],
    category: 'navigation'
  },
  {
    id: 'now',
    label: 'Now',
    description: 'What I\'m doing now',
    action: () => window.location.href = '/now',
    keywords: ['now', 'current', 'nowadays'],
    category: 'navigation'
  },
  {
    id: 'today',
    label: 'Today',
    description: 'Daily log',
    action: () => window.location.href = '/today',
    keywords: ['today', 'daily', 'log', 'journal'],
    category: 'navigation'
  },
  {
    id: 'stats',
    label: 'Stats',
    description: 'Site statistics',
    action: () => window.location.href = '/stats',
    keywords: ['stats', 'statistics', 'numbers', 'metrics'],
    category: 'navigation'
  },
  {
    id: 'rss',
    label: 'RSS Feed',
    description: 'Subscribe to RSS',
    action: () => window.location.href = '/rss.xml',
    keywords: ['rss', 'feed', 'subscribe'],
    category: 'navigation'
  },
  {
    id: 'sitemap',
    label: 'Sitemap',
    description: 'View sitemap',
    action: () => window.location.href = '/sitemap-index.xml',
    keywords: ['sitemap', 'map', 'navigation'],
    category: 'navigation'
  },
  {
    id: 'random',
    label: 'Random Page',
    description: 'Go to a random page',
    action: () => {
      const pages = ['/books', '/builds', '/projects', '/reading', '/stack', '/now', '/today'];
      const random = pages[Math.floor(Math.random() * pages.length)];
      window.location.href = random;
    },
    keywords: ['random', 'randomize', 'surprise'],
    category: 'action'
  },
  {
    id: 'latest',
    label: 'Latest',
    description: 'View latest entries',
    action: () => window.location.href = '/#latest',
    keywords: ['latest', 'recent', 'new'],
    category: 'action'
  },
  {
    id: 'search',
    label: 'Search',
    description: 'Search the site',
    action: () => window.dispatchEvent(new CustomEvent('open-search')),
    keywords: ['search', 'find', 'query'],
    category: 'action'
  },
  {
    id: 'theme',
    label: 'Toggle Theme',
    description: 'Switch light/dark theme',
    action: () => {
      document.documentElement.classList.toggle('light');
    },
    keywords: ['theme', 'light', 'dark', 'mode'],
    category: 'action'
  },
  {
    id: 'contrast',
    label: 'High Contrast',
    description: 'Toggle high contrast mode',
    action: () => {
      document.body.classList.toggle('high-contrast');
    },
    keywords: ['contrast', 'accessibility', 'a11y', 'high'],
    category: 'action'
  },
  {
    id: 'help',
    label: 'Help',
    description: 'Show keyboard shortcuts',
    action: () => window.location.href = '/shortcuts',
    keywords: ['help', 'shortcuts', 'keys', 'keyboard'],
    category: 'action'
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    description: 'View all keyboard shortcuts',
    action: () => window.location.href = '/shortcuts',
    keywords: ['shortcuts', 'keys', 'keyboard', 'bindings'],
    category: 'action'
  }
];

export function searchCommands(query: string): Command[] {
  if (!query) return commands;
  
  const lowerQuery = query.toLowerCase();
  return commands.filter(cmd => 
    cmd.label.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery) ||
    cmd.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
  );
}
