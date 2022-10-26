var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var table = document.getElementById('root');
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var res, seats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('/seats')];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    seats = (_a.sent());
                    seats.sort(function (a, b) { return a.id - b.id; });
                    createTable(seats);
                    table === null || table === void 0 ? void 0 : table.addEventListener('click', handleSeatClick);
                    return [2 /*return*/];
            }
        });
    });
}
var SEATS_PER_ROW = 10;
function createTable(seats) {
    var _loop_1 = function (row) {
        var tr = document.createElement('tr');
        var rowSeats = seats.slice(SEATS_PER_ROW * row, SEATS_PER_ROW * (row + 1));
        rowSeats.forEach(function (seat) {
            var td = document.createElement('td');
            td.classList.add('seat');
            if (seat.is_booked) {
                td.classList.add('booked');
            }
            td.textContent = seat.id.toString();
            td.title = seat.name;
            tr.appendChild(td);
        });
        table === null || table === void 0 ? void 0 : table.appendChild(tr);
    };
    for (var row = 0; row < seats.length / SEATS_PER_ROW; row++) {
        _loop_1(row);
    }
}
function handleSeatClick(e) {
    return __awaiter(this, void 0, void 0, function () {
        var id, name_1, res, resJson, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    id = e.target.textContent;
                    name_1 = prompt('Enter your name');
                    return [4 /*yield*/, fetch("/".concat(id, "/").concat(name_1), { method: 'PUT' })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    resJson = _a.sent();
                    if (resJson.error) {
                        alert("Could not book the seat ".concat(id));
                    }
                    else {
                        alert("Booked the seat ".concat(id));
                        e.target.classList.add('booked');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    alert('Error: ' + err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
run();
