import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    distributorProductId: string;
    productId: string;
    name: string;
    ptr: number;
    quantity: number;
    distributorId: string;
    distributorName: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (newItem) => set((state) => {
                const existing = state.items.find(i => i.distributorProductId === newItem.distributorProductId);
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.distributorProductId === newItem.distributorProductId
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        )
                    };
                }
                return { items: [...state.items, newItem] };
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(i => i.distributorProductId !== id)
            })),
            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(i => i.distributorProductId === id ? { ...i, quantity } : i)
            })),
            clearCart: () => set({ items: [] }),
        }),
        { name: 'pharma-cart' }
    )
);
