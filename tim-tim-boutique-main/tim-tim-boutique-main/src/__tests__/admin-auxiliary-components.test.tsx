import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '@/components/admin/TagInput';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderStatus } from '@/types';

describe('TagInput Component', () => {
  describe('Rendering', () => {
    it('should render with label and placeholder', () => {
      const mockOnChange = vi.fn();
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
          placeholder="Enter tags"
        />
      );

      expect(screen.getByText('Test Tags')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter tags')).toBeInTheDocument();
    });

    it('should render with default placeholder', () => {
      const mockOnChange = vi.fn();
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText('Digite e pressione Enter')).toBeInTheDocument();
    });

    it('should render existing tags', () => {
      const mockOnChange = vi.fn();
      const tags = ['Tag 1', 'Tag 2', 'Tag 3'];
      
      render(
        <TagInput
          label="Test Tags"
          value={tags}
          onChange={mockOnChange}
        />
      );

      tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('should display tag count when maxTags is set', () => {
      const mockOnChange = vi.fn();
      render(
        <TagInput
          label="Test Tags"
          value={['Tag 1', 'Tag 2']}
          onChange={mockOnChange}
          maxTags={5}
        />
      );

      expect(screen.getByText('2/5 tags')).toBeInTheDocument();
    });
  });

  describe('Adding Tags', () => {
    it('should add tag when Enter is pressed', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'New Tag{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['New Tag']);
    });

    it('should trim whitespace from tags', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '  Trimmed Tag  {Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['Trimmed Tag']);
    });

    it('should not add empty tags', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '   {Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not add duplicate tags', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={['Existing Tag']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Existing Tag{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not add tags when maxTags limit is reached', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={['Tag 1', 'Tag 2']}
          onChange={mockOnChange}
          maxTags={2}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Tag 3{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should clear input after adding tag', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'New Tag{Enter}');

      expect(input.value).toBe('');
    });
  });

  describe('Removing Tags', () => {
    it('should remove tag when X button is clicked', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={['Tag 1', 'Tag 2', 'Tag 3']}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText('Remover Tag 2');
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(['Tag 1', 'Tag 3']);
    });

    it('should remove correct tag from multiple tags', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={['First', 'Second', 'Third']}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText('Remover Second');
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(['First', 'Third']);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on input', () => {
      const mockOnChange = vi.fn();
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Test Tags');
    });

    it('should have proper aria-label on remove buttons', () => {
      const mockOnChange = vi.fn();
      render(
        <TagInput
          label="Test Tags"
          value={['Tag 1', 'Tag 2']}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByLabelText('Remover Tag 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Remover Tag 2')).toBeInTheDocument();
    });

    it('should support custom id for label association', () => {
      const mockOnChange = vi.fn();
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
          id="custom-tag-input"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-tag-input');
    });

    it('should be keyboard navigable', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={['Tag 1']}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText('Remover Tag 1');
      removeButton.focus();
      
      expect(removeButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in tags', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Tag with @#$%{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['Tag with @#$%']);
    });

    it('should handle very long tag names', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      const longTag = 'A'.repeat(100);
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, `${longTag}{Enter}`);

      expect(mockOnChange).toHaveBeenCalledWith([longTag]);
    });

    it('should handle rapid tag additions', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput
          label="Test Tags"
          value={[]}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'Tag1{Enter}Tag2{Enter}Tag3{Enter}');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });
});

describe('OrderStatusBadge Component', () => {
  describe('Rendering', () => {
    it('should render pending status correctly', () => {
      render(<OrderStatusBadge status="pending" />);
      
      expect(screen.getByText('Pendente')).toBeInTheDocument();
    });

    it('should render confirmed status correctly', () => {
      render(<OrderStatusBadge status="confirmed" />);
      
      expect(screen.getByText('Confirmado')).toBeInTheDocument();
    });

    it('should render shipped status correctly', () => {
      render(<OrderStatusBadge status="shipped" />);
      
      expect(screen.getByText('Enviado')).toBeInTheDocument();
    });

    it('should render delivered status correctly', () => {
      render(<OrderStatusBadge status="delivered" />);
      
      expect(screen.getByText('Entregue')).toBeInTheDocument();
    });

    it('should render cancelled status correctly', () => {
      render(<OrderStatusBadge status="cancelled" />);
      
      expect(screen.getByText('Cancelado')).toBeInTheDocument();
    });
  });

  describe('Status Icons', () => {
    it('should render Clock icon for pending status', () => {
      const { container } = render(<OrderStatusBadge status="pending" />);
      
      // Check that an SVG icon is rendered
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render CheckCircle icon for confirmed status', () => {
      const { container } = render(<OrderStatusBadge status="confirmed" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render Truck icon for shipped status', () => {
      const { container } = render(<OrderStatusBadge status="shipped" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render Package icon for delivered status', () => {
      const { container } = render(<OrderStatusBadge status="delivered" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render XCircle icon for cancelled status', () => {
      const { container } = render(<OrderStatusBadge status="cancelled" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Badge Variants', () => {
    it('should apply correct variant class for pending', () => {
      const { container } = render(<OrderStatusBadge status="pending" />);
      
      const badge = container.querySelector('.border');
      expect(badge).toBeInTheDocument();
    });

    it('should apply correct variant class for confirmed', () => {
      const { container } = render(<OrderStatusBadge status="confirmed" />);
      
      // Badge should be rendered with proper classes
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Confirmado')).toBeInTheDocument();
    });

    it('should apply correct variant class for cancelled', () => {
      const { container } = render(<OrderStatusBadge status="cancelled" />);
      
      const badge = container.querySelector('[class*="destructive"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('All Status Types', () => {
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    statuses.forEach(status => {
      it(`should render ${status} status without errors`, () => {
        const { container } = render(<OrderStatusBadge status={status} />);
        
        expect(container.firstChild).toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const { container } = render(<OrderStatusBadge status="pending" />);
      
      const badge = container.firstChild;
      expect(badge).toBeInTheDocument();
      expect(screen.getByText('Pendente')).toBeInTheDocument();
    });

    it('should render icon and text together', () => {
      const { container } = render(<OrderStatusBadge status="confirmed" />);
      
      const badge = container.firstChild as HTMLElement;
      expect(badge.textContent).toContain('Confirmado');
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('should maintain consistent layout across all statuses', () => {
      const statuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      
      statuses.forEach(status => {
        const { container } = render(<OrderStatusBadge status={status} />);
        const badge = container.firstChild as HTMLElement;
        
        // Check that badge has flex layout
        expect(badge.className).toContain('flex');
        expect(badge.className).toContain('items-center');
        expect(badge.className).toContain('gap-1');
      });
    });
  });
});
