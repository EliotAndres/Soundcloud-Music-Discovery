/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef, NgStyle} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';
import {Http, Headers, Response} from 'angular2/http';

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

/*
 * Services and components
 */
import {MusicPlayerService} from './service/music-player';
import {SearchBar} from "./components/search-bar";
import {StatusBar} from "./components/status-bar";

/*
 * Styles
 */
require('./styles/app.scss');

/*
 * Config
 */
var config = require('./config/config');

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app', // <app></app>
  directives: [SearchBar, NgStyle, StatusBar],
  providers: [MusicPlayerService],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
  <div>
    <search-bar (select)="useTrack($event)"></search-bar>

    <img class="logo" src="img/logo.png" />

    <div class="headline" *ng-if="currentTrack.title">
      Tracks in playlists containing {{currentTrack.user.username}} - {{currentTrack.title}} :
    </div>

    <div class="loader-wrapper" *ng-if="loading">
      <div class="loader">
      </div>
    </div>

    <ul *ng-if="tracks" class="venn-result">
       <li class="track" *ng-for="#track of tracks">
          <div class="track_background-image"  [ng-style]="{'background-image': 'url(' + track.artwork_url + ')'}">
          </div>
          <div class="track_content" [ng-class]="{active: track.id == getCurrentTrack().id}" (click)="playTrack(track)">
            {{ track.user.username }} {{ track.title }} ({{ track.total_count }})
          </div>
      </li>
    </ul>

  </div>
  <status-bar></status-bar>
  `
})

export class App {
  tracks;
  currentTrack = {user:{}};
  loading:boolean = false;

  constructor(public musicPlayerService: MusicPlayerService, public http: Http) {
    this.musicPlayerService.init();
  }

  useTrack(event) {
    if (typeof event.track === 'undefined') return;
    this.currentTrack = event.track;
    this.loading = true;
    var url = config.apiUrl + '/soundcloud?trackIds=' + event.track.id ;
    this.musicPlayerService.clearPlaylist();
    this.http.get(url)
      .map((res: Response) => res.json())
      .subscribe(
        data => this.addTracksToPlaylist(data),
        (err) =>  {
          this.tracks = {};
          console.log('There has been an error', err);
        },
        () => this.loading = false
      );
  }

  addTracksToPlaylist(data){
    this.tracks = data;
    for (var i = 0; i < data.length; i ++) {
      this.musicPlayerService.addToPlaylist(data[i]);
    }
  }

  playTrack(track) {
    this.musicPlayerService.playTrack(track);
  }

  getCurrentTrack() {
    if (typeof this.musicPlayerService.getCurrentTrack() === 'undefined') return {user:{}};
    else return this.musicPlayerService.getCurrentTrack();
  }

}
