import { render, screen} from '@testing-library/react'
import React from 'react'
import ToggleLang from '../../App/Components/ToggleLang'

describe('ToggleLang', () => {
    it('should render lang when lang is provided', () => {
        render(<ToggleLang lang='de' onToggle={() => {}}/>)
        const heading = screen.getByRole('button')
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('de')
    })
})