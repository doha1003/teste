import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { Download, Plus, Settings, Heart, Star } from 'lucide-react';

import { Button } from '../src/components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Button 컴포넌트**는 사용자의 액션을 위한 핵심 인터랙션 요소입니다.

- 6가지 variant (primary, secondary, destructive, outline, ghost, link)
- 5가지 size (sm, base, lg, xl, icon)
- 로딩 상태 지원
- 좌우 아이콘 지원
- 완벽한 접근성 (ARIA) 준수
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: '버튼의 시각적 스타일을 결정합니다.',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'base', 'lg', 'xl', 'icon'],
      description: '버튼의 크기를 결정합니다.',
    },
    loading: {
      control: 'boolean',
      description: '로딩 상태를 표시합니다. true일 때 스피너가 표시되고 버튼이 비활성화됩니다.',
    },
    disabled: {
      control: 'boolean',
      description: '버튼을 비활성화합니다.',
    },
    asChild: {
      control: 'boolean',
      description: '자식 요소를 버튼으로 렌더링합니다.',
    },
    children: {
      control: 'text',
      description: '버튼 내부에 표시될 텍스트입니다.',
    },
    className: {
      control: 'text',
      description: '추가적인 CSS 클래스를 적용합니다.',
    },
  },
  args: {
    onClick: () => {},
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리
export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'base',
  },
};

// Variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Account',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large Button',
  },
};

export const IconButton: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: <Settings className="h-4 w-4" />,
    'aria-label': 'Settings',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Download className="h-4 w-4" />,
    children: 'Download',
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: <Plus className="h-4 w-4" />,
    children: 'Add Item',
  },
};

export const WithBothIcons: Story = {
  args: {
    variant: 'outline',
    leftIcon: <Heart className="h-4 w-4" />,
    rightIcon: <Star className="h-4 w-4" />,
    children: 'Like & Star',
  },
};

// States
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const LoadingWithIcon: Story = {
  args: {
    loading: true,
    variant: 'destructive',
    leftIcon: <Download className="h-4 w-4" />,
    children: 'Processing...',
  },
};

// All Variants in One Story
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '모든 variant를 한번에 확인할 수 있습니다.',
      },
    },
  },
};

// All Sizes in One Story
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="base">Base</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
      <Button size="icon" variant="outline">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '모든 size를 한번에 확인할 수 있습니다.',
      },
    },
  },
}; 