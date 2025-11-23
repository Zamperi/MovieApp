import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import './Dropdown.css';

type Props = {
    label: ReactNode;
    to?: string;
}

export default function Dropdown({ label, to }: Props) {
    return (
        <div>
            {to ? (<NavLink to={to}>{label}</NavLink>) : <button>{label}</button>}

        </div>
    );
}