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