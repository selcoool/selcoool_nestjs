// import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Socket } from 'socket.io';

// // @WebSocketGateway(9000, {
// //   cors: {
// //     origin: '*', // Allow all origins for testing purposes (modify for production)
// //   },
// // })


// @WebSocketGateway({
//   namespace: 'chat', // Specify the namespace here
//   cors: {
//     origin: '*', // Allow all origins (for testing; use specific origins in production)
//     methods: ['GET', 'POST'], // Allowed methods
//     credentials: true, // Allow credentials if needed
//   },
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

//   // When a client connects
//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   // When a client disconnects
//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   // Handle custom message events
//   @SubscribeMessage('message')
//   handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
//     console.log(`Received message: ${data} from client: ${client.id}`);
//     return `Hello from server: ${data}`;
//   }
// }


import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Message {
  id: string;
  roomId: string;
  sender: string;
  content: string;
}

// @WebSocketGateway(3002, { cors: { origin: '*' } })

@WebSocketGateway({
  namespace: 'chat', // Specify the namespace here
  cors: {
    origin: '*', // Allow all origins (for testing; use specific origins in production)
    methods: ['GET', 'POST'], // Allowed methods
    credentials: true, // Allow credentials if needed
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private clients: { [id: string]: string } = {};
  private clientRooms: { [id: string]: string } = {};
  private onlineUsers: { [roomId: string]: string[] } = {};
  private messages: Message[] = []; // Stores messages with IDs

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const username = client.handshake.query.username as string;
    this.clients[client.id] = username;
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomId = this.clientRooms[client.id];
    const username = this.clients[client.id];

    if (roomId) {
      client.leave(roomId);
      this.onlineUsers[roomId] = this.onlineUsers[roomId].filter(id => id !== client.id);

      this.server.to(roomId).emit('message', {
        sender: username,
        message: `${username} has left the room.`,
        roomId,
      });

      this.server.to(roomId).emit('update_online', this.onlineUsers[roomId].map(id => this.clients[id]));
    }

    delete this.clients[client.id];
    delete this.clientRooms[client.id];
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, { roomId, username }: { roomId: string; username: string }) {
    if (this.clientRooms[client.id]) {
      client.emit('message', {
        sender: username,
        message: 'You are already in a room!',
        roomId,
      });
      return;
    }

    client.join(roomId);
    this.clientRooms[client.id] = roomId;

    if (!this.onlineUsers[roomId]) {
      this.onlineUsers[roomId] = [];
    }
    this.onlineUsers[roomId].push(client.id);

    console.log(`${username} joined room ${roomId}`);

    this.server.to(roomId).emit('message', {
      sender: username,
      message: `${username} has joined the room.`,
      roomId,
    });

    this.server.to(roomId).emit('update_online', this.onlineUsers[roomId].map(id => this.clients[id]));
  }

  // Create Message
  @SubscribeMessage('create_message')
  handleCreateMessage(client: Socket, { roomId, content }: { roomId: string; content: string }) {
    const username = this.clients[client.id];
    const message: Message = {
      id: client.id + Date.now().toString(), // Unique ID
      roomId,
      sender: username,
      content,
    };

    if (this.clientRooms[client.id] === roomId) {
      this.messages.push(message); // Store message
      this.server.to(roomId).emit('message', message);
    } else {
      client.emit('message', {
        sender: username,
        message: 'You are not in the correct room to send messages.',
        roomId,
      });
    }
  }

  // Read All Messages in a Room
  @SubscribeMessage('get_messages')
  handleGetMessages(client: Socket, { roomId }: { roomId: string }) {
    const roomMessages = this.messages.filter(msg => msg.roomId === roomId);
    client.emit('load_messages', roomMessages);
  }

  // Update Message
  @SubscribeMessage('update_message')
  handleUpdateMessage(client: Socket, { messageId, newContent }: { messageId: string; newContent: string }) {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message && message.sender === this.clients[client.id]) {
      message.content = newContent;
      this.server.to(message.roomId).emit('message_updated', message);
    } else {
      client.emit('error', 'Message not found or unauthorized');
    }
  }

  // Delete Message
  @SubscribeMessage('delete_message')
  handleDeleteMessage(client: Socket, { messageId }: { messageId: string }) {
    const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1 && this.messages[messageIndex].sender === this.clients[client.id]) {
      const [deletedMessage] = this.messages.splice(messageIndex, 1);
      this.server.to(deletedMessage.roomId).emit('message_deleted', { id: messageId });
    } else {
      client.emit('error', 'Message not found or unauthorized');
    }
  }
}
  