import React from 'react';
import Link from 'next/link';
import { Challenge, Badge } from '@prisma/client';

interface ChallengeCardProps {
  challenge: Challenge & {
    badge: Badge;
    _count?: {
      progress: number;
    };
  };
  progress?: {
    status: string;
    currentStep: number;
  };
}

export function ChallengeCard({ challenge, progress }: ChallengeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {challenge.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mb-2">
                {challenge.points} points
              </span>
              {progress && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    progress.status
                  )}`}
                >
                  {progress.status === 'in_progress'
                    ? `Step ${progress.currentStep}`
                    : progress.status}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="capitalize">{challenge.category}</span>
              <span className="capitalize">{challenge.difficulty}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {challenge.badge.name}
              </span>
            </div>
          </div>
          {challenge._count && (
            <div className="mt-2 text-sm text-gray-500">
              {challenge._count.progress} scouts attempted this challenge
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
