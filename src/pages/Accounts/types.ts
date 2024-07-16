import type { Component } from 'vue';

export interface TableAsset {
  symbol: string
  name: string
  price: number
  amount: number
  icon: Component | null
}
