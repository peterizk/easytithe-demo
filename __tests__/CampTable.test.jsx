import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CampTable from '../src/CampTable';
import * as svc from '../src/services/UseCamps';

const mockRows = [
  {
    Title: 'Text Only', Description: 'Plain', 'Image URL': '', Dates: '', Location: '', 'EasyTithe Link': ''
  },
  {
    Title: 'Image Row', Description: '', 'Image URL': 'https://img.test/pic.jpg', Dates: '', Location: '', 'EasyTithe Link': ''
  },
  {
    Title: 'Link Row', Description: '', 'Image URL': '', Dates: '', Location: '', 'EasyTithe Link': 'https://give.link'
  },
  {
    Title: 'HTML Row', Description: '<strong>Bold!</strong>', 'Image URL': '', Dates: '', Location: '', 'EasyTithe Link': ''
  }
];

vi.mock('../src/services/UseCamps', () => ({
  useSheet: () => ({ columns: Object.keys(mockRows[0]), rows: mockRows })
}));

describe('CampTable rendering', () => {
  beforeEach(() => render(<CampTable />));

  it('renders plain text', () => {
    expect(screen.getByText('Text Only')).toBeInTheDocument();
  });

  it('renders image tag', () => {
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://img.test/pic.jpg');
  });

  it('renders link tag', () => {
    const link = screen.getByRole('link', { name: 'https://give.link' });
    expect(link).toHaveAttribute('href', 'https://give.link');
  });

  it('renders raw HTML', () => {
    expect(screen.getByText('Bold!').tagName).toBe('STRONG');
  });
});
