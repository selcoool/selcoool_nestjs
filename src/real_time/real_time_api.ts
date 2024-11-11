import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealTimeService } from './real_time.service';
import { ChatMessageDto } from './dtos/chat.dto';

@WebSocketGateway({
  namespace: 'real_time_api',
  cors: {
    origin:["http://localhost:3000","https://selcoool.com"], //frontend url
    credentials: true,
    allowedHeaders:'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders:'Content-Range, X-Content-Range'
  },
})
export class Real_Time_Gateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly realTimeService: RealTimeService) {}

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() messageData: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { username, message, roomId } = messageData;

    if (!client.rooms.has(roomId)) {
      client.join(roomId);
      console.log(`Client ${client.id} joined room: ${roomId}`);
    }

    const newMessage = await this.realTimeService.createMessage(
      username,
      message,
      roomId,
    );

    this.server.to(roomId).emit('newMessage1', newMessage);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    if (roomId && !client.rooms.has(roomId)) {
      client.join(roomId);
      console.log(`Client ${client.id} joined room: ${roomId}`);
      client.emit('joinedRoom', roomId);


      const allMessges = await this.realTimeService.getMessagesByRoom(
        roomId
      );

      this.server.to(roomId).emit('allMessges', allMessges);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    if (client.rooms.has(roomId)) {
      client.leave(roomId);
      console.log(`Client ${client.id} left room: ${roomId}`);
      client.emit('leftRoom', roomId);
    }
  }
}





// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayInit,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { RealTimeService } from './real_time.service';
// import { ChatMessageDto } from './dtos/chat.dto';

// @WebSocketGateway({
//   namespace: 'real_time_api',
//   cors: {
//     origin: '*',
//   },
// })
// export class Real_Time_Gateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer() server: Server;

//   constructor(private readonly realTimeService: RealTimeService) {}

//   afterInit(server: Server) {
//     console.log('WebSocket gateway initialized');
//   }

//   // Handle new client connection
//   async handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   // Handle client disconnection
//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   // Handle receiving a new message
//   @SubscribeMessage('newMessage')
//   async handleNewMessage(
//     @MessageBody() messageData: ChatMessageDto,
//     @ConnectedSocket() client: Socket,
//   ) {
//     const { username, message, roomId } = messageData;

//     // Ensure that client is in a room
//     if (!client.rooms.has(roomId)) {
//       client.join(roomId); // Join the room if not already joined
//       console.log(`Client ${client.id} joined room: ${roomId}`);
//     }

//     // Save the new message
//     const newMessage = await this.realTimeService.createMessage(
//       username,
//       message,
//       roomId,
//     );

//     // Emit the new message to all clients in the room
//     this.server.to(roomId).emit('newMessage', newMessage);
//   }

//   // Handle joining a room
//   @SubscribeMessage('joinRoom')
//   handleJoinRoom(
//     @MessageBody() data: { roomId: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     const { roomId } = data;
//     if (roomId && !client.rooms.has(roomId)) {
//       client.join(roomId); // Join the room if not already joined
//       console.log(`Client ${client.id} joined room: ${roomId}`);
//     }
//   }
// }







// import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import * as fs from 'fs';
// import * as path from 'path';



// @WebSocketGateway({
//     namespace: 'real_time_api', // Specify the namespace here
//     cors: {
//       origin: '*', // Allow all origins (for testing; use specific origins in production)
//       // methods: ['GET', 'POST'], // Allowed methods
//       // credentials: true, // Allow credentials if needed
//     },
//   })
// export class Real_Time_Gateway  implements OnGatewayConnection, OnGatewayDisconnect  {
//   @WebSocketServer()
//   server: Server;
//   private clients: { [id: string]: string } = {}; // Store client IDs and usernames


//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//     const username = client.handshake.query.username as string; // Get username from query
//     this.clients[client.id] = username; // Store username
//     this.server.emit('user_connected', { id: client.id, username }); // Notify all clients
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     const username = this.clients[client.id];
//     this.server.emit('user_disconnected', { id: client.id, username }); // Notify all clients
//     delete this.clients[client.id]; // Remove client from the list
//   }

//   // Handle incoming image file as a binary stream
//   @SubscribeMessage('upload_image')
//   async handleFileUpload(client: Socket, buffer: Buffer) {
//     try {
//       console.log('File received:', buffer);
//       const uploadsDir = path.join(__dirname, '../../uploads');
//       const filePath = path.join(uploadsDir, `${Date.now()}-image.jpg`);
 
//       // Check if the uploads directory exists, and create it if necessary
//       if (!fs.existsSync(uploadsDir)) {
//         console.log('Uploads directory does not exist. Creating...');
//         fs.mkdirSync(uploadsDir, { recursive: true }); // Create the directory and any missing parent directories
//       }

//       // Write the binary data to a file
//       fs.writeFile(filePath, buffer, (err) => {
//         if (err) {
//           console.error('Error saving file:', err);
//           client.emit('upload_error', 'Error saving file.');
//         } else {
//           console.log('File saved successfully at:', filePath);
//           client.emit('upload_success', `File uploaded successfully at ${filePath}`);
//         }
//       });
//     } catch (error) {
//       console.error('Error during file upload:', error);
//       client.emit('upload_error', 'An error occurred during file upload.');
//     }
//   }
// }






