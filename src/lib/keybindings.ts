export interface KeyBinding {
  key: string;
  sequence?: string[];
  modifiers?: string[];
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export const keyBindings: KeyBinding[] = [
  // Slash commands
  {
    key: '/',
    action: () => window.dispatchEvent(new CustomEvent('open-command-palette')),
    description: 'Open slash command palette',
    preventDefault: true
  },
  // Vim-style commands
  {
    key: ':',
    action: () => window.dispatchEvent(new CustomEvent('open-command-bar')),
    description: 'Open vim command bar',
    preventDefault: true
  },
  // Search
  {
    key: '?',
    action: () => window.dispatchEvent(new CustomEvent('open-search')),
    description: 'Open search',
    preventDefault: true
  },
  // Escape closes overlays
  {
    key: 'Escape',
    action: () => {
      window.dispatchEvent(new CustomEvent('close-overlays'));
    },
    description: 'Close overlays'
  },
  // Ctrl+K opens slash
  {
    key: 'k',
    modifiers: ['ctrl'],
    action: () => window.dispatchEvent(new CustomEvent('open-command-palette')),
    description: 'Open command palette (Ctrl+K)',
    preventDefault: true
  },
  // Navigation sequences
  {
    key: 'b',
    modifiers: ['g'],
    sequence: ['g', 'b'],
    action: () => window.location.href = '/books',
    description: 'Go to Books (G B)'
  },
  {
    key: 'p',
    modifiers: ['g'],
    sequence: ['g', 'p'],
    action: () => window.location.href = '/projects',
    description: 'Go to Projects (G P)'
  },
  {
    key: 'd',
    modifiers: ['g'],
    sequence: ['g', 'd'],
    action: () => window.location.href = '/builds',
    description: 'Go to Builds (G D)'
  },
  {
    key: 't',
    modifiers: ['g'],
    sequence: ['g', 't'],
    action: () => window.location.href = '/today',
    description: 'Go to Today (G T)'
  },
  {
    key: 's',
    modifiers: ['g'],
    sequence: ['g', 's'],
    action: () => window.location.href = '/stats',
    description: 'Go to Stats (G S)'
  },
  {
    key: 'h',
    modifiers: ['g'],
    sequence: ['g', 'h'],
    action: () => window.location.href = '/',
    description: 'Go to Home (G H)'
  },
  // Pane navigation
  {
    key: 'h',
    modifiers: ['ctrl'],
    action: () => window.dispatchEvent(new CustomEvent('pane-left')),
    description: 'Navigate pane left (Ctrl+H)'
  },
  {
    key: 'j',
    modifiers: ['ctrl'],
    action: () => window.dispatchEvent(new CustomEvent('pane-down')),
    description: 'Navigate pane down (Ctrl+J)'
  },
  {
    key: 'k',
    modifiers: ['ctrl'],
    action: () => window.dispatchEvent(new CustomEvent('pane-up')),
    description: 'Navigate pane up (Ctrl+K)'
  },
  {
    key: 'l',
    modifiers: ['ctrl'],
    action: () => window.dispatchEvent(new CustomEvent('pane-right')),
    description: 'Navigate pane right (Ctrl+L)'
  },
  // Graph controls
  {
    key: 'r',
    action: () => window.dispatchEvent(new CustomEvent('graph-reset')),
    description: 'Reset graph view (R)'
  },
  {
    key: 'f',
    action: () => window.dispatchEvent(new CustomEvent('graph-focus')),
    description: 'Focus selected node in graph (F)'
  },
  // Enter to maximize pane
  {
    key: 'Enter',
    action: () => window.dispatchEvent(new CustomEvent('pane-maximize')),
    description: 'Maximize current pane (Enter)'
  },
  // Tab for autocomplete in command bar
  {
    key: 'Tab',
    action: () => window.dispatchEvent(new CustomEvent('command-autocomplete')),
    description: 'Autocomplete command (Tab)'
  }
];

export function initKeyBindings() {
  let sequence: string[] = [];
  let sequenceTimeout: ReturnType<typeof setTimeout>;

  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    
    if (e.key === 'Escape') {
      window.dispatchEvent(new CustomEvent('close-overlays'));
      return;
    }

    // Allow keybindings in input for certain keys
    const isCtrl = e.ctrlKey || e.metaKey;
    
    // Handle pane navigation with Ctrl+hljk even in inputs
    if (isCtrl && ['h', 'j', 'k', 'l'].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'h') window.dispatchEvent(new CustomEvent('pane-left'));
      if (e.key === 'j') window.dispatchEvent(new CustomEvent('pane-down'));
      if (e.key === 'k') window.dispatchEvent(new CustomEvent('pane-up'));
      if (e.key === 'l') window.dispatchEvent(new CustomEvent('pane-right'));
      return;
    }
    
    if (isInput) {
      // Still handle : and / in input for command activation
      if (e.key === ':' || e.key === '/') {
        // Let it pass through to activate
      } else {
        return;
      }
    }

    // Check modifier-based bindings first
    const modifierBinding = keyBindings.find(binding => {
      if (!binding.modifiers?.length) return false;
      const modifiersMatch = binding.modifiers.every(mod => {
        if (mod === 'ctrl') return isCtrl;
        if (mod === 'alt') return e.altKey;
        if (mod === 'shift') return e.shiftKey;
        return false;
      });
      return modifiersMatch && e.key.toLowerCase() === binding.key.toLowerCase();
    });

    if (modifierBinding) {
      if (modifierBinding.preventDefault) {
        e.preventDefault();
      }
      modifierBinding.action();
      return;
    }

    // Check simple key bindings
    const simpleBinding = keyBindings.find(binding => {
      if (binding.sequence || binding.modifiers?.length) return false;
      return e.key.toLowerCase() === binding.key.toLowerCase();
    });

    if (simpleBinding) {
      if (simpleBinding.preventDefault) {
        e.preventDefault();
      }
      simpleBinding.action();
    }

    // Handle key sequences (G + key)
    sequence.push(e.key.toLowerCase());
    
    if (sequenceTimeout) clearTimeout(sequenceTimeout);
    
    sequenceTimeout = setTimeout(() => {
      sequence = [];
    }, 500);

    const sequenceBinding = keyBindings.find(binding => {
      if (!binding.sequence) return false;
      const seq = binding.sequence;
      if (seq.length !== sequence.length) return false;
      return seq.every((key, i) => key === sequence[i]);
    });

    if (sequenceBinding) {
      sequence = [];
      sequenceBinding.action();
    }
  });
}

export function getKeyBindingsForDisplay() {
  return keyBindings.map(binding => ({
    key: binding.sequence ? binding.sequence.join(' ') : (binding.modifiers ? `${binding.modifiers.join('+')}+${binding.key}` : binding.key),
    description: binding.description
  }));
}
