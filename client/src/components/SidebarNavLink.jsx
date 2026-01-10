import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Reusable NavLink component for consistent styling across sidebars
 * @param {string} to - Navigation path
 * @param {string} icon - Bootstrap icon class (e.g., 'bi-grid-1x2-fill')
 * @param {string} label - Display text
 * @param {string} variant - 'primary' (active highlight) or 'secondary' (muted when inactive)
 * @param {string} className - Additional CSS classes
 */
const SidebarNavLink = ({ to, icon, label, variant = 'primary', className = '' }) => {
  const baseClass = 'list-group-item list-group-item-action bg-transparent rounded-3 mb-2';
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        let classes = baseClass;
        
        if (isActive) {
          classes += ` active text-${variant} fw-bold bg-${variant} bg-opacity-10`;
        } else {
          classes += ' text-secondary';
        }
        
        return classes + (className ? ` ${className}` : '');
      }}
    >
      {icon && <i className={`bi ${icon} me-2`}></i>}
      {label}
    </NavLink>
  );
};

export default SidebarNavLink;
