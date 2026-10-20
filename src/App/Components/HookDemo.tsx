import { type FC, useState } from 'react'
import './HookDemo.scss'
import { useClickAway } from '../hooks/useClickAway'
import { useGeolocation } from '../hooks/useGeolocation'
import { useHistoryState } from '../hooks/useHistoryState'

const HookDemo: FC = () => {
	const [btnClicked, setBtnClicked] = useState(false)

	const ref = useClickAway(() => setBtnClicked(false))

	const { state, set, undo, redo, clear, canUndo, canRedo } = useHistoryState({
		items: [],
	})

	const addTodo = (val: string) => {
		set({
			...state,
			items: state.items.concat({ id: crypto.randomUUID(), name: val }),
		})
	}

	const removeTodo = (id: string) => {
		set({
			...state,
			items: state.items.filter(item => item.id !== id),
		})
	}

	const [value, setValue] = useState('')

	const location = useGeolocation()

	return (
		<div className="hook-demo">
			<button
				type="button"
				onClick={() => setBtnClicked(true)}
				ref={ref}
				style={{ backgroundColor: btnClicked ? 'lightgreen' : 'lightgrey' }}
			>
				Click and Click Away
			</button>
			<div>
				<section>
					<header>
						<h1>useHistoryState</h1>
						<div>
							<button
								type="button"
								disabled={!canUndo}
								className="link"
								onClick={undo}
							>
								Undo
							</button>
							<button
								type="button"
								disabled={!canRedo}
								className="link"
								onClick={redo}
							>
								Redo
							</button>

							<button
								type="button"
								disabled={!state.items.length}
								className="link"
								onClick={clear}
							>
								Clear
							</button>
						</div>
						<input
							type="text"
							value={value}
							onChange={e => setValue(e.target.value)}
						></input>
						<button type="button" onClick={() => addTodo(value)}>Add</button>
					</header>

					<ul>
						{state.items.map((item, index) => {
							return (
								<li key={index}>
									<span>{item.name}</span>
									<button type="button" className="link" onClick={() => removeTodo(item.id)}>
										Delete
									</button>
								</li>
							)
						})}
					</ul>
				</section>
			</div>
			<div>
				{location.loading && (
					<p>loading... (you may need to enable permissions)</p>
				)}
				{location.error && (
					<p>Enable permissions to access your location data</p>
				)}
				{!(location.loading && location.error) && (
					<div>{location.latitude + ' ' + location.longitude} </div>
				)}
			</div>
		</div>
	)
}

export default HookDemo
