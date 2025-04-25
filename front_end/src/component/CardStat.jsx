import { MdAttachMoney } from "react-icons/md";

const CardStat = ({ title = "test", icon = "", data = [[], [], [], []] }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-600">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl">{data[0].toLocaleString()}</p>
      <p className="text-gray-400 text-sm">
        {data[1]} {data[2]}
      </p>
      <p className={data[3] > 0 ? "text-green-600" : " text-red-600"}>
        {data[3] > 0 ? "+" : ""}
        {data[3]} {data[4]}
      </p>
    </div>
  );
};

export default CardStat;
