// frontend/web-app/src/components/ui/__tests__/StatCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { LayoutDashboard } from 'lucide-react';

describe('StatCard', () => {
  it('renders with title and value', () => {
    render(<StatCard title="Active Users" value="1,234" />);
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<StatCard title="Active Users" value="1,234" icon={<LayoutDashboard data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with trend data', () => {
    render(
      <StatCard
        title="Revenue"
        value="$100k"
        trend={{ value: 5, label: 'vs last month', direction: 'up' }}
      />
    );
    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toHaveClass('text-green-400');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<StatCard title="Clickable" value="Value" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button', { name: /clickable/i })); // Find the button by its accessible name
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
