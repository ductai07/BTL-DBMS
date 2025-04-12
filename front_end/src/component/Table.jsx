const Table = ({ columnNames, transactions }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-gray-500 border-b">
            {columnNames.map((col) => (
              <th className="py-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((trx) => (
            <tr
              key={trx.id}
              className="border-b text-sm text-gray-700 hover:bg-gray-50"
            >
              <td className="py-3">{trx.id}</td>
              <td>{trx.customer}</td>
              <td>{trx.movie}</td>
              <td>${trx.amount.toFixed(2)}</td>
              <td>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trx.status === "Completed"
                      ? "bg-gray-200 text-green-600"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {trx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
