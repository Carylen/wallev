'use client';

import { useId } from 'react';
import { CATEGORY_OPTIONS } from '@/components/category-options';

interface CategoryInputProps {
  defaultValue?: string | null;
  className?: string;
  placeholder?: string;
}

export default function CategoryInput({
  defaultValue,
  className,
  placeholder = 'Category',
}: CategoryInputProps) {
  const listId = useId();

  return (
    <>
      <input
        name="category"
        list={listId}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
