

export async function getGroups() {
    const api_url = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${api_url}/api/groups/all`);

        if(!response.ok) {
            console.error('Endpoint for all groups failed!');
            return [];
        }

        const data = await response.json();

        if(!Array.isArray(data)) {
            console.error('Missing an array at all groups');
            return [];
        }

        return data;
    } catch(error) {
        console.error(error);
        return [];
    }
}