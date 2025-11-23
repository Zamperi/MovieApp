import { useParams } from 'react-router-dom';

export default function MoviePage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="movie-page">
            <h2>Elokuva ID: {id}</h2>
            {/* Tässä voit myöhemmin hakea tiedot TMDB:stä id:n perusteella */}
        </div>
    );
}
