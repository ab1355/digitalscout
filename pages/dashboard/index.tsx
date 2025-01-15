import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { BadgeCard } from '../../components/dashboard/BadgeCard';
import { ChallengeCard } from '../../components/dashboard/ChallengeCard';
import { Badge, Challenge } from '@prisma/client';

interface DashboardProps {
  badges: Badge[];
  inProgressChallenges: Challenge[];
}

export default function Dashboard({ badges, inProgressChallenges }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    completedChallenges: 0,
    earnedBadges: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/users/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Points
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.totalPoints}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Completed Challenges
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.completedChallenges}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Earned Badges
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.earnedBadges}
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Badges</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} earned />
          ))}
        </div>
      </div>

      {/* In Progress Challenges */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Challenges In Progress
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {inProgressChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              progress={{
                status: 'in_progress',
                currentStep: 1, // This should come from the actual progress data
              }}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This would normally fetch data from your API
  // For now, we'll return empty arrays
  return {
    props: {
      badges: [],
      inProgressChallenges: [],
    },
  };
};
