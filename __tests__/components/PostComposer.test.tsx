
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostComposer } from '@/components/forms/PostComposer'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('PostComposer Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  })

  it('renders form elements', () => {
    render(<PostComposer onClose={mockOnClose} onSuccess={mockOnSuccess} />)
    
    expect(screen.getByPlaceholderText(/เขียนโพสต์ของคุณ/)).toBeInTheDocument()
    expect(screen.getByText(/เลือกแพลตฟอร์ม/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /โพสต์/i })).toBeInTheDocument()
  })

  it('handles content input', () => {
    render(<PostComposer onClose={mockOnClose} onSuccess={mockOnSuccess} />)
    const textarea = screen.getByPlaceholderText(/เขียนโพสต์ของคุณ/)
    
    fireEvent.change(textarea, { target: { value: 'Test post content' } })
    expect(textarea).toHaveValue('Test post content')
  })

  it('calls onClose when cancel is clicked', () => {
    render(<PostComposer onClose={mockOnClose} onSuccess={mockOnSuccess} />)
    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/i })
    
    fireEvent.click(cancelButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
