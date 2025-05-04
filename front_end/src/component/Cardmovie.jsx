import { GrSchedulePlay } from "react-icons/gr";

const Cardmovie = () => {
  return (
    <div className="border-b pb-4">
      <div className="flex gap-1">
        <div>
          <img
            className="h-[130px] w-[100px] rounded-md"
            src="/imgs/avatar.png"
            alt="Movie poster"
          />
        </div>
        <div className="flex items-center w-full p-2">
          <div className="space-y-1">
            <span className="font-semibold">Black Window</span>
            <div className="flex items-center  gap-1 text-base text-gray-400">
              <span>Hành động, Phiêu lưu</span>
              <span className="block w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>145 phút</span>
            </div>
            <div className="  flex gap-1 items-center text-red-600 font-semibold">
              <GrSchedulePlay />
              <div>Ra mắt 25/04/2025</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cardmovie;
