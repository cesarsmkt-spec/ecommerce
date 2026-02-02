// Supabase Configuration
const SUPABASE_URL = 'https://ifsepbolbrpzrvviighx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmc2VwYm9sYnJwenJ2dmlpZ2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NTI1NjYsImV4cCI6MjA1NDAyODU2Nn0.naRT9reFhGd5Tsv9-UxynA_1xafg8O-';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Helper Functions
const DB = {
    // Products
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        return data || [];
    },

    async createProduct(product) {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select();

        if (error) {
            console.error('Error creating product:', error);
            throw error;
        }
        return data[0];
    },

    async updateProduct(id, updates) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }
        return data[0];
    },

    async deleteProduct(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // Categories
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
        return data.map(c => c.name);
    },

    async createCategory(name) {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name }])
            .select();

        if (error) {
            console.error('Error creating category:', error);
            throw error;
        }
        return data[0];
    },

    async deleteCategory(name) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('name', name);

        if (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    // Neighborhoods (Delivery)
    async getNeighborhoods() {
        const { data, error } = await supabase
            .from('neighborhoods')
            .select('*')
            .order('zone', { ascending: true });

        if (error) {
            console.error('Error fetching neighborhoods:', error);
            return [];
        }
        return data || [];
    },

    async createNeighborhood(neighborhood) {
        const { data, error } = await supabase
            .from('neighborhoods')
            .insert([neighborhood])
            .select();

        if (error) {
            console.error('Error creating neighborhood:', error);
            throw error;
        }
        return data[0];
    },

    async updateNeighborhood(id, updates) {
        const { data, error } = await supabase
            .from('neighborhoods')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating neighborhood:', error);
            throw error;
        }
        return data[0];
    },

    async deleteNeighborhood(id) {
        const { error } = await supabase
            .from('neighborhoods')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting neighborhood:', error);
            throw error;
        }
    },

    // Orders
    async getOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data || [];
    },

    async createOrder(order) {
        const { data, error } = await supabase
            .from('orders')
            .insert([order])
            .select();

        if (error) {
            console.error('Error creating order:', error);
            throw error;
        }
        return data[0];
    },

    async deleteOrder(id) {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    },

    // Settings
    async getSettings() {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching settings:', error);
        }
        return data || { whatsapp: '', admin_user: 'ducervejariaadmin', admin_pass: 'ducervejariaadmin' };
    },

    async updateSettings(settings) {
        // First, try to get existing settings
        const { data: existing } = await supabase
            .from('settings')
            .select('id')
            .limit(1)
            .single();

        if (existing) {
            // Update existing
            const { data, error } = await supabase
                .from('settings')
                .update(settings)
                .eq('id', existing.id)
                .select();

            if (error) {
                console.error('Error updating settings:', error);
                throw error;
            }
            return data[0];
        } else {
            // Create new
            const { data, error } = await supabase
                .from('settings')
                .insert([settings])
                .select();

            if (error) {
                console.error('Error creating settings:', error);
                throw error;
            }
            return data[0];
        }
    }
};

// Export for use in other files
window.DB = DB;
window.supabaseClient = supabase;
