"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch('/seats');
        const seats = (yield res.json());
        seats.sort((a, b) => a.id - b.id);
        createTable(seats);
    });
}
function createTable(seats) {
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
        table === null || table === void 0 ? void 0 : table.appendChild(tr);
    }
}
run();
