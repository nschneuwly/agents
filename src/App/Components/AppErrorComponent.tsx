import type { FC } from 'react'
import '@esri/calcite-components/dist/components/calcite-notice'
import type { AppError } from '../Store/AppStore'

interface Props {
	errors: AppError[]
	onRemoveError: (error: AppError) => void
}

const AppErrorComponent: FC<Props> = ({ errors, onRemoveError }) => {
	return (
		<div className="errors-container">
			{errors?.map(err => (
				<calcite-notice
					key={err.id}
					open
					kind="danger"
					closable
					oncalciteNoticeClose={() => onRemoveError(err)}
					onClick={() => onRemoveError(err)}
					style={{ cursor: 'pointer' }}
				>
					{err?.messages?.map((msg, j) => (
						<span key={`${err.id}-${j}`} slot="message">
							{msg}
						</span>
					))}
				</calcite-notice>
			))}
		</div>
	)
}

export default AppErrorComponent
