import Header from "../component/Header";
import { MdAttachMoney } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { MdOutlineLocalMovies } from "react-icons/md";
import Chart from "../component/DashBoard/Chart";
import RecentTransactions from "../component/DashBoard/RecentTransactions";
import CardStat from "../component/DashBoard/CardStat";
import TopRevenue from "../component/DashBoard/TopRevenue";
import NextMovies from "../component/DashBoard/NextMovies";

const DashBoard = () => {
  const revenueByMovies = [
    { name: "Avengers: Endgame", revenue: 120000000 },
    { name: "Spider-Man: No Way Home", revenue: 95000000 },
    { name: "The Batman", revenue: 73000000 },
    { name: "Top Gun: Maverick", revenue: 89000000 },
    { name: "Frozen II", revenue: 66000000 },
  ];
  const dataCard = [
    [24500, "Cập nhật đến tháng", 4, 12.5, "% from last month"],
    [1234, "Cập nhật đến tháng", 5, -8.5, "% from last month"],
    [14, "Phim sắp ra mắt ", 7, 3, "phim mới trong tháng này"],
  ];

  return (
    <div className="w-[100%] h-[100vh]  bg-neutral-100  p-5 overflow-auto">
      <Header title={"Dash board"} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <CardStat
          title={"Total Revenue"}
          icon={<MdAttachMoney />}
          data={dataCard[0]}
        />
        <CardStat
          title="Tickets Sold"
          icon={<IoTicketOutline />}
          data={dataCard[1]}
        />
        <CardStat
          title="Active Movies"
          icon={<MdOutlineLocalMovies />}
          data={dataCard[2]}
        />
      </div>
      <div className="flex gap-5 mb-5">
        <Chart title={"Revenue by moives"} data={revenueByMovies} />
        <Chart title={"Revenue by moives"} data={revenueByMovies} />
      </div>
      <TopRevenue />
      <div className="flex flex-wrap w-full gap-5">
        <div className="w-full md:flex-[4] md:w-auto">
          <RecentTransactions />
        </div>
        <div className="w-full md:flex-[2] md:w-auto">
          <NextMovies />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
