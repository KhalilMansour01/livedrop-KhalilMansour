/// <reference types="jest" />

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('renders button with children', () => {
  render(<Button>Test Button</Button>);
  const buttonElement = screen.getByText('Test Button');
  expect(buttonElement).toBeInTheDocument();
});

test('button is disabled when disabled prop is true', () => {
  render(<Button disabled>Disabled Button</Button>);
  const buttonElement = screen.getByText('Disabled Button');
  expect(buttonElement).toBeDisabled();
});
