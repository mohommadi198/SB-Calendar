declare module 'react-onesignal' {
  interface IOneSignal {
    init(options: any): Promise<void>;
    on(event: string, callback: () => void): void;
    off(event: string, callback: () => void): void;
    getUserId(callback: (userId: string) => void): void;
    getNotificationPermission(callback: (permission: string) => void): void;
    push(item: any): void;
    SlidingGuys: {
        show(options?: any): void;
    };
    Notifications: {
        requestPermission(): Promise<void>;
        permission: string;
    }
  }
  const OneSignal: IOneSignal;
  export default OneSignal;
}
