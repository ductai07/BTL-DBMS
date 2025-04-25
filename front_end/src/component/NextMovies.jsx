import Cardmovie from "./Cardmovie";

const NextMovies = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4">Phim sắp ra mắt</h3>
      <Cardmovie />
      <Cardmovie />
    </div>
  );
};

export default NextMovies;
