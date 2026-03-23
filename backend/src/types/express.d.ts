declare namespace Express {
  interface User {
    id: string;
    githubId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }
}
