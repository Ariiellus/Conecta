"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const cryptoData = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 45000, holdings: 0.5, change: 2.5 },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3200, holdings: 3.2, change: -1.2 },
  { id: 3, name: 'Cardano', symbol: 'ADA', price: 1.2, holdings: 1000, change: 5.7 },
];

const chartData = [
  { date: '2024-01', value: 40000 },
  { date: '2024-02', value: 45000 },
  { date: '2024-03', value: 42000 },
  { date: '2024-04', value: 47000 },
  { date: '2024-05', value: 45000 },
];

export function Portfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');
  
  const totalValue = cryptoData.reduce((acc, crypto) => 
    acc + (crypto.price * crypto.holdings), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Crypto Portfolio</h2>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'portfolio' ? 'default' : 'outline'}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </Button>
          <Button 
            variant={activeTab === 'trade' ? 'default' : 'outline'}
            onClick={() => setActiveTab('trade')}
          >
            Trade
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-500">Total Balance</h3>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          <p className="text-sm text-green-500">+3.2% (24h)</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-gray-500">Active Positions</h3>
          <p className="text-2xl font-bold">{cryptoData.length}</p>
          <p className="text-sm text-gray-500">Across {cryptoData.length} assets</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-gray-500">Best Performer</h3>
          <p className="text-2xl font-bold">MXN</p>
          <p className="text-sm text-green-500">+5.7% (24h)</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
        <div className="h-[300px]">
          <div className="h-full w-full">
            <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Assets</h3>
        <div className="divide-y">
          {cryptoData.map((crypto) => (
            <div key={crypto.id} className="py-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{crypto.name}</h4>
                <p className="text-sm text-gray-500">{crypto.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ${(crypto.price * crypto.holdings).toLocaleString()}
                </p>
                <p className={`text-sm ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
