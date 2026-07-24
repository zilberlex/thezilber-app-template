export type Initializable<T> = T & { isInitialized: boolean };

export type DistributiveOmit<T, Keys extends PropertyKey> = T extends unknown ? Omit<T, Keys> : never;
