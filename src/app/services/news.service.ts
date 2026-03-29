import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private http = inject(HttpClient);
  // Gebruik je eigen LXC proxy!
  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php?url=';
  private readonly NEWS_URL = encodeURIComponent('https://www.vvh-harlingen.nl/wp-json/wp/v2/posts?_embed&per_page=5');

  getNews() {
    return this.http.get<any[]>(this.PROXY + this.NEWS_URL).pipe(
      map(posts => posts.map(post => ({
        // WordPress API stuur objecten voor title en content, we hebben .rendered nodig!
        titel: post.title.rendered,
        datum: post.date,
        omschrijving: post.excerpt.rendered,
        link: post.link,
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'assets/default-news.jpg'
      })))
    );
  }
}
