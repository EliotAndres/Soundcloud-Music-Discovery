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
  selector: 'app',
  directives: [SearchBar, NgStyle, StatusBar],
  providers: [MusicPlayerService],
  template: `

  <div class="header">
    <img class="header_logo" src="img/header-logo.png" />
    <search-bar class="search-bar" (select)="useTrack($event)"></search-bar>
  </div>

  <div class="hero" [hidden]="tracks" >
     <h1 class="hero_headline">Music Discovery Tool</h1>
     <h2 class="hero_sub-headline">Powered by Soundcloud</h2>
  </div>

  <div class="loader-wrapper" *ng-if="loading">
    <div class="loader">
    </div>
  </div>

  <div class="info" *ng-if="selectedTrack.title && !error">
    Tracks in playlists containing {{selectedTrack.user.username}} - {{selectedTrack.title}} :
  </div>

  <div class="error-wrapper" *ng-if="error">
    {{error}}
  </div>

  <ul *ng-if="tracks" class="results">
     <li class="track" *ng-for="#track of tracks">
        <div class="track_background-image"  [ng-style]="{'background-image': 'url(' + track.artwork_url + ')'}">
        </div>
        <div class="track_content" [ng-class]="{active: track.id == getCurrentTrack().id}" (click)="playTrack(track)">
          {{ track.user.username }} {{ track.title }} ({{ track.total_count }})
        </div>
    </li>
  </ul>

  <status-bar></status-bar>
  `
})

export class App {
  tracks;
  selectedTrack = {user:{}};

  loading:boolean = false;
  error:string = null;

  constructor(public musicPlayerService: MusicPlayerService, public http: Http) {
    this.musicPlayerService.init();
  }

  useTrack(event) {
    if (typeof event.track === 'undefined') return;

    //Reset state
    this.loading = true;
    this.error = null;
    this.musicPlayerService.clearPlaylist();

    this.selectedTrack = event.track;

    var url = config.apiUrl + '/soundcloud?trackIds=' + event.track.id ;
    this.http.get(url)
      .subscribe(
        (res: Response) => {
          if(res.status != 200){
            this.error = "There has been a server error. Please try another track.";
            console.log(this.error, res);
          }else {
            this.addTracksToPlaylist(res.json());
          }
        },
        (err) =>  {
          this.error = "There has been a network error. Please try again.";
          console.log(this.error, err);
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
    return this.musicPlayerService.getCurrentTrack();
  }

}
