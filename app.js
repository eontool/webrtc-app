var app = angular.module('mainApp', []);

app.controller('mainCtrl', ['$scope', function(scope){

  let spinner = $('.loading');
  let loginBox = $('#loginBox');
  let chatBox = $('#chatBox');

  let loading = function(state){
    if(state){
      spinner.fadeIn(250);
    }
    else {
      spinner.fadeOut(250);
    }
  };

  let loginOrChat = function(state){
    if (state === 'login') {
      chatBox.fadeOut(250);
      loginBox.fadeIn(250);
    }
    if (state === 'chat') {
      loginBox.fadeOut(250);
      chatBox.fadeIn(250);
    }
  };

  let peer = new Peer({key: '2ly1xbt36ypn9udi', secure: false, debug: 3});


  peer.on('open', function(id){
    loading(false);
    loginOrChat('login');
    scope.myPeerId = id;
    scope.utils = util;
    scope.$digest();
  });

  peer.on()

  peer.on('connection', function(conn) {
    //console.log(conn);
    scope.peerUsername = conn.metadata.username;
    scope.messageHandler('success', 'connection requested.')
    loginOrChat('chat');
    loading(false);
    scope.$digest();
    scope.requestedBy = conn.peer;
    if(scope.conn === null){
      scope.conn = peer.connect(scope.requestedBy);
    }
    conn.on('data', function(data) {
      $('#messageContainer').prepend(angular.element('<div>').text(data).addClass('bubble1')).append(angular.element('<br>'));
    });
  });

  //start connection


  let options = {
    metadata: {
      username: 'Remote User'
    },
    reliable: true,
    serialization: 'json'
  };

  scope.startConnection = function(){
    if(scope.destPeerId === scope.myPeerId){
      scope.messageHandler('error', 'You can\'t connect to yourself!' );
    }
    else{
      loading(true);
      if(!scope.conn){
        scope.conn = peer.connect(scope.destPeerId, options);
        scope.conn.on('open', function(){
          loading(false);
          loginOrChat('chat');
          scope.messageHandler('success', 'Connection successful!');
          scope.$digest();
        });
        peer.on('error', function(error){
          console.log(error, error.type);
          loading(false);
          scope.conn = null;
          scope.messageHandler('error', 'Connection failed!<br>'+ error.type)
        });
      }
      if(scope.conn.open){
        loading(false);
        scope.messageHandler('warning', 'Connection already exists!')
      }
    }

  }

  //send message
  scope.sendMessage = function(){
    if(scope.conn){
      scope.conn.send(scope.message);
      $('#messageContainer').prepend(angular.element('<div>').text(scope.message).addClass('bubble2')).append(angular.element('<br>'));
      $('#messageInput').val(null);
    }
    else if(scope.requestedBy){
      scope.conn = peer.connect(scope.requestedBy, options);
      scope.conn.on('open', function(){
        scope.conn.send(scope.message);
        $('#messageContainer').prepend(angular.element('<div>').text(scope.message).addClass('bubble2')).append(angular.element('<br>'));
        $('#messageInput').val(null);
      });
    }
    else{
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
