import { useState } from 'react';
import FilterCard from '../components/FilterCard';

export default function People() {
    const [peopleSort, setPeopleSort] = useState<string>('');

    return (
        <div className='search-results-container'>
            <h2>People</h2>
            <div className='results-and-parameters'>
                <div className='parameters'>
                    <FilterCard
                        page="groups"
                        sortValue={peopleSort}
                        onSortChange={setPeopleSort}
                    />

                </div>
                <div className='results-grid'>

                </div>
            </div>
        </div>
    );
}