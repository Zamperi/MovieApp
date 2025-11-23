import { useState, useEffect } from 'react';
import { getGroups } from '../services/dbService';
import GroupCard from '../components/GroupCard';
import FilterCard from '../components/FilterCard';

export default function Groups() {
    const [results, setResults] = useState<any[]>([]);
    const [groupSort, setGroupSort] = useState<string>('name_asc');

    useEffect(() => {
        async function loadResults() {
            const data = await getGroups();
            setResults(data);
        }
        loadResults();
    }, []);

    return (
        <div className="search-results-container">
            <h2>Groups</h2>

            <div className="results-and-parameters">
                <div className="parameters">
                    <FilterCard
                        page="groups"
                        sortValue={groupSort}
                        onSortChange={setGroupSort}
                    />
                </div>

                <ul className="results-grid">
                    {results.map((g) => (
                        <li key={g.id}>
                            <GroupCard id={g.id} name={g.name} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
