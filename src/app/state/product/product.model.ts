export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    thumbnail: string;
    images: string[];
    rating: {
        rate: number;
        count: number;
    };
    stock: number;
    availabilityStatus?: string;
    brand?: string;
    discountPercentage?: number;
    returnPolicy?: string;
    reviews?: {
        rating: number;
        comment: string;
        date: string;
        reviewerName: string;
        reviewerEmail: string;
    }[];
    shippingInformation?: string;
    warrantyInformation?: string;
}

export interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
    filters: {
        category: string;
        minPrice: number;
        maxPrice: number;
        searchTerm: string;
    };
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
    };
}

export const initialProductState: ProductState = {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    filters: {
        category: '',
        minPrice: 0,
        maxPrice: 10000,
        searchTerm: '',
    },
    pagination: {
        currentPage: 1,
        pageSize: 25,
        totalItems: 0,
    },
};
