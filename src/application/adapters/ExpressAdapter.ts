import express, { Express, Request, Response } from 'express';
import HttpServer from '../ports/HttpServer';
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from '../../swagger.json';

export default class ExpressAdapter implements HttpServer {
  server: any;
  private httpServer: any;
  private methodMap: { [key: string]: Function };

  constructor() {
    this.server = express();
    this.methodMap = {
      get: this.server.get.bind(this.server),
      post: this.server.post.bind(this.server),
      put: this.server.put.bind(this.server),
      delete: this.server.delete.bind(this.server),
      patch: this.server.patch.bind(this.server),
    };
    this.middleware();
  }

  listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer = this.server.listen(port, () => {
        resolve();
      });
      this.httpServer.on('error', reject);
    });
  }

  private middleware() {
    this.server.use(express.json());
    this.server.use(
      '/api-docs',
      swaggerUI.serve,
      swaggerUI.setup(swaggerDocument),
    );
    // this.server.use(verifyToken); //TODO voltar com token
  }

  public router(route: any) {
    this.server.use(route);
  }

  async register(
    method: string,
    url: string,
    callback: (req: Request, res: Response) => Promise<void>,
  ): Promise<void> {
    const expressMethod = this.methodMap[method.toLowerCase()];

    if (expressMethod) {
      expressMethod(url, async (req: Request, res: Response) => {
        await callback(req, res);
      });
    } else {
      throw new Error(`Invalid method: ${method}`);
    }
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close((err: any) => {
          if (err) {
            reject(err);
            return;
          }
          this.httpServer = null;
          resolve();
        });
      } else {
        resolve(); // Resolve immediately if the server is not started
      }
    });
  }

  isRunning(): boolean {
    return this.httpServer?.listening ?? false;
  }

  isRunningOnPort(port: number): boolean {
    return this.isRunning() && this.httpServer?.address()?.port === port;
  }

  getServer(): Express {
    return this.server;
  }
}
