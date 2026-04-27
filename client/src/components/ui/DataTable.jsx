function DataTable({ columns, rows, emptyState }) {
  if (!rows?.length) {
    return emptyState || null
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={row.id || row._id || rowIndex} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${row.id || row._id || rowIndex}`}
                    className={`px-4 py-3 text-sm text-slate-700 ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
