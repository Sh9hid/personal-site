export interface KeyBinding {
  key: string;
  sequence?: string[];
  modifiers?: ('ctrl' | 'alt' | 'shift')[];
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export const keyBindings: KeyBinding[] = [
  {
    key: '/',
    action: () => window.dispatchEvent(new CustomEvent('open-command-palette')),
    description: 'Open command palette',
    preventDefault: true
  },
  {
    key: '?',
    action: () => window.dispatchEvent(new CustomEvent('open-search')),
    description: 'Open search',
    preventDefault: true
  },
  {
    key: 'Escape',
    action: () => {
      window.dispatchEvent(new CustomEvent('close-overlays'));
    },
    description: 'Close overlays'
  },
  {
    key: 'k',
    modifiers: ['ctrl'],
    action: () => window.dispatchEvent(new CustomEvent('open-command-palette')),
    description: 'Open command palette (Ctrl+K)',
    preventDefault: true
  },
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

    if (isInput) return;

    const matchingBinding = keyBindings.find(binding => {
      if (binding.sequence) {
        return false;
      }
      if (binding.modifiers?.length) {
        const modifiersMatch = binding.modifiers.every(mod => {
          if (mod === 'ctrl') return e.ctrlKey;
          if (mod === 'alt') return e.altKey;
          if (mod === 'shift') return e.shiftKey;
          return false;
        });
        return modifiersMatch && e.key.toLowerCase() === binding.key.toLowerCase();
      }
      return e.key.toLowerCase() === binding.key.toLowerCase();
    });

    if (matchingBinding) {
      if (matchingBinding.preventDefault) {
        e.preventDefault();
      }
      matchingBinding.action();
    }

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
