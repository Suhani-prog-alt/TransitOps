import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className = '', ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
    <table className={`w-full min-w-[800px] border-collapse text-left text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <thead className={`border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-gray-400 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-white/5 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }> = ({ children, selected = false, className = '', ...props }) => (
  <tr
    className={`transition-colors duration-150 hover:bg-white/[0.02] ${
      selected ? 'bg-brand-blue/5 border-l-2 border-brand-blue' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-4 font-semibold text-gray-300 ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 text-gray-300 font-medium ${className}`} {...props}>
    {children}
  </td>
);
