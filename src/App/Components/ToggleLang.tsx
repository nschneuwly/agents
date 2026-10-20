import { t } from 'i18next'
import type { FC } from 'react'

interface Props {
    onToggle: () => void
    lang: string
}

const ToggleLang: FC<Props> = ({ onToggle, lang }) => {

    return <div className='lang-btn'>
        <button onClick={onToggle} type='button'>{`${t('toggle-lang')}: ${lang}`}</button>
    </div>
}

export default ToggleLang