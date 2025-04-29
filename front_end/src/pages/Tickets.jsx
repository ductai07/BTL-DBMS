import Header from "../component/Header";
import Select from "../component/Select";
import { FaPlus } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import TableTickets from "../component/TableTickets";
import AddTicketModal from "../component/AddTicketModal";

const Tickets = () => {
  // Call api lay data
  let [data, setData] = useState([
    {
      id: 1,
      movieTitle: "The Dark Knight",
      roomName: "Room A1",
      seatNumber: "A12",
      showDate: "2025-04-25",
      showTime: "19:30",
      price: 120000,
      status: "Booked",
    },
    {
      id: 2,
      movieTitle: "Inception",
      roomName: "Room B2",
      seatNumber: "C5",
      showDate: "2025-04-26",
      showTime: "20:00",
      price: 150000,
      status: "Paid",
    },
    {
      id: 3,
      movieTitle: "Interstellar",
      roomName: "Room A2",
      seatNumber: "D8",
      showDate: "2025-04-25",
      showTime: "18:15",
      price: 120000,
      status: "Canceled",
    },
  ]);
  
  // API call to update data
  const handleDelete = (ticketId) => {
    setDelete(!Delete);
    const updateData = data.filter(({ id }) => id != ticketId);
    setData(updateData);
    filterTickets(updateData);
  };

  const handleAddTicket = (newTicket) => {
    let updatedTickets = [
      newTicket,
      ...data.filter((ticket) => ticket.id != newTicket.id),
    ];
    setData(updatedTickets);
    filterTickets(updatedTickets);
  };

  // Table configuration
  const columnNames = ["Movie", "Room", "Seat", "Date", "Time", "Price", "Status", "Actions"];
  const [tickets, setTickets] = useState([]);
  
  const ticketStatuses = [
    { key: "all", value: "All Status" },
    { key: "booked", value: "Booked" },
    { key: "paid", value: "Paid" },
    { key: "canceled", value: "Canceled" },
  ];
  
  const movieOptions = [
    { key: "all", value: "All Movies" },
    { key: "the_dark_knight", value: "The Dark Knight" },
    { key: "inception", value: "Inception" },
    { key: "interstellar", value: "Interstellar" },
  ];

  const [defaultMovie, setDefaultMovie] = useState(() => {
    return localStorage.getItem("keyMovie") || movieOptions[0].value;
  });

  const [defaultTicketStatus, setDefaultTicketStatus] = useState(() => {
    return localStorage.getItem("keyTicketStatus") || ticketStatuses[0].value;
  });

  const filterTickets = (data) => {
    let filtered = data;

    if (defaultMovie !== movieOptions[0].value) {
      filtered = filtered.filter((ticket) => {
        return ticket.movieTitle === defaultMovie;
      });
    }

    if (defaultTicketStatus !== ticketStatuses[0].value) {
      filtered = filtered.filter((ticket) => {
        return ticket.status === defaultTicketStatus;
      });
    }
    setTickets(filtered);
  };

  useEffect(() => {
    filterTickets(data);
  }, [defaultMovie, defaultTicketStatus]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ticketInfo, setTicketInfo] = useState({
    movieTitle: "",
    roomName: "",
    seatNumber: "",
    showDate: "",
    showTime: "",
    price: "",
    status: "",
    id: Date.now(),
  });
  
  const entry = useRef({});
  const changeEntry = (value) => {
    entry.current = {
      title: value[0],
      action: value[1],
    };
  };

  const [Delete, setDelete] = useState(false);

  return (
    <div className="w-[100%] h-[100vh] bg-neutral-100 p-5 overflow-auto">
      <Header title={"Ticket Management"} />
      <div>
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <Select
              options={movieOptions}
              defaultValue={defaultMovie}
              setDefault={setDefaultMovie}
              keyStorage={"keyMovie"}
            />
            <Select
              options={ticketStatuses}
              defaultValue={defaultTicketStatus}
              setDefault={setDefaultTicketStatus}
              keyStorage={"keyTicketStatus"}
            />
          </div>
          <button
            className="button flex items-center gap-1"
            onClick={() => {
              setIsModalOpen(true);
              changeEntry(["Add new ticket", "Add"]);
            }}
          >
            <FaPlus />
            Add ticket
          </button>
        </div>
        {!tickets.length ? (
          <p className="text-center font-semibold text-xl">
            Không có vé nào được tìm thấy!!!
          </p>
        ) : (
          <TableTickets
            columnNames={columnNames}
            tickets={tickets}
            setOpen={setIsModalOpen}
            setTicketInfo={setTicketInfo}
            changeEntry={changeEntry}
            handleDelete={handleDelete}
          />
        )}
      </div>
      <AddTicketModal
        title={entry.current.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTicket={handleAddTicket}
        info={ticketInfo}
        setInfo={setTicketInfo}
        Entry={entry.current.action}
      />
    </div>
  );
};

export default Tickets;