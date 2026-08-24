import { FacilityCard } from '@/components/facility/FacilityCard';
import { CardSkeletonGrid, EmptyState } from '@/components/ui/Loading';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export const FacilityGrid = ({ facilities, loading, emptyAction }) => {
  if (loading) return <CardSkeletonGrid count={6} />;

  if (!facilities?.length) {
    return (
      <EmptyState
        icon={FaMagnifyingGlass}
        title="No facilities found"
        description="Try adjusting your search, filters, or location to see more results."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map((f) => (
        <FacilityCard key={f._id} facility={f} />
      ))}
    </div>
  );
};
