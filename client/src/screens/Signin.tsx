import { useNavigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';

interface SigninLocationState {
    from?: string;
}

export default function Signin() {
    const navigate = useNavigate();
    const location = useLocation() as Location & {
        state: SigninLocationState | null;
    }

    const from = location.state?.from || '/home';

    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
    }

    function handleOverlayClick() {
        // Tänne modalin sulkemislogiikka
        navigate(from, { replace: true });
    }

    return (
        <div className="overlay" onClick={handleOverlayClick}>
            <div className="modal" onClick={handleClick}>
                <h5>Sign in</h5>
                <input placeholder="Email" />
                <input placeholder="Password" />
                <button>Submit</button>
            </div>
        </div>
    );
}
