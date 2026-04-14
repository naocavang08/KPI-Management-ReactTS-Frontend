import { useEffect, useState } from "react";

function useIncrement(initialValue: number = 0): [number, () => void] {
  const [value, setValue] = useState(initialValue);

  function increase() {
    setValue(prev => prev + 1);
  }

  return [value, increase];
}

function usePrevious<T>(value: T): T | undefined {
  const [prevValue, setPrevValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  return prevValue;
}

function useToggle(
  initialValue: boolean
): [boolean, (value?: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  function toggleValue(nextValue?: boolean) {
    setValue(current =>
      typeof nextValue === "boolean" ? nextValue : !current
    );
  }

  return [value, toggleValue];
}


export { useIncrement, usePrevious, useToggle };