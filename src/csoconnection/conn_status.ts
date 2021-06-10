export enum Status {
  // StatusPrepare is status when the connection is setting up.
  StatusPrepare = 0,

  // StatusConnecting is status when the connection is connecting to server.
  StatusConnecting = 1,

  // StatusConnected is status when the connection connected to server.
  StatusConnected = 2,

  // StatusDisconnected is status when the connection closed.
  StatusDisconnected = 3,
}
