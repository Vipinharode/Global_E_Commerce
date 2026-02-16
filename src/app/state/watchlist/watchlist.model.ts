export interface WatchlistItem {
    productId: number;
    title: string;
    price: number;
    image: string;
}

export interface WatchlistState {
    items: WatchlistItem[];
    loading: boolean;
    error: any;
}
