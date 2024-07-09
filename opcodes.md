# Opcodes

### Opcode 0
	Message that will be relayed to all clients
`{"opcode":0, data: {"opcode": 0, ...}}`

### Opcode 1
	A gateway message that will be decoded and sent to all clients.
	Has own opcode property:
	Opcode 0 is for setting encoding and compression of the gateway
	Opcode 1 is for `webSocketFrameReceived` sending a encoded/compressed message and decoded message will be sent to all clients.
	format: {"opcode": opcode, "data": {opcode: 1, ...}}
	Opcode 2 is for `webSocketFrameSent` sending a encoded/compressed message and decoded message will be sent to all clients.
	format: {"opcode": opcode, "data": {opcode: 2, ...}}

`{"opcode":0, data: {"opcode": 0}, ...}`
