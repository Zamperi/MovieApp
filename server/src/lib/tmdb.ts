const TMDB = process.env.TMDB_BASE_URL;

export async function tmdb(path: string, params: Record<string, any> = {}){
    const key = process.env.TMDB_API_KEY;
    if(!key) throw new Error('TMDB_API_KEY is missing');

    const usp = new URLSearchParams({api_key: key});
    for (const [key, value] of Object.entries(params)) {
        if( value !== undefined && value !== null && value !== '') usp.set(key, String(value));
    }
    const url = `${TMDB}${path}?${usp.toString()}`;

    const res= await fetch(url);
    if(!res.ok) throw new Error(`TMDB ${res.status} ${res.statusText}`);
    return res.json();
    
}