import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { Mail, Lock, Search, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Input } from '../src/components/ui/input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Input 컴포넌트**는 사용자 입력을 받기 위한 폼 요소입니다.

- 3가지 variant (default, error, success)
- 3가지 size (sm, base, lg)
- 라벨 및 헬퍼 텍스트 지원
- 에러 상태 및 메시지 표시
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
      options: ['default', 'error', 'success'],
      description: '입력 필드의 시각적 상태를 결정합니다.',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'base', 'lg'],
      description: '입력 필드의 크기를 결정합니다.',
    },
    label: {
      control: 'text',
      description: '입력 필드의 라벨을 설정합니다.',
    },
    helperText: {
      control: 'text',
      description: '입력 필드 아래에 표시될 도움말 텍스트입니다.',
    },
    error: {
      control: 'text',
      description: '에러 메시지를 설정합니다. 설정되면 variant가 자동으로 error로 변경됩니다.',
    },
    placeholder: {
      control: 'text',
      description: '입력 필드의 플레이스홀더 텍스트입니다.',
    },
    disabled: {
      control: 'boolean',
      description: '입력 필드를 비활성화합니다.',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'search', 'tel', 'url'],
      description: '입력 필드의 타입을 설정합니다.',
    },
  },
  args: {
    onChange: () => {},
    placeholder: 'Enter text...',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리
export const Default: Story = {
  args: {
    placeholder: 'Basic input',
  },
};

// With Label
export const WithLabel: Story = {
  args: {
    label: '이름',
    placeholder: '홍길동',
  },
};

// With Helper Text
export const WithHelperText: Story = {
  args: {
    label: '이메일',
    placeholder: 'example@domain.com',
    helperText: '유효한 이메일 주소를 입력해주세요',
  },
};

// Error State
export const ErrorState: Story = {
  args: {
    label: '비밀번호',
    type: 'password',
    placeholder: '비밀번호를 입력하세요',
    error: '비밀번호는 최소 8자 이상이어야 합니다',
  },
};

// Success State (using variant)
export const SuccessState: Story = {
  args: {
    label: '사용자명',
    placeholder: 'username',
    variant: 'success',
    helperText: '사용 가능한 사용자명입니다',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small Input',
    placeholder: 'Small size',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large Input',
    placeholder: 'Large size',
  },
};

// With Left Icon
export const WithLeftIcon: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'example@domain.com',
    leftIcon: <Mail className="h-4 w-4" />,
  },
};

// With Right Icon
export const WithRightIcon: Story = {
  args: {
    label: '검색',
    type: 'search',
    placeholder: '검색어를 입력하세요',
    rightIcon: <Search className="h-4 w-4" />,
  },
};

// Password with Toggle
export const PasswordWithToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <Input
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
        placeholder="비밀번호를 입력하세요"
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: '비밀번호 표시/숨김 토글 기능이 있는 입력 필드입니다.',
      },
    },
  },
};

// Disabled State
export const Disabled: Story = {
  args: {
    label: '비활성화된 입력',
    placeholder: '입력할 수 없습니다',
    disabled: true,
    leftIcon: <User className="h-4 w-4" />,
  },
};

// Different Input Types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <Input
        label="텍스트"
        type="text"
        placeholder="일반 텍스트"
      />
      <Input
        label="이메일"
        type="email"
        placeholder="example@domain.com"
        leftIcon={<Mail className="h-4 w-4" />}
      />
      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호"
        leftIcon={<Lock className="h-4 w-4" />}
      />
      <Input
        label="검색"
        type="search"
        placeholder="검색어"
        leftIcon={<Search className="h-4 w-4" />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '다양한 input type을 확인할 수 있습니다.',
      },
    },
  },
};

// All Sizes
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Input
        size="sm"
        label="Small"
        placeholder="Small input"
        leftIcon={<User className="h-4 w-4" />}
      />
      <Input
        size="base"
        label="Base"
        placeholder="Base input"
        leftIcon={<User className="h-4 w-4" />}
      />
      <Input
        size="lg"
        label="Large"
        placeholder="Large input"
        leftIcon={<User className="h-4 w-4" />}
      />
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