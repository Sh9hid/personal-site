export interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'action';
}

export const commands: Command[] = [
  // Navigation
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
    keywords: ['books', 'reading', 'library'],
    category: 'navigation'
  },
  {
    id: 'builds',
    label: 'Builds',
    description: 'View build logs',
    action: () => window.location.href = '/builds',
    keywords: ['builds', 'logs', 'projects'],
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
    keywords: ['stack', 'tech', 'tools'],
    category: 'navigation'
  },
  {
    id: 'now',
    label: 'Now',
    description: "What I'm doing now",
    action: () => window.location.href = '/now',
    keywords: ['now', 'current'],
    category: 'navigation'
  },
  {
    id: 'today',
    label: 'Today',
    description: 'Daily log',
    action: () => window.location.href = '/today',
    keywords: ['today', 'daily', 'log'],
    category: 'navigation'
  },
  {
    id: 'stats',
    label: 'Stats',
    description: 'Site statistics',
    action: () => window.location.href = '/stats',
    keywords: ['stats', 'statistics', 'numbers'],
    category: 'navigation'
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    description: 'Keyboard shortcuts',
    action: () => window.location.href = '/shortcuts',
    keywords: ['shortcuts', 'keys', 'keyboard'],
    category: 'navigation'
  },
  {
    id: 'rss',
    label: 'RSS Feed',
    description: 'Subscribe to RSS',
    action: () => window.location.href = '/rss.xml',
    keywords: ['rss', 'feed'],
    category: 'navigation'
  },
  {
    id: 'sitemap',
    label: 'Sitemap',
    description: 'View sitemap',
    action: () => window.location.href = '/sitemap-index.xml',
    keywords: ['sitemap', 'map'],
    category: 'navigation'
  },
  // Actions
  {
    id: 'random',
    label: 'Random Page',
    description: 'Go to a random page',
    action: () => {
      const pages = ['/books', '/builds', '/projects', '/reading', '/stack', '/now', '/today'];
      const random = pages[Math.floor(Math.random() * pages.length)];
      window.location.href = random;
    },
    keywords: ['random', 'surprise'],
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
    keywords: ['search', 'find'],
    category: 'action'
  },
  {
    id: 'graph',
    label: 'Graph',
    description: 'Focus graph view',
    action: () => window.dispatchEvent(new CustomEvent('focus-graph')),
    keywords: ['graph', 'network', 'view'],
    category: 'action'
  },
  {
    id: 'theme',
    label: 'Toggle Theme',
    description: 'Switch mono/dev theme',
    action: () => {
      const current = document.body.getAttribute('data-theme');
      const next = current === 'dev' ? 'mono' : 'dev';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    },
    keywords: ['theme', 'mono', 'dev'],
    category: 'action'
  },
  {
    id: 'contrast',
    label: 'High Contrast',
    description: 'Toggle high contrast mode',
    action: () => {
      document.body.classList.toggle('high-contrast');
    },
    keywords: ['contrast', 'accessibility'],
    category: 'action'
  },
  {
    id: 'help',
    label: 'Help',
    description: 'Show keyboard shortcuts',
    action: () => window.location.href = '/shortcuts',
    keywords: ['help', 'shortcuts'],
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
