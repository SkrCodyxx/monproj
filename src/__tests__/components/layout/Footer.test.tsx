import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Footer contains <Link> components
import Footer from '../../../components/layout/Footer'; // Adjust path as necessary

describe('Footer Component', () => {
  beforeEach(() => {
    // Wrap Footer in MemoryRouter because it uses <Link> from react-router-dom
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  });

  it('should render the copyright notice with the current year', () => {
    const currentYear = new Date().getFullYear();
    // Using a regex to be more flexible with surrounding text or slight variations
    const copyrightRegex = new RegExp(`© ${currentYear} Dounie Cuisine Pro. Tous droits réservés.`, 'i');
    const copyrightElement = screen.getByText(copyrightRegex);
    expect(copyrightElement).toBeInTheDocument();
  });

  it('should render the company name "Dounie Cuisine Pro"', () => {
    // Check for company name in one of the headings or prominent texts
    const companyNameElements = screen.getAllByText('Dounie Cuisine Pro');
    expect(companyNameElements.length).toBeGreaterThanOrEqual(1);
    const headingElement = screen.getByRole('heading', { name: 'Dounie Cuisine Pro', level: 5 });
    expect(headingElement).toBeInTheDocument();
  });

  it('should render social media links', () => {
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook').closest('a')).toHaveAttribute('href', 'https://facebook.com/douniecuisinepro');
  });

  it('should render quick links', () => {
    expect(screen.getByText('Notre Menu')).toBeInTheDocument();
    expect(screen.getByText('Nos Services')).toBeInTheDocument();
    expect(screen.getByText('Notre Menu').closest('a')).toHaveAttribute('href', '/menu');
  });

  it('should render contact information (e.g., address or phone)', () => {
    expect(screen.getByText(/123 Rue de la Saveur/i)).toBeInTheDocument();
    expect(screen.getByText('(514) 123-4567')).toBeInTheDocument();
  });

  it('should render a newsletter subscription form placeholder', () => {
    expect(screen.getByPlaceholderText('Votre email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "S'abonner" })).toBeInTheDocument();
  });
});
