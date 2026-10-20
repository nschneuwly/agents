import { render, screen } from '@testing-library/react'
import React from 'react'
import AppErrorComponent from '../../App/Components/AppErrorComponent'
import { userEvent } from '@testing-library/user-event'

describe('AppErrorComponent', () => {
	const errors = [
		{
			id: crypto.randomUUID(),
			messages: ['Fehler Test', 'Etwas ist schiefgelaufen Test'],
		},
		{
			id: crypto.randomUUID(),
			messages: ['Fehler Test 2', ' 2 Etwas ist schiefgelaufen Test'],
		},
		{ id: crypto.randomUUID(), messages: ['Fehler Test 3'] },
	]

	it('should render error when error is provided', () => {
		render(<AppErrorComponent errors={errors} onRemoveError={() => {}} />)
		errors.forEach((err) => {
			const errEl = screen.getByText(err.messages[0])
			expect(errEl).toBeInTheDocument()
		})
	})
	it('should not render when error array is empty', () => {
		render(<AppErrorComponent errors={[]} onRemoveError={() => {}} />)
		const li = screen.queryByRole('listitem')
		expect(li).toBeNull()
	})

	it('should emit onRemove when user clicks', async () => {
		const mockOnRemove = vi.fn()
		render(<AppErrorComponent errors={errors} onRemoveError={mockOnRemove} />)
		const errEls = screen.queryAllByRole('listitem')
		const e = errors.find((errs) => errs.id === errEls[0].getAttribute('id'))
		const user = userEvent.setup()
		await user.click(errEls[0])
		expect(mockOnRemove).toHaveBeenCalledWith(expect.objectContaining(e))
	})
})
