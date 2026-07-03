function ScrollArea({ children }) {
  return (
    <div className="relative flex-1 min-h-0">

      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10 bg-gradient-to-b from-gray-950 to-transparent" />

      <div className="h-full overflow-y-auto scrollbar-hide px-4 md:px-0 py-6">
        {children}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10 bg-gradient-to-t from-gray-950 to-transparent" />
    </div>
  );
}

export default ScrollArea;
