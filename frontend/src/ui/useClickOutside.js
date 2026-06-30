import { useEffect, useRef } from 'react';

function useClickOutside(onOutsideClick) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutsideClick();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onOutsideClick]);

  return ref;
}

export default useClickOutside;
