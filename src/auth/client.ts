import {
  challengeSchema,
  sessionSchema,
  userSchema,
  errorSchema,
  type Challenge,
  type User,
  type MobileRole,
} from './contracts';
export interface CredentialStorage {
  get(): Promise<string | null>;
  set(value: string): Promise<void>;
  clear(): Promise<void>;
}
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly retryAfter = 0,
  ) {
    super(
      code === 'INVALID_CHALLENGE'
        ? 'The code is invalid, expired, or already used. Request a new code if needed.'
        : code === 'RATE_LIMITED'
          ? 'Too many attempts. Please wait before trying again.'
          : status === 401 || status === 403
            ? 'Your session expired. Please sign in again.'
            : status === 400
              ? 'Check your phone number or six-digit code.'
              : 'Unable to connect. Check your connection and try again.',
    );
  }
}
export class AuthClient {
  private accessToken: string | null = null;
  private refreshFlight: Promise<User> | null = null;
  constructor(
    readonly role: MobileRole,
    readonly apiUrl: string,
    private readonly storage: CredentialStorage,
    private readonly transport: typeof fetch = (input, init) => fetch(input, init),
  ) {}
  private async request(path: string, method = 'GET', body?: unknown, authenticated = false) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await this.transport(`${this.apiUrl.replace(/\/$/, '')}/v1/auth/${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authenticated && this.accessToken
            ? { Authorization: `Bearer ${this.accessToken}` }
            : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const error = errorSchema.safeParse(await response.json().catch(() => null));
        throw new ApiError(
          response.status,
          error.success ? error.data.code : 'REQUEST_FAILED',
          Number(response.headers.get('retry-after') ?? 0),
        );
      }
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeout);
    }
  }
  private user(input: unknown): User {
    const result = userSchema.safeParse(input);
    if (!result.success || result.data.role !== this.role)
      throw new ApiError(0, 'INVALID_RESPONSE');
    return result.data;
  }
  private async accept(input: unknown): Promise<User> {
    const result = sessionSchema.safeParse(input);
    if (!result.success) throw new ApiError(0, 'INVALID_RESPONSE');
    const user = this.user(result.data.user);
    await this.storage.set(result.data.refreshToken);
    this.accessToken = result.data.accessToken;
    return user;
  }
  async begin(phone: string): Promise<Challenge> {
    const result = challengeSchema.safeParse(
      await this.request('otp/request', 'POST', { phone, purpose: `${this.role}_LOGIN` }),
    );
    if (!result.success) throw new ApiError(0, 'INVALID_RESPONSE');
    return result.data;
  }
  async verify(challenge: Challenge, code: string) {
    return this.accept(
      await this.request('otp/verify', 'POST', {
        challengeId: challenge.challengeId,
        challengeToken: challenge.challengeToken,
        code,
      }),
    );
  }
  private async clear() {
    this.accessToken = null;
    await this.storage.clear();
  }
  async refresh(): Promise<User> {
    if (this.refreshFlight) return this.refreshFlight;
    this.refreshFlight = (async () => {
      const credential = await this.storage.get();
      if (!credential) throw new ApiError(401, 'INVALID_SESSION');
      try {
        return await this.accept(
          await this.request('refresh', 'POST', { refreshToken: credential }),
        );
      } catch (error) {
        if (error instanceof ApiError && [401, 403].includes(error.status)) await this.clear();
        throw error;
      }
    })();
    try {
      return await this.refreshFlight;
    } finally {
      this.refreshFlight = null;
    }
  }
  async restore(): Promise<User | null> {
    return (await this.storage.get()) ? this.refresh() : null;
  }
  async me(): Promise<User> {
    if (!this.accessToken) await this.refresh();
    try {
      return this.user(await this.request('me', 'GET', undefined, true));
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      await this.refresh();
      return this.user(await this.request('me', 'GET', undefined, true));
    }
  }
  async logout(all = false) {
    try {
      if (!this.accessToken) await this.refresh();
      await this.request(all ? 'logout-all' : 'logout', 'POST', undefined, true);
    } finally {
      await this.clear();
    }
  }
}
