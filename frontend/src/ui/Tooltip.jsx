import { useState } from 'react';

function Tooltip({ children, text }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-2.5 py-1.5 rounded-md
            bg-gray-700 text-gray-100 text-xs whitespace-nowrap
            shadow-lg z-50
          "
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
