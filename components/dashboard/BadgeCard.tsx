import React from 'react';
import Image from 'next/image';
import { Badge } from '@prisma/client';

interface BadgeCardProps {
  badge: Badge & {
    _count?: {
      users: number;
    };
  };
  earned?: boolean;
}

export function BadgeCard({ badge, earned }: BadgeCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      earned ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="p-4">
        <div className="relative w-full h-40 mb-4">
          <Image
            src={badge.imageUrl}
            alt={badge.name}
            fill
            className="object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {badge.name}
          {earned && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Earned
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="capitalize">{badge.category}</span>
          <span className="capitalize">{badge.level}</span>
        </div>
        {badge._count && (
          <div className="mt-2 text-sm text-gray-500">
            {badge._count.users} scouts earned this badge
          </div>
        )}
      </div>
    </div>
  );
}
