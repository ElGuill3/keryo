import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

describe('smoke test', () => {
  it('renders App without crashing', () => {
    render(<App />)
    expect(screen.getByText('Keryo')).toBeInTheDocument()
  })
})