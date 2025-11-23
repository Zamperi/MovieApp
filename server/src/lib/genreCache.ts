type Genre = { id: number; name: string };

export class GenreCache {
  private map: Record<string, number> = {};
  private loadedAt = 0;

  constructor(private fetcher: (path: string, params?: any) => Promise<any>) {}

  async ensureFresh(language = process.env.TMDB_LANG ?? 'fi-FI') {
    const TTL = 24 * 60 * 60 * 1000;
    if (!this.loadedAt || Date.now() - this.loadedAt > TTL) {
      const [movie, tv] = await Promise.all([
        this.fetcher('/genre/movie/list', { language }),
        this.fetcher('/genre/tv/list', { language }),
      ]);
      this.map = {};
      const add = (g: Genre) => { this.map[g.name.toLowerCase()] = g.id; };
      movie.genres?.forEach(add);
      tv.genres?.forEach(add);

      // Kevyet aliasit (täydennä myöhemmin)
      if (this.map['science fiction']) this.map['scifi'] = this.map['science fiction'];
      if (this.map['kauhu']) this.map['horror'] = this.map['horro'];
      if (this.map['romantic']) this.map['romantiikka'] = this.map['romance'];

      this.loadedAt = Date.now();
    }
  }

  getId(term: string) { return this.map[term.toLowerCase()]; }
  has(term: string) { return this.getId(term) != null; }
}