import { createReducer, on } from '@ngrx/store';
import { initialCartState, CartItem } from './cart.model';
import * as CartActions from './cart.actions';

function calculateTotals(items: CartItem[]) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
}

export const cartReducer = createReducer(
    initialCartState,

    on(CartActions.addToCart, (state, { item }) => {
        const existingItem = state.items.find(i => i.productId === item.productId);

        let newItems: CartItem[];
        if (existingItem) {
            newItems = state.items.map(i =>
                i.productId === item.productId
                    ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                    : i
            );
        } else {
            const newItem: CartItem = {
                id: Date.now(),
                productId: item.productId,
                title: item.title,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image,
            };
            newItems = [...state.items, newItem];
        }

        const { total, itemCount } = calculateTotals(newItems);

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newItems));

        return {
            ...state,
            items: newItems,
            total,
            itemCount,
        };
    }),

    on(CartActions.removeFromCart, (state, { id }) => {
        const newItems = state.items.filter(item => item.id !== id);
        const { total, itemCount } = calculateTotals(newItems);

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newItems));

        return {
            ...state,
            items: newItems,
            total,
            itemCount,
        };
    }),

    on(CartActions.updateQuantity, (state, { id, quantity }) => {
        if (quantity <= 0) {
            return state;
        }

        const newItems = state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
        );
        const { total, itemCount } = calculateTotals(newItems);

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newItems));

        return {
            ...state,
            items: newItems,
            total,
            itemCount,
        };
    }),

    on(CartActions.clearCart, (state) => {
        localStorage.removeItem('cart');
        return initialCartState;
    }),

    on(CartActions.loadCartSuccess, (state, { items }) => {
        const { total, itemCount } = calculateTotals(items);
        return {
            ...state,
            items,
            total,
            itemCount,
        };
    }),

    on(CartActions.syncCart, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(CartActions.syncCartSuccess, (state) => ({
        ...state,
        loading: false,
    })),

    on(CartActions.syncCartFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    }))
);
