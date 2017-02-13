Skip to content
This repository
Search
Pull requests
Issues
Gist
 @calebfoss
 Sign out
 Watch 29
  Star 48
  Fork 25 ITPNYU/ICM-2015
 Code  Issues 1  Pull requests 0  Projects 0  Wiki  Pulse  Graphs
Branch: master Find file Copy pathICM-2015/09_video_sound/02_capture/13_get_sources/sketch.js
904b555  on Oct 27, 2015
@lmccart lmccart adding get sources example
1 contributor
RawBlameHistory     
Executable File  40 lines (33 sloc)  1.2 KB
// 1. Run this example to print to console all the sources.
// 2. Determine the ID of the video source you'd like to use.
// 3. Place the ID as a string where it says 'put_desired_source_id_here'.
// 4. Comment in lines 15-21 to set options for the capture.
// 5. (Optional) remove line 14 and lines 29-39 (the gotSources function).
//    They are no longer necessary.

var capture;
var options;

function setup() {
  
  // This line triggers a print of all detected input sources.
  // It can be removed after the source ID has been determined.
  MediaStreamTrack.getSources(gotSources);
  
  // var options = {
  //   video: {
  //     optional: [{
  //       sourceId: 'put_desired_source_id_here'
  //     }]
  //   }
  // };
  
  capture = createCapture(options);

}

// This method can be removed after the source ID has been determined.
function gotSources(sources) {
  for (var i = 0; i !== sources.length; ++i) {
    if (sources[i].kind === 'audio') {
      console.log('audio: '+sources[i].label+' ID: '+sources[i].id);
    } else if (sources[i].kind === 'video') {
      console.log('video: '+sources[i].label+' ID: '+sources[i].id);
    } else {
      console.log('Some other kind of source: ', sources[i]);
    }
  }
}
Contact GitHub API Training Shop Blog About
© 2017 GitHub, Inc. Terms Privacy Security Status Help