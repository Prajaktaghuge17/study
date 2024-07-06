// Footer.tsx

import React from 'react';
import { useTheme } from './ThemeContext';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`text-center text-lg-start mt-auto ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="text-center p-3" style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
        © {new Date().getFullYear()} Collaborative Study Platform. All rights reserved. <br/>
        Website design by <b>Prajakta Ghuge</b>

      </div>
    </footer>
  );
};

export default Footer;
