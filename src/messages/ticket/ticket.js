"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
var Ticket = /** @class */ (function () {
    function Ticket() {
    }
    // ParseBytes converts bytes to Ticket
    // ID: 2 bytes
    // Token: next 32 bytes
    Ticket.prototype.ParseBytes = function (buffer) {
        if (buffer.byteLength != 34) {
            return null;
        }
        var temp = new Uint16Array(1);
        temp[0] = (buffer[1] << 8) | buffer[0];
        this.ID = temp[0];
        this.Token = buffer.slice(2);
    };
    // BuildBytes returns bytes of Ticket
    Ticket.prototype.BuildBytes = function (id, token) {
        if (token.byteLength != 32) {
            return null;
        }
        var buffer = new Uint8Array(34);
        buffer[0] = id[0];
        buffer[1] = id[0] >> 8;
        for (var i = 0; i < 32; i++) {
            buffer[i + 2] = token[i];
        }
        return buffer;
    };
    return Ticket;
}());
exports.Ticket = Ticket;
