export interface Guard {
  canActivate(): Promise<boolean> | boolean;

  redirectUrl?: string;
}
