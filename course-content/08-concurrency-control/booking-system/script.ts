interface Seat {
  id: number;
  is_booked: boolean;
  name: string;
}

const table = document.getElementById('root');

async function run() {
  const res = await fetch('/seats');
  const seats = (await res.json()) as Seat[];
  seats.sort((a, b) => a.id - b.id);

  createTable(seats);
  table?.addEventListener('click', handleSeatClick);
}

const SEATS_PER_ROW = 10;

function createTable(seats: Seat[]) {
  for (let row = 0; row < seats.length / SEATS_PER_ROW; row++) {
    const tr = document.createElement('tr');
    const rowSeats = seats.slice(
      SEATS_PER_ROW * row,
      SEATS_PER_ROW * (row + 1)
    );
    rowSeats.forEach((seat) => {
      const td = document.createElement('td');
      td.classList.add('seat');
      if (seat.is_booked) {
        td.classList.add('booked');
      }
      td.textContent = seat.id.toString();
      td.title = seat.name;
      tr.appendChild(td);
    });
    table?.appendChild(tr);
  }
}

async function handleSeatClick(e: Event) {
  try {
    const id = (e.target as HTMLTableCellElement).textContent;
    const name = prompt('Enter your name');
    const res = await fetch(`/${id}/${name}`, { method: 'PUT' });
    const resJson = await res.json();
    if (resJson.error) {
      alert(`Could not book the seat ${id}`);
    } else {
      alert(`Booked the seat ${id}`);
      (e.target as HTMLTableCellElement).classList.add('booked');
    }
  } catch (err) {
    alert('Error: ' + err);
  }
}

run();
