export interface Order {
    id: number;
    userId: number;
    date: string;
    orderDate?: string;  // Alias for date
    products: OrderProduct[];
    items?: OrderProduct[];  // Alias for products
    status: OrderStatus;
    total: number;
    paymentMethod: string;
    shippingAddress: ShippingAddress;
    trackingNumber?: string;
    estimatedDelivery?: string;
}

export interface OrderProduct {
    productId: number;
    quantity: number;
    title: string;
    price: number;
    image: string;
}

export interface ShippingAddress {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    IN_TRANSIT = 'in-transit',
    OUT_FOR_DELIVERY = 'out-for-delivery',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    trackingOrder: Order | null;
    loading: boolean;
    error: string | null;
}

export const initialOrderState: OrderState = {
    orders: [],
    currentOrder: null,
    trackingOrder: null,
    loading: false,
    error: null,
};
