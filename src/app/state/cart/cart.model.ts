export interface CartItem {
    id: number;
    productId: number;
    title: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
    loading: boolean;
    error: string | null;
}

export const initialCartState: CartState = {
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
};
