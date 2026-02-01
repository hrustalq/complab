'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Address } from './schemas';

interface UserState {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setAddresses: (addresses: Address[]) => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, data: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
      
      setAddresses: (addresses) => {
        set({ addresses });
      },
      
      login: (user) => {
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, addresses: [], isAuthenticated: false });
      },
      
      updateProfile: (data) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },
      
      addAddress: (address) => {
        set((state) => ({
          addresses: [...state.addresses, address],
        }));
      },
      
      updateAddress: (id, data) => {
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === id ? { ...addr, ...data } : addr
          ),
        }));
      },
      
      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== id),
        }));
      },
      
      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          })),
        }));
      },
    }),
    {
      name: 'complab-user',
    }
  )
);
