import {Component, FORM_DIRECTIVES, EventEmitter, NgIf, NgFor} from "angular2/angular2";
import {Http, Response} from 'angular2/http';

import {PlayPauseButton, NextButton} from '../directive/control-buttons';
import {SeekBar, SeekBarStatus} from '../directive/seek-bar';
import {MusicPlayerService} from "../service/music-player";

@Component({
  selector: 'status-bar',
  directives: [PlayPauseButton, NextButton, SeekBar, SeekBarStatus, NgIf, NgFor],
  template: `
   <div class="status">
    <a play-pause-button class="material-icon">
      <span class="first"></span>
      <span class="second"></span>
      <span class="third"></span>
    </a>
    <a next-button class="status_button-container">
       <img class="status_button"src="img/icon-next.png" />
    </a>

    <div class="status_wrapper" *ng-if="getCurrentTrack().title">
      <div class="status_wrapper_title"><a href="{{getCurrentTrack().permalink_url}}" target="_blank">{{ getCurrentTrack().title}}</a></div>
      <div accesskey="" class="status_wrapper_artist">{{ getCurrentTrack().user.username}}</div>
      <div seek-bar class="progress" >
        <div class="progress_bar"></div>
        <div class="progress_content" seek-bar-status></div>
      </div>
    </div>
  </div>
  `,
})
export class StatusBar{

  constructor(public musicPlayerService: MusicPlayerService) {}

  getCurrentTrack() {
    return this.musicPlayerService.getCurrentTrack();
  }
}
