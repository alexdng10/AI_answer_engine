import React from 'react';

type TableProps = {
  headers: string[];
  rows: Array<Array<string | number>>;
};

const DynamicTable: React.FC<TableProps> = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 bg-gray-800 text-left text-gray-200 border border-gray-700 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2 border border-gray-700 text-gray-300 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
