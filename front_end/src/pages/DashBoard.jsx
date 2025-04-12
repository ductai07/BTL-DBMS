import Header from "../component/Header";
import { MdAttachMoney } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { MdOutlineLocalMovies } from "react-icons/md";
import Chart from "../component/Chart";
import Table from "../component/Table";

const DashBoard = () => {
  const revenueByMovies = [
    { name: "Avengers: Endgame", revenue: 120000000 },
    { name: "Spider-Man: No Way Home", revenue: 95000000 },
    { name: "The Batman", revenue: 73000000 },
    { name: "Top Gun: Maverick", revenue: 89000000 },
    { name: "Frozen II", revenue: 66000000 },
  ];
  const columnNames = [
    "Transaction ID",
    "Customer",
    "Movie",
    "Amount",
    "Status",
  ];
  const transactions = [
    {
      id: "#TRX-123456",
      customer: "John Doe",
      movie: "Inception",
      amount: 24.0,
      status: "Completed",
    },
    {
      id: "#TRX-123457",
      customer: "Jane Smith",
      movie: "The Matrix",
      amount: 32.0,
      status: "Completed",
    },
    {
      id: "#TRX-123458",
      customer: "Bob Johnson",
      movie: "Interstellar",
      amount: 28.0,
      status: "Pending",
    },
  ];
  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Dash board"} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div class="bg-white p-5 rounded-xl shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-neutral-600">Total Revenue</h3>
            <MdAttachMoney />
          </div>
          <p class="text-2xl">$24,500</p>
          <p class="text-sm text-green-600">+12.5% from last month</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-neutral-600">Tickets Sold</h3>
            <IoTicketOutline />
          </div>
          <p class="text-2xl">1,234</p>
          <p class="text-neutral-600 text-sm">Last 30 days</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-neutral-600">Active Movies</h3>
            <MdOutlineLocalMovies />
          </div>
          <p class="text-2xl">12</p>
          <p class="text-neutral-600 text-sm">Currently showing</p>
        </div>
      </div>
      <div className="flex gap-5 mb-5">
        <div className="bg-white flex-1 shadow-md p-5 rounded-lg">
          <Chart title={"Revenue by moives"} data={revenueByMovies} />
        </div>
        <div className="bg-white flex-1  shadow-md p-5 rounded-lg">
          <Chart title={"Revenue by moives"} data={revenueByMovies} />
        </div>
      </div>
      <Table columnNames={columnNames} transactions={transactions} />
    </div>
  );
};

export default DashBoard;
