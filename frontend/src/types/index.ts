export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface LoyaltyCard {
  card_number: string;
  points_balance: number;
  tier: 'bronze' | 'silver' | 'gold';
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  stock: number;
}

export interface Transaction {
  id: number;
  store_id: number;
  amount: number;
  points_earned: number;
  created_at: string;
}
