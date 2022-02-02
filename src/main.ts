import { ValidationPipe, WebSocketAdapter } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MessageMappingProperties } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import * as events from 'events';
import { fastifyHelmet } from 'fastify-helmet';

import { createClient } from 'redis';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import * as UWS from 'uWebSockets.js';
import { AppModule } from './app.module';

export const redisUrl =
  process.env.NODE_ENV !== 'production'
    ? 'redis://localhost:6379'
    : process.env.REDIS_URL;

export const redisClient = createClient({
  url: redisUrl,
});

export const redisSocketClient = createClient({
  url: redisUrl,
});

const subClient = redisSocketClient.duplicate();

redisSocketClient.on('error', function (error) {
  console.error(error);
});

export interface ICreateServerArgs {
  port: number;
}
export interface ICreateServerSecureArgs extends ICreateServerArgs {
  sslKey?: string;
  sslCert?: string;
}
export interface ICreateServerOptionsArgs {
  isSSL: boolean;
  port: number;
  sslKey?: string;
  sslCert?: string;
}

export class UWSBuilder {
  static buildSSLApp(params: ICreateServerSecureArgs): UWS.TemplatedApp {
    return UWS.SSLApp({
      cert_file_name: params.sslCert,
      key_file_name: params.sslKey,
    });
  }

  static buildApp(params: ICreateServerArgs): UWS.TemplatedApp {
    return UWS.App();
  }
}

export class UWebSocketAdapter implements WebSocketAdapter {
  private instance: UWS.TemplatedApp = null;
  private listenSocket: string = null;
  private port = 0;

  constructor(args: ICreateServerArgs & ICreateServerSecureArgs) {
    this.port = args.port;
    if (args.sslKey) {
      this.instance = UWSBuilder.buildSSLApp(args as ICreateServerSecureArgs);
    } else {
      this.instance = UWSBuilder.buildApp(args);
    }
  }

  bindClientConnect(
    server: UWS.TemplatedApp,
    callback: (socket: any) => void,
  ): any {
    this.instance
      .ws('/*', {
        maxBackpressure: 2048 * 2048,
        compression: UWS.DEDICATED_COMPRESSOR_128KB,
        open: (socket) => {
          socket.id = randomUUID();

          Object.defineProperty(socket, 'emitter', {
            configurable: false,
            value: new events.EventEmitter(),
          });
          callback(socket);
        },
        message: (socket, message, isBinary) => {
          socket['emitter'].emit('message', { message, isBinary });
        },
      })
      .any('/*', (res, req) => {
        res.end('Nothing to see here!');
      });
  }

  bindMessageHandlers(
    client: UWS.WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): any {
    fromEvent(client['emitter'], 'message')
      .pipe(
        mergeMap((data: { message: ArrayBuffer; isBinary: boolean }) =>
          this.bindMessageHandler(data, handlers, process),
        ),
        filter((result) => result),
      )
      .subscribe((response) => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer: { message: ArrayBuffer; isBinary: boolean },
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const stringMessageData = Buffer.from(buffer.message).toString('utf-8');
    const message = JSON.parse(stringMessageData);
    const messageHandler = handlers.find(
      (handler) => handler.message === message.event,
    );
    if (!messageHandler) {
      console.error('empty');
      return EMPTY;
    }

    return process(messageHandler.callback(message.data));
  }

  close(): any {
    UWS.us_listen_socket_close(this.listenSocket);
    this.instance = null;
  }

  async create(): Promise<UWS.TemplatedApp> {
    return new Promise((resolve, reject) =>
      this.instance.listen(this.port, (token) => {
        if (token) {
          this.listenSocket = token;
          resolve(this.instance);
        } else {
          reject("Can't start listening...");
        }
      }),
    );
  }
}

async function bootstrap() {
  redisClient.on('error', (err) => console.log('Redis Client Error', err));

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [
          `'self'`,
          `'unsafe-inline'`,
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
        ],
        fontSrc: [`'self'`, 'fonts.gstatic.com'],
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(
    new UWebSocketAdapter({
      port: 3001,
      sslCert: process.env.SSL_CERT,
      sslKey: process.env.SSL_KEY,
    }),
  );

  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
