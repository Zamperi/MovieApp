import { useNavigate } from 'react-router-dom';
import './GroupCard.css';

type Props = {
    id: number;
    name: string;
};

export default function GroupCard({ id, name }: Props) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(`/group/${id}`);
    }

    return (
        <div className="group-card" onClick={handleClick}>
            <h5>{name}</h5>
        </div>
    );
}
