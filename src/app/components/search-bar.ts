import {Component, FORM_DIRECTIVES, EventEmitter, NgIf, NgFor} from "angular2/angular2";
import {Http, Response} from 'angular2/http';

var config = require('../config/config');

@Component({
  selector: 'search-bar',
  template: `
  <div class="search">
    <div class="wrapper">
      <form class="search_form" (ng-submit)="searchTracks()">
        <input [(ng-model)]="query" placeholder="Select a song you love" class="search_form_input"/>
        <button class="search_form_button">></button>
      </form>
    </div>
    <ul *ng-if="items" class="search_results">
       <li (click)="addTrack(item)"  class="search_results_track" *ng-for="#item of items">
          <span>{{ item.user.username }} - {{ item.title }}</span>
      </li>
    </ul>
  </div>
  `,
  directives:[FORM_DIRECTIVES, NgIf, NgFor],
  events: ['select'],

})
export class SearchBar{

  query;
  items;
  select;

  constructor(public http: Http) {
    this.select = new EventEmitter();
  }

  static logError(err) {
    console.error('There was an error: ', err);
  }

  addTrack(track){
    this.items = null;
    this.select.next({track:track});
  }

  searchTracks(){
    var url = 'http://api.soundcloud.com/tracks?q=' + this.query + '&format=json&_status_code_map[302]=200&client_id=' + config.soundcloudKey ;

    this.http.get(url)
      .map((res: Response) => res.json())
      .subscribe(
        data => this.items = data,
        err => SearchBar.logError(err),
        () => console.log('Search complete')
      );

  }
}
