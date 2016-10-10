var app = angular.module('mainApp', []);

app.controller('mainCtrl', ['$scope', function(scope){

  let peer = new Peer({key: '2ly1xbt36ypn9udi'});

  peer.on('open', function(id){
    console.log("peer open!");
    scope.myPeerId = id;
    scope.$apply();
    console.log('My peer ID is: ' + id);
  });

  peer.on('connection', function(conn) {
    console.log("connection requested by: ", conn.peer);
    scope.requestedBy = conn.peer;

    if(scope.conn === null){
      scope.conn = peer.connect(scope.requestedBy);
    }
    conn.on('data', function(data) {
      $('#messageContainer').append(angular.element('<div>').text(data).addClass('bg-success text-xs-left'));
      console.log(data);
    });
  });

  //start connection

  scope.startConnection = function(){
    //scope.conn = null;
    if(scope.destPeerId === scope.myPeerId){
      scope.messageHandler('error', 'You can\'t connect to yourself!' );
    }
    else{
      if(!scope.conn){
        console.log("opening connection!");
        scope.conn = peer.connect(scope.destPeerId);
        scope.conn.on('open', function(){
          scope.messageHandler('success', 'Connection successful!')
          console.log("connected to: ", scope.conn.peer);
          console.log(scope.conn);
        });
        peer.on('error', function(){
          scope.conn = null;
          console.log("error!");
          scope.messageHandler('error', 'Connection failed!')
        });
      }
      if(scope.conn.open){
        scope.messageHandler('warning', 'Connection already exists!')
      }
    }

  }

  //send message
  scope.sendMessage = function(){
    if(scope.conn){
      scope.conn.send(scope.message);
      $('#messageContainer').append(angular.element('<div>').text(scope.message).addClass('bg-info text-xs-right'));
    }
    else if(scope.requestedBy){
      console.log("No connection exists!");
      console.log("Attempting connection!");
      scope.conn = peer.connect(scope.requestedBy);
      scope.conn.on('open', function(){
        scope.conn.send(scope.message);
        $('#messageContainer').append(angular.element('<div>').text(scope.message).addClass('bg-info text-xs-right'));
      });
    }
    else{
      console.log("No id provided.");
    }
  }


  scope.messageHandler = function(type, message){
    toastr.remove();
    if(type === 'error'){
      toastr.error(message);
    }
    if(type === 'success'){
      toastr.success(message);
    }
    if(type === 'warning'){
      toastr.warning(message);
    }
  };

}]);