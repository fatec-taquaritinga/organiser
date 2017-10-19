declare module 'organiser' {

  export function GET ();
  
  export function HEAD ();
  
  export function POST ();
  
  export function PUT ();
  
  export function DELETE ();
  
  export function OPTIONS ();
  
  export function TRACE ();
  
  export function PATCH ();

  export function Arguments (...args: any[]);

  export function Path (path: string)

  export function EventHandler (eventType: string | (() => void) | object);

  export function ModulesAfter (modules: ((context) => void)[])

  export function ModulesBefore (modules: ((context) => void)[])

  export namespace Modules {
    export function bodyParser(): (context: object) => void;
    export function rawBodyParser(): (context: object) => void;
  }

  export class ResponseBuilder {
    constructor(statusCode: number, mediaType: string, entity: object | string);
    build(): Response;
    status(status: number);
    entity(entity: object | string);
    type(mediaType: string);
    cookie(...cookies: any[]);
    expires(date: Date);
    lastModified(date: Date);
    encoding(encoding: string);
    header(key: string, value: string);
  }
  
  export class Response {
    constructor(builder: ResponseBuilder);
    edit(): ResponseBuilder;
    static fromResponse: (response: Response) => ResponseBuilder;
    static accepted: (entity?: object | string, mediaType?: string) => ResponseBuilder;
    static badRequest: (entity?: object | string, mediaType?: string) => ResponseBuilder;
    static noContent: (mediaType?: string) => ResponseBuilder;
    static notFound: (entity?: object | string, mediaType?: string) => ResponseBuilder;
    static ok: (entity?: object | string, mediaType?: string) => ResponseBuilder;
    static redirect: (uri: string) => ResponseBuilder;
    static serverError: (mediaType?: string) => ResponseBuilder;
    static status: (status: number) => ResponseBuilder;
    static static: (file: | string, mediaType?: string) => ResponseBuilder;
    static Status: HttpStatus;
    static MediaType: MediaType;
  }

  export enum ServerStatus {
    SERVER_CLOSE = 'SERVER_CLOSE',
    SERVER_OPEN = 'SERVER_OPEN',
    SERVER_BOOT = 'SERVER_BOOT',
    SERVER_SHUTDOWN = 'SERVER_SHUTDOWN'
  }

  export enum MediaType {
    APPLICATION_ATOM_XML = 'application/atom+xml',
    APPLICATION_JSON = 'application/json',
    APPLICATION_FORM_URLENCODED = 'application/x-www-form-urlencoded',
    APPLICATION_OCTET_STREAM = 'application/octet-stream',
    APPLICATION_PDF = 'application/pdf',
    APPLICATION_RSS_XML = 'application/rss+xml',
    APPLICATION_XHTML_XML = 'application/xhtml+xml',
    APPLICATION_XML = 'application/xml',
    IMAGE_GIF = 'image/gif',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    MULTIPART_FORM_DATA = 'multipart/form-data',
    TEXT_EVENT_STREAM = 'text/event-stream',
    TEXT_HTML = 'text/html',
    TEXT_MARKDOWN = 'text/markdown',
    TEXT_PLAIN = 'text/plain',
    TEXT_XML = 'text/xml'
  }

  export enum HttpStatus {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    REQUEST_URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IM_A_TEAPOT = 418, // lol
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    CONNECTION_CLOSED_WITHOUT_RESPONSE = 444,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
    CLIENT_CLOSED_REQUEST = 499,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENTE_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
    NETWORK_CONNECT_TIMEOUT_ERROR = 599
  }

  export enum Types {
    UUID = 'uuid',
    STRING = 'string',
    BOOLEAN = 'boolean',
    INTEGER = 'integer',
    DOUBLE = 'double',
    FLOAT = 'float',
    DATE = 'date',
    CLIENT_REQUEST = 'clientRequest',
    SERVER_RESPONSE = 'serverResponse',
  }
  
  export class Server {
    constructor(options?: Server.ServerOptions);
    status: string;
    isRunning: boolean;
    options(options?: Server.ServerOptions): void | Server.ServerOptions;
    routes(...routes: any[]): Router.RouterModules;
    modules(...modules: ((context) => void)[]): Router.RouterModules;
    registerListener(eventType: string, listener: () => void | object);
    removeListener(eventType: string, listener: () => void | object);
    emitEvent(eventType: string, event: object);
    boot(): Promise<string>;
    close(): Promise<string>;
    reboot(): void;
  }

  namespace Router {

    interface RouterModules {
      after(...modules: ((context) => void)[]): RouterModules;
      before(...modules: ((context) => void)[]): RouterModules;
    }

  }
  
  namespace Server {
  
    interface ServerOptions {
      name?: string;
      host?: string;
      port?: number;
      internal?: InternalServerOptions;
    }
  
    interface InternalServerOptions {
      debug?: boolean;
    }
  
  }
  
}
