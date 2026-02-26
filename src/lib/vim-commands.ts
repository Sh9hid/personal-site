export interface VimCommand {
  id: string;
  label: string;
  description: string;
  action: () => void;
  keywords: string[];
}

export const vimCommands: VimCommand[] = [
  {
    id: 'open',
    label: ':open',
    description: 'Open a file (e.g., :open notes/foo)',
    action: () => {
      // Implemented in command handler
    },
    keywords: ['open', 'file', 'note'],
  },
  {
    id: 'stats',
    label: ':stats',
    description: 'Show site statistics',
    action: () => window.location.href = '/stats',
    keywords: ['stats', 'statistics', 'numbers'],
  },
  {
    id: 'graph',
    label: ':graph',
    description: 'Focus graph view',
    action: () => {
      window.dispatchEvent(new CustomEvent('focus-graph'));
    },
    keywords: ['graph', 'network', 'view'],
  },
  {
    id: 'theme-mono',
    label: ':theme mono',
    description: 'Set mono theme (grayscale)',
    action: () => {
      localStorage.setItem('theme', 'mono');
      document.body.setAttribute('data-theme', 'mono');
    },
    keywords: ['theme', 'mono', 'grayscale'],
  },
  {
    id: 'theme-dev',
    label: ':theme dev',
    description: 'Set dev theme (subtle syntax colors)',
    action: () => {
      localStorage.setItem('theme', 'dev');
      document.body.setAttribute('data-theme', 'dev');
    },
    keywords: ['theme', 'dev', 'syntax'],
  },
  {
    id: 'recent',
    label: ':recent',
    description: 'Show recent files',
    action: () => {
      window.dispatchEvent(new CustomEvent('show-recent'));
    },
    keywords: ['recent', 'latest', 'files'],
  },
  {
    id: 'random',
    label: ':random',
    description: 'Open random note',
    action: () => {
      const pages = ['/books', '/builds', '/projects', '/reading', '/now', '/today'];
      const random = pages[Math.floor(Math.random() * pages.length)];
      window.location.href = random;
    },
    keywords: ['random', 'randomize'],
  },
  {
    id: 'zen',
    label: ':zen',
    description: 'Zen mode (distraction-free)',
    action: () => {
      document.body.classList.toggle('zen-mode');
    },
    keywords: ['zen', 'focus', 'distraction'],
  },
  {
    id: 'set-number',
    label: ':set number',
    description: 'Toggle line numbers',
    action: () => {
      document.body.classList.toggle('show-line-numbers');
    },
    keywords: ['set', 'number', 'lines'],
  },
  {
    id: 'set-wrap',
    label: ':set wrap',
    description: 'Toggle word wrap',
    action: () => {
      document.body.classList.toggle('word-wrap');
    },
    keywords: ['set', 'wrap', 'line'],
  },
  {
    id: 'help',
    label: ':help',
    description: 'Show command help',
    action: () => window.location.href = '/shortcuts',
    keywords: ['help', 'commands'],
  },
  {
    id: 'quit',
    label: ':q',
    description: 'Close command bar',
    action: () => {
      window.dispatchEvent(new CustomEvent('close-command-bar'));
    },
    keywords: ['quit', 'close', 'exit'],
  },
  {
    id: 'today',
    label: ':today',
    description: 'Go to today page',
    action: () => window.location.href = '/today',
    keywords: ['today', 'daily'],
  },
];

export function searchVimCommands(query: string): VimCommand[] {
  if (!query.startsWith(':')) {
    return [];
  }
  
  const cmd = query.slice(1).toLowerCase();
  
  if (!cmd) return vimCommands;
  
  return vimCommands.filter(c => 
    c.label.toLowerCase().includes(cmd) ||
    c.description.toLowerCase().includes(cmd) ||
    c.keywords.some(k => k.includes(cmd))
  );
}
