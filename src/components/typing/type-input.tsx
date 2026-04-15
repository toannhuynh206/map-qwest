'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface TypeInputHandle {
  clear: () => void;
  shake: () => void;
  focus: () => void;
}

interface TypeInputProps {
  onInput: (value: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const TypeInput = forwardRef<TypeInputHandle, TypeInputProps>(
  function TypeInputComponent({ onInput, onEnter, disabled, placeholder = 'Type a name…' }, ref) {
    const [value, setValue] = useState('');
    const [shakeKey, setShakeKey] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        setValue('');
        onInput('');
      },
      shake: () => setShakeKey((k) => k + 1),
      focus: () => inputRef.current?.focus(),
    }));

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      onInput(v);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onEnter?.();
    };

    return (
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="flex-1"
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full px-4 py-3 rounded-2xl bg-board-card border border-board-border text-board-text text-base font-semibold placeholder:text-board-muted focus:outline-none focus:ring-2 focus:ring-board-green focus:border-board-green transition-shadow disabled:opacity-50"
        />
      </motion.div>
    );
  },
);
