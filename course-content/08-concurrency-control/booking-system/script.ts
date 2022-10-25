interface Seat {
  id: number;
  is_booked: boolean;
  name: string;
}

async function run() {
  const res = await fetch('/seats');
  const seats = (await res.json()) as Seat[];
  seats.sort((a, b) => a.id - b.id);

  createTable(seats);
}

function createTable(seats: Seat[]) {
  const table = document.getElementById('root');
  for (let row = 0; row < seats.length / 3; row++) {
    const tr = document.createElement('tr');
    const rowSeats = seats.slice(3 * row, 3 * (row + 1));
    rowSeats.forEach((seat) => {
      const td = document.createElement('td');
      td.classList.add('seat');
      td.textContent = seat.id.toString();
      td.title = seat.name;
      tr.appendChild(td);
    });
    table?.appendChild(tr);
  }
}

run();
