import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [filter, setFilter] = useState('Building Team');
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('csarae_search') || '');

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans">
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <main className="flex-1 overflow-x-hidden">
        {/* Pass filter/searchTerm down to children via cloneElement */}
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child, { filter, setFilter, searchTerm, setSearchTerm })
            : child
        )}
      </main>
    </div>
  );
}